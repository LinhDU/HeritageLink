const { db } = require('../db');

async function createBooking(req, res) {
  const { experienceId, bookingDate, guests } = req.body || {};

  if (!req.session.user) {
    return res.status(401).json({ message: 'Bạn cần đăng nhập để đặt chỗ.' });
  }

  if (!experienceId || !bookingDate || !guests) {
    return res.status(400).json({ message: 'Thiếu thông tin đặt chỗ.' });
  }

  const experience = await db.queryOne('SELECT * FROM experiences WHERE id = $1', [Number(experienceId)]);

  if (!experience) {
    return res.status(404).json({ message: 'Trải nghiệm không tồn tại.' });
  }

  const totalPrice = Number(experience.price) * Number(guests);

  const result = await db.queryOne(
    `
      INSERT INTO bookings (experienceId, userId, bookingDate, guests, totalPrice, status)
      VALUES ($1, $2, $3, $4, $5, 'confirmed')
      RETURNING id, experienceId, bookingDate, guests, totalPrice, status
    `,
    [Number(experienceId), req.session.user.id, bookingDate, Number(guests), totalPrice]
  );

  res.status(201).json({
    message: 'Đặt chỗ thành công.',
    booking: {
      ...result,
      experienceTitle: experience.title
    }
  });
}

async function getBookings(req, res) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Chưa đăng nhập.' });
  }

  const rows = await db.query(
    `
      SELECT b.*, e.title AS experienceTitle
      FROM bookings b
      JOIN experiences e ON e.id = b.experienceId
      WHERE b.userId = $1
      ORDER BY b.createdAt DESC
    `,
    [req.session.user.id]
  );

  res.json(rows);
}

module.exports = { createBooking, getBookings };
