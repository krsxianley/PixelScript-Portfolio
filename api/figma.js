// Vercel API route for Figma API proxy
// This keeps your token secure on the server side

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_FILE_KEY = '1vwyFb6wqIGnyhzpRjApfR';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!FIGMA_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'Figma token not configured on server' });
  }

  const { nodeId, action } = req.query;

  try {
    if (action === 'getImage') {
      // Get image for a specific node
      const response = await fetch(
        `https://api.figma.com/v1/images/${FIGMA_FILE_KEY}?ids=${nodeId}&format=png&scale=2`,
        {
          headers: {
            'X-Figma-Token': FIGMA_ACCESS_TOKEN
          }
        }
      );
      const data = await response.json();
      return res.status(200).json(data);
    } else {
      // Get file data
      const response = await fetch(
        `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}`,
        {
          headers: {
            'X-Figma-Token': FIGMA_ACCESS_TOKEN
          }
        }
      );
      const data = await response.json();
      return res.status(200).json(data);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
