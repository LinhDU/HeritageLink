const express = require('express');
const path = require('path');
const session = require('express-session');
const routes = require('./routes');
const { initializeDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await initializeDb();

    app.listen(PORT, () => {
      console.log(`HeritageLink server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
})();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(
  session({
    secret: 'heritagelink-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 12
    }
  })
);

app.use('/uploads', express.static(uploadDir));
app.use(express.static(path.join(__dirname)));
app.use(routes);

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/ambassador', (req, res) => {
  res.sendFile(path.join(__dirname, 'ambassador.html'));
});

app.get('/dashboard/ambassador', (req, res) => {
  res.sendFile(path.join(__dirname, 'ambassador.html'));
});

app.get('/ambassadors', (req, res) => {
  res.sendFile(path.join(__dirname, 'ambassadors.html'));
});

app.get('/ambassadors/apply', (req, res) => {
  res.sendFile(path.join(__dirname, 'ambassador-apply.html'));
});

app.get('/ambassador-handbook', (req, res) => {
  res.sendFile(path.join(__dirname, 'ambassador-handbook.html'));
});

app.get('/ambassadors/handbook', (req, res) => {
  res.sendFile(path.join(__dirname, 'ambassador-handbook.html'));
});

app.get('/ambassador/handbook', (req, res) => {
  res.sendFile(path.join(__dirname, 'ambassador-handbook.html'));
});

app.get('/community', (req, res) => {
  res.sendFile(path.join(__dirname, 'community.html'));
});

app.get('/passport', (req, res) => {
  res.sendFile(path.join(__dirname, 'passport.html'));
});

app.get('/ai-itinerary', (req, res) => {
  res.sendFile(path.join(__dirname, 'ai-itinerary.html'));
});

app.get('/explore', (req, res) => {
  res.sendFile(path.join(__dirname, 'explore.html'));
});

app.get('/heritage', (req, res) => {
  res.sendFile(path.join(__dirname, 'heritage.html'));
});

app.get('/heritage/:slug', (req, res, next) => {
  if (req.params.slug && req.params.slug.includes('.')) return next();
  res.sendFile(path.join(__dirname, 'heritage.html'));
});

app.get('/host', (req, res) => {
  res.sendFile(path.join(__dirname, 'host.html'));
});

app.get('/bookings', (req, res) => {
  res.sendFile(path.join(__dirname, 'bookings.html'));
});

app.get('/detail', (req, res) => {
  res.sendFile(path.join(__dirname, 'detail.html'));
});

app.get('/experience/:id', (req, res, next) => {
  if (req.params.id && req.params.id.includes('.')) return next();
  res.sendFile(path.join(__dirname, 'detail.html'));
});

app.get('*', (req, res, next) => {
  if (req.path && req.path.includes('.')) return next();
  res.sendFile(path.join(__dirname, 'index.html'));
});

module.exports = app;
