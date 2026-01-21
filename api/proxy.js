export default async function handler(req, res) {
  const BACKEND_URL = 'http://ec2-13-126-81-152.ap-south-1.compute.amazonaws.com:3847';

  // Get the path after /api/proxy
  const path = req.url.replace('/api/proxy', '') || '/';
  const targetUrl = `${BACKEND_URL}${path}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}
