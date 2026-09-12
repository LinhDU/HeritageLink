const dns = require('node:dns');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

dns.setDefaultResultOrder('ipv4first');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const db = {
  query: async (text, params = []) => {
    const result = await pool.query(text, params);
    return result.rows;
  },
  queryOne: async (text, params = []) => {
    const result = await pool.query(text, params);
    return result.rows[0] || null;
  }
};

const seedExperiences = [
  {
    id: 1,
    category: 'workshop',
    title: 'Gốm truyền thống Bắc Ninh',
    ambassador: 'Minh Anh',
    rating: 4.9,
    duration: '2 giờ',
    location: 'Ninh Bình',
    price: 350000,
    imageClass: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    badge: 'Workshop'
  },
  {
    id: 2,
    category: 'homestay',
    title: 'Ở cùng gia đình vùng cao Hà Giang',
    ambassador: 'Huyền Trâm',
    rating: 4.8,
    duration: '1 đêm',
    location: 'Hà Giang',
    price: 700000,
    imageClass: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80',
    badge: 'Homestay'
  },
  {
    id: 3,
    category: 'craft',
    title: 'Thăm làng thêu truyền thống Hưng Yên',
    ambassador: 'Quốc Bình',
    rating: 5.0,
    duration: '3 giờ',
    location: 'Hưng Yên',
    price: 280000,
    imageClass: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    badge: 'Làng nghề'
  },
  {
    id: 4,
    category: 'food',
    title: 'Ẩm thực mâm cơm cộng đồng Đà Nẵng',
    ambassador: 'Lan Anh',
    rating: 4.7,
    duration: '90 phút',
    location: 'Đà Nẵng',
    price: 240000,
    imageClass: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80',
    badge: 'Ẩm thực'
  }
];

let initialized = false;

const initializeDb = async () => {
  if (initialized) return;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS experiences (
        id INTEGER PRIMARY KEY,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        ambassador TEXT NOT NULL,
        rating REAL NOT NULL,
        duration TEXT NOT NULL,
        location TEXT NOT NULL,
        price INTEGER NOT NULL,
        imageClass TEXT NOT NULL,
        badge TEXT NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        passwordHash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'visitor',
        createdAt TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ambassador_applications (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        school TEXT NOT NULL,
        region TEXT NOT NULL,
        introLink TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        createdAt TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        experienceId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        bookingDate TEXT NOT NULL,
        guests INTEGER NOT NULL,
        totalPrice INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'confirmed',
        createdAt TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY(experienceId) REFERENCES experiences(id),
        FOREIGN KEY(userId) REFERENCES users(id)
      );
    `);

    for (const experience of seedExperiences) {
      await client.query(
        `
          INSERT INTO experiences (id, category, title, ambassador, rating, duration, location, price, imageClass, badge)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
            category = EXCLUDED.category,
            title = EXCLUDED.title,
            ambassador = EXCLUDED.ambassador,
            rating = EXCLUDED.rating,
            duration = EXCLUDED.duration,
            location = EXCLUDED.location,
            price = EXCLUDED.price,
            imageClass = EXCLUDED.imageClass,
            badge = EXCLUDED.badge
        `,
        [
          experience.id,
          experience.category,
          experience.title,
          experience.ambassador,
          experience.rating,
          experience.duration,
          experience.location,
          experience.price,
          experience.imageClass,
          experience.badge
        ]
      );
    }

    const adminHash = bcrypt.hashSync('admin123', 10);
    await client.query(
      `
        INSERT INTO users (email, name, passwordHash, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO NOTHING
      `,
      ['admin@heritagelink.vn', 'Admin HeritageLink', adminHash, 'admin']
    );

    await client.query('COMMIT');
    initialized = true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const formatPrice = (price) => {
  const numericPrice = Number(price || 0);
  return `${numericPrice.toLocaleString('vi-VN')}đ`;
};

module.exports = { db, pool, initializeDb, formatPrice };
