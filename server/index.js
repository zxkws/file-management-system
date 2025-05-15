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

// Folders API endpoints
router.get('/api/folders', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM folders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );
    
    // Get file count for each folder
    const foldersWithCounts = await Promise.all(rows.map(async folder => {
      const [fileCount] = await pool.query(
        'SELECT COUNT(*) as count FROM files WHERE folder_id = ?',
        [folder.id]
      );
      
      return {
        ...folder,
        filesCount: fileCount[0].count
      };
    }));
    
    res.json(foldersWithCounts);
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ message: 'Failed to fetch folders' });
  }
});

router.post('/api/folders', async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;
    
    const [result] = await pool.query(
      'INSERT INTO folders (id, name, user_id, created_at) VALUES (?, ?, ?, NOW())',
      [`folder_${Date.now()}`, name, userId]
    );
    
    const [folder] = await pool.query(
      'SELECT * FROM folders WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(folder[0]);
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ message: 'Failed to create folder' });
  }
});

router.put('/api/folders/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const folderId = req.params.id;
    const userId = req.user.userId;
    
    await pool.query(
      'UPDATE folders SET name = ? WHERE id = ? AND user_id = ?',
      [name, folderId, userId]
    );
    
    const [folder] = await pool.query(
      'SELECT * FROM folders WHERE id = ?',
      [folderId]
    );
    
    res.json(folder[0]);
  } catch (error) {
    console.error('Error updating folder:', error);
    res.status(500).json({ message: 'Failed to update folder' });
  }
});

router.delete('/api/folders/:id', async (req, res) => {
  try {
    const folderId = req.params.id;
    const userId = req.user.userId;
    
    // Get all files in the folder
    const [files] = await pool.query(
      'SELECT * FROM files WHERE folder_id = ? AND user_id = ?',
      [folderId, userId]
    );
    
    // Delete all files in the folder from filesystem
    for (const file of files) {
      const filePath = path.join(uploadsDir, file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Delete all files in the folder from database
    await pool.query(
      'DELETE FROM files WHERE folder_id = ? AND user_id = ?',
      [folderId, userId]
    );
    
    // Delete the folder
    await pool.query(
      'DELETE FROM folders WHERE id = ? AND user_id = ?',
      [folderId, userId]
    );
    
    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ message: 'Failed to delete folder' });
  }
});

// Update file upload to support folders
router.post('/api/files/upload', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No files were uploaded' });
    }
    
    const file = req.files.file;
    const folderId = req.body.folderId || null;
    file.name = Buffer.from(file.name, 'latin1').toString('utf8');
    const userId = req.user.userId;
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = path.join(uploadsDir, fileName);
    
    await file.mv(filePath);
    
    const fileId = `file_${timestamp}`;
    
    await pool.query(
      'INSERT INTO files (id, name, type, size, path, folder_id, user_id, upload_date, last_modified) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [fileId, file.name, file.mimetype, file.size, fileName, folderId, userId]
    );
    
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
      userId: newFile.user_id,
      folderId: newFile.folder_id
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
});

// Initialize database with required tables
const initializeDatabase = async () => {
  try {
    try {
      connection = await pool.getConnection();
    } catch(err) {
      const newConfig = {...dbConfig};
      delete newConfig.database;
      pool = mysql.createPool(newConfig);
      connection = await pool.getConnection();
      await connection.execute('CREATE DATABASE IF NOT EXISTS filevault');
      await connection.release();
      pool = mysql.createPool(dbConfig);
    }

    // Create folders table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS folders (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL,
        INDEX user_id_idx (user_id)
      )
    `);

    // Create files table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS files (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(255) NOT NULL,
        size BIGINT NOT NULL,
        path VARCHAR(255) NOT NULL,
        folder_id VARCHAR(255),
        user_id VARCHAR(255) NOT NULL,
        upload_date DATETIME NOT NULL,
        last_modified DATETIME NOT NULL,
        INDEX user_id_idx (user_id),
        INDEX folder_id_idx (folder_id),
        FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
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