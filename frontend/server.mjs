import { createServer, request } from 'node:http';
import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');
const port = Number(process.env.PORT || 8080);
const backendUrl = new URL(process.env.BACKEND_URL || 'http://backend:5000');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const sendFile = async (res, filePath) => {
  const ext = path.extname(filePath);
  res.writeHead(200, {
    'Content-Type': contentTypes[ext] || 'application/octet-stream'
  });
  createReadStream(filePath).pipe(res);
};

const server = createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/api/')) {
      const target = new URL(req.url, backendUrl);
      const proxyReq = request(target, {
        method: req.method,
        headers: {
          ...req.headers,
          host: target.host
        }
      }, proxyRes => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res);
      });

      proxyReq.on('error', () => {
        res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, message: 'Backend no disponible' }));
      });

      req.pipe(proxyReq);
      return;
    }

    const requestPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
    const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
    const candidate = path.join(distDir, safePath === '/' ? 'index.html' : safePath);

    if (!candidate.startsWith(distDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    const stat = await fs.stat(candidate).catch(() => null);
    if (stat?.isFile()) {
      await sendFile(res, candidate);
      return;
    }

    await sendFile(res, path.join(distDir, 'index.html'));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: false, message: error.message }));
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Frontend listo en puerto ${port}`);
});
