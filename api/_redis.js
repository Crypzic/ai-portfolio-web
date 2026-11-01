// Shared by the /api functions. Talks to Upstash Redis over its REST API, so no
// npm packages are needed. Vercel's Upstash integration sets one of these pairs
// of environment variables automatically.
var URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
var TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

// Days are counted in Lagos time (UTC+1, no daylight saving).
var TZ_OFFSET_MS = 60 * 60 * 1000;
var KEEP_DAYS = 40; // a little over the 30 days the dashboard shows

function configured() { return !!(URL_ && TOKEN); }

// Runs several Redis commands in one request. commands: [['HINCRBY', key, field, 1], ...]
async function pipeline(commands) {
  var res = await fetch(URL_ + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands)
  });
  if (!res.ok) throw new Error('Redis error ' + res.status);
  var out = await res.json();
  return out.map(function(r) { return r.result; });
}

function dayKey(offsetDays) {
  var d = new Date(Date.now() + TZ_OFFSET_MS - (offsetDays || 0) * 86400000);
  return d.toISOString().slice(0, 10);
}

module.exports = { configured: configured, pipeline: pipeline, dayKey: dayKey, KEEP_DAYS: KEEP_DAYS };
