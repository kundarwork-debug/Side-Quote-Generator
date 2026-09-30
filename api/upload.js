module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
      return res.status(400).json({ error: 'Missing filename or fileData in request body' });
    }

    // Convert base64 data back to binary buffer
    const buffer = Buffer.from(fileData, 'base64');
    const PIXELDRAIN_API_KEY = "e160ffab-69c1-47c9-a29e-f72b5d5a02b7";
    const authHeader = "Basic " + Buffer.from(":" + PIXELDRAIN_API_KEY).toString("base64");

    const pixeldrainRes = await fetch(`https://pixeldrain.com/api/file/${encodeURIComponent(filename)}`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/octet-stream'
      },
      body: buffer
    });

    const responseText = await pixeldrainRes.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { message: responseText };
    }

    return res.status(pixeldrainRes.status).json(data);
  } catch (err) {
    console.error("Vercel proxy execution error:", err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports.config = {
  api: {
    bodyParser: {
      sizeLimit: '30mb',
    },
  },
};
