import { createServer } from 'http';
import { generateLoyaltyProgram } from './generate.js';

const server = createServer(async (req, res) => {
  if (req.url === '/api/generate' && req.method === 'POST') {
    try {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        const { businessName } = JSON.parse(body);
        const program = await generateLoyaltyProgram(businessName);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(program));
      });
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});