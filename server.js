const express = require('express');
const path = require('path');
const session = require('express-session');
const routes = require('./routes');
const { initializeDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

initializeDb().catch((error) => {
  console.error('Failed to initialize database:', error);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

app.use(express.static(path.join(__dirname)));
app.use(routes);

app.get('/experience/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`HeritageLink server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
