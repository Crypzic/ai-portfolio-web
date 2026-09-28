(function() {
  // ---------- Theme ----------
  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');
  var stored = null;
  try { stored = localStorage.getItem('isaacd-theme'); } catch (e) {}
  var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  root.setAttribute('data-theme', stored || (prefersLight ? 'light' : 'dark'));

  toggle.addEventListener('click', function() {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('isaacd-theme', next); } catch (e) {}
  });

  // ---------- Nav background on scroll ----------
  var nav = document.getElementById('nav');
  window.addEventListener('scroll', function() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // ---------- Scroll reveal ----------
  var revealEls = document.querySelectorAll('.reveal');
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(function(el) { io.observe(el); });

  // ---------- Blob parallax (matches pricing site) ----------
  var blobs = document.querySelectorAll('.blob');
  window.addEventListener('scroll', function() {
    var y = window.scrollY;
    blobs.forEach(function(blob, i) {
      blob.style.marginTop = (y * (0.015 + i * 0.006)) + 'px';
    });
  }, { passive: true });

  // ---------- Force autoplay ----------
  // Videos built via innerHTML strings don't reliably honor the `autoplay`
  // attribute in every engine, and iOS can still block the first attempt.
  // This keeps every clip actually playing without any tap from the visitor.
  function forcePlayAll() {
    document.querySelectorAll('video').forEach(function(v) {
      v.muted = true;
      var p = v.play();
      if (p && p.catch) p.catch(function() {});
    });
  }
  forcePlayAll();
  document.addEventListener('loadedmetadata', forcePlayAll, true);
  ['touchstart', 'click', 'scroll'].forEach(function(evt) {
    window.addEventListener(evt, forcePlayAll, { once: true, passive: true });
  });


  // Add/remove items freely — the carousel rebuilds itself from this array.
  // Set a real "src" (mp4 url or data URI) on any item to replace its placeholder plate.
  // NOTE: the src URLs below are free Mixkit stock clips, standing in so you can see how
  // real footage reads in this carousel. Swap each src for your own clip when ready — same
  // field, same format. (Published Claude preview links can't load external video per
  // platform restrictions, so these will only play once you open the downloaded file or
  // host it yourself — see the chat reply for details.)
  var portfolioItems = [
    { label: 'Product Ads', color1: '#8d6bff', color2: '#2c1f5c', src: 'https://assets.mixkit.co/videos/20766/20766-360.mp4' },
    { label: 'Fashion',     color1: '#e84fd8', color2: '#521a44', src: 'https://assets.mixkit.co/videos/21328/21328-360.mp4' },
    { label: 'Automotive',  color1: '#6f55ff', color2: '#1c1f4a', src: 'https://assets.mixkit.co/videos/35540/35540-360.mp4' },
    { label: 'Real Estate', color1: '#b344ff', color2: '#2e1650', src: 'https://assets.mixkit.co/videos/27543/27543-360.mp4' },
    { label: 'Skincare',    color1: '#e84fd8', color2: '#451a37', src: 'https://assets.mixkit.co/videos/50406/50406-720.mp4' },
    { label: 'UGC / Creators', color1: '#8d6bff', color2: '#211a4d', src: 'https://assets.mixkit.co/videos/41269/41269-360.mp4' },
    { label: 'Social Content', color1: '#6f55ff', color2: '#2a1a4a', src: 'https://assets.mixkit.co/videos/42291/42291-360.mp4' }
  ];

  var createCategories = [
    { title: 'Product Ads', desc: 'Cinematic product-focused advertising.' },
    { title: 'Fashion', desc: 'Campaign-style fashion and clothing content.' },
    { title: 'Automotive', desc: 'Vehicle showcases and commercial videos.' },
    { title: 'Real Estate', desc: 'Cinematic property walkthroughs and promos.' },
    { title: 'Beauty & Skincare', desc: 'Premium product and application visuals.' },
    { title: 'UGC / AI Creators', desc: 'Creator-style content for social ads.' },
    { title: 'Social Media Content', desc: 'Short-form videos for TikTok and Instagram.' }
  ];

  var createGrid = document.getElementById('createGrid');
  createCategories.forEach(function(c) {
    var el = document.createElement('div');
    el.className = 'create-card';
    el.innerHTML = '<div class="dot"></div><h3>' + c.title + '</h3><p>' + c.desc + '</p>';
    createGrid.appendChild(el);
  });
  var moreEl = document.createElement('div');
  moreEl.className = 'create-card more';
  moreEl.innerHTML = '<span>+ And more</span>';
  createGrid.appendChild(moreEl);

  // ================= 3D CYLINDRICAL CAROUSEL =================
  var track = document.getElementById('carouselTrack');
  var stage = document.getElementById('carouselStage');
  var dotsWrap = document.getElementById('carouselDots');
  var n = portfolioItems.length;
  var angleStep = 360 / n;
  var radius = Math.round(270 / (2 * Math.tan(Math.PI / n)));
  var rotation = 0;
  var activeIndex = 0;

  portfolioItems.forEach(function(item, i) {
    var el = document.createElement('div');
    el.className = 'carousel-item';
    el.style.transform = 'rotateY(' + (i * angleStep) + 'deg) translateZ(' + radius + 'px)';

    var mediaHtml = '';
    if (item.src) {
      mediaHtml = '<video src="' + item.src + '" autoplay muted loop playsinline webkit-playsinline disablepictureinpicture disableremoteplayback></video>';
    } else {
      el.style.background = 'linear-gradient(160deg,' + item.color1 + ',' + item.color2 + ')';
    }
    el.innerHTML = mediaHtml + '<div class="plate"><span>' + item.label + '</span></div>';
    track.appendChild(el);

    var dot = document.createElement('button');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', function() { goTo(i); });
    dotsWrap.appendChild(dot);
  });

  var items = track.querySelectorAll('.carousel-item');
  var dots = dotsWrap.querySelectorAll('button');
  forcePlayAll();

  function render() {
    track.style.transform = 'translateZ(-' + radius + 'px) rotateY(' + rotation + 'deg)';
    items.forEach(function(el, i) {
      var itemAngle = i * angleStep + rotation;
      var norm = ((itemAngle % 360) + 360) % 360;
      var delta = Math.min(norm, 360 - norm);
      el.classList.toggle('is-active', delta < angleStep / 2);
    });
    dots.forEach(function(d, i) { d.classList.toggle('active', i === activeIndex); });
  }

  function goTo(index) {
    activeIndex = ((index % n) + n) % n;
    rotation = -activeIndex * angleStep;
    render();
  }

  document.getElementById('prevBtn').addEventListener('click', function() { goTo(activeIndex - 1); });
  document.getElementById('nextBtn').addEventListener('click', function() { goTo(activeIndex + 1); });

  var dragging = false, startX = 0, startRotation = 0, moved = false;
  var lastX = 0, lastT = 0, velocity = 0;
  function pointerDown(x) {
    dragging = true; moved = false; startX = x; startRotation = rotation;
    lastX = x; lastT = performance.now(); velocity = 0;
    track.classList.add('no-transition');
  }
  function pointerMove(x) {
    if (!dragging) return;
    var now = performance.now();
    var dx = x - startX;
    if (Math.abs(dx) > 4) moved = true;
    rotation = startRotation + dx * 0.35;
    var dt = now - lastT;
    if (dt > 0) velocity = (x - lastX) / dt; // px per ms, smoothed by recency
    lastX = x; lastT = now;
    render();
  }
  function pointerUp() {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('no-transition');
    if (moved) {
      // Fling a bit further based on release velocity, then settle on the
      // nearest card — mirrors the weighty, momentum-based feel of an iOS
      // picker wheel instead of a hard instant snap.
      var momentum = velocity * 55;
      var clamped = Math.max(-angleStep * 2.2, Math.min(angleStep * 2.2, momentum));
      goTo(Math.round(-(rotation + clamped) / angleStep));
    }
  }

  stage.addEventListener('mousedown', function(e) { pointerDown(e.clientX); });
  window.addEventListener('mousemove', function(e) { pointerMove(e.clientX); });
  window.addEventListener('mouseup', pointerUp);
  stage.addEventListener('touchstart', function(e) { pointerDown(e.touches[0].clientX); }, { passive: true });
  stage.addEventListener('touchmove', function(e) { pointerMove(e.touches[0].clientX); }, { passive: true });
  stage.addEventListener('touchend', pointerUp);

  stage.tabIndex = 0;
  stage.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') goTo(activeIndex - 1);
    if (e.key === 'ArrowRight') goTo(activeIndex + 1);
  });

  render();
})();
