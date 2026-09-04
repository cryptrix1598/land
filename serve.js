const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, 'dist');
const TYPES = { '.html':'text/html', '.css':'text/css', '.js':'application/javascript', '.svg':'image/svg+xml' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found: ' + p); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(4173, () => console.log('serving dist/ on http://localhost:4173'));
