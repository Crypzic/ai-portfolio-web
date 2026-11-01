// Receives one event from assets/track.js and adds it to today's counters.
//   a:<day>  hash of counters (events, button labels, pages, sources, devices, countries)
//   v:<day>  HyperLogLog of visitor ids (unique visitors)
//   recent   the last 100 events, for the live feed
var redis = require('./_redis');

var EVENTS = ['page_view', 'hero_cta', 'whatsapp_click', 'social_click', 'clip_open', 'package_select'];
var PAGES = ['/', '/ngn-price', '/usd-price'];
// Link-preview bots don't run JavaScript, so this only needs to catch headless browsers.
var BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|phantom|selenium|puppeteer/i;

function clean(s, max) {
  return String(s || '').replace(/[^\w\s.\-\/@&+()]/g, '').trim().slice(0, max || 60);
}

function device(ua) {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return 'tablet';
  if (/mobi|iphone|android/i.test(ua)) return 'mobile';
  return 'desktop';
}

function sourceOf(ref, host) {
  if (!ref) return 'direct';
  try {
    var h = new URL(ref).hostname.replace(/^www\./, '').replace(/^(l|lm|m)\./, '');
    if (!h || h === host) return null; // moving between our own pages isn't a source
    return clean(h, 40);
  } catch (e) { return 'direct'; }
}

module.exports = async function(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();
  if (!redis.configured()) return res.status(204).end();

  var ua = req.headers['user-agent'] || '';
  if (BOT_UA.test(ua)) return res.status(204).end();

  var body = req.body;
  try { if (typeof body !== 'object' || Buffer.isBuffer(body)) body = JSON.parse(String(body)); } catch (e) { body = null; }
  if (!body || EVENTS.indexOf(body.e) === -1) return res.status(400).end();

  var path = String(body.p || '/').replace(/\/(index\.html)?$/, '') || '/';
  if (PAGES.indexOf(path) === -1) path = 'other';
  var label = clean(body.l);
  var vid = clean(body.v, 40);
  var country = clean(req.headers['x-vercel-ip-country'], 2) || '??';
  var dev = device(ua);

  var day = redis.dayKey(0);
  var a = 'a:' + day, v = 'v:' + day;
  var ttl = redis.KEEP_DAYS * 86400;
  var cmds = [['HINCRBY', a, 'ev:' + body.e, 1]];
  if (label) cmds.push(['HINCRBY', a, 'lbl:' + body.e + ':' + label, 1]);

  if (body.e === 'page_view') {
    cmds.push(['HINCRBY', a, 'pg:' + path, 1]);
    cmds.push(['HINCRBY', a, 'dev:' + dev, 1]);
    cmds.push(['HINCRBY', a, 'cty:' + country, 1]);
    var src = body.s ? clean(body.s, 40).toLowerCase() : sourceOf(body.r, req.headers.host);
    if (src) cmds.push(['HINCRBY', a, 'src:' + src, 1]);
    if (vid) cmds.push(['PFADD', v, vid], ['EXPIRE', v, ttl]);
  }

  var item = JSON.stringify({ t: Date.now(), e: body.e, l: label, p: path, c: country, d: dev });
  cmds.push(['EXPIRE', a, ttl], ['LPUSH', 'recent', item], ['LTRIM', 'recent', 0, 99]);

  try { await redis.pipeline(cmds); } catch (e) { return res.status(502).end(); }
  res.status(204).end();
};
