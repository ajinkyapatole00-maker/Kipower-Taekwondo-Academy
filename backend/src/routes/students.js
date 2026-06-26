const express = require('express');
const db = require('../services/db');
const { authenticate, requireApproved } = require('../middleware/auth');

const router = express.Router();

// Create student (parent creates)
router.post('/', authenticate, requireApproved, async (req, res) => {
  try {
    const { name, dob, gender } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name required' });
    }

    const result = await db.query(
      'INSERT INTO students (parent_id, name, dob, gender) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, name, dob, gender]
    );

    res.status(201).json({
      success: true,
      student: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Submit registration (belt exam + tournament + uploads)
router.post('/:id/register', authenticate, requireApproved, async (req, res) => {
  try {
    const studentId = req.params.id;
    const { belt_level, exam_date, tournament_event, tournament_category, uploads } = req.body;

    // Create registration
    const regRes = await db.query(
      'INSERT INTO registrations (student_id, status) VALUES ($1, $2) RETURNING id',
      [studentId, 'pending']
    );
    const registrationId = regRes.rows[0].id;

    // Create belt form
    if (belt_level && exam_date) {
      await db.query(
        'INSERT INTO belt_forms (registration_id, belt_level, exam_date) VALUES ($1, $2, $3)',
        [registrationId, belt_level, exam_date]
      );
    }

    // Create tournament form
    if (tournament_event) {
      await db.query(
        'INSERT INTO tournament_forms (registration_id, event_name, category) VALUES ($1, $2, $3)',
        [registrationId, tournament_event, tournament_category]
      );
    }

    // Store upload references
    if (uploads && uploads.length > 0) {
      for (const upload of uploads) {
        await db.query(
          'INSERT INTO uploads (student_id, registration_id, drive_file_id, file_name, mime_type) VALUES ($1, $2, $3, $4, $5)',
          [studentId, registrationId, upload.drive_file_id, upload.file_name, upload.mime_type]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Registration submitted for approval',
      registration_id: registrationId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get certificates
router.get('/:id/certificates', authenticate, async (req, res) => {
  try {
    const studentId = req.params.id;
    const result = await db.query(
      'SELECT id, title, drive_file_id, issued_at FROM certificates WHERE student_id = $1 ORDER BY issued_at DESC',
      [studentId]
    );

    res.json({ certificates: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
