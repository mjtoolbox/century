import { NextResponse } from 'next/server';
import pool from '../../utils/postgres';

export default async function handler(req, res) {
  // const data = req.body;
  const data = await req.body;
  console.log('api/submit', data);

  const query =
    'INSERT INTO event( title, detail, start_date, end_date, color, time_duration) VALUES ($1, $2, $3, $4, $5, $6) returning event_id';
  const values = [
    data.title === 'Other' || data.title === 'Holiday'
      ? data.description
      : data.title,
    data.description,
    data.date.substring(0, 10),
    data.date.substring(0, 10),
    data.color,
    data.time,
  ];

  //console.log('query', query);
  // console.log('values', values);

  try {
    const expense = await pool.query(query, values);
    res.status(200).json({ result: expense.rows[0].event_id });
  } catch (err) {
    res.status(500).json({ error: err });
  }

  // res.status(200).json({ result: 'okay' });
}
