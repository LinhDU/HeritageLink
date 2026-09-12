const bcrypt = require('bcryptjs');
const { db } = require('../db');

async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc.' });
  }

  const user = await db.queryOne('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);

  if (!user) {
    return res.status(401).json({ message: 'Tài khoản không tồn tại.' });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordhash);

  if (!isMatch) {
    return res.status(401).json({ message: 'Mật khẩu không đúng.' });
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

function logout(req, res) {
  req.session.destroy(() => {
    res.json({ message: 'Đăng xuất thành công' });
  });
}

function getCurrentUser(req, res) {
  res.json({ user: req.session.user || null });
}

module.exports = { login, logout, getCurrentUser };
