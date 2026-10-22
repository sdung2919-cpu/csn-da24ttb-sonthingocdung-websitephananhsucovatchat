const db = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const [total] = await db.query('SELECT COUNT(*) AS count FROM reports');
    const [received] = await db.query("SELECT COUNT(*) AS count FROM reports WHERE status = 'received'");
    const [inProgress] = await db.query("SELECT COUNT(*) AS count FROM reports WHERE status IN ('assigned', 'in_progress')");
    const [completed] = await db.query("SELECT COUNT(*) AS count FROM reports WHERE status = 'completed'");

    res.json({
      success: true,
      data: {
        total: total[0].count,
        received: received[0].count,
        inProgress: inProgress[0].count,
        completed: completed[0].count
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy dữ liệu thống kê!' });
  }
};

exports.assignTechnician = async (req, res) => {
  try {
    const { report_id, technician_id, note } = req.body;
    const adminId = req.user ? req.user.id : 1;

    const [existing] = await db.query('SELECT id FROM assignments WHERE report_id = ?', [report_id]);
    if (existing.length > 0) {
      await db.query('UPDATE assignments SET technician_id = ?, note = ? WHERE report_id = ?', [technician_id, note, report_id]);
    } else {
      await db.query('INSERT INTO assignments (report_id, technician_id, assigned_by, note) VALUES (?, ?, ?, ?)', [report_id, technician_id, adminId, note]);
    }

    await db.query("UPDATE reports SET status = 'in_progress' WHERE id = ?", [report_id]);
    await db.query(
      'INSERT INTO report_history (report_id, actor_id, action, new_status, note) VALUES (?, ?, ?, ?, ?)',
      [report_id, adminId, 'Phân công kỹ thuật viên', 'in_progress', note || 'Đã phân công kỹ thuật viên xử lý']
    );

    res.json({ success: true, message: 'Phân công kỹ thuật viên thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi khi phân công công việc!' });
  }
};

exports.getCategories = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM categories');
  res.json({ success: true, data: rows });
};

exports.getTechnicians = async (req, res) => {
  const [rows] = await db.query("SELECT id, fullname, phone FROM users WHERE role = 'technician'");
  res.json({ success: true, data: rows });
};