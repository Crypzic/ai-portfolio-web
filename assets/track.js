// First-party analytics for the /admin dashboard. Sends each event to /api/track
// alongside GA4. Loaded on every page before the page's own script.
(function() {
  if (location.protocol === 'file:') return;

  var off = false, vid = '';
  try {
    off = localStorage.getItem('isaacd-notrack') === '1'; // set from /admin to skip your own visits
    vid = localStorage.getItem('isaacd-vid') || '';
    if (!vid) { vid = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('isaacd-vid', vid); }
  } catch (e) {}

  function send(data) {
    var body = JSON.stringify(data);
    if (navigator.sendBeacon && navigator.sendBeacon('/api/track', new Blob([body], { type: 'text/plain' }))) return;
    if (window.fetch) fetch('/api/track', { method: 'POST', body: body, keepalive: true }).catch(function() {});
  }

  window.siteTrack = function(name, params) {
    if (off) return;
    params = params || {};
    var label = params.label || '';
    if (params.package) label = params.package + (params.currency ? ' (' + params.currency + ')' : '');
    send({ e: name, l: label, p: location.pathname, v: vid });
  };

  if (off) return;
  // Links shared as ...?ref=instagram or ?utm_source=instagram show up under that source.
  var q = new URLSearchParams(location.search);
  send({ e: 'page_view', p: location.pathname, v: vid, r: document.referrer, s: q.get('utm_source') || q.get('ref') || '' });
})();
