import formidable from 'formidable';
import fs from 'fs';
import sharp from 'sharp';
import { put } from '@vercel/blob';
import pool from '../../utils/vercelpostgres';

export const config = {
  api: { bodyParser: false },
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

  const get = (key) => (Array.isArray(fields[key]) ? fields[key][0] : fields[key]);

  const memberId = get('member_id');
  if (!memberId) return res.status(400).json({ error: 'member_id is required' });

  const name = get('name');
  const hangeul = get('hangeul');
  const altname = get('altname') || null;
  const level = get('level') || null;
  const isActive = get('is_active') === 'true';
  const isAdult = get('is_adult') === 'true';
  const startDate = get('start_date') || null;

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
    const setClauses = [
      'name = $1',
      'hangeul = $2',
      'altname = $3',
      'level = $4',
      'is_active = $5',
      'is_adult = $6',
      'start_date = $7',
      'last_update = now()',
    ];
    const values = [name, hangeul, altname, level, isActive, isAdult, startDate || null];

    if (imgValue) {
      setClauses.push(`img = $${values.length + 1}`);
      values.push(imgValue);
    }

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
