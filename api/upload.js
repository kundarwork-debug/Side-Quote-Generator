export const config = {
  api: {
    bodyParser: false, // Disabling default parser to handle raw file stream
  },
};

export default async function handler(req, res) {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const filename = req.query.filename || 'uploaded-file';
  const PIXELDRAIN_API_KEY = "e160ffab-69c1-47c9-a29e-f72b5d5a02b7";
  const authHeader = "Basic " + Buffer.from(":" + PIXELDRAIN_API_KEY).toString("base64");

  try {
    const pixeldrainRes = await fetch(`https://pixeldrain.com/api/file/${encodeURIComponent(filename)}`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader
      },
      body: req // Pipe the incoming request stream straight to Pixeldrain
    });

    const data = await pixeldrainRes.json();
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(pixeldrainRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
