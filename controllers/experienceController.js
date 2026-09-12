const { db, formatPrice } = require('../db');

async function getExperiences(req, res) {
  const rows = await db.query('SELECT * FROM experiences ORDER BY id ASC');

  res.json(rows.map((experience) => ({
    ...experience,
    priceDisplay: formatPrice(experience.price)
  })));
}

async function getExperienceById(req, res) {
  const experienceId = Number(req.params.id);

  if (!experienceId) {
    return res.status(400).json({ message: 'ID trải nghiệm không hợp lệ.' });
  }

  const experience = await db.queryOne('SELECT * FROM experiences WHERE id = $1', [experienceId]);

  if (!experience) {
    return res.status(404).json({ message: 'Không tìm thấy trải nghiệm.' });
  }

  return res.json({
    ...experience,
    priceDisplay: formatPrice(experience.price)
  });
}

async function getImpact(req, res) {
  const totalAmbassadors = await db.queryOne('SELECT COUNT(*)::int AS count FROM users WHERE role = $1', ['ambassador']);
  const totalHeritagePoints = await db.queryOne('SELECT COUNT(*)::int AS count FROM experiences');
  const bookingRevenueRow = await db.queryOne('SELECT COALESCE(SUM(totalPrice),0) AS total FROM bookings');

  const bookingRevenue = Number(bookingRevenueRow?.total || 0);

  res.json({
    ambassadors: Number(totalAmbassadors?.count || 0) + 68,
    heritagePoints: Number(totalHeritagePoints?.count || 0) + 240,
    communityRevenue: `${(bookingRevenue / 1000000).toFixed(0)}M`,
    satisfactionRate: '92%'
  });
}

async function createApplication(req, res) {
  const { name, school, region, introLink } = req.body || {};

  if (!name || !school || !region) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
  }

  const result = await db.queryOne(
    `
      INSERT INTO ambassador_applications (name, school, region, introLink, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING *
    `,
    [name, school, region, introLink || '']
  );

  return res.status(201).json({
    message: 'Đăng ký thành công, đơn của bạn đang chờ xét duyệt.',
    application: result
  });
}

module.exports = { getExperiences, getExperienceById, getImpact, createApplication };
