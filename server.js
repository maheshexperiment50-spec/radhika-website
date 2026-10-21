const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = __dirname;
const dbDir = path.join(rootDir, 'data');
const dbPath = path.join(dbDir, 'radhika.db');

fs.mkdirSync(dbDir, { recursive: true });

const DB_KEYS = {
  CENTERS: 'centers',
  STAFF: 'staff',
  STUDENTS: 'students',
  FEES: 'fees',
  ATTENDANCE: 'attendance',
  EXPENSES: 'expenses',
  NOTICES: 'notices',
  COURSES: 'courses',
  CURRENT_USER: 'current_user'
};

const SEED_DATA = {
  centers: [
    { id: 'C001', center_name: 'Main Campus (HQ)', center_code: 'MCHQ01', address: 'Civil Lines, Near Town Hall, District HQ', head_name: 'Dr. R. K. Sharma', contact: '9876543210' },
    { id: 'C002', center_name: 'City Tech Center', center_code: 'CTC02', address: 'Station Road, Opp. Central Mall', head_name: 'Prof. Vinay Mishra', contact: '8765432109' },
    { id: 'C003', center_name: 'Rural IT Development Wing', center_code: 'RIT03', address: 'NH-2 Bypass, Near Block Office', head_name: 'Er. Amit Patel', contact: '7654321098' }
  ],
  staff: [
    { id: 'S001', name: 'Super Administrator', login_id: 'superadmin', password: '123', role: 'super_admin', center_id: '', status: 'active' },
    { id: 'S002', name: 'Vinay Mishra (Center Head)', login_id: 'centerhead1', password: '123', role: 'center_admin', center_id: 'C002', status: 'active' },
    { id: 'S003', name: 'Amit Patel (Center Head)', login_id: 'centerhead2', password: '123', role: 'center_admin', center_id: 'C003', status: 'active' },
    { id: 'S004', name: 'Rita Sen (Senior Counselor)', login_id: 'staff1', password: '123', role: 'staff', center_id: 'C001', status: 'active' },
    { id: 'S005', name: 'Rajesh Kumar (Office Assistant)', login_id: 'staff2', password: '123', role: 'staff', center_id: 'C002', status: 'active' },
    { id: 'S006', name: 'Sunita Verma (System Operator)', login_id: 'staff3', password: '123', role: 'staff', center_id: 'C003', status: 'inactive' }
  ],
  students: [
    { id: 'RAD-2026-001', student_name: 'Aditya Narayan', father_name: 'Surendra Prasad', course: 'ADCA', mobile: '9565123456', address: 'Gola Bazaar, Ward No 4', admission_date: '2026-01-10', fees: 15000, center_id: 'C001', status: 'active' },
    { id: 'RAD-2026-002', student_name: 'Priya Singh', father_name: 'Ramesh Singh', course: 'DCA', mobile: '9988776655', address: 'Rampuri Colony, Lane 3', admission_date: '2026-02-15', fees: 8000, center_id: 'C001', status: 'active' },
    { id: 'RAD-2026-003', student_name: 'Vikram Malhotra', father_name: 'K. P. Malhotra', course: 'PGDCA', mobile: '9123456789', address: 'Civil Lines Area', admission_date: '2026-03-05', fees: 18000, center_id: 'C002', status: 'active' },
    { id: 'RAD-2026-004', student_name: 'Neha Gupta', father_name: 'M. L. Gupta', course: 'CCC', mobile: '9839401234', address: 'Shastri Nagar', admission_date: '2026-04-01', fees: 3500, center_id: 'C002', status: 'active' },
    { id: 'RAD-2026-005', student_name: 'Sandeep Yadav', father_name: 'Ram Chandra Yadav', course: 'O-Level', mobile: '7309876543', address: 'Village Pipra, Post Harra', admission_date: '2026-01-22', fees: 12000, center_id: 'C003', status: 'active' },
    { id: 'RAD-2026-006', student_name: 'Komal Preet Kaur', father_name: 'Gurmukh Singh', course: 'ADCA', mobile: '8127394850', address: 'Model Town Ext', admission_date: '2026-04-20', fees: 15000, center_id: 'C003', status: 'active' },
    { id: 'RAD-2026-007', student_name: 'Rahul Verma', father_name: 'Satya Prakash Verma', course: 'PGDCA', mobile: '9450392817', address: 'Station Road, Gali 2', admission_date: '2026-02-18', fees: 18000, center_id: 'C002', status: 'completed' },
    { id: 'RAD-2026-008', student_name: 'Sneha Tiwari', father_name: 'J. P. Tiwari', course: 'DCA', mobile: '9670394857', address: 'Vikas Nagar Sector A', admission_date: '2026-05-02', fees: 8000, center_id: 'C001', status: 'active' }
  ],
  fees: [
    { id: 'INV-10001', student_id: 'RAD-2026-001', amount: 5000, payment_date: '2026-01-10', payment_mode: 'Cash', remark: 'Admission installment' },
    { id: 'INV-10002', student_id: 'RAD-2026-001', amount: 5000, payment_date: '2026-03-15', payment_mode: 'UPI', remark: 'Second installment' },
    { id: 'INV-10003', student_id: 'RAD-2026-002', amount: 4000, payment_date: '2026-02-15', payment_mode: 'Card', remark: '50% fees payment' },
    { id: 'INV-10004', student_id: 'RAD-2026-003', amount: 10000, payment_date: '2026-03-05', payment_mode: 'UPI', remark: 'Admission payment' },
    { id: 'INV-10005', student_id: 'RAD-2026-004', amount: 3500, payment_date: '2026-04-01', payment_mode: 'Cash', remark: 'Full fees paid' },
    { id: 'INV-10006', student_id: 'RAD-2026-005', amount: 6000, payment_date: '2026-01-22', payment_mode: 'UPI', remark: 'First installment' },
    { id: 'INV-10007', student_id: 'RAD-2026-006', amount: 7500, payment_date: '2026-04-20', payment_mode: 'Cash', remark: '50% course fee' },
    { id: 'INV-10008', student_id: 'RAD-2026-007', amount: 18000, payment_date: '2026-02-18', payment_mode: 'UPI', remark: 'Full fees paid' }
  ],
  expenses: [
    { id: 'EXP-5001', center_id: 'C001', title: 'Office Electricity Bill', amount: 3200, date: '2026-05-10', category: 'Electricity' },
    { id: 'EXP-5002', center_id: 'C002', title: 'Whiteboard & Stationary purchase', amount: 850, date: '2026-05-15', category: 'Office Supplies' },
    { id: 'EXP-5003', center_id: 'C001', title: 'Computer Lab Maintenance', amount: 4500, date: '2026-05-20', category: 'Others' },
    { id: 'EXP-5004', center_id: 'C003', title: 'Center Rent (May 2026)', amount: 12000, date: '2026-06-01', category: 'Rent' }
  ],
  notices: [
    { id: 'N001', title: 'Summer Vacation Announcement', message: 'Radhika IT College campuses will remain closed for summer vacation from June 15 to June 30. Regular online support will be available.', date: '2026-06-10', target: 'all' },
    { id: 'N002', title: 'Super Admin Advisory on Fees Collection', message: 'All Center Admins are advised to follow up on pending fees collection before the vacation starts.', date: '2026-06-11', target: 'center_admin' }
  ],
  courses: [
    { id: 'COURSE-001', code: 'DCA', name: 'Diploma in Computer Applications', duration: '6 Months', fee: 8000, description: 'Core computer fundamentals and office automation.' },
    { id: 'COURSE-002', code: 'ADCA', name: 'Advanced Diploma in Computer Applications', duration: '12 Months', fee: 15000, description: 'Advanced software, web and accounting applications.' },
    { id: 'COURSE-003', code: 'PGDCA', name: 'Post Graduate Diploma in Computer Applications', duration: '12 Months', fee: 18000, description: 'Professional-level programming and DBMS training.' },
    { id: 'COURSE-004', code: 'O-Level', name: 'NIELIT O-Level', duration: '12 Months', fee: 12000, description: 'Foundation computing and ICT skill development.' },
    { id: 'COURSE-005', code: 'CCC', name: 'Course on Computer Concepts', duration: '3 Months', fee: 3500, description: 'Short computer literacy and productivity course.' },
    { id: 'COURSE-006', code: 'BA', name: 'Basic Accounting', duration: '6 Months', fee: 6500, description: 'Accounting principles and business entries.' }
  ],
  attendance: []
};

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database at', dbPath);
});

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) return reject(err);
    resolve({ id: this.lastID, changes: this.changes });
  });
});

