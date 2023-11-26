import { NextResponse } from 'next/server';
import pool from '../../../utils/postgres';
import { useRouter } from 'next/navigation';

export default async function handler(req, res) {
  const router = useRouter();

  console.log('req.query', req.query);

  const data = await req.body;
  console.log('api/manage', data);

  //   const query =
  //     'INSERT INTO event( title, detail, start_date, end_date, color, time_duration) VALUES ($1, $2, $3, $4, $5, $6) returning event_id';
  //   const values = [
  //     data.title === 'Other' || data.title === 'Holiday'
  //       ? data.description
  //       : data.title,
  //     data.description,
  //     data.date.substring(0, 10),
  //     data.date.substring(0, 10),
  //     data.color,
  //     data.time,
  //   ];

  //   try {
  //     const expense = await pool.query(query, values);
  //     res.status(200).json({ result: expense.rows[0].event_id });
  //   } catch (err) {
  //     res.status(500).json({ error: err });
  //   }

  // res.status(200).json({ result: 'okay' });

  router.push('/calendar');
}
