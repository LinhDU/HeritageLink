const { db } = require('../db');

function ensureAdmin(req, res) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập admin dashboard.' });
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

module.exports = { getAdminOverview, createExperience, updateExperience, deleteExperience };
