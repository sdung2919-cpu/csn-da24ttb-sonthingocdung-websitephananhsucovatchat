const db = require('../config/db');

exports.getMyTasks = async (req, res) => {
  try {
    const techId = req.user ? req.user.id : 2;
    const query = `
      SELECT r.*, c.name AS category_name, CONCAT(l.building, ' - ', l.room) AS location_display, a.note AS assign_note
      FROM reports r
      JOIN assignments a ON r.id = a.report_id
      JOIN categories c ON r.category_id = c.id
      JOIN locations l ON r.location_id = l.id
      WHERE a.technician_id = ?
      ORDER BY r.created_at DESC
    `;
    const [tasks] = await db.query(query, [techId]);
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi tải công việc cá nhân!' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { report_id, status, note } = req.body;
    const techId = req.user ? req.user.id : 2;

    await db.query('UPDATE reports SET status = ? WHERE id = ?', [status, report_id]);
    await db.query(
      'INSERT INTO report_history (report_id, actor_id, action, new_status, note) VALUES (?, ?, ?, ?, ?)',
      [report_id, techId, 'Cập nhật tiến độ', status, note]
    );

    res.json({ success: true, message: 'Cập nhật trạng thái công việc thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái!' });
  }
};