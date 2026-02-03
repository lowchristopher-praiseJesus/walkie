const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3001;
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'walkie-dev-secret';
const SITE_PASSWORD = '14@star';

app.use(cookieParser(COOKIE_SECRET));
app.use(express.urlencoded({ extended: false }));

// Login page HTML
function loginPage(error) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - Walkie</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #1a1a2e; color: #e0e0e0; }
    .login-box { background: #16213e; padding: 2rem; border-radius: 12px; width: 320px; box-shadow: 0 4px 24px rgba(0,0,0,0.3); }
    h1 { text-align: center; margin-bottom: 1.5rem; color: #e0c97f; font-size: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; }
    input[type="password"] { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #2a3a5c; border-radius: 6px; background: #0f3460; color: #e0e0e0; font-size: 1rem; margin-bottom: 1rem; }
    input[type="password"]:focus { outline: none; border-color: #e0c97f; }
    button { width: 100%; padding: 0.6rem; border: none; border-radius: 6px; background: #e0c97f; color: #1a1a2e; font-size: 1rem; font-weight: 600; cursor: pointer; }
    button:hover { background: #c9b06e; }
    .error { color: #ff6b6b; text-align: center; margin-bottom: 1rem; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="login-box">
    <h1>Walkie Tracker</h1>
    ${error ? '<p class="error">Incorrect password</p>' : ''}
    <form method="POST" action="/login">
      <label for="password">Password</label>
      <input type="password" id="password" name="password" autofocus required>
      <button type="submit">Enter</button>
    </form>
  </div>
</body>
</html>`;
}

// Auth middleware
app.use((req, res, next) => {
  // Check for valid auth cookie
  if (req.signedCookies.auth === 'ok') {
    return next();
  }

  // Handle login POST
  if (req.method === 'POST' && req.path === '/login') {
    if (req.body.password === SITE_PASSWORD) {
      res.cookie('auth', 'ok', {
        signed: true,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      return res.redirect('/');
    }
    return res.send(loginPage(true));
  }

  // Show login page for all other unauthenticated requests
  res.send(loginPage(false));
});

// Serve static files from client build
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
