-- 1. Tạo cơ sở dữ liệu nếu chưa có
CREATE DATABASE IF NOT EXISTS school_incident_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE school_incident_db;

-- 2. Xóa các bảng cũ (nếu muốn làm mới lại từ đầu, theo đúng thứ tự khóa ngoại)
DROP TABLE IF EXISTS report_history;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS report_images;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- 3. Tạo bảng người dùng (Users)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_code VARCHAR(50) UNIQUE NOT NULL, -- MSSV hoặc Mã cán bộ (DA24TTB, ADMIN01...)
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'lecturer', 'admin', 'technician') NOT NULL DEFAULT 'student',
    phone VARCHAR(20),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Tạo bảng danh mục loại sự cố (Categories)
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active'
) ENGINE=InnoDB;

-- 5. Tạo bảng vị trí phòng học / giảng đường (Locations)
CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campus VARCHAR(50) NOT NULL,
    building VARCHAR(50) NOT NULL,
    room VARCHAR(50) NOT NULL,
    description TEXT
) ENGINE=InnoDB;

-- 6. Tạo bảng phản ánh sự cố (Reports)
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL, -- Mã sự cố tra cứu dạng SC101, SC102...
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    location_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('received', 'assigned', 'in_progress', 'completed', 'rejected') DEFAULT 'received',
    deadline DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 7. Tạo bảng hình ảnh minh chứng và ảnh kết quả xử lý (Report Images)
CREATE TABLE report_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    image_type ENUM('evidence', 'result') DEFAULT 'evidence',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Tạo bảng phân công kỹ thuật viên (Assignments)
CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    technician_id INT NOT NULL,
    assigned_by INT NOT NULL, -- ID của Admin phân công
    note TEXT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 9. Tạo bảng lịch sử xử lý tiến độ (Report History)
CREATE TABLE report_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    actor_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================================
-- DỮ LIỆU MẪU KIỂM THỬ (Mật khẩu mặc định là: 123456)
-- ==========================================================

-- Thêm người dùng mẫu
INSERT INTO users (user_code, fullname, email, password, role, phone) VALUES
('ADMIN01', 'Ban Quản Trị CSVC', 'admin@tvu.edu.vn', '$2a$10$wEkgzR7P22c2Wp23fW3C7OPeQZ5kO1x4q9vF00vB0hXJgT7a3yN5y', 'admin', '02943855246'),
('KT01', 'Anh D Kỹ Thuật', 'tech_d@tvu.edu.vn', '$2a$10$wEkgzR7P22c2Wp23fW3C7OPeQZ5kO1x4q9vF00vB0hXJgT7a3yN5y', 'technician', '0912345678'),
('KT02', 'Anh E Điện Nước', 'tech_e@tvu.edu.vn', '$2a$10$wEkgzR7P22c2Wp23fW3C7OPeQZ5kO1x4q9vF00vB0hXJgT7a3yN5y', 'technician', '0987654321'),
('DA24TTB', 'Sơn Thị Ngọc Dung', 'dungda24ttb@st.tvu.edu.vn', '$2a$10$wEkgzR7P22c2Wp23fW3C7OPeQZ5kO1x4q9vF00vB0hXJgT7a3yN5y', 'student', '0901112233');

-- Thêm danh mục sự cố
INSERT INTO categories (name, description) VALUES
('Thiết bị dạy học', 'Máy chiếu, micro, loa âm tường, màn chiếu, bảng trượt'),
('Hệ thống nước', 'Bồn rửa tay, vòi xịt, rò rỉ đường ống vệ sinh'),
('Hệ thống điện - Đèn', 'Bóng đèn LED, cầu dao tự động, quạt trần, ổ cắm giảng đường');

-- Thêm danh mục vị trí
INSERT INTO locations (campus, building, room, description) VALUES
('Khu I', 'Khu I - Tòa A', 'Phòng A101', 'Phòng học lý thuyết tầng 1'),
('Khu I', 'Khu I - Tòa B', 'Phòng B202', 'Phòng thực hành máy tính tầng 2'),
('Khu II', 'Khu II - Tòa A2', 'Phòng A2.101', 'Giảng đường đa phương tiện Khu 2');

-- Thêm 2 phản ánh mẫu ban đầu
INSERT INTO reports (code, user_id, category_id, location_id, title, description, priority, status) VALUES
('SC101', 4, 1, 3, 'Hỏng máy chiếu phòng A201', 'Máy chiếu không lên nguồn, đèn tín hiệu nhấp nháy đỏ liên tục.', 'high', 'in_progress'),
('SC102', 4, 2, 1, 'Chảy nước bồn rửa tay', 'Khóa van bị lỏng ren, nước chảy liên tục gây ướt sàn nhà vệ sinh.', 'medium', 'received');

-- Phân công công việc mẫu cho kỹ thuật viên Anh D
INSERT INTO assignments (report_id, technician_id, assigned_by, note) VALUES
(1, 2, 1, 'Kiểm tra nguồn và bóng đèn máy chiếu trước giờ học chiều.');

-- Lưu lịch sử mẫu
INSERT INTO report_history (report_id, actor_id, action, new_status, note) VALUES
(1, 4, 'Tạo mới phản ánh', 'received', 'Sinh viên gửi phản ánh sự cố máy chiếu'),
(1, 1, 'Phân công kỹ thuật viên', 'in_progress', 'Admin đã giao cho Anh D Kỹ Thuật'),
(2, 4, 'Tạo mới phản ánh', 'received', 'Gửi phản ánh sự cố rò rỉ nước');