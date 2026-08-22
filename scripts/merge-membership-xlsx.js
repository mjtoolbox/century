#!/usr/bin/env node
/**
 * Phase 4.5 Step 3/5 — merge Century_Membership_List.xlsx into centurymember.
 *
 *   node scripts/merge-membership-xlsx.js --xlsx "<path>"                  # dry run, writes a report only
 *   node scripts/merge-membership-xlsx.js --xlsx "<path>" --apply          # one transaction
 *   node scripts/merge-membership-xlsx.js --xlsx "<path>" --overrides scripts/merge-overrides.json --apply
 *
 * Rules (from MIGRATION-Phase4.5-MemberDataModel.md):
 *   - Sheet 'ㄱ' only. Headers on row 2, data from row 3.
 *   - Match on normalized hangeul. A key duplicated on either side is never merged.
 *   - DB wins: level, img, status, is_adult, guardian_id, altname, start_date.
 *   - XLSX wins: names, gender, height, occupation, dan_issue_date, dob, phone, email, applied_date.
 *   - A blank spreadsheet cell NEVER overwrites a populated DB value.
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const pool = require('../src/utils/vercelpostgres');

// ---------------------------------------------------------------- args
const argv = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const i = argv.indexOf(name);
  return i === -1 ? fallback : argv[i + 1];
};
const APPLY = argv.includes('--apply');
const XLSX_PATH = arg('--xlsx', 'D:/MJData/zettelkasten/raw/century/Century_Membership_List.xlsx');
const OVERRIDES_PATH = arg('--overrides');

// ---------------------------------------------------------------- helpers
const normHangeul = (v) => (v == null ? '' : String(v).replace(/\s+/g, '').trim());
const blank = (v) => v == null || String(v).trim() === '';
const str = (v) => (blank(v) ? null : String(v).trim());

const excelDate = (v) => {
  if (blank(v)) return null;
  if (v instanceof Date) {
    return new Date(Date.UTC(v.getFullYear(), v.getMonth(), v.getDate())).toISOString().slice(0, 10);
  }
  if (typeof v === 'number') {
    const d = XLSX.SSF.parse_date_code(v);
    if (!d) return null;
    return `${String(d.y).padStart(4, '0')}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
  }
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

const asDateString = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v == null ? null : String(v).slice(0, 10));

// A member with no birthday on file is treated as an adult, matching how the
// club has always handled undated members. `overrides.isAdult` beats this.
const deriveIsAdult = (rec, overrides) => {
  const forced = (overrides.isAdult || {})[String(rec.sheetRow)];
  if (typeof forced === 'boolean') return forced;
  if (!rec.dob) return true;
  const born = new Date(`${rec.dob}T00:00:00Z`);
  const now = new Date();
  let age = now.getUTCFullYear() - born.getUTCFullYear();
  const beforeBirthday = now.getUTCMonth() < born.getUTCMonth()
    || (now.getUTCMonth() === born.getUTCMonth() && now.getUTCDate() < born.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age >= 18;
};

const displayName = (rec) => [rec.first_name, rec.last_name].filter(Boolean).join(' ').trim() || null;

// Column caps after migration 001, for the truncation report.
const CAPS = {
  last_name: 60, first_name: 60, occupation: 60, phone: 20, email: 255,
  hangeul: 50, name: 100, altname: 50, level: 50,
  street: 120, city: 60, province: 2, postal_code: 10,
};

// XLSX column index -> member field. Column A is the row number.
const COLS = {
  last_name: 1, first_name: 2, hangeul: 3, street: 4, city: 5, province: 6,
  postal_code: 7, phone: 8, email: 9, occupation: 10, dan: 11,
  dan_issue_date: 12, height_cm: 13, dob: 14, gender: 15, applied_date: 16,
};

// Fields the spreadsheet owns, in report order.
const XLSX_FIELDS = [
  'last_name', 'first_name', 'gender', 'height_cm', 'occupation',
  'dan_issue_date', 'dob', 'phone', 'email', 'applied_date',
];

// ---------------------------------------------------------------- parse
function readSheet(file) {
  const wb = XLSX.readFile(file, { cellDates: true });
  const sheetName = wb.SheetNames.find((n) => n.trim() === '\u3131');
  if (!sheetName) throw new Error(`sheet not found; sheets are ${wb.SheetNames.join(', ')}`);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
    header: 1, blankrows: false, raw: false, cellDates: true,
  });
  // The sheet's !ref starts at A2, so rows[0] is the header row and rows[1] is the first member.
  const data = rows.slice(1);

  return data
    .map((r, i) => {
      const pick = (k) => r[COLS[k]];
      const rec = {
        sheetRow: i + 3, // spreadsheet row number, for the report
        last_name: str(pick('last_name')),
        first_name: str(pick('first_name')),
        hangeul: str(pick('hangeul')),
        key: normHangeul(pick('hangeul')),
        street: str(pick('street')),
        city: str(pick('city')),
        province: str(pick('province')),
        postal_code: str(pick('postal_code')),
        phone: str(pick('phone')),
        email: str(pick('email')),
        occupation: str(pick('occupation')),
        dan: str(pick('dan')),
        dan_issue_date: excelDate(pick('dan_issue_date')),
        height_cm: blank(pick('height_cm')) ? null : Number.parseInt(String(pick('height_cm')), 10) || null,
        dob: excelDate(pick('dob')),
        gender: (() => {
          const g = str(pick('gender'));
          return g && /^[MF]$/i.test(g) ? g.toUpperCase() : null;
        })(),
        applied_date: excelDate(pick('applied_date')),
      };
      // Column L holds a bare number; the DB stores "<n> Dan".
      rec.level = rec.dan && /^\d+$/.test(rec.dan) ? `${rec.dan} Dan` : rec.dan;
      return rec;
    })
    .filter((r) => r.key !== '');
}

// ---------------------------------------------------------------- db
async function readMembers() {
  const { rows: cols } = await pool.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'centurymember'`);
  const present = new Set(cols.map((c) => c.column_name));

  const wanted = ['member_id', 'name', 'hangeul', 'altname', 'img', 'level', 'is_adult', 'is_active',
    'status', 'guardian_id', 'address', 'phone', 'email', 'dob', 'start_date',
    ...XLSX_FIELDS, 'household_id', 'notes'];
  const select = [...new Set(wanted)].filter((c) => present.has(c));
  const { rows } = await pool.query(`SELECT ${select.join(', ')} FROM centurymember ORDER BY member_id`);

  return {
    rows: rows.map((r) => {
      const out = { ...r, key: normHangeul(r.hangeul) };
      for (const f of ['dob', 'start_date', 'dan_issue_date', 'applied_date']) {
        if (f in out) out[f] = asDateString(out[f]);
      }
      return out;
    }),
    present,
    migrated: present.has('status') && present.has('gender'),
  };
}

// ---------------------------------------------------------------- diff
function planUpdates(dbRows, sheetRows, overrides) {
  const dbByKey = new Map();
  const dbDupes = new Set();
  for (const r of dbRows) {
    if (dbByKey.has(r.key)) dbDupes.add(r.key);
    else dbByKey.set(r.key, r);
  }
  const sheetByKey = new Map();
  const sheetDupes = new Set();
  for (const r of sheetRows) {
    if (sheetByKey.has(r.key)) sheetDupes.add(r.key);
    else sheetByKey.set(r.key, r);
  }

  const pairs = [];
  const matchedDbIds = new Set();
  const matchedSheetRows = new Set();

  // Explicit human adjudications (Step 4) win over key matching.
  for (const [sheetRow, memberId] of Object.entries(overrides.pairs || {})) {
    const s = sheetRows.find((r) => String(r.sheetRow) === String(sheetRow));
    const d = dbRows.find((r) => r.member_id === memberId);
    if (s && d) {
      pairs.push({ db: d, sheet: s, via: 'override' });
      matchedDbIds.add(d.member_id);
      matchedSheetRows.add(s.sheetRow);
    }
  }

  for (const s of sheetRows) {
    if (matchedSheetRows.has(s.sheetRow)) continue;
    if (sheetDupes.has(s.key) || dbDupes.has(s.key)) continue; // never guess between duplicates
    const d = dbByKey.get(s.key);
    if (!d || matchedDbIds.has(d.member_id)) continue;
    pairs.push({ db: d, sheet: s, via: 'hangeul' });
    matchedDbIds.add(d.member_id);
    matchedSheetRows.add(s.sheetRow);
  }

  const updates = [];
  const truncations = [];
  for (const { db, sheet, via } of pairs) {
    const changes = [];
    const consider = (field, value) => {
      if (blank(value)) return;                       // blank never overwrites
      const current = db[field] === undefined ? null : db[field];
      if (String(current ?? '') === String(value)) return;
      if (CAPS[field] && String(value).length > CAPS[field]) {
        truncations.push({ member_id: db.member_id, field, length: String(value).length, cap: CAPS[field], value });
      }
      changes.push({ field, from: current, to: value });
    };

    for (const f of XLSX_FIELDS) consider(f, sheet[f]);
    // level: the spreadsheet fills a gap only, it never overwrites a DB rank.
    if (blank(db.level) && !blank(sheet.level)) consider('level', sheet.level);

    if (changes.length) updates.push({ db, sheet, via, changes });
  }

  const dbOnly = dbRows.filter((r) => !matchedDbIds.has(r.member_id));
  const sheetOnly = sheetRows.filter((r) => !matchedSheetRows.has(r.sheetRow));

  // Unmatched sheet rows the human adjudication (Step 4) says to create.
  //
  // A row whose hangeul is duplicated in the DB never reaches the matcher, so on a
  // second run it would land back here and be inserted again. Treat an existing row
  // with the same hangeul AND the same dob as proof this row was already created.
  const insertRows = new Set((overrides.insert || []).map(String));
  const alreadyInserted = (r) => dbRows.some((d) => d.key === r.key && d.dob && r.dob && d.dob === r.dob);

  const candidates = sheetOnly.filter((r) => insertRows.has(String(r.sheetRow)));
  const inserts = candidates
    .filter((r) => !alreadyInserted(r))
    .map((r) => ({ sheet: r, name: displayName(r), is_adult: deriveIsAdult(r, overrides) }));
  const skippedInserts = candidates.filter(alreadyInserted);
  const stillUnadjudicated = sheetOnly.filter((r) => !insertRows.has(String(r.sheetRow)));

  for (const ins of inserts) {
    for (const [field, cap] of Object.entries(CAPS)) {
      const v = field === 'name' ? ins.name : ins.sheet[field];
      if (v && String(v).length > cap) {
        truncations.push({ member_id: `new (row ${ins.sheet.sheetRow})`, field, length: String(v).length, cap, value: v });
      }
    }
  }

  return { pairs, updates, dbOnly, sheetOnly, stillUnadjudicated, inserts, skippedInserts, dbDupes, sheetDupes, truncations };
}

// ---------------------------------------------------------------- households (preview for Step 6)
function clusterHouseholds(sheetRows) {
  const key = (r) => `${(r.street || '').toLowerCase().replace(/\s+/g, ' ').trim()}|${(r.postal_code || '').toUpperCase().replace(/\s+/g, '')}`;
  const map = new Map();
  for (const r of sheetRows) {
    if (blank(r.street) && blank(r.postal_code)) continue;
    const k = key(r);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(r);
  }
  return [...map.entries()].map(([k, members]) => ({ k, members }));
}

// ---------------------------------------------------------------- report
function writeReport(result, meta) {
  const { pairs, updates, dbOnly, sheetOnly, stillUnadjudicated, inserts, skippedInserts, dbDupes, sheetDupes, truncations } = result;
  const stamp = new Date().toISOString().slice(0, 10);
  const out = path.join(__dirname, '..', 'reports', `merge-${stamp}.md`);
  const L = [];
  const val = (v) => (v === null || v === undefined || v === '' ? '_(empty)_' : String(v));

  L.push(`# Membership merge report — ${stamp}`, '');
  L.push(`Source: \`${meta.xlsxPath}\``);
  L.push(`Mode: **${meta.apply ? 'APPLY' : 'dry run — nothing written'}**`);
  if (!meta.migrated) {
    L.push('', '> **Schema not yet migrated.** Migration 001 has not been applied, so the columns',
      '> `gender`, `height_cm`, `occupation`, `dan_issue_date`, `applied_date`, `last_name` and',
      '> `first_name` do not exist yet. Their diffs below are shown as new values against an',
      '> empty column. Re-run this dry run after Step 2 before applying.');
  }
  L.push('');
  L.push('## 1. Summary', '');
  L.push('| | count |', '|---|---|');
  L.push(`| DB rows | ${meta.dbCount} |`);
  L.push(`| XLSX rows (sheet ㄱ) | ${meta.sheetCount} |`);
  L.push(`| matched | ${pairs.length} |`);
  L.push(`| matched with changes to write | ${updates.length} |`);
  L.push(`| matched, already identical | ${pairs.length - updates.length} |`);
  L.push(`| DB-only (unmatched, kept as-is) | ${dbOnly.length} |`);
  L.push(`| XLSX-only (unmatched) | ${sheetOnly.length} |`);
  L.push(`| └ to insert as new members | ${inserts.length} |`);
  L.push(`| └ already inserted on an earlier run | ${skippedInserts.length} |`);
  L.push(`| └ still unadjudicated | ${stillUnadjudicated.length} |`);
  L.push(`| field changes total | ${updates.reduce((n, u) => n + u.changes.length, 0)} |`);
  L.push('');
  L.push(`Reconciliation: matched + DB-only = ${pairs.length + dbOnly.length} (expect ${meta.dbCount}); `
    + `matched + XLSX-only = ${pairs.length + sheetOnly.length} (expect ${meta.sheetCount}).`);
  L.push('');

  L.push('## 2. Per-member field diffs', '');
  if (!updates.length) L.push('_No changes — the merge is idempotent._', '');
  for (const u of updates) {
    L.push(`### ${u.db.member_id} — ${u.db.name || ''} (${u.db.hangeul}) · sheet row ${u.sheet.sheetRow}`
      + `${u.via === 'override' ? ' · paired by override' : ''}`, '');
    L.push('| field | DB value | XLSX value | action |', '|---|---|---|---|');
    for (const c of u.changes) {
      L.push(`| \`${c.field}\` | ${val(c.from)} | ${val(c.to)} | ${blank(c.from) ? 'fill' : '**overwrite**'} |`);
    }
    L.push('');
  }

  L.push('## 2b. New members to insert (adjudicated in Step 4)', '');
  if (!inserts.length) L.push('_None._', '');
  if (skippedInserts.length) {
    L.push(`${skippedInserts.length} adjudicated row(s) already exist in the DB with the same hangeul and `
      + 'birthday, so they are not inserted again: '
      + skippedInserts.map((r) => `row ${r.sheetRow} (${r.hangeul})`).join(', ') + '.', '');
  }
  else {
    L.push('| sheet row | name | hangeul | dob | gender | adult | level | city |', '|---|---|---|---|---|---|---|---|');
    for (const i of inserts) {
      L.push(`| ${i.sheet.sheetRow} | ${val(i.name)} | ${val(i.sheet.hangeul)} | ${val(i.sheet.dob)} | `
        + `${val(i.sheet.gender)} | ${i.is_adult ? 'adult' : 'minor'} | ${val(i.sheet.level)} | ${val(i.sheet.city)} |`);
    }
    L.push('');
    L.push('`member_id` comes from `member_id_seq`; `status` defaults to `active`; `start_date` is left');
    L.push('null (the DB owns it — the spreadsheet\'s Date column lands in `applied_date`).', '');
  }

  if (meta.corrections.length) {
    L.push('## 2c. Source corrections applied (from the overrides file)', '');
    L.push('| sheet row | field | spreadsheet says | corrected to |', '|---|---|---|---|');
    for (const c of meta.corrections) L.push(`| ${c.row} | \`${c.field}\` | ${val(c.from)} | ${val(c.to)} |`);
    L.push('');
  }

  L.push('## 3. Unmatched rows', '');
  L.push(`### DB-only — kept as-is, no spreadsheet counterpart (${dbOnly.length})`, '');
  L.push('| member_id | name | hangeul | level | status | start_date |', '|---|---|---|---|---|---|');
  for (const r of dbOnly) {
    const status = r.status ?? (r.is_active ? 'active' : 'inactive');
    L.push(`| ${r.member_id} | ${val(r.name)} | ${val(r.hangeul)} | ${val(r.level)} | ${val(status)} | ${val(r.start_date)} |`);
  }
  L.push('');
  L.push(`### XLSX-only, still unadjudicated (${stillUnadjudicated.length})`, '');
  L.push('| sheet row | last | first | hangeul | city | dob | gender |', '|---|---|---|---|---|---|---|');
  for (const r of stillUnadjudicated) {
    L.push(`| ${r.sheetRow} | ${val(r.last_name)} | ${val(r.first_name)} | ${val(r.hangeul)} | ${val(r.city)} | ${val(r.dob)} | ${val(r.gender)} |`);
  }
  L.push('');

  L.push('## 4. Duplicate keys — never merged automatically', '');
  const dupes = [...new Set([...dbDupes, ...sheetDupes])];
  if (!dupes.length) L.push('_None._', '');
  for (const k of dupes) {
    L.push(`### \`${k}\``, '');
    L.push('| side | detail |', '|---|---|');
    for (const r of meta.dbRows.filter((x) => x.key === k)) {
      L.push(`| DB | member_id ${r.member_id}, ${val(r.name)}, level ${val(r.level)}, start ${val(r.start_date)} |`);
    }
    for (const r of meta.sheetRows.filter((x) => x.key === k)) {
      L.push(`| XLSX | row ${r.sheetRow}, ${val(r.first_name)} ${val(r.last_name)}, dob ${val(r.dob)}, ${val(r.city)} |`);
    }
    L.push('');
  }

  L.push('## 5. Truncation warnings', '');
  if (!truncations.length) L.push('_None — every value fits its column._', '');
  else {
    L.push('| member_id | field | length | cap | value |', '|---|---|---|---|---|');
    for (const t of truncations) {
      L.push(`| ${t.member_id} | \`${t.field}\` | ${t.length} | ${t.cap} | ${val(t.value)} |`);
    }
    L.push('');
  }

  L.push('## 6. Household clusters (preview for Step 6 — not written by this script)', '');
  const clusters = meta.clusters;
  const multi = clusters.filter((c) => c.members.length > 1);
  const clustered = clusters.reduce((n, c) => n + c.members.length, 0);
  L.push(`${clusters.length} distinct addresses, ${multi.length} with more than one member `
    + `(${multi.reduce((n, c) => n + c.members.length, 0)} people). `
    + `${meta.sheetCount - clustered} rows have no address.`, '');
  L.push('| members | address | who |', '|---|---|---|');
  for (const c of multi.sort((a, b) => b.members.length - a.members.length)) {
    const head = c.members[0];
    L.push(`| ${c.members.length} | ${val(head.street)}, ${val(head.city)} ${val(head.postal_code)} | ${c.members.map((m) => m.hangeul).join(', ')} |`);
  }
  L.push('');

  fs.writeFileSync(out, L.join('\n'), 'utf8');
  return out;
}

// ---------------------------------------------------------------- apply
// Columns a new member row is built from. member_id comes from member_id_seq,
// status defaults to 'active', and start_date stays null — the DB owns it and the
// spreadsheet's Date column lands in applied_date instead.
const INSERT_FIELDS = ['last_name', 'first_name', 'gender', 'height_cm', 'occupation',
  'level', 'dan_issue_date', 'dob', 'phone', 'email', 'applied_date'];

async function applyUpdates(updates, inserts) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const u of updates) {
      const values = [];
      const sets = u.changes.map((c) => {
        values.push(c.to);
        return `${c.field} = $${values.length}`;
      });
      sets.push('last_update = now()');
      values.push(u.db.member_id);
      await client.query(`UPDATE centurymember SET ${sets.join(', ')} WHERE member_id = $${values.length}`, values);
    }

    const inserted = [];
    for (const ins of inserts) {
      const cols = ['name', 'hangeul', 'is_adult'];
      const values = [ins.name, ins.sheet.hangeul, ins.is_adult];
      for (const f of INSERT_FIELDS) {
        if (blank(ins.sheet[f])) continue;
        cols.push(f);
        values.push(ins.sheet[f]);
      }
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      const { rows } = await client.query(
        `INSERT INTO centurymember (${cols.join(', ')}) VALUES (${placeholders})
         RETURNING member_id, name, hangeul`, values);
      inserted.push(rows[0]);
    }

    await client.query('COMMIT');
    return { updated: updates.length, inserted };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------- main
(async () => {
  const overrides = OVERRIDES_PATH && fs.existsSync(OVERRIDES_PATH)
    ? JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8'))
    : {};

  const sheetRows = readSheet(XLSX_PATH);
  // Corrections to the source data, recorded rather than edited into the workbook,
  // so a re-download of the spreadsheet does not silently undo them.
  const corrections = [];
  for (const [row, fields] of Object.entries(overrides.values || {})) {
    const rec = sheetRows.find((r) => String(r.sheetRow) === String(row));
    if (!rec) continue;
    for (const [field, value] of Object.entries(fields)) {
      corrections.push({ row, field, from: rec[field], to: value });
      rec[field] = value;
    }
  }

  const { rows: dbRows, migrated } = await readMembers();

  const result = planUpdates(dbRows, sheetRows, overrides);
  const clusters = clusterHouseholds(sheetRows);

  const reportPath = writeReport(result, {
    xlsxPath: XLSX_PATH,
    apply: APPLY,
    migrated,
    dbCount: dbRows.length,
    sheetCount: sheetRows.length,
    dbRows,
    sheetRows,
    clusters,
    corrections,
  });

  console.log(`matched ${result.pairs.length} · to update ${result.updates.length} · `
    + `to insert ${result.inserts.length} (${result.skippedInserts.length} already present) · DB-only ${result.dbOnly.length} · `
    + `XLSX-only ${result.sheetOnly.length} (${result.stillUnadjudicated.length} unadjudicated) · `
    + `truncations ${result.truncations.length}`);
  console.log(`report: ${reportPath}`);

  if (APPLY) {
    if (!migrated) throw new Error('refusing to apply: migration 001 has not been run');
    if (result.truncations.length) throw new Error('refusing to apply: truncation warnings present');
    const { updated, inserted } = await applyUpdates(result.updates, result.inserts);
    console.log(`applied ${updated} updates and ${inserted.length} inserts in one transaction`);
    for (const r of inserted) console.log(`  + ${r.member_id} ${r.name || ''} (${r.hangeul})`);
  } else {
    console.log('dry run — nothing written');
  }
  await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
