(function() {
  var WHATSAPP_NUMBER = '2347068716014';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  function prefersReducedMotion() { return !!(reduceMotion && reduceMotion.matches); }

  // ---------- Analytics (GA4) ----------
  // Only loads once a Measurement ID is set in index.html. Tracks CTA clicks
  // (anything with data-track) and which clips visitors open.
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
  document.addEventListener('click', function(e) {
    var el = e.target.closest && e.target.closest('[data-track]');
    if (el) trackEvent(el.getAttribute('data-track'), { label: el.getAttribute('data-track-label') || '' });
  });

  // ---------- Theme ----------
  // The initial theme is set by the inline script in <head> (avoids a flash).
  var root = document.documentElement;
  document.getElementById('themeToggle').addEventListener('click', function() {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('isaacd-theme', next); } catch (e) {}
  });

  // ---------- Scroll: nav background + blob parallax (one listener, once per frame) ----------
  var nav = document.getElementById('nav');
  var blobs = document.querySelectorAll('.blob');
  var scrollTicking = false;
  function onScrollFrame() {
    scrollTicking = false;
    var y = window.scrollY;
    nav.classList.toggle('scrolled', y > 60);
    if (prefersReducedMotion()) return;
    // `translate` composes with the blobs' float animation (which uses `transform`)
    // and avoids the layout work that animating margin-top caused.
    blobs.forEach(function(blob, i) {
      blob.style.translate = '0 ' + (y * (0.015 + i * 0.006)).toFixed(1) + 'px';
    });
  }
  window.addEventListener('scroll', function() {
    if (!scrollTicking) { scrollTicking = true; requestAnimationFrame(onScrollFrame); }
  }, { passive: true });
  if (reduceMotion && reduceMotion.addEventListener) {
    reduceMotion.addEventListener('change', function() {
      if (prefersReducedMotion()) blobs.forEach(function(b) { b.style.translate = ''; });
    });
  }
  onScrollFrame();

  // ---------- Scroll reveal ----------
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function(el) { io.observe(el); });
  } else {
    revealEls.forEach(function(el) { el.classList.add('visible'); });
  }

  // ---------- Video helpers ----------
  function tryPlay(v) {
    v.muted = true;
    var p = v.play();
    if (p && p.catch) p.catch(function() {});
  }
  // Make a paused video draw its opening frame as soon as its size is known, so it never
  // sits as an empty box (some browsers only paint a frame after a seek).
  function showFirstFrame(v) {
    v.addEventListener('loadedmetadata', function() {
      if (v.paused && v.currentTime < 0.05) {
        try { v.currentTime = 0.1; } catch (e) {}
      }
    }, { once: true });
  }
  // Pause a video while it's off-screen, resume when it comes back.
  function playWhileVisible(target, getVideo) {
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function(entries) {
      var v = getVideo();
      if (!v) return;
      if (entries[0].isIntersecting) tryPlay(v); else v.pause();
    }, { threshold: 0.15 }).observe(target);
  }

  // ---------- Hero video (always autoplays) ----------
  var heroVideo = document.getElementById('hero-video');
  // Until assets/videos/hero.mp4 is uploaded, the animated gradient behind it shows instead.
  heroVideo.addEventListener('error', function() { heroVideo.style.display = 'none'; });
  if (heroVideo.error) heroVideo.style.display = 'none';
  tryPlay(heroVideo);
  // iOS Low Power Mode can block the first attempt; retry on the first interaction.
  ['touchstart', 'click', 'scroll'].forEach(function(evt) {
    window.addEventListener(evt, function() { tryPlay(heroVideo); }, { once: true, passive: true });
  });
  playWhileVisible(document.querySelector('.hero'), function() { return heroVideo; });


  // ---------- Portfolio clips ----------
  // Each clip loads from a fixed file name — just upload the file and it appears:
  //   assets/videos/<file>.mp4        the teaser shown in the carousel (and in the player)
  //   assets/videos/<file>-full.mp4   optional longer version for the player: set full: true
  // Cards show the clip's opening frame until they reach the centre, then play.
  // Until a video file exists, its card shows the coloured placeholder instead.
  // The carousel rebuilds itself from this list, so you can add or remove entries.
  var portfolioItems = [
    { label: 'Product Ads',     file: 'product-ads', color1: '#8d6bff', color2: '#2c1f5c' },
    { label: 'Fashion',         file: 'fashion',     color1: '#e84fd8', color2: '#521a44' },
    { label: 'Automotive',      file: 'automotive',  color1: '#6f55ff', color2: '#1c1f4a' },
    { label: 'Real Estate',     file: 'real-estate', color1: '#b344ff', color2: '#2e1650' },
    { label: 'Skincare',        file: 'skincare',    color1: '#e84fd8', color2: '#451a37' },
    { label: 'UGC / Creators',  file: 'ugc',         color1: '#8d6bff', color2: '#211a4d' },
    { label: 'Social Content',  file: 'social',      color1: '#6f55ff', color2: '#2a1a4a' }
  ];
  portfolioItems.forEach(function(item) {
    if (!item.file) return;
    item.src = item.src || 'assets/videos/' + item.file + '.mp4';
    if (item.full === true) item.full = 'assets/videos/' + item.file + '-full.mp4';
  });

  var createCategories = [
    { icon: 'fa-bag-shopping', title: 'Product Ads', desc: 'Cinematic product-focused advertising.' },
    { icon: 'fa-shirt', title: 'Fashion', desc: 'Campaign-style fashion and clothing content.' },
    { icon: 'fa-car', title: 'Automotive', desc: 'Vehicle showcases and commercial videos.' },
    { icon: 'fa-house', title: 'Real Estate', desc: 'Cinematic property walkthroughs and promos.' },
    { icon: 'fa-spa', title: 'Beauty & Skincare', desc: 'Premium product and application visuals.' },
    { icon: 'fa-user-check', title: 'UGC / AI Creators', desc: 'Creator-style content for social ads.' },
    { icon: 'fa-mobile-screen', title: 'Social Media Content', desc: 'Short-form videos for TikTok and Instagram.' }
  ];

  var createGrid = document.getElementById('createGrid');
  createCategories.forEach(function(c) {
    var el = document.createElement('div');
    el.className = 'create-card';
    el.innerHTML = '<div class="card-icon"><i class="fa-solid ' + c.icon + '" aria-hidden="true"></i></div><h3></h3><p></p>';
    el.querySelector('h3').textContent = c.title;
    el.querySelector('p').textContent = c.desc;
    createGrid.appendChild(el);
  });
  var moreEl = document.createElement('div');
  moreEl.className = 'create-card more';
  moreEl.innerHTML = '<span><i class="fa-solid fa-plus" aria-hidden="true"></i> And more</span>';
  createGrid.appendChild(moreEl);

  function whatsappLink(message) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
  }

  // ================= FLOATING ELEMENTS =================
  // Each .float drifts with scroll (relative to its section) and, on desktop, with the mouse.
  // data-depth controls how far it moves. The gentle bob is a CSS animation on top.
  var floats = Array.prototype.slice.call(document.querySelectorAll('.float[data-depth]'));
  var mouseX = 0, mouseY = 0, floatTicking = false;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function updateFloats() {
    floatTicking = false;
    if (prefersReducedMotion()) return;
    var vh = window.innerHeight;
    var parentShift = new Map();
    floats.forEach(function(el) {
      var parent = el.parentElement;
      if (!parentShift.has(parent)) {
        var r = parent.getBoundingClientRect();
        // -1 when the section is below the viewport centre, +1 above it
        parentShift.set(parent, r.bottom < 0 || r.top > vh ? null : ((vh / 2) - (r.top + r.height / 2)) / vh);
      }
      var shift = parentShift.get(parent);
      if (shift === null) return;
      var d = parseFloat(el.getAttribute('data-depth')) || 0.5;
      var x = mouseX * d * 18;
      var y = shift * d * -60 + mouseY * d * 18;
      el.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
    });
  }
  function requestFloats() {
    if (!floatTicking) { floatTicking = true; requestAnimationFrame(updateFloats); }
  }
  window.addEventListener('scroll', requestFloats, { passive: true });
  window.addEventListener('resize', requestFloats);
  requestFloats();

  // Cursor glow (desktop only)
  var glow = document.getElementById('cursorGlow');
  if (finePointer && glow) {
    window.addEventListener('pointermove', function(e) {
      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
      if (!prefersReducedMotion()) {
        glow.classList.add('on');
        glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      }
      requestFloats();
    }, { passive: true });
    document.addEventListener('pointerleave', function() { glow.classList.remove('on'); });
  }

  // ================= PLATFORM SHOWCASE (swipeable phones) =================
  // One phone per platform. Only the centre phone plays; the others sit on their opening frame.
  // Each slide's data-files lists video names to try in order (first one that exists wins).
  function formatCount(n, fmt) {
    if (fmt === 'k') return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : Math.round(n).toString();
    if (fmt === 'dec') return n.toFixed(1);
    return Math.round(n).toLocaleString('en-US');
  }
  // Example stat cards count up the first time their phone reaches the centre.
  function runCounters(slide) {
    if (slide.getAttribute('data-counted')) return;
    slide.setAttribute('data-counted', '1');
    var els = slide.querySelectorAll('[data-count-to]');
    slide.querySelectorAll('.stat-bar').forEach(function(b) { b.classList.add('on'); });
    function set(p) {
      els.forEach(function(el) {
        el.textContent = formatCount(parseFloat(el.getAttribute('data-count-to')) * p, el.getAttribute('data-format'));
      });
    }
    if (prefersReducedMotion()) { set(1); return; }
    var start = performance.now(), duration = 1500;
    (function step(now) {
      var p = Math.min((now - start) / duration, 1);
      set(1 - Math.pow(1 - p, 3));
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  var pfStage = document.getElementById('pfStage');
  if (pfStage) {
    var pfSlides = Array.prototype.slice.call(pfStage.querySelectorAll('.pf-slide'));
    var pfTabs = document.querySelectorAll('.pf-tab');
    var pfDotsWrap = document.getElementById('pfDots');
    var pfN = pfSlides.length;
    var pfIndex = 0;
    var pfVisible = false;
    var pfAuto = null;
    var pfUserTook = false;

    // Load each slide's clip, falling back through its data-files list.
    pfSlides.forEach(function(slide, k) {
      var v = slide.querySelector('video');
      var files = (slide.getAttribute('data-files') || '').split(',').filter(Boolean);
      var attempt = 0;
      function load() {
        if (attempt >= files.length) { v.remove(); return; }
        v.src = 'assets/videos/' + files[attempt].trim() + '.mp4#t=0.1';
      }
      if (v) {
        v.addEventListener('error', function() { attempt++; load(); });
        showFirstFrame(v);
        load();
      }
      slide.addEventListener('click', function() {
        if (pfDragMoved) return;
        if (k !== pfIndex) { pfUserTook = true; pfGo(k); }
      });
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Show ' + (slide.getAttribute('aria-label') || 'platform'));
      dot.addEventListener('click', function() { pfUserTook = true; pfGo(k); });
      pfDotsWrap.appendChild(dot);
    });
    var pfDots = pfDotsWrap.querySelectorAll('button');

    function pfLayout() {
      pfSlides.forEach(function(slide, k) {
        var off = k - pfIndex;
        if (off > pfN / 2) off -= pfN;
        if (off < -pfN / 2) off += pfN;
        var abs = Math.abs(off);
        slide.classList.toggle('is-active', off === 0);
        slide.setAttribute('aria-hidden', off === 0 ? 'false' : 'true');
        slide.style.zIndex = String(10 - abs);
        slide.style.opacity = abs > 1 ? '0' : '1';
        slide.style.pointerEvents = abs > 1 ? 'none' : '';
        slide.style.transform = off === 0 ? 'none'
          : 'translateX(' + (off * 58) + '%) scale(.8) rotateY(' + (off > 0 ? -16 : 16) + 'deg)';
      });
      pfTabs.forEach(function(t, k) {
        t.classList.toggle('active', k === pfIndex);
        t.setAttribute('aria-selected', k === pfIndex ? 'true' : 'false');
      });
      pfDots.forEach(function(d, k) { d.classList.toggle('active', k === pfIndex); });
    }
    function pfSyncVideos() {
      pfSlides.forEach(function(slide, k) {
        var v = slide.querySelector('video');
        if (!v) return;
        var off = Math.abs(k - pfIndex);
        if (Math.min(off, pfN - off) <= 1) v.preload = 'auto';
        if (k === pfIndex && pfVisible) tryPlay(v); else v.pause();
      });
      if (pfVisible) runCounters(pfSlides[pfIndex]);
    }
    function pfGo(k) {
      pfIndex = ((k % pfN) + pfN) % pfN;
      pfLayout();
      pfSyncVideos();
    }

    // Auto-advance every few seconds until the visitor takes over.
    function pfStartAuto() {
      if (pfAuto || pfUserTook || prefersReducedMotion()) return;
      pfAuto = setInterval(function() { pfGo(pfIndex + 1); }, 6500);
    }
    function pfStopAuto() { clearInterval(pfAuto); pfAuto = null; }

    pfTabs.forEach(function(t) {
      t.addEventListener('click', function() { pfUserTook = true; pfStopAuto(); pfGo(parseInt(t.getAttribute('data-index'), 10)); });
    });
    document.getElementById('pfPrev').addEventListener('click', function() { pfUserTook = true; pfStopAuto(); pfGo(pfIndex - 1); });
    document.getElementById('pfNext').addEventListener('click', function() { pfUserTook = true; pfStopAuto(); pfGo(pfIndex + 1); });
    pfStage.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); pfUserTook = true; pfStopAuto(); pfGo(pfIndex - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); pfUserTook = true; pfStopAuto(); pfGo(pfIndex + 1); }
    });

    // Swipe / drag
    var pfStartX = null, pfDragMoved = false;
    function pfDown(x) { pfStartX = x; pfDragMoved = false; }
    function pfUp(x) {
      if (pfStartX === null) return;
      var dx = x - pfStartX;
      pfStartX = null;
      if (Math.abs(dx) > 40) {
        pfDragMoved = true;
        setTimeout(function() { pfDragMoved = false; }, 0);
        pfUserTook = true; pfStopAuto();
        pfGo(pfIndex + (dx < 0 ? 1 : -1));
      }
    }
    pfStage.addEventListener('mousedown', function(e) { pfDown(e.clientX); });
    window.addEventListener('mouseup', function(e) { pfUp(e.clientX); });
    pfStage.addEventListener('touchstart', function(e) { pfDown(e.touches[0].clientX); }, { passive: true });
    pfStage.addEventListener('touchend', function(e) { pfUp(e.changedTouches[0].clientX); });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function(entries) {
        pfVisible = entries[0].isIntersecting;
        pfSyncVideos();
        if (pfVisible) pfStartAuto(); else pfStopAuto();
      }, { threshold: 0.3 }).observe(pfStage);
    } else {
      pfVisible = true;
    }
    pfLayout();
    pfSyncVideos();
  }

  // ================= 3D CYLINDRICAL CAROUSEL =================
  var track = document.getElementById('carouselTrack');
  var stage = document.getElementById('carouselStage');
  var dotsWrap = document.getElementById('carouselDots');
  var statusEl = document.getElementById('carouselStatus');
  var n = portfolioItems.length;
  var angleStep = 360 / n;
  var radius = 0; // set by layoutRing() from the rendered card width
  var rotation = 0;
  var activeIndex = 0;
  var stageVisible = true;

  stage.setAttribute('role', 'region');
  stage.setAttribute('aria-roledescription', 'carousel');
  stage.setAttribute('aria-label', 'Portfolio clips. Use left and right arrow keys to browse, Enter to watch.');

  portfolioItems.forEach(function(item, i) {
    var el = document.createElement('div');
    el.className = 'carousel-item';
    // Gradient shows until the clip/poster loads (and stays if there's no src).
    el.style.background = 'linear-gradient(160deg,' + item.color1 + ',' + item.color2 + ')';
    el.setAttribute('aria-hidden', 'true');

    if (item.src) {
      var v = document.createElement('video');
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.setAttribute('disablepictureinpicture', '');
      v.setAttribute('disableremoteplayback', '');
      // Only clips near the centre download in full; the rest fetch just enough to show
      // their opening frame (#t=0.1 makes iPhones draw it too instead of a blank box).
      v.preload = 'metadata';
      v.src = item.src + '#t=0.1';
      showFirstFrame(v);
      // No file uploaded yet (or it failed): drop the video so the gradient placeholder shows.
      v.addEventListener('error', function() {
        item.missing = true;
        v.remove();
        el.classList.add('no-clip');
      });
      el.appendChild(v);
    }

    var plate = document.createElement('div');
    plate.className = 'plate';
    var label = document.createElement('span');
    label.textContent = item.label;
    plate.appendChild(label);
    if (item.src) {
      var play = document.createElement('span');
      play.className = 'play-badge';
      play.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
      plate.appendChild(play);
    }
    el.appendChild(plate);

    el.addEventListener('click', function() {
      if (suppressClick) return;
      if (i === activeIndex) openLightbox(i);
      else goTo(i);
    });
    track.appendChild(el);

    var dot = document.createElement('button');
    dot.setAttribute('aria-label', 'Show ' + item.label + ' clip');
    dot.addEventListener('click', function() { goTo(i); });
    dotsWrap.appendChild(dot);
  });

  var items = track.querySelectorAll('.carousel-item');

  // Spread the cards round the ring with a gap of ~20% of a card, so neighbours sit apart.
  function layoutRing() {
    var cardW = items[0].offsetWidth || 270;
    radius = Math.round((cardW * 1.2) / (2 * Math.tan(Math.PI / n)));
    items.forEach(function(el, i) {
      el.style.transform = 'rotateY(' + (i * angleStep) + 'deg) translateZ(' + radius + 'px)';
    });
  }
  layoutRing();
  window.addEventListener('resize', function() { layoutRing(); render(); });
  var dots = dotsWrap.querySelectorAll('button');

  // Only the centre clip plays. The cards either side stay paused on their opening frame
  // and are fully preloaded (two out each way), so a swipe starts playback instantly.
  function ringDistance(i) {
    var d = Math.abs(i - activeIndex) % n;
    return Math.min(d, n - d);
  }
  function syncCarouselPlayback() {
    items.forEach(function(el, i) {
      var v = el.querySelector('video');
      if (!v) return;
      var dist = ringDistance(i);
      if (dist <= 2) v.preload = 'auto';
      if (dist === 0 && stageVisible && !lightboxOpen) tryPlay(v);
      else v.pause();
    });
  }

  function render() {
    track.style.transform = 'translateZ(-' + radius + 'px) rotateY(' + rotation + 'deg)';
    items.forEach(function(el, i) {
      var itemAngle = i * angleStep + rotation;
      var norm = ((itemAngle % 360) + 360) % 360;
      var delta = Math.min(norm, 360 - norm);
      el.classList.toggle('is-active', delta < angleStep / 2);
    });
    dots.forEach(function(d, i) {
      d.classList.toggle('active', i === activeIndex);
      if (i === activeIndex) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
    });
  }

  function afterChange() {
    render();
    syncCarouselPlayback();
    statusEl.textContent = 'Clip ' + (activeIndex + 1) + ' of ' + n + ': ' + portfolioItems[activeIndex].label;
  }

  function goTo(index) {
    var next = ((index % n) + n) % n;
    // Rotate the short way round (e.g. last → first moves one step, not all the way back).
    var diff = next - activeIndex;
    if (diff > n / 2) diff -= n;
    if (diff < -n / 2) diff += n;
    rotation = Math.round(rotation / angleStep) * angleStep - diff * angleStep;
    activeIndex = next;
    afterChange();
  }

  document.getElementById('prevBtn').addEventListener('click', function() { goTo(activeIndex - 1); });
  document.getElementById('nextBtn').addEventListener('click', function() { goTo(activeIndex + 1); });

  var dragging = false, startX = 0, startRotation = 0, moved = false, suppressClick = false;
  var lastX = 0, lastT = 0, velocity = 0;
  function pointerDown(x) {
    dragging = true; moved = false; suppressClick = false; startX = x; startRotation = rotation;
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
      // A drag shouldn't also count as a tap on the card under the finger.
      suppressClick = true;
      setTimeout(function() { suppressClick = false; }, 0);
      // Fling a bit further based on release velocity, then settle on the
      // nearest card — mirrors the weighty, momentum-based feel of an iOS
      // picker wheel instead of a hard instant snap.
      var momentum = velocity * 55;
      var clamped = Math.max(-angleStep * 2.2, Math.min(angleStep * 2.2, momentum));
      var target = Math.round(-(rotation + clamped) / angleStep);
      activeIndex = ((target % n) + n) % n;
      rotation = -target * angleStep;
      afterChange();
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
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(activeIndex - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(activeIndex + 1); }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(activeIndex); }
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function(entries) {
      stageVisible = entries[0].isIntersecting;
      syncCarouselPlayback();
    }, { threshold: 0.15 }).observe(stage);
  }

  // ================= CLIP PLAYER =================
  var lightbox = document.getElementById('lightbox');
  var lbVideo = document.getElementById('lightboxVideo');
  var lbLabel = document.getElementById('lightboxLabel');
  var lbCta = document.getElementById('lightboxCta');
  var lbSound = document.getElementById('lightboxSound');
  var lightboxOpen = false;
  var lastFocus = null;

  function setSoundIcon() {
    lbSound.classList.toggle('muted', lbVideo.muted);
    lbSound.setAttribute('aria-label', lbVideo.muted ? 'Unmute' : 'Mute');
  }

  function openLightbox(i) {
    var item = portfolioItems[i];
    if (!item || !item.src || item.missing) return;
    lastFocus = document.activeElement;
    lightboxOpen = true;
    syncCarouselPlayback();

    lbLabel.textContent = item.label;
    lbCta.href = whatsappLink('Hi Isaac, I just watched your ' + item.label + ' clip. I want something like that for my brand.');
    lbCta.setAttribute('data-track-label', item.label);
    if (item.poster) lbVideo.poster = item.poster; else lbVideo.removeAttribute('poster');
    lightbox.classList.remove('landscape');
    lbVideo.src = item.full || item.src;
    lbVideo.currentTime = 0;

    lightbox.hidden = false;
    document.body.classList.add('lightbox-lock');
    requestAnimationFrame(function() { lightbox.classList.add('open'); });

    // Opened by a tap, so the browser allows sound. Fall back to muted if it refuses.
    lbVideo.muted = false;
    var p = lbVideo.play();
    if (p && p.catch) p.catch(function() { lbVideo.muted = true; setSoundIcon(); lbVideo.play().catch(function() {}); });
    setSoundIcon();
    lightbox.querySelector('.lightbox-close').focus();
    trackEvent('clip_open', { label: item.label });
  }

  function closeLightbox() {
    if (!lightboxOpen) return;
    lightboxOpen = false;
    lbVideo.pause();
    lightbox.classList.remove('open');
    document.body.classList.remove('lightbox-lock');
    setTimeout(function() {
      if (!lightboxOpen) { lightbox.hidden = true; lbVideo.removeAttribute('src'); lbVideo.load(); }
    }, prefersReducedMotion() ? 0 : 300);
    syncCarouselPlayback();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // Landscape clips (e.g. 16:9 car or property footage) get a wide player instead of a cropped portrait one.
  lbVideo.addEventListener('loadedmetadata', function() {
    lightbox.classList.toggle('landscape', lbVideo.videoWidth > lbVideo.videoHeight);
  });

  lbSound.addEventListener('click', function() {
    lbVideo.muted = !lbVideo.muted;
    setSoundIcon();
  });
  lightbox.addEventListener('click', function(e) {
    if (e.target.closest('[data-close]')) closeLightbox();
  });
  document.addEventListener('keydown', function(e) {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') closeLightbox();
    // Keep keyboard focus inside the player while it's open.
    if (e.key === 'Tab') {
      var focusables = lightbox.querySelectorAll('button, a[href]');
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  render();
  syncCarouselPlayback();
})();
