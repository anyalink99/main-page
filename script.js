// NIOCREATIONS — Portfolio v2.0

document.addEventListener('DOMContentLoaded', () => {

  // ── i18n ──
  const T = {
    en: {
      'nav.work': 'Work',
      'nav.about': 'About',
      'nav.contact': 'Contact',
      'hero.label': 'Web Development & Design',
      'hero.title': 'I build web projects<br>that <span class="gradient-text">actually work</span>',
      'hero.desc': 'Landing pages, web apps, interactive tools. No templates, no page builders — just hand-crafted code from scratch.',
      'hero.cta1': 'See my work',
      'hero.cta2': 'Get in touch',
      'work.label': 'Projects',
      'work.title': 'Selected work',
      'work.sub': 'Each project built from scratch with attention to every pixel',
      'about.label': 'About',
      'about.title': 'Every detail<br>is <span class="gradient-text">intentional</span>',
      'about.desc': 'From premium landing pages to interactive web apps — each project is built from scratch with performance, usability, and attention to detail. No bloat, no shortcuts.',
      'm.handcoded': 'Hand-coded',
      'm.loadtime': 'Load time',
      'm.deps': 'Dependencies',
      'm.projects': 'Projects shipped',
      'contact.label': 'Contact',
      'contact.title': 'Have a project in mind?',
      'contact.desc': 'Let\'s talk about your next web project.',
      'c1.t': 'TRILOKA',
      'c1.d': 'Architecture & interior design studio. Premium landing with door-reveal preloader, RU/EN localization, scroll animations, and responsive design.',
      'c2.t': 'Poker Timer',
      'c2.d': 'Tournament blind timer with 48-tick progress bar, level navigation, auto-advance, and break management. Interactive demo of the full desktop app.',
      'c3.t': 'Psihologiya na Salfetke',
      'c3.d': 'Psychology blog with card-based article grid, warm design, and 7 thematic categories. Practical self-help content in a clean, readable format.',
    },
    ru: {
      'nav.work': 'Работы',
      'nav.about': 'Обо мне',
      'nav.contact': 'Контакты',
      'hero.label': 'Веб-разработка и дизайн',
      'hero.title': 'Я делаю веб-проекты,<br>которые <span class="gradient-text">реально работают</span>',
      'hero.desc': 'Лендинги, веб-приложения, интерактивные инструменты. Без шаблонов, без конструкторов — только код с нуля.',
      'hero.cta1': 'Смотреть работы',
      'hero.cta2': 'Связаться',
      'work.label': 'Проекты',
      'work.title': 'Избранные работы',
      'work.sub': 'Каждый проект создан с нуля с вниманием к каждому пикселю',
      'about.label': 'Обо мне',
      'about.title': 'Каждая деталь<br><span class="gradient-text">продумана</span>',
      'about.desc': 'От премиальных лендингов до интерактивных веб-приложений — каждый проект создаётся с нуля с вниманием к производительности, удобству и деталям.',
      'm.handcoded': 'Код вручную',
      'm.loadtime': 'Загрузка',
      'm.deps': 'Зависимости',
      'm.projects': 'Проектов',
      'contact.label': 'Контакты',
      'contact.title': 'Есть проект?',
      'contact.desc': 'Давайте обсудим ваш следующий веб-проект.',
      'c1.t': 'TRILOKA',
      'c1.d': 'Архитектурно-дизайнерская студия. Премиальный лендинг с прелоадером-дверями, локализацией RU/EN, анимациями прокрутки и адаптивным дизайном.',
      'c2.t': 'Покер Таймер',
      'c2.d': 'Таймер блайндов для покерных турниров с прогресс-баром из 48 тиков, навигацией по уровням, автопереходом и управлением перерывами.',
      'c3.t': 'Психология на салфетке',
      'c3.d': 'Блог по психологии с карточной сеткой статей, тёплым дизайном и 7 тематическими категориями. Практичный контент для саморазвития.',
    }
  };

  let currentLang = 'en';

  function setLang(lang) {
    currentLang = lang;
    const d = T[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.dataset.i18n;
      if (d[k] !== undefined) el.textContent = d[k];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const k = el.dataset.i18nHtml;
      if (d[k] !== undefined) el.innerHTML = d[k];
    });
    // Hero title (has HTML)
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && d['hero.title']) heroTitle.innerHTML = d['hero.title'];

    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    document.documentElement.lang = lang;
  }

  document.querySelectorAll('.lang-btn').forEach(b => {
    b.addEventListener('click', () => setLang(b.dataset.lang));
  });

  // ── Preloader ──
  const preloader = document.getElementById('preloader');
  setTimeout(() => {
    preloader.classList.add('done');
    document.body.style.overflow = '';
    // Trigger hero animations after preloader
    document.querySelectorAll('.hero [data-animate]').forEach(el => {
      const d = el.dataset.delay || 0;
      setTimeout(() => el.classList.add('visible'), 200 + parseInt(d));
    });
  }, 1800);

  // Block scroll during preloader
  document.body.style.overflow = 'hidden';

  // ── Custom Cursor ──
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  let mx = 0, my = 0, fx = 0, fy = 0;

  // Only on non-touch devices
  const isTouch = matchMedia('(hover: none)').matches;

  if (!isTouch) {
    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
    });

    // Smooth follower
    function animateFollower() {
      fx += (mx - fx) * 0.12;
      fy += (my - fy) * 0.12;
      follower.style.left = fx + 'px';
      follower.style.top = fy + 'px';
      requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Hover state for interactive elements
    const interactives = 'a, button, .btn, .work-card, .contact-link, .lang-btn, [data-magnetic]';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(interactives)) {
        cursor.classList.add('hovering');
        follower.classList.add('hovering');
      }
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(interactives)) {
        cursor.classList.remove('hovering');
        follower.classList.remove('hovering');
      }
    });
  }

  // ── Header scroll ──
  const header = document.getElementById('header');
  let lastScroll = 0;

  function onScroll() {
    const st = window.scrollY;
    header.classList.toggle('scrolled', st > 60);
    lastScroll = st;

    // Scroll progress
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? (st / h) * 100 : 0;
    document.getElementById('scrollProgress').style.width = pct + '%';
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Mobile Menu ──
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ── Smooth scroll ──
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const t = document.querySelector(a.getAttribute('href'));
      if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 60, behavior: 'smooth' });
    });
  });

  // ── Scroll Animations ──
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const d = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
          // Animate metric bars
          const bar = entry.target.querySelector('.metric-bar-fill');
          if (bar) {
            bar.style.width = bar.dataset.width + '%';
          }
          // Animate counters
          const counter = entry.target.querySelector('[data-count]');
          if (counter) {
            animateCounter(counter);
          }
        }, parseInt(d));
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-animate]').forEach(el => {
    // Skip hero elements — they animate after preloader
    if (!el.closest('.hero')) {
      obs.observe(el);
    }
  });

  // ── Counter animation ──
  function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1500;
    const start = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const val = Math.round(eased * target);
      el.textContent = val + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ── 3D Tilt on project cards ──
  if (!isTouch) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      const glow = card.querySelector('.work-card-glow');

      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotateX = ((y - cy) / cy) * -4;
        const rotateY = ((x - cx) / cx) * 4;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;

        if (glow) {
          glow.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(129,140,248,0.1), transparent 40%)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        if (glow) glow.style.background = '';
      });
    });
  }

  // ── Magnetic hover on buttons ──
  if (!isTouch) {
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
        el.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        setTimeout(() => el.style.transition = '', 500);
      });
    });
  }

  // ── Parallax orbs on mouse move ──
  if (!isTouch) {
    const orbs = document.querySelectorAll('.orb');
    document.addEventListener('mousemove', e => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      orbs.forEach((orb, i) => {
        const speed = (i + 1) * 12;
        orb.style.transform += ''; // force update
        orb.style.marginLeft = x * speed + 'px';
        orb.style.marginTop = y * speed + 'px';
      });
    });
  }
});
