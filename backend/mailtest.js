require('dotenv').config();
const { send } = require('./utils/mailer');

const to = process.argv[2] || process.env.SMTP_USER;

if (!process.env.SMTP_HOST) {
  console.log('SMTP_HOST is empty in .env');
  process.exit(1);
}

send(
  to,
  'Test email from the portal',
  'If you can read this, email sending works.',
  '<p>If you can read this, email sending works.</p>'
)
  .then(() => console.log('Sent to', to))
  .catch((err) => {
    console.error('Failed:', err.message);
    process.exit(1);
  });