// Shared by every pricelist page. Each page defines window.PRICELIST before loading this:
//   {
//     currency: 'NGN',
//     format: function(n) { return '₦' + n + 'k'; },   // how a price is displayed
//     packages: { starter: { label, amount, message }, ... }
//   }
(function() {
  var WHATSAPP_NUMBER = '2347068716014';
  var cfg = window.PRICELIST;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Analytics (same opt-in GA4 as the main site) ----------
  var gaId = window.GA_MEASUREMENT_ID;
  if (gaId) {
    var gs = document.createElement('script');
    gs.async = true;
    gs.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
    document.head.appendChild(gs);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', gaId);
  }
  function trackEvent(name, params) {
    if (window.gtag) window.gtag('event', name, params || {});
  }

  // ---------- Theme ----------
  var root = document.documentElement;
  document.getElementById('themeToggle').addEventListener('click', function() {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('isaacd-theme', next); } catch (e) {}
  });

  // ---------- Scroll: nav background + blob parallax ----------
  var nav = document.getElementById('nav');
  var blobs = document.querySelectorAll('.blob');
  var ticking = false;
  function onScrollFrame() {
    ticking = false;
    var y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    if (reduceMotion) return;
    blobs.forEach(function(blob, i) {
      blob.style.translate = '0 ' + (y * (0.015 + i * 0.006)).toFixed(1) + 'px';
    });
  }
  window.addEventListener('scroll', function() {
    if (!ticking) { ticking = true; requestAnimationFrame(onScrollFrame); }
  }, { passive: true });
  onScrollFrame();

  // ---------- Floating fact cards + cursor glow (same behaviour as the main site) ----------
  var floats = Array.prototype.slice.call(document.querySelectorAll('.float[data-depth]'));
  var mouseX = 0, mouseY = 0, floatTicking = false;
  function updateFloats() {
    floatTicking = false;
    if (reduceMotion) return;
    var vh = window.innerHeight;
    var parentShift = new Map();
    floats.forEach(function(el) {
      var parent = el.parentElement;
      if (!parentShift.has(parent)) {
        var r = parent.getBoundingClientRect();
        parentShift.set(parent, r.bottom < 0 || r.top > vh ? null : ((vh / 2) - (r.top + r.height / 2)) / vh);
      }
      var shift = parentShift.get(parent);
      if (shift === null) return;
      var d = parseFloat(el.getAttribute('data-depth')) || 0.5;
      el.style.translate = (mouseX * d * 18).toFixed(1) + 'px ' + (shift * d * -60 + mouseY * d * 18).toFixed(1) + 'px';
    });
  }
  function requestFloats() {
    if (!floatTicking) { floatTicking = true; requestAnimationFrame(updateFloats); }
  }
  window.addEventListener('scroll', requestFloats, { passive: true });
  window.addEventListener('resize', requestFloats);
  requestFloats();

  var glow = document.getElementById('cursorGlow');
  if (glow && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('pointermove', function(e) {
      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
      if (!reduceMotion) {
        glow.classList.add('on');
        glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      }
      requestFloats();
    }, { passive: true });
    document.addEventListener('pointerleave', function() { glow.classList.remove('on'); });
  }

  // ---------- Scroll reveal ----------
  var revealEls = document.querySelectorAll('.reveal');
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('visible');
      io.unobserve(el);
      // Stagger delay is only for the entrance; clear it so hover/select stay instant.
      if (el.style.transitionDelay) setTimeout(function() { el.style.transitionDelay = ''; }, 1300);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.pricing-grid .price-card').forEach(function(card, i) {
    card.style.transitionDelay = (i * 100) + 'ms';
  });
  revealEls.forEach(function(el) { io.observe(el); });

  // ---------- Prices: fill in, and count up when scrolled into view ----------
  var priceEls = document.querySelectorAll('.card-price[data-package]');
  priceEls.forEach(function(el) {
    var pkg = cfg.packages[el.getAttribute('data-package')];
    el.textContent = cfg.format(reduceMotion ? pkg.amount : 0);
    el.setAttribute('aria-label', cfg.format(pkg.amount) + ' per month');
  });
  if (!reduceMotion) {
    var priceIo = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        priceIo.unobserve(el);
        var target = cfg.packages[el.getAttribute('data-package')].amount;
        var start = performance.now(), duration = 1400;
        (function step(now) {
          var p = Math.min((now - start) / duration, 1);
          var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          el.textContent = cfg.format(p === 1 ? target : Math.floor(eased * target));
          if (p < 1) requestAnimationFrame(step);
        })(start);
      });
    }, { threshold: 0.5 });
    priceEls.forEach(function(el) { priceIo.observe(el); });
  }

  // ---------- Package selection ----------
  var selected = null;
  var cards = document.querySelectorAll('.price-card');
  var mainCta = document.getElementById('mainCta');
  var mainCtaLabel = document.getElementById('mainCtaLabel');
  var confirmLine = document.getElementById('confirmLine');
  var confirmText = document.getElementById('confirmText');
  var pricelist = document.getElementById('pricelist');

  function selectPackage(key) {
    var pkg = cfg.packages[key];
    if (!pkg) return;
    selected = key;
    cards.forEach(function(card) {
      var on = card.getAttribute('data-package') === key;
      var btn = card.querySelector('.card-btn');
      card.classList.toggle('selected', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.innerHTML = on
        ? '<i class="fa-solid fa-check" aria-hidden="true"></i> Selected'
        : 'Select ' + cfg.packages[card.getAttribute('data-package')].label;
    });
    confirmText.textContent = pkg.label + ' selected — ' + cfg.format(pkg.amount) + '/month';
    confirmLine.classList.add('show');
    mainCtaLabel.textContent = 'Get started with ' + pkg.label;
    mainCta.disabled = false;
    trackEvent('package_select', { package: key, currency: cfg.currency });
  }

  // The whole card is clickable; its button is the keyboard/screen-reader control.
  cards.forEach(function(card) {
    card.addEventListener('click', function() { selectPackage(card.getAttribute('data-package')); });
  });

  function openWhatsApp() {
    if (!selected) {
      pricelist.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    trackEvent('whatsapp_click', { label: 'pricelist_' + selected, currency: cfg.currency });
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(cfg.packages[selected].message), '_blank', 'noopener');
  }
  mainCta.addEventListener('click', openWhatsApp);
  document.getElementById('finalCta').addEventListener('click', openWhatsApp);
})();
