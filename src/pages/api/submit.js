import { NextResponse } from 'next/server';

export default async function handler(req, res) {
  // const data = req.body;
  const data = await req.body;
  console.log('api/submit', data);
  res.status(200).json({ result: 'ok!' });
  // return NextResposne.json({ data });
}
