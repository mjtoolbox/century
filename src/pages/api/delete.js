import { NextResponse } from 'next/server';
import pool from '../../utils/postgres';

export default async function handler(req, res) {
  console.log('reqbody in hello', req.body);
  const data = await req.body;
  const query = 'DELETE FROM event WHERE event_id = $1';
  const values = [data];

  // console.log('query', query);
  // console.log('values', values);

  try {
    const event = await pool.query(query, values);
    res.status(200).json({ result: 'deleted' });
  } catch (err) {
    res.status(500).json({ error: err });
  }

  // res.status(200).json({ result: 'hello called!' });
}
