const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const port = 3000;

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'app_user',
  password: 'secure_password',
  database: 'practice_app'
};

let dbConnection;

// Create database connection pool
async function initializeDb() {
  try {
    dbConnection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
}

// Health endpoint
app.get('/health', async (req, res) => {
  try {
    await dbConnection.ping();
    res.json({ status: 'healthy', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// Users endpoint
app.get('/users', async (req, res) => {
  try {
    const [rows] = await dbConnection.execute('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Initialize and start server
initializeDb().then(() => {
  app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`);
  });
});

// Handle shutdown gracefully
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing server and database connection...');
  if (dbConnection) await dbConnection.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing server and database connection...');
  if (dbConnection) await dbConnection.end();
  process.exit(0);
});
