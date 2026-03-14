/**
 * upload_r2.js - Uploads a file to Cloudflare R2 and returns its public URL.
 */
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        let key = parts[0].trim();
        let value = parts.slice(1).join('=').trim();
        process.env[key] = value.replace(/^['"]|['"]$/g, '');
      }
    });
  }
}

loadEnv();

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  R2_ENDPOINT,
  NEXT_PUBLIC_R2_PUBLIC_BASE
} = process.env;

const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function uploadFile(filePath) {
  const fileName = path.basename(filePath);
  const fileContent = fs.readFileSync(filePath);
  
  const params = {
    Bucket: R2_BUCKET,
    Key: `aiar-t/${fileName}`,
    Body: fileContent,
    ContentType: 'image/png',
  };

  try {
    console.log(`Uploading ${fileName} to R2 bucket: ${R2_BUCKET}...`);
    await s3Client.send(new PutObjectCommand(params));
    const publicUrl = `${NEXT_PUBLIC_R2_PUBLIC_BASE}/aiar-t/${fileName}`;
    console.log(`✅ Upload Successful! Public URL: ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.error('❌ Error uploading correctly to R2:', err);
    return null;
  }
}

if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Please provide a file path.');
    process.exit(1);
  }
  uploadFile(filePath);
}

module.exports = { uploadFile };
