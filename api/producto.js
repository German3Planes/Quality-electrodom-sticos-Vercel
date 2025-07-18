import mysql from 'mysql2/promise';

let connection;

// Crear conexión solo si no existe (para evitar errores en Vercel)
async function connectDB() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  }
  return connection;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // CORS preflight
  }

  try {
    const conn = await connectDB();

    if (req.method === 'GET') {
      const [rows] = await conn.execute('SELECT * FROM productos ORDER BY id');
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { nombre, descripcion, precio, image } = req.body;
      if (!nombre || !descripcion || isNaN(Number(precio))) {
        return res.status(400).json({ error: 'Datos inválidos' });
      }
      await conn.execute(
        'INSERT INTO productos (nombre, descripcion, precio, image) VALUES (?, ?, ?, ?)',
        [nombre, descripcion, precio, image]
      );
      return res.status(201).json({ message: 'Producto creado' });
    }

    if (req.method === 'PUT') {
      const { id, nombre, descripcion, precio, image } = req.body;
      if (!id) return res.status(400).json({ error: 'ID requerido' });
      await conn.execute(
        'UPDATE productos SET nombre=?, descripcion=?, precio=?, image=? WHERE id=?',
        [nombre, descripcion, precio, image, id]
      );
      return res.status(200).json({ message: 'Producto actualizado' });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID requerido' });
      await conn.execute('DELETE FROM productos WHERE id=?', [id]);
      return res.status(200).json({ message: 'Producto eliminado' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Método ${req.method} no permitido`);
  } catch (err) {
    console.error('ERROR EN EL BACKEND:', err.message);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}
