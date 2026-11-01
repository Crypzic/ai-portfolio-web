// Returns the dashboard data for /admin. Needs the ADMIN_PASSWORD environment variable,
// sent as "Authorization: Bearer <password>".
var crypto = require('crypto');
var redis = require('./_redis');

function sameSecret(a, b) {
  var ha = crypto.createHash('sha256').update(String(a)).digest();
  var hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

module.exports = async function(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  var password = process.env.ADMIN_PASSWORD;
  if (!password) return res.status(500).json({ error: 'ADMIN_PASSWORD is not set in Vercel.' });
  if (!redis.configured()) return res.status(500).json({ error: 'Upstash Redis is not connected in Vercel.' });

  var given = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!given || !sameSecret(given, password)) {
    // Slow down password guessing.
    await new Promise(function(r) { setTimeout(r, 800); });
    return res.status(401).json({ error: 'Wrong password.' });
  }

  // Always the last 30 days; the dashboard filters to today / 7 days itself.
  var days = [];
  for (var i = 29; i >= 0; i--) days.push(redis.dayKey(i));
  var keys = days.map(function(d) { return 'v:' + d; });

  var cmds = [];
  days.forEach(function(d) { cmds.push(['HGETALL', 'a:' + d], ['PFCOUNT', 'v:' + d]); });
  cmds.push(['PFCOUNT'].concat(keys.slice(-7)), ['PFCOUNT'].concat(keys));
  cmds.push(['LRANGE', 'recent', 0, 49]);

  var out;
  try { out = await redis.pipeline(cmds); } catch (e) { return res.status(502).json({ error: 'Could not reach Redis.' }); }

  var result = days.map(function(d, i) {
    var flat = out[i * 2] || [], counts = {};
    for (var j = 0; j < flat.length; j += 2) counts[flat[j]] = Number(flat[j + 1]);
    return { day: d, visitors: out[i * 2 + 1] || 0, counts: counts };
  });
  var k = days.length * 2;

  res.status(200).json({
    days: result,
    // Unique visitors over each range (a visitor on several days counts once).
    visitors: { 1: result[result.length - 1].visitors, 7: out[k] || 0, 30: out[k + 1] || 0 },
    recent: (out[k + 2] || []).map(function(s) { try { return JSON.parse(s); } catch (e) { return null; } }).filter(Boolean)
  });
};
