const bcrypt = require('bcryptjs');
const { db, memoryStore } = require('../db');

function ensureAdmin(req, res) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    res.status(403).json({ message: 'Bạn không có quyền truy cập admin dashboard.' });
    return false;
  }

  return true;
}

async function getAdminOverview(req, res) {
  if (!ensureAdmin(req, res)) return;

  const totalBookingsRow = await db.queryOne('SELECT COUNT(*)::int AS count FROM bookings');
  const totalRevenueRow = await db.queryOne('SELECT COALESCE(SUM(totalPrice), 0) AS total FROM bookings');
  const pendingApplicationsRow = await db.queryOne("SELECT COUNT(*)::int AS count FROM ambassador_applications WHERE status = 'pending'");
  const totalUsersRow = await db.queryOne('SELECT COUNT(*)::int AS count FROM users');

  const recentBookings = await db.query(`
    SELECT b.*, e.title AS experienceTitle, u.name AS userName
    FROM bookings b
    JOIN experiences e ON e.id = b.experienceId
    JOIN users u ON u.id = b.userId
    ORDER BY b.createdAt DESC
    LIMIT 8
  `);

  const applications = await db.query(`
    SELECT * FROM ambassador_applications
    ORDER BY createdAt DESC
  `);

  return res.json({
    stats: {
      totalBookings: totalBookingsRow?.count || 0,
      totalRevenue: Number(totalRevenueRow?.total || 0),
      pendingApplications: pendingApplicationsRow?.count || 0,
      totalUsers: totalUsersRow?.count || 0
    },
    recentBookings,
    applications
  });
}

async function createExperience(req, res) {
  if (!ensureAdmin(req, res)) return;

  const payload = req.body || {};
  const requiredFields = ['category', 'title', 'ambassador', 'duration', 'location', 'price', 'badge'];

  const missing = requiredFields.filter((field) => !payload[field]);
  if (missing.length) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc cho trải nghiệm.' });
  }

  const rating = Number(payload.rating || 4.5);
  const price = Number(payload.price);
  const imageUrl = payload.imageUrl || payload.imageClass || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80';

  const created = await db.queryOne(
    `
      INSERT INTO experiences (category, title, ambassador, rating, duration, location, price, imageClass, badge)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `,
    [payload.category, payload.title, payload.ambassador, rating, payload.duration, payload.location, price, imageUrl, payload.badge]
  );

  return res.status(201).json({ message: 'Tạo trải nghiệm thành công.', experience: created });
}

async function updateExperience(req, res) {
  if (!ensureAdmin(req, res)) return;

  const id = Number(req.params.id);
  const payload = req.body || {};

  if (!id) {
    return res.status(400).json({ message: 'Thiếu ID trải nghiệm.' });
  }

  const existing = await db.queryOne('SELECT * FROM experiences WHERE id = $1', [id]);

  if (!existing) {
    return res.status(404).json({ message: 'Không tìm thấy trải nghiệm.' });
  }

  const updated = {
    category: payload.category || existing.category,
    title: payload.title || existing.title,
    ambassador: payload.ambassador || existing.ambassador,
    rating: Number(payload.rating || existing.rating),
    duration: payload.duration || existing.duration,
    location: payload.location || existing.location,
    price: Number(payload.price || existing.price),
    imageClass: payload.imageUrl || payload.imageClass || existing.imageclass,
    badge: payload.badge || existing.badge
  };

  await db.query(
    `
      UPDATE experiences
      SET category = $1, title = $2, ambassador = $3, rating = $4, duration = $5, location = $6, price = $7, imageClass = $8, badge = $9
      WHERE id = $10
    `,
    [updated.category, updated.title, updated.ambassador, updated.rating, updated.duration, updated.location, updated.price, updated.imageClass, updated.badge, id]
  );

  const saved = await db.queryOne('SELECT * FROM experiences WHERE id = $1', [id]);
  return res.json({ message: 'Cập nhật trải nghiệm thành công.', experience: saved });
}

async function deleteExperience(req, res) {
  if (!ensureAdmin(req, res)) return;

  const id = Number(req.params.id);

  if (!id) {
    return res.status(400).json({ message: 'Thiếu ID trải nghiệm.' });
  }

  const existing = await db.queryOne('SELECT * FROM experiences WHERE id = $1', [id]);

  if (!existing) {
    return res.status(404).json({ message: 'Không tìm thấy trải nghiệm.' });
  }

  await db.query('DELETE FROM bookings WHERE experienceId = $1', [id]);
  await db.query('DELETE FROM experiences WHERE id = $1', [id]);

  return res.json({ message: 'Xóa trải nghiệm thành công.', deletedId: id });
}

