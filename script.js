/* WOLFOVIĆ — demo sajt: meni, sticky nav, pojavljivanje sekcija, accordion */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- hero: ulazna animacija ---------- */
  var hero = document.querySelector('.hero');
  if (hero) requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-ready'); }); });

  /* ---------- sticky nav ---------- */
  var nav = document.getElementById('nav');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 24);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobilni meni ---------- */
  var burger = document.querySelector('.burger');
  var drawer = document.getElementById('meni');

  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
    nav.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      drawer.hidden = false;
      requestAnimationFrame(function () { drawer.classList.add('is-open'); });
      var first = drawer.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    } else {
      drawer.classList.remove('is-open');
      setTimeout(function () { if (burger.getAttribute('aria-expanded') === 'false') drawer.hidden = true; }, reduce ? 0 : 220);
    }
  }

  if (burger && drawer) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        burger.focus();
      }
    });
    window.matchMedia('(min-width: 1100px)').addEventListener('change', function (m) {
      if (m.matches) setMenu(false);
    });
  }

  /* ---------- pojavljivanje pri skrolu ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  var steps = document.querySelector('.steps');

  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
    if (steps) steps.classList.add('is-drawn');
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });

    if (steps) {
      var tallyIo = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          steps.classList.add('is-drawn');
          tallyIo.disconnect();
        }
      }, { threshold: 0.3 });
      tallyIo.observe(steps.querySelector('.tally') || steps);
    }
  }

  /* ---------- česta pitanja ---------- */
  document.querySelectorAll('.acc__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      btn.closest('.acc__item').classList.toggle('is-open', open);
    });
  });

  /* ---------- skrol efekti: progres, paralaksa, linija koraka ---------- */
  var root = document.documentElement;
  var progress = document.querySelector('.progress');
  var heroImg = document.querySelector('.photo--hero img');
  var timeline = document.querySelector('.timeline');
  var stepEls = document.querySelectorAll('.step');
  var fxTick = false;

  function fx() {
    var vh = window.innerHeight;
    var max = root.scrollHeight - vh;
    if (progress) progress.style.setProperty('--sp', max > 0 ? (window.scrollY / max).toFixed(4) : 0);

    if (heroImg && !reduce && window.scrollY < vh * 1.2) {
      heroImg.style.setProperty('--py', Math.min(window.scrollY * 0.08, 36).toFixed(1) + 'px');
    }

    if (timeline) {
      var r = timeline.getBoundingClientRect();
      var line = vh * 0.72;
      var horizontal = window.innerWidth >= 960;
      /* vodoravna linija je niska, pa se puni tokom duže deonice skrola */
      var span = horizontal ? vh * 0.4 : r.height;
      var p = Math.min(1, Math.max(0, (line - r.top) / span));
      timeline.style.setProperty('--p', p.toFixed(3));
      stepEls.forEach(function (st, i) {
        var hit = horizontal ? p >= i / (stepEls.length - 1) - 0.02 : st.getBoundingClientRect().top < line;
        st.classList.toggle('is-hit', hit);
      });
    }
    fxTick = false;
  }
  function onFx() { if (!fxTick) { fxTick = true; requestAnimationFrame(fx); } }
  window.addEventListener('scroll', onFx, { passive: true });
  window.addEventListener('resize', onFx);
  fx();

  /* ---------- način rada: talas signala se smiruje ----------
     telefon/tablet: aktivan je korak na sredini ekrana;
     desktop (4 kolone u redu): svi se pale redom kad red uđe u ekran */
  var principles = document.querySelectorAll('.principle');
  var principleList = document.querySelector('.principles');
  var wide = window.matchMedia('(min-width: 1100px)');
  var pIo = null;

  function allActive() { principles.forEach(function (el) { el.classList.add('is-active'); }); }
  function setupPrinciples() {
    if (pIo) { pIo.disconnect(); pIo = null; }
    principles.forEach(function (el) { el.classList.remove('is-active'); });
    if (reduce || !('IntersectionObserver' in window)) { allActive(); return; }
    if (wide.matches) {
      pIo = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { allActive(); pIo.disconnect(); }
      }, { threshold: 0.35 });
      pIo.observe(principleList);
    } else {
      pIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          principles.forEach(function (el) { el.classList.toggle('is-active', el === entry.target); });
        });
      }, { rootMargin: '-42% 0px -42% 0px' });
      principles.forEach(function (el) { pIo.observe(el); });
    }
  }
  if (principles.length && principleList) {
    setupPrinciples();
    wide.addEventListener('change', setupPrinciples);
  }

  /* ---------- reflektor koji prati kursor (samo miš) ---------- */
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer) {
    document.querySelectorAll('.plan').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var b = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - b.left) + 'px');
        card.style.setProperty('--my', (e.clientY - b.top) + 'px');
      });
    });
  }

  /* ---------- tačka na liniji signala: bez kretanja ako je tako podešeno ---------- */
  if (reduce) {
    document.querySelectorAll('.signal__dot').forEach(function (d) { d.remove(); });
  }

  /* ---------- pre / posle klizač ---------- */
  document.querySelectorAll('.ba').forEach(function (ba) {
    var range = ba.querySelector('.ba__range');
    var dragging = false;

    function set(v) {
      v = Math.min(100, Math.max(0, v));
      ba.style.setProperty('--pos', v + '%');
      if (range) range.value = Math.round(v);
    }
    function fromEvent(e) {
      var b = ba.getBoundingClientRect();
      set((e.clientX - b.left) / b.width * 100);
    }

    ba.addEventListener('pointerdown', function (e) {
      dragging = true;
      ba.setPointerCapture(e.pointerId);
      fromEvent(e);
    });
    ba.addEventListener('pointermove', function (e) { if (dragging) fromEvent(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) {
      ba.addEventListener(t, function () { dragging = false; });
    });
    if (range) range.addEventListener('input', function () { set(Number(range.value)); });

    /* jednom pokaži da može da se vuče */
    if (!reduce && 'IntersectionObserver' in window) {
      var hIo = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        hIo.disconnect();
        ba.classList.add('is-hint');
        var t0 = null;
        function frame(t) {
          if (dragging) return;
          if (t0 === null) t0 = t;
          var k = Math.min(1, (t - t0) / 1600);
          set(50 + Math.sin(k * Math.PI * 2) * 22 * (1 - k));
          if (k < 1) requestAnimationFrame(frame); else set(50);
        }
        setTimeout(function () { requestAnimationFrame(frame); }, 300);
      }, { threshold: 0.6 });
      hIo.observe(ba);
    }
  });

  /* ---------- godina u footeru ---------- */
  var y = document.getElementById('godina');
  if (y) y.textContent = new Date().getFullYear();
})();
