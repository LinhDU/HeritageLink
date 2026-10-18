const bcrypt = require('bcryptjs');
const { db } = require('../db');

async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc.' });
  }

  const user = await db.queryOne('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);

  if (!user) {
    return res.status(401).json({ message: 'Tài khoản không tồn tại trong hệ thống.' });
  }

  const hash = user.passwordhash || user.passwordHash || '';
  const isMatch = hash ? bcrypt.compareSync(password, hash) : false;

  if (!isMatch) {
    return res.status(401).json({ message: 'Mật khẩu không chính xác.' });
  }

  req.session.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };

  return res.json({
    message: 'Đăng nhập thành công',
    user: req.session.user
  });
}

async function register(req, res) {
  const { name, email, password, phone, role = 'client' } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ Họ tên, Email và Mật khẩu.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu phải có độ dài từ 6 ký tự trở lên.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const existingUser = await db.queryOne('SELECT * FROM users WHERE email = $1', [cleanEmail]);

  if (existingUser) {
    return res.status(400).json({ message: 'Email này đã tồn tại trong hệ thống. Vui lòng đăng nhập hoặc dùng email khác.' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const cleanPhone = phone ? phone.trim() : '';
  const cleanName = name.trim();
  const validRole = ['client', 'ambassador', 'host'].includes(role) ? role : 'client';

  const rows = await db.query(
    'INSERT INTO users (email, name, phone, passwordhash, passwordHash, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [cleanEmail, cleanName, cleanPhone, hash, hash, validRole]
  );

  const newUser = rows && rows.length > 0 ? rows[0] : { id: Date.now(), email: cleanEmail, name: cleanName, role: validRole };

  req.session.user = {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role
  };

  return res.status(201).json({
    message: 'Đăng ký tài khoản thành công!',
    user: req.session.user
  });
}

function logout(req, res) {
  req.session.destroy(() => {
    res.json({ message: 'Đăng xuất thành công' });
  });
}

function getCurrentUser(req, res) {
  res.json({ user: req.session.user || null });
}

module.exports = { login, register, logout, getCurrentUser };

