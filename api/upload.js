export const config = {
  api: {
    bodyParser: {
      sizeLimit: '30mb',
    },
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename, fileData } = req.body || {};

    if (!fileData || !filename) {
      return res.status(400).json({ error: 'Missing filename or fileData' });
    }

    const buffer = Buffer.from(fileData, 'base64');
    const boundary = '----VercelCatboxBoundary' + Math.random().toString(36).substring(2);
    
    let payload = '';
    payload += `--${boundary}\r\n`;
    payload += `Content-Disposition: form-data; name="reqtype"\r\n\r\n`;
    payload += `fileupload\r\n`;
    payload += `--${boundary}\r\n`;
    payload += `Content-Disposition: form-data; name="fileToUpload"; filename="${filename}"\r\n`;
    payload += `Content-Type: application/octet-stream\r\n\r\n`;

    const headerBuffer = Buffer.from(payload, 'utf-8');
    const footerBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
    const fullBody = Buffer.concat([headerBuffer, buffer, footerBuffer]);

    const catboxRes = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': fullBody.length
      },
      body: fullBody
    });

    const responseText = await catboxRes.text();

    if (!catboxRes.ok || !responseText.startsWith('http')) {
      return res.status(500).json({ error: 'Catbox error: ' + responseText });
    }

    return res.status(200).json({ url: responseText.trim() });
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: err.message });
  }
}
