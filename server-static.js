const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');

const server = http.createServer((req, res) => {
  let filePath = path.join(DIST_DIR, req.url);
  
  // 如果请求的是目录，尝试加载 index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  
  // 如果文件不存在，返回 index.html（用于 SPA 路由）
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }
  
  const ext = path.extname(filePath);
  let contentType = 'text/html';
  
  if (ext === '.js') contentType = 'application/javascript';
  if (ext === '.css') contentType = 'text/css';
  if (ext === '.json') contentType = 'application/json';
  if (ext === '.png') contentType = 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  if (ext === '.gif') contentType = 'image/gif';
  if (ext === '.svg') contentType = 'image/svg+xml';
  if (ext === '.woff') contentType = 'font/woff';
  if (ext === '.woff2') contentType = 'font/woff2';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Static server running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Serving files from: ${DIST_DIR}`);
});
