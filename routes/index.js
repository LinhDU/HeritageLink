const express = require('express');
const { db } = require('../db');
const { login, logout, getCurrentUser } = require('../controllers/authController');
const { getExperiences, getExperienceById, getImpact, createApplication } = require('../controllers/experienceController');
const { createBooking, getBookings } = require('../controllers/bookingController');
const { getAdminOverview, createExperience, updateExperience, deleteExperience } = require('../controllers/adminController');

const router = express.Router();

router.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HeritageLink API đang hoạt động' });
});

router.get('/api/experiences', getExperiences);
router.get('/api/experiences/:id', getExperienceById);
router.get('/api/impact', getImpact);
router.get('/api/ambassadors', async (req, res) => {
  const rows = await db.query('SELECT * FROM ambassador_applications ORDER BY createdAt DESC');
  res.json(rows);
});

router.post('/api/ambassador-applications', createApplication);
router.post('/api/login', login);
router.post('/api/logout', logout);
router.get('/api/session', getCurrentUser);
router.post('/api/bookings', createBooking);
router.get('/api/bookings', getBookings);
router.get('/api/admin/overview', getAdminOverview);
router.post('/api/admin/experiences', createExperience);
router.put('/api/admin/experiences/:id', updateExperience);
router.delete('/api/admin/experiences/:id', deleteExperience);

module.exports = router;
