import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { authMiddleware } from './authMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  debug: true,
  createParentPath: true,
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  },
}));


const router = express.Router();
router.use(authMiddleware);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'filevault',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
let pool = mysql.createPool(dbConfig);
let connection;



// Get all files for user
router.get('/api/files',  async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM files WHERE user_id = ? ORDER BY upload_date DESC',
      [req.user.userId]
    );
    
    // Transform database rows to API response format
    const files = rows.map(file => ({
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: `${req.protocol}://${req.get('host')}/uploads/${file.path}`,
      uploadDate: file.upload_date,
      lastModified: file.last_modified,
      userId: file.user_id
    }));
    
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Failed to fetch files' });
  }
});

// Get single file
router.get('/api/files/:id',  async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM files WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    const file = rows[0];
    
    res.json({
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: `${req.protocol}://${req.get('host')}/uploads/${file.path}`,
      uploadDate: file.upload_date,
      lastModified: file.last_modified,
      userId: file.user_id
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: 'Failed to fetch file' });
  }
});

// Upload file
router.post('/api/files/upload', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No files were uploaded' });
    }
    
    const file = req.files.file;
    const userId = req.user.userId;
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = path.join(uploadsDir, fileName);
    
    // Move file to uploads directory
    await file.mv(filePath);
    
    // Generate a unique ID for the file
    const fileId = `file_${timestamp}`;
    
    // Save file metadata to database
    const [result] = await pool.query(
      'INSERT INTO files (id, name, type, size, path, user_id, upload_date, last_modified) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [fileId, file.name, file.mimetype, file.size, fileName, userId]
    );
    
    // Get the newly created file
    const [rows] = await pool.query('SELECT * FROM files WHERE id = ?', [fileId]);
    
    if (rows.length === 0) {
      return res.status(500).json({ message: 'Failed to create file record' });
    }
    
    const newFile = rows[0];
    
    res.status(201).json({
      id: newFile.id,
      name: newFile.name,
      type: newFile.type,
      size: newFile.size,
      url: `${req.protocol}://${req.get('host')}/uploads/${newFile.path}`,
      uploadDate: newFile.upload_date,
      lastModified: newFile.last_modified,
      userId: newFile.user_id
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
});

// Update file
router.put('/api/files/:id',  async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    // First check if file exists and belongs to user
    const [rows] = await pool.query(
      'SELECT * FROM files WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Update file metadata
    await pool.query(
      'UPDATE files SET name = ?, last_modified = NOW() WHERE id = ?',
      [name, req.params.id]
    );
    
    // Get updated file
    const [updatedRows] = await pool.query('SELECT * FROM files WHERE id = ?', [req.params.id]);
    
    if (updatedRows.length === 0) {
      return res.status(500).json({ message: 'Failed to update file' });
    }
    
    const updatedFile = updatedRows[0];
    
    res.json({
      id: updatedFile.id,
      name: updatedFile.name,
      type: updatedFile.type,
      size: updatedFile.size,
      url: `${req.protocol}://${req.get('host')}/uploads/${updatedFile.path}`,
      uploadDate: updatedFile.upload_date,
      lastModified: updatedFile.last_modified,
      userId: updatedFile.user_id
    });
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ message: 'Failed to update file' });
  }
});

// Delete file
router.delete('/api/files/:id',  async (req, res) => {
  try {
    // First check if file exists and belongs to user
    const [rows] = await pool.query(
      'SELECT * FROM files WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    const file = rows[0];
    
    // Delete file from filesystem
    const filePath = path.join(uploadsDir, file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete file metadata from database
    await pool.query('DELETE FROM files WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
});

// Initialize database with required tables
const initializeDatabase = async () => {
  try {

    try{
      connection = await pool.getConnection();
    }
    catch(err){
      const newConfig = {...dbConfig};
      delete newConfig.database;
      pool = mysql.createPool(newConfig);
      connection = await pool.getConnection();
      await connection.execute('CREATE DATABASE IF NOT EXISTS filevault');
      await connection.release();
      pool = mysql.createPool(dbConfig);
    }

    // Create files table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS files (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(255) NOT NULL,
        size BIGINT NOT NULL,
        path VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        upload_date DATETIME NOT NULL,
        last_modified DATETIME NOT NULL,
        INDEX user_id_idx (user_id)
      )
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};
app.use('/', router);
// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize database
  await initializeDatabase();
});