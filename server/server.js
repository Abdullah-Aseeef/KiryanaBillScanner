const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Fail fast on missing required credentials
const required = ['GOOGLE_PROJECT_ID', 'GEMINI_API_KEY'];

const hasJsonFile = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
const hasExplicitCreds = !!(process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);

if (!hasJsonFile && !hasExplicitCreds) {
  console.error(
    'FATAL: No Google Cloud Vision credentials found.\n' +
    'Set one of:\n' +
    '  A) GOOGLE_APPLICATION_CREDENTIALS (path to service account JSON), or\n' +
    '  B) GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY (for Render/production)'
  );
  process.exit(1);
}

const missing = required.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(`FATAL: Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    visionConfigured: !!(process.env.GOOGLE_APPLICATION_CREDENTIALS || (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY)),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    waConfigured: !!process.env.WA_TOKEN,
  });
});

app.use('/api/upload', require('./routes/upload'));
app.use('/webhook', require('./routes/webhook'));
app.use('/api/bills', require('./routes/bills'));
app.use('/api/analytics', require('./routes/analytics'));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
