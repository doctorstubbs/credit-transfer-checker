// Minimal web layer for the Credit Transfer Checker (Stage 6).
// Zero dependencies: Node's built in http server.
// Serves the family facing page and a JSON endpoint backed by the
// exact rules engine the Cucumber scenarios test (src/checker.js).

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { runCheck } = require('./checker');

const PORT = process.env.PORT || 3000;
const pagePath = path.join(__dirname, '..', 'public', 'index.html');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    fs.readFile(pagePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Page not found on server.');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/check') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const student = JSON.parse(body);
        const report = runCheck(student);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(report));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad request: ' + e.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log('Credit Transfer Checker running at http://localhost:' + PORT);
});