async function approveAmbassadorApplication(req, res) {
  if (!ensureAdmin(req, res)) return;

  const id = Number(req.params.id);
  let app = await db.queryOne('SELECT * FROM ambassador_applications WHERE id = $1', [id]);
  if (!app) {
    app = memoryStore.ambassador_applications.find((a) => a.id === id);
  }

  if (!app) {
    return res.status(404).json({ message: 'Không tìm thấy đơn đăng ký.' });
  }

  app.status = 'approved';
  const memApp = memoryStore.ambassador_applications.find((a) => a.id === id);
  if (memApp) memApp.status = 'approved';

  const cleanEmail = (app.email || `ambassador${id}@heritagelink.vn`).toLowerCase().trim();
  let user = memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);

  const initialPassword = 'daisu123';
  const hash = bcrypt.hashSync(initialPassword, 10);

  if (user) {
    user.role = 'ambassador';
    user.school = app.school || user.school;
    user.region = app.region || user.region;
  } else {
    user = {
      id: memoryStore.users.length + 1,
      email: cleanEmail,
      name: app.name,
      phone: app.phone || '',
      school: app.school,
      region: app.region,
      role: 'ambassador',
      passwordhash: hash,
      passwordHash: hash,
      createdAt: new Date().toISOString()
    };
    memoryStore.users.push(user);
  }

  try {
    await db.query(`UPDATE ambassador_applications SET status = 'approved' WHERE id = $1`, [id]);
    await db.query(
      `INSERT INTO users (email, name, phone, passwordhash, passwordHash, role)
       VALUES ($1, $2, $3, $4, $5, 'ambassador')
       ON CONFLICT (email) DO UPDATE SET role = 'ambassador', name = EXCLUDED.name`,
      [cleanEmail, app.name, app.phone || '', hash, hash]
    );
  } catch (e) {}

  const emailPreview = {
    to: cleanEmail,
    subject: '[HeritageLink] Chúc mừng bạn đã được phê duyệt làm Đại sứ Di sản!',
    applicantName: app.name,
    school: app.school,
    region: app.region,
    username: cleanEmail,
    initialPassword: initialPassword,
    portalUrl: '/ambassador.html',
    loginUrl: '/login.html',
    handbookUrl: '/ambassador-handbook.html',
    sentAt: new Date().toLocaleString('vi-VN')
  };

  return res.json({
    message: `Đã duyệt đơn và cấp tài khoản Đại sứ cho ${app.name}!`,
    application: app,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    emailPreview
  });
}

async function rejectAmbassadorApplication(req, res) {
  if (!ensureAdmin(req, res)) return;

  const id = Number(req.params.id);
  let app = await db.queryOne('SELECT * FROM ambassador_applications WHERE id = $1', [id]);
  if (!app) {
    app = memoryStore.ambassador_applications.find((a) => a.id === id);
  }

  if (!app) {
    return res.status(404).json({ message: 'Không tìm thấy đơn đăng ký.' });
  }

  app.status = 'rejected';
  const memApp = memoryStore.ambassador_applications.find((a) => a.id === id);
  if (memApp) memApp.status = 'rejected';

  try {
    await db.query(`UPDATE ambassador_applications SET status = 'rejected' WHERE id = $1`, [id]);
  } catch (e) {}

  return res.json({ message: 'Đã cập nhật từ chối đơn ứng tuyển.', application: app });
}

async function createAmbassadorDirectly(req, res) {
  if (!ensureAdmin(req, res)) return;

  const { name, email, phone, school, region, password } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ message: 'Họ tên và Email là bắt buộc.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const existingUser = memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (existingUser && existingUser.role === 'ambassador') {
    return res.status(400).json({ message: 'Email này đã là tài khoản Đại sứ trong hệ thống.' });
  }

  const initialPassword = password || 'daisu123';
  const hash = bcrypt.hashSync(initialPassword, 10);

  let user;
  if (existingUser) {
    existingUser.role = 'ambassador';
    existingUser.name = name.trim();
    existingUser.phone = phone ? phone.trim() : existingUser.phone;
    existingUser.school = school ? school.trim() : existingUser.school;
    existingUser.region = region ? region.trim() : existingUser.region;
    user = existingUser;
  } else {
    user = {
      id: memoryStore.users.length + 1,
      email: cleanEmail,
      name: name.trim(),
      phone: phone ? phone.trim() : '',
      school: school ? school.trim() : 'Đại học',
      region: region ? region.trim() : 'Bắc Ninh & Hà Giang',
      role: 'ambassador',
      passwordhash: hash,
      passwordHash: hash,
      createdAt: new Date().toISOString()
    };
    memoryStore.users.push(user);
  }

  const newApp = {
    id: memoryStore.nextAppId++,
    name: user.name,
    email: cleanEmail,
    phone: user.phone,
    school: user.school,
    region: user.region,
    introLink: '',
    ethicsAgreed: true,
    status: 'approved',
    createdAt: new Date().toISOString()
  };
  memoryStore.ambassador_applications.push(newApp);

  try {
    await db.query(
      `INSERT INTO users (email, name, phone, passwordhash, passwordHash, role)
       VALUES ($1, $2, $3, $4, $5, 'ambassador')
       ON CONFLICT (email) DO UPDATE SET role = 'ambassador', name = EXCLUDED.name`,
      [cleanEmail, user.name, user.phone, hash, hash]
    );
    await db.query(
      `INSERT INTO ambassador_applications (name, email, phone, school, region, status)
       VALUES ($1, $2, $3, $4, $5, 'approved')`,
      [user.name, cleanEmail, user.phone, user.school, user.region]
    );
  } catch (e) {}

  const emailPreview = {
    to: cleanEmail,
    subject: '[HeritageLink] Thông tin cấp tài khoản Đại sứ Di sản chính thức',
    applicantName: user.name,
    school: user.school,
    region: user.region,
    username: cleanEmail,
    initialPassword: initialPassword,
    portalUrl: '/ambassador.html',
    loginUrl: '/login.html',
    handbookUrl: '/ambassador-handbook.html',
    sentAt: new Date().toLocaleString('vi-VN')
  };

  return res.status(201).json({
    message: `Đã khởi tạo tài khoản Đại sứ thành công cho ${user.name}!`,
    user,
    emailPreview
  });
}

module.exports = {
  getAdminOverview,
  createExperience,
  updateExperience,
  deleteExperience,
  approveAmbassadorApplication,
  rejectAmbassadorApplication,
  createAmbassadorDirectly
};

