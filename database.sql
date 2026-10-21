-- =====================================================================
-- RADHIKA IT COLLEGE MANAGEMENT SYSTEM - COMPLETE DATABASE SCRIPT
-- Compatible with MySQL / MariaDB / SQLite / PostgreSQL / phpMyAdmin
-- Generated: 2026-10-21T14:04:59.431Z
-- =====================================================================

CREATE DATABASE IF NOT EXISTS radhika_db;
USE radhika_db;

-- ---------------------------------------------------------------------
-- TABLE 1: centers
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS fees;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS notices;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS app_data;
DROP TABLE IF EXISTS centers;

CREATE TABLE centers (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  center_code VARCHAR(50) NOT NULL UNIQUE,
  center_name VARCHAR(150) NOT NULL,
  address TEXT NOT NULL,
  head_name VARCHAR(100) NOT NULL,
  contact VARCHAR(20) NOT NULL,
  email VARCHAR(100) DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- TABLE 2: courses
-- ---------------------------------------------------------------------
CREATE TABLE courses (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  description TEXT DEFAULT NULL,
  eligibility VARCHAR(100) DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- TABLE 3: staff
-- ---------------------------------------------------------------------
CREATE TABLE staff (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  login_id VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL,
  center_id VARCHAR(50) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  email VARCHAR(100) DEFAULT NULL,
  designation VARCHAR(150) DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_staff_center (center_id),
  INDEX idx_staff_login (login_id),
  CONSTRAINT fk_staff_center FOREIGN KEY (center_id) REFERENCES centers (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- TABLE 4: students
-- ---------------------------------------------------------------------
CREATE TABLE students (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  student_name VARCHAR(100) NOT NULL,
  father_name VARCHAR(100) DEFAULT NULL,
  mother_name VARCHAR(100) DEFAULT NULL,
  course VARCHAR(50) NOT NULL,
  mobile VARCHAR(20) DEFAULT NULL,
  email VARCHAR(100) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  admission_date DATE NOT NULL,
  fees DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  center_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_students_center (center_id),
  INDEX idx_students_course (course),
  CONSTRAINT fk_students_center FOREIGN KEY (center_id) REFERENCES centers (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- TABLE 5: fees (Fee Installments & Receipts)
-- ---------------------------------------------------------------------
CREATE TABLE fees (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_mode VARCHAR(30) DEFAULT 'Cash',
  remark TEXT DEFAULT NULL,
  receipt_no VARCHAR(50) DEFAULT NULL,
  collected_by VARCHAR(50) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_fees_student (student_id),
  INDEX idx_fees_date (payment_date),
  CONSTRAINT fk_fees_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- TABLE 6: expenses
-- ---------------------------------------------------------------------
CREATE TABLE expenses (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  center_id VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  category VARCHAR(50) NOT NULL,
  payment_mode VARCHAR(30) DEFAULT 'Cash',
  bill_no VARCHAR(50) DEFAULT NULL,
  remark TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_expenses_center (center_id),
  CONSTRAINT fk_expenses_center FOREIGN KEY (center_id) REFERENCES centers (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- TABLE 7: attendance
-- ---------------------------------------------------------------------
CREATE TABLE attendance (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  center_id VARCHAR(50) NOT NULL,
  course VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  student_id VARCHAR(50) DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'present',
  records_json LONGTEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_attendance_center (center_id),
  CONSTRAINT fk_attendance_center FOREIGN KEY (center_id) REFERENCES centers (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- TABLE 8: notices
-- ---------------------------------------------------------------------
CREATE TABLE notices (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  date DATE NOT NULL,
  target VARCHAR(50) DEFAULT 'all',
  center_id VARCHAR(50) DEFAULT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- TABLE 9: audit_logs
-- ---------------------------------------------------------------------
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(50) DEFAULT NULL,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  record_id VARCHAR(50) DEFAULT NULL,
  details TEXT DEFAULT NULL,
  ip_address VARCHAR(50) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- TABLE 10: app_data (Legacy KV store for Frontend / JSON REST APIs)
-- ---------------------------------------------------------------------
CREATE TABLE app_data (
  `key` VARCHAR(50) NOT NULL PRIMARY KEY,
  `value` LONGTEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- SEED DATA INSERTS
-- ---------------------------------------------------------------------

-- Centers
INSERT INTO centers (id, center_code, center_name, address, head_name, contact, email, status) VALUES
('C001', 'MCHQ01', 'Main Campus (HQ)', 'Civil Lines, Near Town Hall, District HQ, Gorakhpur, UP', 'Dr. R. K. Sharma', '9876543210', 'hq@radhikaitcollege.com', 'active'),
('C002', 'CTC02', 'City Tech Center', 'Station Road, Opp. Central Mall, Golghar, Gorakhpur, UP', 'Prof. Vinay Mishra', '8765432109', 'citytech@radhikaitcollege.com', 'active'),
('C003', 'RIT03', 'Rural IT Development Wing', 'NH-2 Bypass, Near Block Development Office, Sahjanwa, UP', 'Er. Amit Patel', '7654321098', 'rural@radhikaitcollege.com', 'active'),
('C004', 'EBC04', 'East Branch Campus', 'Medical College Road, Asuran Chowk, Gorakhpur, UP', 'Mrs. Archana Singh', '9450123456', 'eastbranch@radhikaitcollege.com', 'active');

-- Courses
INSERT INTO courses (id, code, name, duration, fee, description, eligibility, status) VALUES
('COURSE-001', 'DCA', 'Diploma in Computer Applications', '6 Months', 8000, 'Fundamentals of computers, Windows OS, MS Office suite (Word, Excel, PowerPoint), Internet technologies and basic IT tools.', '10th Pass / High School', 'active'),
('COURSE-002', 'ADCA', 'Advanced Diploma in Computer Applications', '12 Months', 15000, 'Comprehensive IT training covering Office Automation, DTP (Photoshop, PageMaker, CorelDraw), Web Designing (HTML/CSS), and Tally ERP/Prime accounting.', '12th Pass / Intermediate', 'active'),
('COURSE-003', 'PGDCA', 'Post Graduate Diploma in Computer Applications', '12 Months', 18000, 'Professional postgraduate diploma covering Object-Oriented Programming (C++/Java/Python), RDBMS & SQL, Software Engineering, and Web Development.', 'Graduation in any stream', 'active'),
('COURSE-004', 'O-Level', 'NIELIT O-Level IT Certification', '12 Months', 12000, 'Government recognised NIELIT foundation course covering IT Tools, Web Publishing, Python Programming, and Internet of Things (IoT).', '12th Pass or ITI Certificate', 'active'),
('COURSE-005', 'CCC', 'Course on Computer Concepts', '3 Months', 3500, 'Basic digital literacy program certified by NIELIT covering computer basics, GUI OS, LibreOffice, Digital Financial Services, and Cyber Security.', 'No Minimum Qualification', 'active'),
('COURSE-006', 'BA', 'Basic Accounting with Tally Prime', '6 Months', 6500, 'Modern computerized accounting with Tally Prime, GST filing, e-Way bills, TDS calculation, ledger management, and balance sheet preparation.', '10th / 12th Commerce Preferred', 'active'),
('COURSE-007', 'PY-FS', 'Python Full Stack Web Development', '6 Months', 16000, 'Complete web development boot-camp: Python, Django, REST APIs, HTML5, CSS3, JavaScript, SQLite/PostgreSQL, and Git version control.', '12th Pass / Basic computer knowledge', 'active'),
('COURSE-008', 'DTP', 'Desktop Publishing & Graphic Designing', '4 Months', 5500, 'Creative design training in Adobe Photoshop, CorelDRAW, Adobe Illustrator, banner design, magazine layout, and print media preparation.', '10th Pass', 'active');

-- Staff
INSERT INTO staff (id, name, login_id, password, role, center_id, phone, email, designation, status) VALUES
('S001', 'Super Administrator', 'superadmin', '123', 'super_admin', NULL, '9876543200', 'admin@radhikaitcollege.com', 'Managing Director / Super Admin', 'active'),
('S002', 'Vinay Mishra (Center Head)', 'centerhead1', '123', 'center_admin', 'C002', '8765432109', 'vinay@radhikaitcollege.com', 'Center Director - City Branch', 'active'),
('S003', 'Amit Patel (Center Head)', 'centerhead2', '123', 'center_admin', 'C003', '7654321098', 'amit@radhikaitcollege.com', 'Center Director - Rural Branch', 'active'),
('S004', 'Rita Sen (Senior Counselor)', 'staff1', '123', 'staff', 'C001', '9812345678', 'rita@radhikaitcollege.com', 'Senior Academic Counselor & Admission In-charge', 'active'),
('S005', 'Rajesh Kumar (Office Assistant)', 'staff2', '123', 'staff', 'C002', '9123456780', 'rajesh@radhikaitcollege.com', 'Office Executive & Fee Cashier', 'active'),
('S006', 'Sunita Verma (System Operator)', 'staff3', '123', 'staff', 'C003', '9988776611', 'sunita@radhikaitcollege.com', 'Computer Lab Technician', 'inactive'),
('S007', 'Pooja Tiwari (Faculty - Tally & Accounts)', 'faculty1', '123', 'staff', 'C001', '9765432199', 'pooja@radhikaitcollege.com', 'Senior Faculty - Accounting & Tally', 'active'),
('S008', 'Archana Singh (Branch Head)', 'centerhead3', '123', 'center_admin', 'C004', '9450123456', 'archana@radhikaitcollege.com', 'Center Director - East Branch', 'active');

-- Students
INSERT INTO students (id, student_name, father_name, mother_name, course, mobile, email, address, admission_date, fees, center_id, status) VALUES
('RAD-2026-001', 'Aditya Narayan', 'Surendra Prasad', 'Kavita Devi', 'ADCA', '9565123456', 'aditya.n@gmail.com', 'Gola Bazaar, Ward No 4, Gorakhpur', '2026-01-10', 15000, 'C001', 'active'),
('RAD-2026-002', 'Priya Singh', 'Ramesh Singh', 'Anita Singh', 'DCA', '9988776655', 'priyasingh99@gmail.com', 'Rampuri Colony, Lane 3, Gorakhpur', '2026-02-15', 8000, 'C001', 'active'),
('RAD-2026-003', 'Vikram Malhotra', 'K. P. Malhotra', 'Sunita Malhotra', 'PGDCA', '9123456789', 'vikram.m@outlook.com', 'Civil Lines Area, Near Park, Gorakhpur', '2026-03-05', 18000, 'C002', 'active'),
('RAD-2026-004', 'Neha Gupta', 'M. L. Gupta', 'Reena Gupta', 'CCC', '9839401234', 'neha.gupta2026@gmail.com', 'Shastri Nagar, House 14, Gorakhpur', '2026-04-01', 3500, 'C002', 'active'),
('RAD-2026-005', 'Sandeep Yadav', 'Ram Chandra Yadav', 'Shanti Devi', 'O-Level', '7309876543', 'sandeep.yadav@gmail.com', 'Village Pipra, Post Harra, Sahjanwa', '2026-01-22', 12000, 'C003', 'active'),
('RAD-2026-006', 'Komal Preet Kaur', 'Gurmukh Singh', 'Harpreet Kaur', 'ADCA', '8127394850', 'komalpreet@gmail.com', 'Model Town Ext, Sector 2, Sahjanwa', '2026-04-20', 15000, 'C003', 'active'),
('RAD-2026-007', 'Rahul Verma', 'Satya Prakash Verma', 'Maya Verma', 'PGDCA', '9450392817', 'rahul.verma@gmail.com', 'Station Road, Gali 2, Gorakhpur', '2026-02-18', 18000, 'C002', 'completed'),
('RAD-2026-008', 'Sneha Tiwari', 'J. P. Tiwari', 'Geeta Tiwari', 'DCA', '9670394857', 'sneha.tiwari@gmail.com', 'Vikas Nagar Sector A, House 88', '2026-05-02', 8000, 'C001', 'active'),
('RAD-2026-009', 'Amitabh Dubey', 'Dinesh Dubey', 'Sushila Dubey', 'BA', '9335678901', 'amitabh.dubey@gmail.com', 'Betiahata, Near Hanuman Mandir', '2026-05-15', 6500, 'C001', 'active'),
('RAD-2026-010', 'Anjali Maurya', 'Rajendra Maurya', 'Kamla Maurya', 'PY-FS', '9140223344', 'anjali.m@gmail.com', 'Medical Enclave, Gorakhpur', '2026-06-01', 16000, 'C004', 'active'),
('RAD-2026-011', 'Mohd Faisal', 'Abdul Kalam', 'Naseem Bano', 'ADCA', '9889445566', 'faisal.it@gmail.com', 'Turab Nagar, Mohaddipur', '2026-06-05', 15000, 'C002', 'active'),
('RAD-2026-012', 'Roshni Prajapati', 'Subhash Prajapati', 'Malti Devi', 'CCC', '7890123456', 'roshni.p@gmail.com', 'Bichhiya, Campierganj Road', '2026-06-12', 3500, 'C003', 'active');

-- Fees
INSERT INTO fees (id, student_id, amount, payment_date, payment_mode, remark, receipt_no) VALUES
('INV-10001', 'RAD-2026-001', 5000, '2026-01-10', 'Cash', 'Admission installment', 'RCP-2026-001'),
('INV-10002', 'RAD-2026-001', 5000, '2026-03-15', 'UPI', 'Second installment (PhonePe Ref #8892)', 'RCP-2026-002'),
('INV-10003', 'RAD-2026-002', 4000, '2026-02-15', 'Card', '50% fees payment via POS machine', 'RCP-2026-003'),
('INV-10004', 'RAD-2026-003', 10000, '2026-03-05', 'UPI', 'Admission payment (GPay Ref #4412)', 'RCP-2026-004'),
('INV-10005', 'RAD-2026-004', 3500, '2026-04-01', 'Cash', 'Full fees paid at counter', 'RCP-2026-005'),
('INV-10006', 'RAD-2026-005', 6000, '2026-01-22', 'UPI', 'First installment paid online', 'RCP-2026-006'),
('INV-10007', 'RAD-2026-006', 7500, '2026-04-20', 'Cash', '50% course fee installment', 'RCP-2026-007'),
('INV-10008', 'RAD-2026-007', 18000, '2026-02-18', 'UPI', 'Full fees paid - Certificate issued', 'RCP-2026-008'),
('INV-10009', 'RAD-2026-008', 8000, '2026-05-02', 'Cash', 'Full fees one-time payment with discount', 'RCP-2026-009'),
('INV-10010', 'RAD-2026-009', 3500, '2026-05-15', 'UPI', 'First installment of Basic Accounting', 'RCP-2026-010'),
('INV-10011', 'RAD-2026-010', 8000, '2026-06-01', 'Net Banking', 'Admission fee for Python Full Stack', 'RCP-2026-011'),
('INV-10012', 'RAD-2026-011', 5000, '2026-06-05', 'Cash', 'Initial admission fee', 'RCP-2026-012'),
('INV-10013', 'RAD-2026-012', 3500, '2026-06-12', 'UPI', 'CCC full course fees paid', 'RCP-2026-013');

-- Expenses
INSERT INTO expenses (id, center_id, title, amount, date, category, payment_mode, bill_no) VALUES
('EXP-5001', 'C001', 'Office Electricity Bill (May 2026)', 3200, '2026-05-10', 'Electricity', 'Net Banking', 'UPPCL-99881'),
('EXP-5002', 'C002', 'Whiteboard & Stationery purchase', 850, '2026-05-15', 'Office Supplies', 'Cash', 'ST-441'),
('EXP-5003', 'C001', 'Computer Lab Maintenance & Networking Cable', 4500, '2026-05-20', 'Lab Maintenance', 'UPI', 'INF-1029'),
('EXP-5004', 'C003', 'Center Rent (May 2026)', 12000, '2026-06-01', 'Rent', 'Cheque', 'RENT-MAY'),
('EXP-5005', 'C002', 'High-speed Fiber Broadband Bill', 1499, '2026-06-02', 'Internet', 'UPI', 'JIO-FIB-4412'),
('EXP-5006', 'C004', 'New Branch Opening Marketing Pamphlets & Flex', 6200, '2026-06-05', 'Marketing', 'Cash', 'ADV-881'),
('EXP-5007', 'C001', 'Water Dispenser Refill & Office Tea Supplies', 1100, '2026-06-10', 'Office Supplies', 'Cash', 'TEA-JUN');

-- Notices
INSERT INTO notices (id, title, message, date, target) VALUES
('N001', 'Summer Vacation Announcement', 'Radhika IT College campuses will remain closed for summer vacation from June 15 to June 30. Regular online student support will be available.', '2026-06-10', 'all'),
('N002', 'Super Admin Advisory on Fees Collection', 'All Center Admins are advised to follow up on pending student installments before the monthly closing on 25th of this month.', '2026-06-11', 'center_admin'),
('N003', 'NIELIT CCC & O-Level Examination Form Submission', 'Students appearing for the upcoming NIELIT exam cycle must submit examination fees and photo ID proof by June 28 at the center office.', '2026-06-14', 'all'),
('N004', 'New Batch Launch: Python Full Stack Development', 'Admission is now open for weekend batch of Python Full Stack Web Development starting from July 5. Limited 25 seats available per center.', '2026-06-18', 'staff');

-- Attendance
INSERT INTO attendance (id, center_id, course, date, records_json) VALUES
('ATT-1774000100', 'C001', 'ADCA', '2026-06-15', '{"RAD-2026-001":"present"}'),
('ATT-1774000200', 'C001', 'DCA', '2026-06-15', '{"RAD-2026-002":"present","RAD-2026-008":"present"}'),
('ATT-1774000300', 'C002', 'PGDCA', '2026-06-15', '{"RAD-2026-003":"present"}'),
('ATT-1774000400', 'C003', 'O-Level', '2026-06-15', '{"RAD-2026-005":"present"}');

-- Legacy app_data entries
INSERT INTO app_data (`key`, `value`) VALUES
('centers', '[{"id":"C001","center_code":"MCHQ01","center_name":"Main Campus (HQ)","address":"Civil Lines, Near Town Hall, District HQ, Gorakhpur, UP","head_name":"Dr. R. K. Sharma","contact":"9876543210","email":"hq@radhikaitcollege.com","status":"active"},{"id":"C002","center_code":"CTC02","center_name":"City Tech Center","address":"Station Road, Opp. Central Mall, Golghar, Gorakhpur, UP","head_name":"Prof. Vinay Mishra","contact":"8765432109","email":"citytech@radhikaitcollege.com","status":"active"},{"id":"C003","center_code":"RIT03","center_name":"Rural IT Development Wing","address":"NH-2 Bypass, Near Block Development Office, Sahjanwa, UP","head_name":"Er. Amit Patel","contact":"7654321098","email":"rural@radhikaitcollege.com","status":"active"},{"id":"C004","center_code":"EBC04","center_name":"East Branch Campus","address":"Medical College Road, Asuran Chowk, Gorakhpur, UP","head_name":"Mrs. Archana Singh","contact":"9450123456","email":"eastbranch@radhikaitcollege.com","status":"active"}]'),
('courses', '[{"id":"COURSE-001","code":"DCA","name":"Diploma in Computer Applications","duration":"6 Months","fee":8000,"description":"Fundamentals of computers, Windows OS, MS Office suite (Word, Excel, PowerPoint), Internet technologies and basic IT tools.","eligibility":"10th Pass / High School","status":"active"},{"id":"COURSE-002","code":"ADCA","name":"Advanced Diploma in Computer Applications","duration":"12 Months","fee":15000,"description":"Comprehensive IT training covering Office Automation, DTP (Photoshop, PageMaker, CorelDraw), Web Designing (HTML/CSS), and Tally ERP/Prime accounting.","eligibility":"12th Pass / Intermediate","status":"active"},{"id":"COURSE-003","code":"PGDCA","name":"Post Graduate Diploma in Computer Applications","duration":"12 Months","fee":18000,"description":"Professional postgraduate diploma covering Object-Oriented Programming (C++/Java/Python), RDBMS & SQL, Software Engineering, and Web Development.","eligibility":"Graduation in any stream","status":"active"},{"id":"COURSE-004","code":"O-Level","name":"NIELIT O-Level IT Certification","duration":"12 Months","fee":12000,"description":"Government recognised NIELIT foundation course covering IT Tools, Web Publishing, Python Programming, and Internet of Things (IoT).","eligibility":"12th Pass or ITI Certificate","status":"active"},{"id":"COURSE-005","code":"CCC","name":"Course on Computer Concepts","duration":"3 Months","fee":3500,"description":"Basic digital literacy program certified by NIELIT covering computer basics, GUI OS, LibreOffice, Digital Financial Services, and Cyber Security.","eligibility":"No Minimum Qualification","status":"active"},{"id":"COURSE-006","code":"BA","name":"Basic Accounting with Tally Prime","duration":"6 Months","fee":6500,"description":"Modern computerized accounting with Tally Prime, GST filing, e-Way bills, TDS calculation, ledger management, and balance sheet preparation.","eligibility":"10th / 12th Commerce Preferred","status":"active"},{"id":"COURSE-007","code":"PY-FS","name":"Python Full Stack Web Development","duration":"6 Months","fee":16000,"description":"Complete web development boot-camp: Python, Django, REST APIs, HTML5, CSS3, JavaScript, SQLite/PostgreSQL, and Git version control.","eligibility":"12th Pass / Basic computer knowledge","status":"active"},{"id":"COURSE-008","code":"DTP","name":"Desktop Publishing & Graphic Designing","duration":"4 Months","fee":5500,"description":"Creative design training in Adobe Photoshop, CorelDRAW, Adobe Illustrator, banner design, magazine layout, and print media preparation.","eligibility":"10th Pass","status":"active"}]'),
('staff', '[{"id":"S001","name":"Super Administrator","login_id":"superadmin","password":"123","role":"super_admin","center_id":"","phone":"9876543200","email":"admin@radhikaitcollege.com","designation":"Managing Director / Super Admin","status":"active"},{"id":"S002","name":"Vinay Mishra (Center Head)","login_id":"centerhead1","password":"123","role":"center_admin","center_id":"C002","phone":"8765432109","email":"vinay@radhikaitcollege.com","designation":"Center Director - City Branch","status":"active"},{"id":"S003","name":"Amit Patel (Center Head)","login_id":"centerhead2","password":"123","role":"center_admin","center_id":"C003","phone":"7654321098","email":"amit@radhikaitcollege.com","designation":"Center Director - Rural Branch","status":"active"},{"id":"S004","name":"Rita Sen (Senior Counselor)","login_id":"staff1","password":"123","role":"staff","center_id":"C001","phone":"9812345678","email":"rita@radhikaitcollege.com","designation":"Senior Academic Counselor & Admission In-charge","status":"active"},{"id":"S005","name":"Rajesh Kumar (Office Assistant)","login_id":"staff2","password":"123","role":"staff","center_id":"C002","phone":"9123456780","email":"rajesh@radhikaitcollege.com","designation":"Office Executive & Fee Cashier","status":"active"},{"id":"S006","name":"Sunita Verma (System Operator)","login_id":"staff3","password":"123","role":"staff","center_id":"C003","phone":"9988776611","email":"sunita@radhikaitcollege.com","designation":"Computer Lab Technician","status":"inactive"},{"id":"S007","name":"Pooja Tiwari (Faculty - Tally & Accounts)","login_id":"faculty1","password":"123","role":"staff","center_id":"C001","phone":"9765432199","email":"pooja@radhikaitcollege.com","designation":"Senior Faculty - Accounting & Tally","status":"active"},{"id":"S008","name":"Archana Singh (Branch Head)","login_id":"centerhead3","password":"123","role":"center_admin","center_id":"C004","phone":"9450123456","email":"archana@radhikaitcollege.com","designation":"Center Director - East Branch","status":"active"}]'),
('students', '[{"id":"RAD-2026-001","student_name":"Aditya Narayan","father_name":"Surendra Prasad","mother_name":"Kavita Devi","course":"ADCA","mobile":"9565123456","email":"aditya.n@gmail.com","address":"Gola Bazaar, Ward No 4, Gorakhpur","admission_date":"2026-01-10","fees":15000,"center_id":"C001","status":"active"},{"id":"RAD-2026-002","student_name":"Priya Singh","father_name":"Ramesh Singh","mother_name":"Anita Singh","course":"DCA","mobile":"9988776655","email":"priyasingh99@gmail.com","address":"Rampuri Colony, Lane 3, Gorakhpur","admission_date":"2026-02-15","fees":8000,"center_id":"C001","status":"active"},{"id":"RAD-2026-003","student_name":"Vikram Malhotra","father_name":"K. P. Malhotra","mother_name":"Sunita Malhotra","course":"PGDCA","mobile":"9123456789","email":"vikram.m@outlook.com","address":"Civil Lines Area, Near Park, Gorakhpur","admission_date":"2026-03-05","fees":18000,"center_id":"C002","status":"active"},{"id":"RAD-2026-004","student_name":"Neha Gupta","father_name":"M. L. Gupta","mother_name":"Reena Gupta","course":"CCC","mobile":"9839401234","email":"neha.gupta2026@gmail.com","address":"Shastri Nagar, House 14, Gorakhpur","admission_date":"2026-04-01","fees":3500,"center_id":"C002","status":"active"},{"id":"RAD-2026-005","student_name":"Sandeep Yadav","father_name":"Ram Chandra Yadav","mother_name":"Shanti Devi","course":"O-Level","mobile":"7309876543","email":"sandeep.yadav@gmail.com","address":"Village Pipra, Post Harra, Sahjanwa","admission_date":"2026-01-22","fees":12000,"center_id":"C003","status":"active"},{"id":"RAD-2026-006","student_name":"Komal Preet Kaur","father_name":"Gurmukh Singh","mother_name":"Harpreet Kaur","course":"ADCA","mobile":"8127394850","email":"komalpreet@gmail.com","address":"Model Town Ext, Sector 2, Sahjanwa","admission_date":"2026-04-20","fees":15000,"center_id":"C003","status":"active"},{"id":"RAD-2026-007","student_name":"Rahul Verma","father_name":"Satya Prakash Verma","mother_name":"Maya Verma","course":"PGDCA","mobile":"9450392817","email":"rahul.verma@gmail.com","address":"Station Road, Gali 2, Gorakhpur","admission_date":"2026-02-18","fees":18000,"center_id":"C002","status":"completed"},{"id":"RAD-2026-008","student_name":"Sneha Tiwari","father_name":"J. P. Tiwari","mother_name":"Geeta Tiwari","course":"DCA","mobile":"9670394857","email":"sneha.tiwari@gmail.com","address":"Vikas Nagar Sector A, House 88","admission_date":"2026-05-02","fees":8000,"center_id":"C001","status":"active"},{"id":"RAD-2026-009","student_name":"Amitabh Dubey","father_name":"Dinesh Dubey","mother_name":"Sushila Dubey","course":"BA","mobile":"9335678901","email":"amitabh.dubey@gmail.com","address":"Betiahata, Near Hanuman Mandir","admission_date":"2026-05-15","fees":6500,"center_id":"C001","status":"active"},{"id":"RAD-2026-010","student_name":"Anjali Maurya","father_name":"Rajendra Maurya","mother_name":"Kamla Maurya","course":"PY-FS","mobile":"9140223344","email":"anjali.m@gmail.com","address":"Medical Enclave, Gorakhpur","admission_date":"2026-06-01","fees":16000,"center_id":"C004","status":"active"},{"id":"RAD-2026-011","student_name":"Mohd Faisal","father_name":"Abdul Kalam","mother_name":"Naseem Bano","course":"ADCA","mobile":"9889445566","email":"faisal.it@gmail.com","address":"Turab Nagar, Mohaddipur","admission_date":"2026-06-05","fees":15000,"center_id":"C002","status":"active"},{"id":"RAD-2026-012","student_name":"Roshni Prajapati","father_name":"Subhash Prajapati","mother_name":"Malti Devi","course":"CCC","mobile":"7890123456","email":"roshni.p@gmail.com","address":"Bichhiya, Campierganj Road","admission_date":"2026-06-12","fees":3500,"center_id":"C003","status":"active"}]'),
('fees', '[{"id":"INV-10001","student_id":"RAD-2026-001","amount":5000,"payment_date":"2026-01-10","payment_mode":"Cash","remark":"Admission installment","receipt_no":"RCP-2026-001"},{"id":"INV-10002","student_id":"RAD-2026-001","amount":5000,"payment_date":"2026-03-15","payment_mode":"UPI","remark":"Second installment (PhonePe Ref #8892)","receipt_no":"RCP-2026-002"},{"id":"INV-10003","student_id":"RAD-2026-002","amount":4000,"payment_date":"2026-02-15","payment_mode":"Card","remark":"50% fees payment via POS machine","receipt_no":"RCP-2026-003"},{"id":"INV-10004","student_id":"RAD-2026-003","amount":10000,"payment_date":"2026-03-05","payment_mode":"UPI","remark":"Admission payment (GPay Ref #4412)","receipt_no":"RCP-2026-004"},{"id":"INV-10005","student_id":"RAD-2026-004","amount":3500,"payment_date":"2026-04-01","payment_mode":"Cash","remark":"Full fees paid at counter","receipt_no":"RCP-2026-005"},{"id":"INV-10006","student_id":"RAD-2026-005","amount":6000,"payment_date":"2026-01-22","payment_mode":"UPI","remark":"First installment paid online","receipt_no":"RCP-2026-006"},{"id":"INV-10007","student_id":"RAD-2026-006","amount":7500,"payment_date":"2026-04-20","payment_mode":"Cash","remark":"50% course fee installment","receipt_no":"RCP-2026-007"},{"id":"INV-10008","student_id":"RAD-2026-007","amount":18000,"payment_date":"2026-02-18","payment_mode":"UPI","remark":"Full fees paid - Certificate issued","receipt_no":"RCP-2026-008"},{"id":"INV-10009","student_id":"RAD-2026-008","amount":8000,"payment_date":"2026-05-02","payment_mode":"Cash","remark":"Full fees one-time payment with discount","receipt_no":"RCP-2026-009"},{"id":"INV-10010","student_id":"RAD-2026-009","amount":3500,"payment_date":"2026-05-15","payment_mode":"UPI","remark":"First installment of Basic Accounting","receipt_no":"RCP-2026-010"},{"id":"INV-10011","student_id":"RAD-2026-010","amount":8000,"payment_date":"2026-06-01","payment_mode":"Net Banking","remark":"Admission fee for Python Full Stack","receipt_no":"RCP-2026-011"},{"id":"INV-10012","student_id":"RAD-2026-011","amount":5000,"payment_date":"2026-06-05","payment_mode":"Cash","remark":"Initial admission fee","receipt_no":"RCP-2026-012"},{"id":"INV-10013","student_id":"RAD-2026-012","amount":3500,"payment_date":"2026-06-12","payment_mode":"UPI","remark":"CCC full course fees paid","receipt_no":"RCP-2026-013"}]'),
('expenses', '[{"id":"EXP-5001","center_id":"C001","title":"Office Electricity Bill (May 2026)","amount":3200,"date":"2026-05-10","category":"Electricity","payment_mode":"Net Banking","bill_no":"UPPCL-99881"},{"id":"EXP-5002","center_id":"C002","title":"Whiteboard & Stationery purchase","amount":850,"date":"2026-05-15","category":"Office Supplies","payment_mode":"Cash","bill_no":"ST-441"},{"id":"EXP-5003","center_id":"C001","title":"Computer Lab Maintenance & Networking Cable","amount":4500,"date":"2026-05-20","category":"Lab Maintenance","payment_mode":"UPI","bill_no":"INF-1029"},{"id":"EXP-5004","center_id":"C003","title":"Center Rent (May 2026)","amount":12000,"date":"2026-06-01","category":"Rent","payment_mode":"Cheque","bill_no":"RENT-MAY"},{"id":"EXP-5005","center_id":"C002","title":"High-speed Fiber Broadband Bill","amount":1499,"date":"2026-06-02","category":"Internet","payment_mode":"UPI","bill_no":"JIO-FIB-4412"},{"id":"EXP-5006","center_id":"C004","title":"New Branch Opening Marketing Pamphlets & Flex","amount":6200,"date":"2026-06-05","category":"Marketing","payment_mode":"Cash","bill_no":"ADV-881"},{"id":"EXP-5007","center_id":"C001","title":"Water Dispenser Refill & Office Tea Supplies","amount":1100,"date":"2026-06-10","category":"Office Supplies","payment_mode":"Cash","bill_no":"TEA-JUN"}]'),
('notices', '[{"id":"N001","title":"Summer Vacation Announcement","message":"Radhika IT College campuses will remain closed for summer vacation from June 15 to June 30. Regular online student support will be available.","date":"2026-06-10","target":"all"},{"id":"N002","title":"Super Admin Advisory on Fees Collection","message":"All Center Admins are advised to follow up on pending student installments before the monthly closing on 25th of this month.","date":"2026-06-11","target":"center_admin"},{"id":"N003","title":"NIELIT CCC & O-Level Examination Form Submission","message":"Students appearing for the upcoming NIELIT exam cycle must submit examination fees and photo ID proof by June 28 at the center office.","date":"2026-06-14","target":"all"},{"id":"N004","title":"New Batch Launch: Python Full Stack Development","message":"Admission is now open for weekend batch of Python Full Stack Web Development starting from July 5. Limited 25 seats available per center.","date":"2026-06-18","target":"staff"}]'),
('attendance', '[{"id":"ATT-1774000100","center_id":"C001","course":"ADCA","date":"2026-06-15","records":{"RAD-2026-001":"present"}},{"id":"ATT-1774000200","center_id":"C001","course":"DCA","date":"2026-06-15","records":{"RAD-2026-002":"present","RAD-2026-008":"present"}},{"id":"ATT-1774000300","center_id":"C002","course":"PGDCA","date":"2026-06-15","records":{"RAD-2026-003":"present"}},{"id":"ATT-1774000400","center_id":"C003","course":"O-Level","date":"2026-06-15","records":{"RAD-2026-005":"present"}}]');

-- ---------------------------------------------------------------------
-- DATABASE VIEWS FOR REPORTS & DASHBOARDS
-- ---------------------------------------------------------------------

-- View 1: Student Fee Summary with Calculated Balance
CREATE OR REPLACE VIEW v_student_fee_summary AS
SELECT 
  s.id AS student_id,
  s.student_name,
  s.father_name,
  s.mobile,
  s.course,
  s.center_id,
  c.center_name,
  s.admission_date,
  s.fees AS total_fee,
  COALESCE(SUM(f.amount), 0) AS total_paid,
  (s.fees - COALESCE(SUM(f.amount), 0)) AS balance_due,
  CASE 
    WHEN COALESCE(SUM(f.amount), 0) >= s.fees THEN 'Fully Paid'
    WHEN COALESCE(SUM(f.amount), 0) > 0 THEN 'Partial'
    ELSE 'Unpaid'
  END AS payment_status,
  s.status AS student_status
FROM students s
LEFT JOIN centers c ON s.center_id = c.id
LEFT JOIN fees f ON s.id = f.student_id
GROUP BY s.id, s.student_name, s.father_name, s.mobile, s.course, s.center_id, c.center_name, s.admission_date, s.fees, s.status;

-- View 2: Center Financial Performance (Revenue, Expense, Profit)
CREATE OR REPLACE VIEW v_center_financial_summary AS
SELECT 
  c.id AS center_id,
  c.center_code,
  c.center_name,
  c.head_name,
  COUNT(DISTINCT s.id) AS total_students,
  COALESCE((SELECT SUM(f2.amount) FROM fees f2 JOIN students s2 ON f2.student_id = s2.id WHERE s2.center_id = c.id), 0) AS total_collections,
  COALESCE((SELECT SUM(e.amount) FROM expenses e WHERE e.center_id = c.id), 0) AS total_expenses,
  (COALESCE((SELECT SUM(f3.amount) FROM fees f3 JOIN students s3 ON f3.student_id = s3.id WHERE s3.center_id = c.id), 0) - COALESCE((SELECT SUM(e2.amount) FROM expenses e2 WHERE e2.center_id = c.id), 0)) AS net_profit
FROM centers c
LEFT JOIN students s ON c.id = s.center_id
GROUP BY c.id, c.center_code, c.center_name, c.head_name;

-- View 3: Course Enrollment Summary
CREATE OR REPLACE VIEW v_course_enrollments AS
SELECT 
  cr.code AS course_code,
  cr.name AS course_name,
  cr.duration,
  cr.fee AS standard_fee,
  COUNT(s.id) AS enrolled_students,
  COALESCE(SUM(s.fees), 0) AS expected_revenue,
  COALESCE((SELECT SUM(f.amount) FROM fees f JOIN students s2 ON f.student_id = s2.id WHERE s2.course = cr.code), 0) AS actual_collected
FROM courses cr
LEFT JOIN students s ON cr.code = s.course
GROUP BY cr.id, cr.code, cr.name, cr.duration, cr.fee;
