const db = require('../config/db');
const { generateCode } = require('../utils/helpers');

exports.createReport = async (req, res) => {
  try {
    const { title, building, room, category_id, priority, description } = req.body;
    const userId = req.user ? req.user.id : 4; // Mặc định người dùng hiện tại

    if (!title || !building || !category_id || !description) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ các thông tin bắt buộc!' });
    }

    let [loc] = await db.query('SELECT id FROM locations WHERE building = ? AND room = ?', [building, room || 'N/A']);
    let locationId;
    if (loc.length > 0) {
      locationId = loc[0].id;
    } else {
      const [newLoc] = await db.query(
        'INSERT INTO locations (campus, building, room) VALUES (?, ?, ?)',
        ['Khuôn viên trường', building, room || 'N/A']
      );
      locationId = newLoc.insertId;
    }

    const code = generateCode();
    const [reportResult] = await db.query(
      `INSERT INTO reports (code, user_id, category_id, location_id, title, description, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'received')`,
      [code, userId, category_id, locationId, title, description, priority || 'medium']
    );

    const reportId = reportResult.insertId;

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await db.query(
          'INSERT INTO report_images (report_id, image_path, image_type) VALUES (?, ?, ?)',
          [reportId, `/uploads/${file.filename}`, 'evidence']
        );
      }
    }

    await db.query(
      'INSERT INTO report_history (report_id, actor_id, action, new_status, note) VALUES (?, ?, ?, ?, ?)',
      [reportId, userId, 'Tạo phản ánh', 'received', 'Người dùng đã gửi thông tin phản ánh sự cố']
    );

    res.status(201).json({ success: true, message: 'Gửi phản ánh thành công!', code, reportId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi ghi nhận phản ánh vào CSDL!' });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const query = `
      SELECT 
        r.id, r.code, r.title, r.status, r.priority, r.created_at,
        u.fullname AS sender_name, u.role AS sender_role,
        c.name AS category_name,
        CONCAT(l.building, ' - ', l.room) AS location_display,
        tech.fullname AS tech_name,
        a.technician_id
      FROM reports r
      JOIN users u ON r.user_id = u.id
      JOIN categories c ON r.category_id = c.id
      JOIN locations l ON r.location_id = l.id
      LEFT JOIN assignments a ON r.id = a.report_id
      LEFT JOIN users tech ON a.technician_id = tech.id
      ORDER BY r.created_at DESC
    `;
    const [reports] = await db.query(query);
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Không thể truy xuất dữ liệu phản ánh!' });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const [reports] = await db.query(
      `SELECT r.*, c.name AS category_name, l.building, l.room, u.fullname AS sender_name
       FROM reports r
       JOIN categories c ON r.category_id = c.id
       JOIN locations l ON r.location_id = l.id
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ? OR r.code = ?`,
      [id, id]
    );

    if (reports.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sự cố này!' });
    }

    const report = reports[0];
    const [images] = await db.query('SELECT * FROM report_images WHERE report_id = ?', [report.id]);
    const [history] = await db.query(
      `SELECT h.*, u.fullname AS actor_name FROM report_history h 
       JOIN users u ON h.actor_id = u.id WHERE h.report_id = ? ORDER BY h.created_at DESC`,
      [report.id]
    );

    res.json({ success: true, data: { ...report, images, history } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi tải chi tiết phản ánh!' });
  }
};