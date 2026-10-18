const { db, formatPrice } = require('../db');

async function getExperiences(req, res) {
  const { category, location, minPrice, maxPrice, search } = req.query || {};
  let rows = await db.query('SELECT * FROM experiences ORDER BY id ASC');

  if (category && category !== 'all') {
    rows = rows.filter((e) => e.category === category || e.segmentName?.toLowerCase().includes(category.toLowerCase()));
  }
  if (location && location !== 'all') {
    rows = rows.filter((e) => e.location.toLowerCase().includes(location.toLowerCase()));
  }
  if (search) {
    const s = search.toLowerCase().trim();
    rows = rows.filter((e) => 
      e.title.toLowerCase().includes(s) || 
      e.location.toLowerCase().includes(s) || 
      (e.story && e.story.toLowerCase().includes(s)) ||
      (e.ambassador && e.ambassador.toLowerCase().includes(s))
    );
  }
  if (minPrice) {
    rows = rows.filter((e) => Number(e.price) >= Number(minPrice));
  }
  if (maxPrice) {
    rows = rows.filter((e) => Number(e.price) <= Number(maxPrice));
  }

  res.json(rows.map((experience) => ({
    ...experience,
    imageClass: experience.imageclass || experience.imageClass,
    segmentName: experience.segmentname || experience.segmentName,
    priceDisplay: formatPrice ? formatPrice(experience.price) : `${Number(experience.price).toLocaleString('vi-VN')}đ`
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
    imageClass: experience.imageclass || experience.imageClass,
    segmentName: experience.segmentname || experience.segmentName,
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
  const { name, email, phone, school, region, introLink } = req.body || {};

  if (!name || !school || !region) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
  }

  const cleanEmail = email ? email.toLowerCase().trim() : '';
  const cleanPhone = phone ? phone.trim() : '';

  const result = await db.queryOne(
    `
      INSERT INTO ambassador_applications (name, email, phone, school, region, introLink, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *
    `,
    [name, cleanEmail, cleanPhone, school, region, introLink || '']
  );

  return res.status(201).json({
    message: 'Đăng ký thành công, đơn của bạn đang chờ xét duyệt.',
    application: result
  });
}

module.exports = { getExperiences, getExperienceById, getImpact, createApplication };
