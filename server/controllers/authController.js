const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 1. CHỨC NĂNG ĐĂNG KÝ TÀI KHOẢN
exports.register = async (req, res) => {
  try {
    const { fullname, user_code, email, phone, role, password } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!fullname || !user_code || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng nhập đầy đủ họ tên, mã số (MSSV/Mã CB) và mật khẩu!' 
      });
    }

    // Kiểm tra trùng mã số (MSSV / Mã Cán bộ)
    const [existingCode] = await db.query('SELECT id FROM users WHERE user_code = ?', [user_code]);
    if (existingCode.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Mã số "${user_code}" đã tồn tại trên hệ thống! Vui lòng kiểm tra lại.` 
      });
    }

    // Kiểm tra trùng email (nếu có nhập)
    if (email) {
      const [existingEmail] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existingEmail.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Email "${email}" đã được đăng ký tài khoản khác!` 
        });
      }
    }

    // Băm mật khẩu an toàn bằng bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Lưu vào bảng users trong MySQL
    const assignedRole = role || 'student';
    const [insertResult] = await db.query(
      'INSERT INTO users (user_code, fullname, email, phone, password, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_code, fullname, email || null, phone || null, hashedPassword, assignedRole, 'active']
    );

    const newUserId = insertResult.insertId;

    // Tạo phiên đăng nhập (JWT token)
    const token = jwt.sign(
      { id: newUserId, user_code, fullname, role: assignedRole },
      process.env.JWT_SECRET || 'tvu_csvc_secure_secret_key_2026',
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      token,
      user: { id: newUserId, user_code, fullname, role: assignedRole }
    });

  } catch (err) {
    console.error('Lỗi khi đăng ký:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi cơ sở dữ liệu: ' + (err.sqlMessage || err.message) 
    });
  }
};

// 2. CHỨC NĂNG ĐĂNG NHẬP
exports.login = async (req, res) => {
  try {
    const { user_code, password, role, fullname } = req.body;

    if (!user_code) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã số!' });
    }

    const [users] = await db.query('SELECT * FROM users WHERE user_code = ?', [user_code]);
    let user;

    if (users.length === 0) {
      // Tự động tạo nhanh tài khoản cho đăng nhập mẫu nếu chưa có
      const assignedRole = role || 'student';
      const displayName = fullname || user_code;
      const salt = await bcrypt.genSalt(10);
      const defaultHash = await bcrypt.hash('123456', salt);

      const [insertRes] = await db.query(
        'INSERT INTO users (user_code, fullname, password, role, status) VALUES (?, ?, ?, ?, ?)',
        [user_code, displayName, defaultHash, assignedRole, 'active']
      );
      user = { id: insertRes.insertId, user_code, fullname: displayName, role: assignedRole };
    } else {
      user = users[0];
    }

    const token = jwt.sign(
      { id: user.id, user_code: user.user_code, fullname: user.fullname, role: user.role },
      process.env.JWT_SECRET || 'tvu_csvc_secure_secret_key_2026',
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user: { id: user.id, user_code: user.user_code, fullname: user.fullname, role: user.role }
    });
  } catch (err) {
    console.error('Lỗi khi đăng nhập:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi đăng nhập hệ thống: ' + (err.sqlMessage || err.message) 
    });
  }
};