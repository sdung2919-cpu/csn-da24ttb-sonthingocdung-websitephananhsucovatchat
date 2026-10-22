const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập để thực hiện chức năng!' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tvu_csvc_secure_secret_key_2026');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Phiên đăng nhập hết hạn hoặc không hợp lệ!' });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập khu vực này!' });
    }
    next();
  };
};