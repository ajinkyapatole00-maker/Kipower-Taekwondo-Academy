const express = require('express');
const db = require('../services/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { sendBulkSMS } = require('../services/twilio');

const router = express.Router();

// Get pending registrations
router.get('/registrations/pending', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        r.id, r.student_id, r.status, r.applied_at, r.notes,
        s.name as student_name, s.dob, s.gender,
        u.name as parent_name, u.email, u.phone
      FROM registrations r
      JOIN students s ON r.student_id = s.id
      JOIN users u ON s.parent_id = u.id
      WHERE r.status = 'pending'
      ORDER BY r.applied_at DESC
    `);

    res.json({ registrations: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Approve student
router.post('/users/:id/approve', authenticate, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { notes } = req.body;

    await db.query(
      'UPDATE users SET is_approved = true WHERE id = $1 AND role = $2',
      [userId, 'student']
    );

    // Get user details for notification
    const userRes = await db.query('SELECT email, phone, name FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];

    // TODO: Send email/SMS notification to student

    res.json({
      success: true,
      message: 'Student approved',
      user: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Reject student
router.post('/users/:id/reject', authenticate, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { notes } = req.body;

    await db.query(
      'UPDATE registrations SET status = $1, notes = $2 WHERE student_id IN (SELECT id FROM students WHERE parent_id = $3)',
      ['rejected', notes, userId]
    );

    res.json({
      success: true,
      message: 'Student rejected',
      notes: notes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Upload certificates (bulk)
router.post('/certificates/bulk-upload', authenticate, requireAdmin, async (req, res) => {
  try {
    const { certificates } = req.body; // [{student_id, drive_file_id, title}, ...]

    for (const cert of certificates) {
      await db.query(
        'INSERT INTO certificates (student_id, uploaded_by, drive_file_id, title) VALUES ($1, $2, $3, $4)',
        [cert.student_id, req.user.id, cert.drive_file_id, cert.title]
      );
    }

    res.json({
      success: true,
      message: `${certificates.length} certificates uploaded`,
      count: certificates.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Send bulk messages
router.post('/messages/bulk-send', authenticate, requireAdmin, async (req, res) => {
  try {
    const { message, recipient_ids, channel } = req.body; // channel: 'sms', 'email', 'whatsapp'

    // Get phone numbers or emails
    const usersRes = await db.query(
      'SELECT id, phone, email FROM users WHERE id = ANY($1)',
      [recipient_ids]
    );

    const recipients = usersRes.rows;

    if (channel === 'sms' || channel === 'whatsapp') {
      const phones = recipients.map(r => r.phone).filter(p => p);
      await sendBulkSMS(phones, message);
    } else if (channel === 'email') {
      // TODO: sendBulkEmail(emails, message)
    }

    // Log message
    await db.query(
      'INSERT INTO messages (admin_id, channel, content, recipients_json, sent_at) VALUES ($1, $2, $3, $4, NOW())',
      [req.user.id, channel, message, JSON.stringify(recipient_ids)]
    );

    res.json({
      success: true,
      message: `Message sent to ${recipients.length} recipients`,
      count: recipients.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error sending messages' });
  }
});

module.exports = router;
