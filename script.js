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
  tryPlay(heroVideo);
  // iOS Low Power Mode can block the first attempt; retry on the first interaction.
  ['touchstart', 'click', 'scroll'].forEach(function(evt) {
    window.addEventListener(evt, function() { tryPlay(heroVideo); }, { once: true, passive: true });
  });
  playWhileVisible(document.querySelector('.hero'), function() { return heroVideo; });


  // ---------- Portfolio clips ----------
  // Add/remove items freely — the carousel rebuilds itself from this array.
  //   src    — the short teaser clip shown in the carousel (and in the player).
  //            Put your files in assets/videos/ and use e.g. 'assets/videos/product-ads.mp4'.
  //   poster — optional still image (e.g. 'assets/posters/product-ads.jpg'). Shown before the
  //            clip loads, so side cards never look empty. Strongly recommended.
  //   full   — optional longer/higher-quality version to play when the clip is opened.
  //            If left out, the player uses `src`.
  // NOTE: the src URLs below are free Mixkit stock clips standing in until your own are ready.
  var portfolioItems = [
    { label: 'Product Ads',     color1: '#8d6bff', color2: '#2c1f5c', src: 'https://assets.mixkit.co/videos/20766/20766-360.mp4' },
    { label: 'Fashion',         color1: '#e84fd8', color2: '#521a44', src: 'https://assets.mixkit.co/videos/21328/21328-360.mp4' },
    { label: 'Automotive',      color1: '#6f55ff', color2: '#1c1f4a', src: 'https://assets.mixkit.co/videos/35540/35540-360.mp4' },
    { label: 'Real Estate',     color1: '#b344ff', color2: '#2e1650', src: 'https://assets.mixkit.co/videos/27543/27543-360.mp4' },
    { label: 'Skincare',        color1: '#e84fd8', color2: '#451a37', src: 'https://assets.mixkit.co/videos/50406/50406-720.mp4' },
    { label: 'UGC / Creators',  color1: '#8d6bff', color2: '#211a4d', src: 'https://assets.mixkit.co/videos/41269/41269-360.mp4' },
    { label: 'Social Content',  color1: '#6f55ff', color2: '#2a1a4a', src: 'https://assets.mixkit.co/videos/42291/42291-360.mp4' }
  ];

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

  // ================= 3D CYLINDRICAL CAROUSEL =================
  var track = document.getElementById('carouselTrack');
  var stage = document.getElementById('carouselStage');
  var dotsWrap = document.getElementById('carouselDots');
  var statusEl = document.getElementById('carouselStatus');
  var n = portfolioItems.length;
  var angleStep = 360 / n;
  var radius = Math.round(270 / (2 * Math.tan(Math.PI / n)));
  var rotation = 0;
  var activeIndex = 0;
  var stageVisible = true;

  stage.setAttribute('role', 'region');
  stage.setAttribute('aria-roledescription', 'carousel');
  stage.setAttribute('aria-label', 'Portfolio clips. Use left and right arrow keys to browse, Enter to watch.');

  portfolioItems.forEach(function(item, i) {
    var el = document.createElement('div');
    el.className = 'carousel-item';
    el.style.transform = 'rotateY(' + (i * angleStep) + 'deg) translateZ(' + radius + 'px)';
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
      // Only the centre clip downloads in full; the rest fetch just enough to show a frame.
      v.preload = 'metadata';
      if (item.poster) v.poster = item.poster;
      v.src = item.src;
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
  var dots = dotsWrap.querySelectorAll('button');

  // Play only the clip in the centre; pause the rest to save data and battery.
  function syncCarouselPlayback() {
    items.forEach(function(el, i) {
      var v = el.querySelector('video');
      if (!v) return;
      if (i === activeIndex && stageVisible && !lightboxOpen) {
        v.preload = 'auto';
        tryPlay(v);
      } else {
        v.pause();
      }
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
    if (!item || !item.src) return;
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
