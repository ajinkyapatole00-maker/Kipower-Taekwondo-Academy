const { google } = require('googleapis');

let auth;

function initializeAuth() {
  try {
    const keyJson = JSON.parse(
      Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf8')
    );

    auth = new google.auth.JWT(
      keyJson.client_email,
      null,
      keyJson.private_key,
      ['https://www.googleapis.com/auth/drive']
    );
  } catch (err) {
    console.error('Failed to initialize Google auth:', err.message);
    throw err;
  }
}

async function ensureFolder(folderName, parentId) {
  if (!auth) initializeAuth();
  const drive = google.drive({ version: 'v3', auth });

  const q = `'${parentId}' in parents and name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const res = await drive.files.list({
    q,
    fields: 'files(id, name)',
    spaces: 'drive'
  });

  if (res.data.files && res.data.files.length) {
    return res.data.files[0].id;
  }

  const meta = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };
  if (parentId) meta.parents = [parentId];

  const file = await drive.files.create({
    resource: meta,
    fields: 'id'
  });

  return file.data.id;
}

async function uploadFileToGoogleDrive(fileName, fileBuffer, mimeType, studentName) {
  if (!auth) initializeAuth();
  const drive = google.drive({ version: 'v3', auth });

  const parentFolderId = process.env.DRIVE_PARENT_FOLDER_ID;
  if (!parentFolderId) {
    throw new Error('DRIVE_PARENT_FOLDER_ID not configured');
  }

  const studentFolderId = await ensureFolder(studentName || 'uploads', parentFolderId);

  const fileMetadata = {
    name: fileName,
    parents: [studentFolderId]
  };

  const driveRes = await drive.files.create(
    {
      resource: fileMetadata,
      media: {
        mimeType,
        body: fileBuffer
      },
      fields: 'id, webViewLink'
    },
    { timeout: 30000 }
  );

  return {
    driveFileId: driveRes.data.id,
    webViewLink: driveRes.data.webViewLink
  };
}

module.exports = {
  uploadFileToGoogleDrive,
  ensureFolder
};
