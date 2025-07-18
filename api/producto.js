import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    if (req.method === 'GET') {
      const [rows] = await connection.execute('SELECT * FROM productos');
      res.status(200).json(rows);
    } else {
      res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  } finally {
    if (connection) await connection.end();
  }
}
