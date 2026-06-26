const db = require('../src/services/db');

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','student','parent')),
  is_approved BOOLEAN DEFAULT false,
  phone TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  parent_id INTEGER REFERENCES users(id),
  name TEXT NOT NULL,
  dob DATE,
  gender TEXT,
  photo_drive_id TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  applied_at TIMESTAMP DEFAULT now(),
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS belt_forms (
  id SERIAL PRIMARY KEY,
  registration_id INTEGER REFERENCES registrations(id),
  belt_level TEXT,
  exam_date DATE,
  scores_json JSONB
);

CREATE TABLE IF NOT EXISTS tournament_forms (
  id SERIAL PRIMARY KEY,
  registration_id INTEGER REFERENCES registrations(id),
  event_name TEXT,
  category TEXT
);

CREATE TABLE IF NOT EXISTS uploads (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  registration_id INTEGER REFERENCES registrations(id),
  drive_file_id TEXT,
  file_name TEXT,
  mime_type TEXT,
  uploaded_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  uploaded_by INTEGER REFERENCES users(id),
  drive_file_id TEXT,
  title TEXT,
  issued_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES users(id),
  sent_at TIMESTAMP DEFAULT now(),
  channel TEXT,
  content TEXT,
  recipients_json JSONB
);
`;

async function migrate() {
  try {
    console.log('Running migrations...');
    await db.query(schema);
    console.log('✓ Database schema created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
