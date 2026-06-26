# VR Mala Taekwondo - Student Registration & Admin Portal

## Features
- Student & Admin login with role-based access
- Student registration with admin approval workflow
- Belt exam and tournament forms
- Photo/document auto-upload to Google Drive
- Certificate bulk upload and parent view
- Admin bulk messaging (SMS via Twilio)
- Pending registration dashboard

## Tech Stack
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Frontend**: React (Create React App)
- **Auth**: JWT + bcrypt
- **File Storage**: Google Drive API
- **Messaging**: Twilio

## Setup

### Prerequisites
- Node.js v14+
- PostgreSQL
- Google Cloud Project with Drive API enabled
- Twilio account

### Installation

1. Clone the repo
   ```bash
   git clone https://github.com/ajinkyapatole00-maker/Kipower-Taekwondo-Academy.git
   cd Kipower-Taekwondo-Academy
   ```

2. Copy `.env.example` to `.env` and fill in your values
   ```bash
   cp .env.example .env
   ```

3. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

4. Set up database
   ```bash
   npm run migrate
   ```

5. Start backend
   ```bash
   npm run dev
   ```

6. In another terminal, install and start frontend
   ```bash
   cd frontend
   npm install
   npm start
   ```

Backend runs on http://localhost:3000  
Frontend runs on http://localhost:3000

## API Endpoints

### Auth
- `POST /auth/register-student` - Student registration
- `POST /auth/register-admin` - Admin registration (protected)
- `POST /auth/login` - Login (returns JWT)
- `GET /auth/me` - Get current user

### Admin
- `GET /admin/registrations/pending` - Pending student registrations
- `POST /admin/users/:id/approve` - Approve student
- `POST /admin/users/:id/reject` - Reject student
- `POST /admin/certificates/bulk-upload` - Upload certificates
- `POST /admin/messages/bulk-send` - Send bulk SMS

### Student
- `POST /students` - Create student profile
- `POST /registrations` - Submit registration with forms
- `GET /registrations/:id` - View registration status
- `GET /students/:id/certificates` - View certificates

### Files
- `POST /upload` - Upload file to Google Drive

## Deployment

### Backend (Render/Heroku)
1. Set environment variables in platform dashboard
2. Push to main branch
3. Platform auto-deploys

### Frontend (Vercel)
1. Connect repo to Vercel
2. Set REACT_APP_API_URL to backend URL
3. Auto-deploys on push

## Database Setup

Create tables:
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','student','parent')),
  is_approved BOOLEAN DEFAULT false,
  phone TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  parent_id INTEGER REFERENCES users(id),
  name TEXT NOT NULL,
  dob DATE,
  gender TEXT,
  photo_drive_id TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  applied_at TIMESTAMP DEFAULT now(),
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  notes TEXT
);

CREATE TABLE belt_forms (
  id SERIAL PRIMARY KEY,
  registration_id INTEGER REFERENCES registrations(id),
  belt_level TEXT,
  exam_date DATE,
  scores_json JSONB
);

CREATE TABLE tournament_forms (
  id SERIAL PRIMARY KEY,
  registration_id INTEGER REFERENCES registrations(id),
  event_name TEXT,
  category TEXT
);

CREATE TABLE uploads (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  registration_id INTEGER REFERENCES registrations(id),
  drive_file_id TEXT,
  file_name TEXT,
  mime_type TEXT,
  uploaded_at TIMESTAMP DEFAULT now()
);

CREATE TABLE certificates (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  uploaded_by INTEGER REFERENCES users(id),
  drive_file_id TEXT,
  title TEXT,
  issued_at TIMESTAMP DEFAULT now()
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES users(id),
  sent_at TIMESTAMP DEFAULT now(),
  channel TEXT,
  content TEXT,
  recipients_json JSONB
);
```

## Google Drive Setup

1. Create Google Cloud Project
2. Enable Google Drive API
3. Create Service Account
4. Download JSON key and encode as base64:
   ```bash
   cat service-account-key.json | base64 | pbcopy
   ```
5. Paste into `.env` as `GOOGLE_SERVICE_ACCOUNT_KEY`
6. Create a folder in your Drive and share it with the service account email
7. Get folder ID from URL and set `DRIVE_PARENT_FOLDER_ID`

## Twilio Setup

1. Sign up at twilio.com
2. Get Account SID, Auth Token, and a phone number
3. Set in `.env` file

## File Structure

```
Kipower-Taekwondo-Academy/
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── admin.js
│   │   │   ├── students.js
│   │   │   └── uploads.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── services/
│   │   │   ├── googleDrive.js
│   │   │   ├── twilio.js
│   │   │   └── db.js
│   │   └── config/
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── StudentDashboard.js
│   │   │   ├── AdminDashboard.js
│   │   │   └── Register.js
│   │   ├── components/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── .env.example
└── README.md
```

## Contributing

Create a feature branch and submit a pull request.

## License

MIT
