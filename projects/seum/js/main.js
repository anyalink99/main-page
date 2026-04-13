(function () {
  /* ─── Sidebar ─────────────────────────────────────────────── */
  var sidebar  = document.getElementById('sidebar');
  var menuBtn  = document.getElementById('menu-btn');
  var closeBtn = document.getElementById('sidebar-close');

  var overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  function openSidebar() {
    sidebar.classList.add('is-open');
    sidebar.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-visible');
    menuBtn.setAttribute('aria-expanded', 'true');
    closeBtn.focus();
  }

  function closeSidebar() {
    sidebar.classList.remove('is-open');
    sidebar.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-visible');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.focus();
  }

  menuBtn.addEventListener('click', openSidebar);
  closeBtn.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  // Allow keyboard activation of close button (it's a div with role=button)
  closeBtn.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeSidebar(); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sidebar.classList.contains('is-open')) closeSidebar();
  });

  /* ─── Feed tab switching ──────────────────────────────────── */
  var filters = document.querySelectorAll('.feed-filter');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) {
        b.classList.remove('feed-filter--active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('feed-filter--active');
      btn.setAttribute('aria-selected', 'true');
    });
  });

  /* ─── Loader ──────────────────────────────────────────────── */
  var loader = document.getElementById('loader');
  var loaderHidden = false;

  function hideLoader() {
    if (loaderHidden) return;
    loaderHidden = true;
    if (loader) {
      loader.classList.add('is-hidden');
      loader.addEventListener('transitionend', function () {
        loader.style.display = 'none';
      }, { once: true });
    }
    revealHero();
    runInitialReveal();
  }

  if (loader) {
    // Both conditions must pass: animation finishes AND page is loaded.
    // Minimum keeps the animation visible even on fast/cached loads.
    var minDone = false;
    var loadDone = false;
    function tryHide() { if (minDone && loadDone) hideLoader(); }
    setTimeout(function () { minDone = true; tryHide(); }, 2200);
    window.addEventListener('load', function () { loadDone = true; tryHide(); });
    // Hard safety — never trap the user
    setTimeout(hideLoader, 4000);
  }

  /* ─── Hero reveal ─────────────────────────────────────────── */
  function revealHero() {
    var hero = document.querySelector('.hero');
    if (hero) hero.classList.add('hero-revealed');
  }

  /* ─── Entrance reveals ────────────────────────────────────── */
  var revealItems = null;

  function initReveal() {
    revealItems = document.querySelectorAll('.reveal-item');
    if (!revealItems.length || !window.IntersectionObserver) {
      // Fallback: immediately visible if no IO support
      if (revealItems) revealItems.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    revealItems.forEach(function (el) { observer.observe(el); });
  }

  function runInitialReveal() {
    // Reveal elements already in viewport when loader hides
    if (!revealItems) return;
    revealItems.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        el.classList.add('is-visible');
      }
    });
  }

  // Safety fallback: force-reveal everything after 2.8s
  setTimeout(function () {
    document.querySelectorAll('.reveal-item:not(.is-visible)').forEach(function (el) {
      el.classList.add('is-visible');
    });
    revealHero();
  }, 2800);

  initReveal();
})();
