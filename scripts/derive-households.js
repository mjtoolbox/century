#!/usr/bin/env node
/**
 * Phase 4.5 Step 6 — derive households from the spreadsheet's address columns and
 * fill in the guardian link for minors.
 *
 *   node scripts/derive-households.js --xlsx "<path>" --overrides scripts/merge-overrides.json
 *   node scripts/derive-households.js --xlsx "<path>" --overrides scripts/merge-overrides.json --apply
 *
 * A shared street + postal code is a family (confirmed by the club, 2026-08-22).
 *
 * Guardians: a minor in a household with exactly one adult gets that adult. Where a
 * household has several adults, the one holding the household's primary phone/email
 * wins; if that is still ambiguous the minor is reported and left alone. An existing
 * guardian_id is never overwritten.
 *
 * Idempotent: a household is looked up by street + postal before being created, and
 * only blank household_id / guardian_id values are written.
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const pool = require('../src/utils/vercelpostgres');

const argv = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const i = argv.indexOf(name);
  return i === -1 ? fallback : argv[i + 1];
};
const APPLY = argv.includes('--apply');
const XLSX_PATH = arg('--xlsx', 'D:/MJData/zettelkasten/raw/century/Century_Membership_List.xlsx');
const OVERRIDES_PATH = arg('--overrides');

const normHangeul = (v) => (v == null ? '' : String(v).replace(/\s+/g, '').trim());
const blank = (v) => v == null || String(v).trim() === '';
const str = (v) => (blank(v) ? null : String(v).trim());
const normStreet = (v) => (v || '').toLowerCase().replace(/\s+/g, ' ').trim();
const normPostal = (v) => (v || '').toUpperCase().replace(/\s+/g, '');
const asDate = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v == null ? null : String(v).slice(0, 10));

const excelDate = (v) => {
  if (blank(v)) return null;
  if (v instanceof Date) return new Date(Date.UTC(v.getFullYear(), v.getMonth(), v.getDate())).toISOString().slice(0, 10);
  const s = String(v).trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    const [, mo, da, yr] = m;
    const year = yr.length === 2 ? Number(yr) + (Number(yr) > 30 ? 1900 : 2000) : Number(yr);
    return `${String(year).padStart(4, '0')}-${mo.padStart(2, '0')}-${da.padStart(2, '0')}`;
  }
  const parsed = new Date(s);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
};

const COLS = { hangeul: 3, street: 4, city: 5, province: 6, postal_code: 7, phone: 8, email: 9, dob: 14 };

function readSheet(file, overrides) {
  const wb = XLSX.readFile(file, { cellDates: true });
  const sheetName = wb.SheetNames.find((n) => n.trim() === '\u3131');
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, blankrows: false, raw: false, cellDates: true });
  const recs = rows.slice(1).map((r, i) => ({
    sheetRow: i + 3,
    hangeul: str(r[COLS.hangeul]),
    key: normHangeul(r[COLS.hangeul]),
    street: str(r[COLS.street]),
    city: str(r[COLS.city]),
    province: str(r[COLS.province]),
    postal_code: str(r[COLS.postal_code]),
    phone: str(r[COLS.phone]),
    email: str(r[COLS.email]),
    dob: excelDate(r[COLS.dob]),
  })).filter((r) => r.key !== '');

  for (const [row, fields] of Object.entries(overrides.values || {})) {
    const rec = recs.find((r) => String(r.sheetRow) === String(row));
    if (rec) Object.assign(rec, fields);
  }
  return recs;
}

async function readMembers() {
  const { rows } = await pool.query(
    `SELECT member_id, name, hangeul, is_adult, status, guardian_id, household_id, phone, email,
            to_char(dob,'YYYY-MM-DD') AS dob
     FROM centurymember ORDER BY member_id`);
  return rows.map((r) => ({ ...r, key: normHangeul(r.hangeul), dob: asDate(r.dob) }));
}

// A sheet row resolves to a member by hangeul + dob first (which separates the
// duplicated 김하랑 rows), then by a hangeul that is unique on both sides.
function resolveMembers(sheetRows, members) {
  const resolved = new Map();
  const unresolved = [];
  for (const s of sheetRows) {
    const byBoth = members.filter((m) => m.key === s.key && m.dob && s.dob && m.dob === s.dob);
    if (byBoth.length === 1) { resolved.set(s.sheetRow, byBoth[0]); continue; }
    const byKey = members.filter((m) => m.key === s.key);
    if (byKey.length === 1) { resolved.set(s.sheetRow, byKey[0]); continue; }
    unresolved.push({ sheet: s, candidates: byKey.map((m) => m.member_id) });
  }
  return { resolved, unresolved };
}

function buildClusters(sheetRows, resolved) {
  const map = new Map();
  for (const s of sheetRows) {
    if (blank(s.street) && blank(s.postal_code)) continue;
    const member = resolved.get(s.sheetRow);
    if (!member) continue;
    const k = `${normStreet(s.street)}|${normPostal(s.postal_code)}`;
    if (!map.has(k)) {
      map.set(k, {
        key: k,
        street: s.street,
        city: s.city,
        province: s.province && s.province.length <= 2 ? s.province : 'BC',
        postal_code: s.postal_code,
        rows: [],
      });
    }
    map.get(k).rows.push({ sheet: s, member });
  }

  for (const c of map.values()) {
    // The household's contact details are the first non-blank in the cluster.
    c.primary_phone = (c.rows.find((r) => !blank(r.sheet.phone)) || {}).sheet?.phone ?? null;
    c.primary_email = (c.rows.find((r) => !blank(r.sheet.email)) || {}).sheet?.email ?? null;
  }
  return [...map.values()];
}

const yearsBetween = (older, younger) => {
  if (!older || !younger) return null;
  return (new Date(younger) - new Date(older)) / (365.2425 * 24 * 3600 * 1000);
};

// Among the adults of a household, the oldest is the likeliest parent. Contact
// details are a bad tie-break: the household's primary phone is whichever member
// happens to sit first in the spreadsheet, which in one case was the 19-year-old
// sibling of the minor rather than their father.
function planGuardians(clusters) {
  const assignments = [];
  const ambiguous = [];
  for (const c of clusters) {
    const adults = c.rows.filter((r) => r.member.is_adult);
    const minors = c.rows.filter((r) => !r.member.is_adult && r.member.guardian_id == null);
    if (!minors.length) continue;
    if (!adults.length) {
      ambiguous.push({ cluster: c, minors, reason: 'no adult in this household' });
      continue;
    }

    const dated = adults.filter((a) => a.member.dob).sort((x, y) => new Date(x.member.dob) - new Date(y.member.dob));
    const guardian = dated[0] || adults[0];

    for (const m of minors) {
      const gap = yearsBetween(guardian.member.dob, m.member.dob);
      assignments.push({
        minor: m.member,
        guardian: guardian.member,
        cluster: c,
        gap: gap == null ? null : Math.floor(gap),
        // A guardian less than 16 years older is more likely a sibling than a parent.
        weak: gap == null || gap < 16,
        otherAdults: adults.filter((a) => a.member.member_id !== guardian.member.member_id).map((a) => a.member),
      });
    }
  }
  return { assignments, ambiguous };
}

function writeReport(clusters, guardians, unresolved, existingByKey, apply) {
  const stamp = new Date().toISOString().slice(0, 10);
  const out = path.join(__dirname, '..', 'reports', `households-${stamp}.md`);
  const L = [];
  const val = (v) => (v === null || v === undefined || v === '' ? '_(empty)_' : String(v));
  const multi = clusters.filter((c) => c.rows.length > 1);
  const toCreate = clusters.filter((c) => !existingByKey.has(c.key));

  L.push(`# Household derivation — ${stamp}`, '');
  L.push(`Mode: **${apply ? 'APPLY' : 'dry run — nothing written'}**`, '');
  L.push('## 1. Summary', '');
  L.push('| | count |', '|---|---|');
  L.push(`| clusters (distinct street + postal) | ${clusters.length} |`);
  L.push(`| households to create | ${toCreate.length} |`);
  L.push(`| households already present | ${clusters.length - toCreate.length} |`);
  L.push(`| members getting a household_id | ${clusters.reduce((n, c) => n + c.rows.filter((r) => r.member.household_id == null).length, 0)} |`);
  L.push(`| multi-member households | ${multi.length} (${multi.reduce((n, c) => n + c.rows.length, 0)} people) |`);
  L.push(`| guardian links to set | ${guardians.assignments.length} |`);
  L.push(`| minors left without a guardian | ${guardians.ambiguous.reduce((n, a) => n + a.minors.length, 0)} |`);
  L.push(`| sheet rows that resolve to no single member | ${unresolved.length} |`);
  L.push('');

  L.push('## 2. Households', '');
  for (const c of clusters.sort((a, b) => b.rows.length - a.rows.length)) {
    L.push(`### ${val(c.street)}, ${val(c.city)} ${val(c.postal_code)} — ${c.rows.length} member(s)`, '');
    L.push(`Primary phone ${val(c.primary_phone)} · primary email ${val(c.primary_email)}`, '');
    L.push('| member_id | name | hangeul | adult | dob | current guardian |', '|---|---|---|---|---|---|');
    for (const r of c.rows) {
      L.push(`| ${r.member.member_id} | ${val(r.member.name)} | ${val(r.member.hangeul)} | `
        + `${r.member.is_adult ? 'adult' : 'minor'} | ${val(r.member.dob)} | ${val(r.member.guardian_id)} |`);
    }
    L.push('');
  }

  L.push('## 3. Guardian links to set', '');
  if (!guardians.assignments.length) L.push('_None._', '');
  else {
    L.push('| minor | | guardian | age gap | other adults in household | household |', '|---|---|---|---|---|---|');
    for (const a of guardians.assignments) {
      L.push(`| ${a.minor.member_id} ${val(a.minor.name)} (${val(a.minor.hangeul)}) | → | `
        + `${a.guardian.member_id} ${val(a.guardian.name)} (${val(a.guardian.hangeul)}) | `
        + `${a.gap == null ? '_(unknown)_' : `${a.gap}y`}${a.weak ? ' ⚠' : ''} | `
        + `${a.otherAdults.map((m) => `${m.member_id} ${m.name}`).join(', ') || '—'} | ${val(a.cluster.street)} |`);
    }
    L.push('');
    const weak = guardians.assignments.filter((a) => a.weak);
    if (weak.length) {
      L.push(`⚠ ${weak.length} guardian(s) are less than 16 years older than the minor, so they may be a `
        + 'sibling rather than a parent. Confirm before relying on these.', '');
    }
  }

  L.push('## 4. Minors left without a guardian — needs a human call', '');
  if (!guardians.ambiguous.length) L.push('_None._', '');
  for (const a of guardians.ambiguous) {
    L.push(`### ${val(a.cluster.street)}, ${val(a.cluster.city)} — ${a.reason}`, '');
    L.push('| member_id | name | hangeul | dob |', '|---|---|---|---|');
    for (const m of a.minors) L.push(`| ${m.member.member_id} | ${val(m.member.name)} | ${val(m.member.hangeul)} | ${val(m.member.dob)} |`);
    L.push('');
    const adults = a.cluster.rows.filter((r) => r.member.is_adult);
    if (adults.length) {
      L.push('Adults in this household: ' + adults.map((r) => `${r.member.member_id} ${r.member.name}`).join(', '), '');
    }
  }

  L.push('## 5. Sheet rows resolving to no single member', '');
  if (!unresolved.length) L.push('_None._', '');
  else {
    L.push('| sheet row | hangeul | dob | candidate member_ids |', '|---|---|---|---|');
    for (const u of unresolved) {
      L.push(`| ${u.sheet.sheetRow} | ${val(u.sheet.hangeul)} | ${val(u.sheet.dob)} | ${u.candidates.join(', ') || 'none'} |`);
    }
    L.push('');
  }

  fs.writeFileSync(out, L.join('\n'), 'utf8');
  return out;
}

async function apply(clusters, guardians, existingByKey) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let created = 0;
    let linked = 0;

    for (const c of clusters) {
      let householdId = existingByKey.get(c.key);
      if (householdId == null) {
        const { rows } = await client.query(
          `INSERT INTO household (street, city, province, postal_code, primary_phone, primary_email)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING household_id`,
          [c.street, c.city, c.province, c.postal_code, c.primary_phone, c.primary_email]);
        householdId = rows[0].household_id;
        created += 1;
      }
      for (const r of c.rows) {
        if (r.member.household_id != null) continue;
        await client.query(
          'UPDATE centurymember SET household_id = $1, last_update = now() WHERE member_id = $2 AND household_id IS NULL',
          [householdId, r.member.member_id]);
      }
    }

    for (const a of guardians.assignments) {
      const { rowCount } = await client.query(
        'UPDATE centurymember SET guardian_id = $1, last_update = now() WHERE member_id = $2 AND guardian_id IS NULL',
        [a.guardian.member_id, a.minor.member_id]);
      linked += rowCount;
    }

    await client.query('COMMIT');
    return { created, linked };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

(async () => {
  const overrides = OVERRIDES_PATH && fs.existsSync(OVERRIDES_PATH)
    ? JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8'))
    : {};
  const sheetRows = readSheet(XLSX_PATH, overrides);
  const members = await readMembers();
  const { resolved, unresolved } = resolveMembers(sheetRows, members);
  const clusters = buildClusters(sheetRows, resolved);
  const guardians = planGuardians(clusters);

  const { rows: existing } = await pool.query('SELECT household_id, street, postal_code FROM household');
  const existingByKey = new Map(existing.map((h) => [`${normStreet(h.street)}|${normPostal(h.postal_code)}`, h.household_id]));

  const reportPath = writeReport(clusters, guardians, unresolved, existingByKey, APPLY);
  console.log(`clusters ${clusters.length} · to create ${clusters.filter((c) => !existingByKey.has(c.key)).length} · `
    + `guardian links ${guardians.assignments.length} · ambiguous minors ${guardians.ambiguous.reduce((n, a) => n + a.minors.length, 0)} · `
    + `unresolved sheet rows ${unresolved.length}`);
  console.log(`report: ${reportPath}`);

  if (APPLY) {
    const { created, linked } = await apply(clusters, guardians, existingByKey);
    console.log(`created ${created} households, set ${linked} guardian links`);
  } else {
    console.log('dry run — nothing written');
  }
  await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
