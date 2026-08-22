import formidable from 'formidable';
import fs from 'fs';
import sharp from 'sharp';
import { put } from '@vercel/blob';
import pool from '../../utils/vercelpostgres';

export const config = {
  api: { bodyParser: false },
};

const STATUS_VALUES = ['active', 'inactive', 'pending'];

// Fields the admin form may update, with the parser that turns the multipart
// string into the value the column expects. `is_active` is deliberately absent:
// since migration 001 it is a generated column derived from `status` and cannot
// be written. Only keys actually present in the submitted form are updated, so a
// form that does not yet render a field never blanks it.
const UPDATABLE_FIELDS = {
  name: (v) => v || null,
  hangeul: (v) => v || null,
  altname: (v) => v || null,
  last_name: (v) => v || null,
  first_name: (v) => v || null,
  level: (v) => v || null,
  status: (v) => (STATUS_VALUES.includes(v) ? v : 'active'),
  is_adult: (v) => v === 'true',
  gender: (v) => (v === 'M' || v === 'F' ? v : null),
  height_cm: (v) => (v === '' || v == null ? null : Number.parseInt(v, 10) || null),
  occupation: (v) => v || null,
  start_date: (v) => v || null,
  dob: (v) => v || null,
  dan_issue_date: (v) => v || null,
  applied_date: (v) => v || null,
  phone: (v) => v || null,
  email: (v) => v || null,
  household_id: (v) => (v === '' || v == null ? null : Number.parseInt(v, 10) || null),
  notes: (v) => v || null,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({ maxFileSize: 10 * 1024 * 1024 });

  let fields, files;
  try {
    [fields, files] = await form.parse(req);
  } catch (err) {
    return res.status(400).json({ error: 'Failed to parse form: ' + String(err) });
  }

  const has = (key) => Object.prototype.hasOwnProperty.call(fields, key);
  const get = (key) => (Array.isArray(fields[key]) ? fields[key][0] : fields[key]);

  const memberId = get('member_id');
  if (!memberId) return res.status(400).json({ error: 'member_id is required' });

  const name = get('name');
  const altname = get('altname') || null;

  let imgValue = null;

  const uploadedFile = files.photo?.[0] ?? files.photo;
  if (uploadedFile) {
    const displayName = (altname || name || '').trim().toLowerCase();
    const blobPath = `profile/${displayName}.jpg`;

    try {
      const buffer = fs.readFileSync(uploadedFile.filepath);
      const processed = await sharp(buffer)
        .resize(500, 500, { fit: 'cover', position: 'centre' })
        .grayscale()
        .jpeg({ quality: 90 })
        .toBuffer();

      const blob = await put(blobPath, processed, {
        access: 'public',
        contentType: 'image/jpeg',
        addRandomSuffix: false,
        allowOverwrite: true,
      });

      imgValue = blob.url;
    } catch (err) {
      console.error('Image processing/upload error:', err);
      return res.status(500).json({ error: 'Image upload failed: ' + String(err) });
    } finally {
      try { fs.unlinkSync(uploadedFile.filepath); } catch (_) {}
    }
  }

  try {
    const setClauses = [];
    const values = [];

    for (const [column, parse] of Object.entries(UPDATABLE_FIELDS)) {
      if (!has(column)) continue;
      values.push(parse(get(column)));
      setClauses.push(`${column} = $${values.length}`);
    }

    if (imgValue) {
      values.push(imgValue);
      setClauses.push(`img = $${values.length}`);
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No updatable fields submitted' });
    }

    setClauses.push('last_update = now()');

    values.push(memberId);
    const idParam = `$${values.length}`;

    await pool.query(
      `UPDATE centurymember SET ${setClauses.join(', ')} WHERE member_id = ${idParam}`,
      values
    );

    try {
      await res.revalidate('/members');
    } catch (revalErr) {
      console.error('Members revalidation failed:', revalErr);
    }

    return res.status(200).json({ success: true, img: imgValue });
  } catch (err) {
    console.error('api/update-member DB error:', err?.stack || err);
    return res.status(500).json({ error: 'Database update failed: ' + String(err) });
  }
}
