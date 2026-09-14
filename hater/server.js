const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');
const DATA = path.join(__dirname, 'data');
const FILE = path.join(DATA, 'submissions.json');
fs.mkdirSync(DATA, { recursive: true });
if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]');

const send = (res, status, body, type='application/json') => {
  res.writeHead(status, {'Content-Type': `${type}; charset=utf-8`, 'Cache-Control':'no-store'}); res.end(body);
};
const json = (res, status, obj) => send(res, status, JSON.stringify(obj));
const safePath = (url) => { const p = decodeURIComponent((url || '/').split('?')[0]); const rel = p === '/' ? 'index.html' : p.slice(1); const full = path.resolve(PUBLIC, rel); return full.startsWith(PUBLIC + path.sep) ? full : null; };
const readBody = (req) => new Promise((resolve, reject) => { let raw=''; req.on('data', c => { raw += c; if(raw.length > 20000) req.destroy(); }); req.on('end', () => resolve(raw)); req.on('error', reject); });

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/submit') {
    try {
      const body = JSON.parse(await readBody(req));
      if (body.website) return json(res, 400, {ok:false, error:'Invalid submission'});
      const text = String(body.message || '').trim();
      if (text.length < 3 || text.length > 500) return json(res, 400, {ok:false, error:'Message must be 3–500 characters.'});
      const submissions = JSON.parse(fs.readFileSync(FILE, 'utf8'));
      submissions.push({ id: crypto.randomUUID(), message: text, createdAt: new Date().toISOString(), status: 'pending' });
      fs.writeFileSync(FILE, JSON.stringify(submissions, null, 2));
      return json(res, 201, {ok:true});
    } catch { return json(res, 400, {ok:false, error:'Invalid submission'}); }
  }
  const file = safePath(req.url);
  if (!file || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res, 404, 'Not found', 'text/plain');
  const ext = path.extname(file); const types = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
  send(res, 200, fs.readFileSync(file), types[ext] || 'application/octet-stream');
});
server.listen(PORT, () => console.log(`HATER listening on ${PORT}`));
