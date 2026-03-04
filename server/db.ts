import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('syskop.db');

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    role TEXT,
    password TEXT,
    google_id TEXT
  );

  CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    type TEXT,
    status TEXT,
    join_date TEXT
  );

  CREATE TABLE IF NOT EXISTS loans (
    id TEXT PRIMARY KEY,
    member_id TEXT,
    member_name TEXT,
    amount REAL,
    purpose TEXT,
    status TEXT,
    date TEXT,
    FOREIGN KEY(member_id) REFERENCES members(id)
  );

  CREATE TABLE IF NOT EXISTS savings (
    id TEXT PRIMARY KEY,
    member_id TEXT,
    member_name TEXT,
    amount REAL,
    type TEXT,
    date TEXT,
    FOREIGN KEY(member_id) REFERENCES members(id)
  );
`);

// Seed Admin User if not exists
const adminExists = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@syskop.com');
if (!adminExists) {
  db.prepare('INSERT INTO users (id, email, name, role, password) VALUES (?, ?, ?, ?, ?)')
    .run('admin-1', 'admin@syskop.com', 'Admin Koperasi', 'admin', 'password123');
}

// Seed initial members if empty
const memberCount = db.prepare('SELECT COUNT(*) as count FROM members').get() as { count: number };
if (memberCount.count === 0) {
  const insertMember = db.prepare('INSERT INTO members (id, name, email, type, status, join_date) VALUES (?, ?, ?, ?, ?, ?)');
  insertMember.run('MEM-001', 'Budi Santoso', 'budi@example.com', 'Permanent', 'Active', '2023-01-15');
  insertMember.run('MEM-002', 'Siti Aminah', 'siti@example.com', 'Contract', 'Active', '2023-05-20');
  insertMember.run('MEM-003', 'Agus Setiawan', 'agus@example.com', 'Permanent', 'Active', '2022-11-10');
}

// Seed initial loans if empty
const loanCount = db.prepare('SELECT COUNT(*) as count FROM loans').get() as { count: number };
if (loanCount.count === 0) {
  const insertLoan = db.prepare('INSERT INTO loans (id, member_id, member_name, amount, purpose, status, date) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertLoan.run('L-001', 'MEM-001', 'Budi Santoso', 5000000, 'Renovasi Rumah', 'approved', '2024-02-01');
  insertLoan.run('L-002', 'MEM-002', 'Siti Aminah', 2000000, 'Biaya Sekolah', 'pending', '2024-03-01');
  insertLoan.run('L-003', 'MEM-003', 'Agus Setiawan', 10000000, 'Modal Usaha', 'rejected', '2024-01-15');
}

export default db;