const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) return reject(err);
    resolve(row);
  });
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) return reject(err);
    resolve(rows);
  });
});

async function initializeDatabase() {
  await run(`CREATE TABLE IF NOT EXISTS app_data (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);

  const table = await all('SELECT key FROM app_data');
  const existingKeys = new Set(table.map(row => row.key));

  for (const [key, value] of Object.entries(SEED_DATA)) {
    if (!existingKeys.has(key)) {
      await run('INSERT INTO app_data (key, value) VALUES (?, ?)', [key, JSON.stringify(value)]);
    }
  }
}

async function getCollection(key) {
  const row = await get('SELECT value FROM app_data WHERE key = ?', [key]);
  if (!row) return [];
  try {
    return JSON.parse(row.value);
  } catch (error) {
    return [];
  }
}

async function saveCollection(key, value) {
  const jsonValue = JSON.stringify(value);
  await run(
    `INSERT INTO app_data (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, jsonValue]
  );
  return value;
}

app.use(express.json({ limit: '2mb' }));
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON payload.' });
  }
  next(err);
});
app.use(express.static(rootDir));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Backend is running', time: new Date().toISOString() });
});

app.get('/api/collections', async (req, res) => {
  try {
    const collections = {};
    for (const key of Object.keys(DB_KEYS)) {
      const collectionKey = DB_KEYS[key].toLowerCase();
      if (collectionKey === 'current_user') continue;
      collections[collectionKey] = await getCollection(collectionKey);
    }
    res.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ message: 'Failed to fetch collections' });
  }
});

