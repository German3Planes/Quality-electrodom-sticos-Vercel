import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const [rows] = await connection.execute('SELECT * FROM productos');
    res.status(200).json(rows);
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
