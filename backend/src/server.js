require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
let databaseReady = false;
let databaseError = null;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    message: 'Backend is running',
    database: databaseReady ? 'connected' : 'connecting'
  });
});

app.get('/api/ready', (req, res) => {
  if (!databaseReady) {
    return res.status(503).json({
      message: 'Database is not connected',
      error: databaseError
    });
  }

  res.json({ message: 'Backend and database are ready' });
});

const requireDatabase = (req, res, next) => {
  if (!databaseReady) {
    return res.status(503).json({
      message: 'Database is not connected yet',
      error: databaseError
    });
  }

  next();
};

app.use('/api/auth', requireDatabase, authRoutes);
app.use('/api/projects', requireDatabase, projectRoutes);
app.use('/api/tasks', requireDatabase, taskRoutes);

if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../../frontend/build');
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

connectDB()
  .then(() => {
    databaseReady = true;
    databaseError = null;
  })
  .catch((error) => {
    databaseReady = false;
    databaseError = error.message;
  });

module.exports = app;