app.get('/api/data/:key', async (req, res) => {
  try {
    const key = req.params.key.toLowerCase();
    const data = await getCollection(key);
    res.json(data);
  } catch (error) {
    console.error('Error reading collection:', error);
    res.status(500).json({ message: 'Failed to read dataset' });
  }
});

app.post('/api/data/:key', async (req, res) => {
  try {
    const key = req.params.key.toLowerCase();
    const value = req.body;
    const saved = await saveCollection(key, value);
    res.json({ success: true, key, data: saved });
  } catch (error) {
    console.error('Error saving collection:', error);
    res.status(500).json({ message: 'Failed to save dataset' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { loginId, password } = req.body || {};
    const staffList = await getCollection(DB_KEYS.STAFF);
    const user = staffList.find((s) => {
      return s.login_id.toLowerCase() === String(loginId || '').toLowerCase() && s.password === String(password || '');
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid Login ID or Password.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Your account is deactivated. Contact Super Admin.' });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Authentication failed due to server error.' });
  }
});

app.post('/api/logout', async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

app.post('/api/enquiries', async (req, res) => {
  try {
    const enquiry = req.body || {};
    const id = 'ENQ-' + Date.now();
    await run(
      `INSERT INTO audit_logs (user_id, action, entity, record_id, details) VALUES (?, ?, ?, ?, ?)`,
      ['PUBLIC', 'STUDENT_ENQUIRY', 'enquiries', id, JSON.stringify(enquiry)]
    ).catch(() => {});
    res.json({ success: true, id, message: 'Enquiry received successfully.' });
  } catch (error) {
    console.error('Enquiry error:', error);
    res.status(500).json({ success: false, message: 'Failed to record enquiry.' });
  }
});

app.get('*', (req, res) => {
  const safePath = path.join(rootDir, req.path === '/' ? 'index.html' : req.path);
  if (safePath.startsWith(rootDir) && fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
    return res.sendFile(safePath);
  }
  res.sendFile(path.join(rootDir, 'index.html'));
});

async function startServer() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Radhika backend running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});
