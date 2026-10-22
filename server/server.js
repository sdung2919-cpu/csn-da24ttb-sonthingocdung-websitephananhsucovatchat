const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../client')));

// Mount API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/tech', require('./routes/techRoutes'));

// Trang gốc điều hướng tới đăng nhập hoặc trang chủ
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/login.html'));
});

app.listen(PORT, () => {
  console.log(`Hệ thống CSVC - TVU đang hoạt động tại http://localhost:${PORT}`);
});