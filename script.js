// NIOCREATIONS — Portfolio v3.0

document.addEventListener('DOMContentLoaded', () => {

  // ── i18n ──
  const T = {
    en: {
      'nav.work': 'Work',
      'nav.about': 'About',
      'nav.contact': 'Contact',
      'hero.label': 'Web Development & Design',
      'hero.title': 'I make websites<br>and <span class="accent-text">web apps</span>',
      'hero.desc': 'Clean code, thoughtful design, fast loading. HTML, CSS, JavaScript, React — from landing pages to interactive tools.',
      'hero.cta1': 'See my work',
      'hero.cta2': 'Get in touch',
      'work.label': 'Projects',
      'work.title': 'Recent work',
      'work.sub': 'A few projects I\'ve built recently',
      'about.label': 'About',
      'about.title': 'How I <span class="accent-text">work</span>',
      'about.desc': 'I write code from scratch — no page builders, no WordPress themes. Each project gets its own structure, designed around what it actually needs.',
      'ap1.t': 'Code from scratch',
      'ap1.d': 'No templates or frameworks where they\'re not needed. Just HTML, CSS and JS, written for the specific project.',
      'ap2.t': 'Fast by default',
      'ap2.d': 'Lightweight pages that load quickly. No heavy libraries, no unnecessary dependencies.',
      'ap3.t': 'Works on any device',
      'ap3.d': 'Responsive from the start. Tested on phones, tablets and desktops.',
      'contact.label': 'Contact',
      'contact.title': 'Have a project in mind?',
      'contact.desc': 'Write me — I\'ll reply within a day.',
      'c1.t': 'TRILOKA',
      'c1.d': 'Landing page for an architecture and interior design studio in Dubai. Door-reveal preloader, RU/EN switch, scroll animations.',
      'c2.t': 'Poker Timer',
      'c2.d': 'Blind timer for poker tournaments. 48-tick progress bar, level navigation, auto-advance, break management.',
      'c3.t': 'And more',
      'c3.d': 'Other projects — web apps, tools, websites',
      'modal.title': 'Other projects',
      'mp1.t': 'Rock Climbing Calendar',
      'mp1.d': 'Competition calendar for climbers. Schedule, filters, event details.',
      'mp2.t': 'Psihologiya na Salfetke',
      'mp2.d': 'Psychology blog with card-based article grid and 7 categories.',
      'mp3.t': 'Mafia Host App',
      'mp3.d': 'App for mafia game hosts. Role assignment, timers, game log.',
      'mp4.t': 'Set Trainer',
      'mp4.d': 'Card game trainer. Pattern recognition practice with timed rounds.',
    },
    ru: {
      'nav.work': 'Работы',
      'nav.about': 'Обо мне',
      'nav.contact': 'Контакты',
      'hero.label': 'Веб-разработка и дизайн',
      'hero.title': 'Делаю сайты<br>и <span class="accent-text">веб-приложения</span>',
      'hero.desc': 'Чистый код, продуманный дизайн, быстрая загрузка. HTML, CSS, JavaScript, React — от лендингов до интерактивных инструментов.',
      'hero.cta1': 'Смотреть работы',
      'hero.cta2': 'Написать мне',
      'work.label': 'Проекты',
      'work.title': 'Последние работы',
      'work.sub': 'Несколько недавних проектов',
      'about.label': 'Обо мне',
      'about.title': 'Как я <span class="accent-text">работаю</span>',
      'about.desc': 'Пишу код с нуля — без конструкторов и шаблонов WordPress. Каждый проект получает свою структуру, под свои задачи.',
      'ap1.t': 'Код с нуля',
      'ap1.d': 'Без шаблонов и фреймворков там, где они не нужны. Только HTML, CSS и JS, написанные под конкретный проект.',
      'ap2.t': 'Быстрая загрузка',
      'ap2.d': 'Лёгкие страницы, которые грузятся быстро. Без тяжёлых библиотек и лишних зависимостей.',
      'ap3.t': 'Работает на любом устройстве',
      'ap3.d': 'Адаптивная вёрстка с самого начала. Проверено на телефонах, планшетах и десктопах.',
      'contact.label': 'Контакты',
      'contact.title': 'Есть проект?',
      'contact.desc': 'Напишите — отвечу в течение дня.',
      'c1.t': 'TRILOKA',
      'c1.d': 'Лендинг для архитектурно-дизайнерской студии в Дубае. Прелоадер-двери, переключатель RU/EN, анимации при скролле.',
      'c2.t': 'Покер Таймер',
      'c2.d': 'Таймер блайндов для покерных турниров. Прогресс-бар из 48 тиков, навигация по уровням, автопереход, перерывы.',
      'c3.t': 'И другие',
      'c3.d': 'Другие проекты — веб-приложения, инструменты, сайты',
      'modal.title': 'Другие проекты',
      'mp1.t': 'Календарь скалолазания',
      'mp1.d': 'Календарь соревнований для скалолазов. Расписание, фильтры, детали событий.',
      'mp2.t': 'Психология на салфетке',
      'mp2.d': 'Блог по психологии с карточной сеткой статей и 7 категориями.',
      'mp3.t': 'Mafia Host App',
      'mp3.d': 'Приложение для ведущего мафии. Раздача ролей, таймеры, журнал игры.',
      'mp4.t': 'Set Trainer',
      'mp4.d': 'Тренажёр карточной игры. Тренировка распознавания паттернов на время.',
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
  const preloaderLogo = preloader.querySelector('.preloader-logo');

  setTimeout(() => {
    preloaderLogo.classList.add('click');
  }, 700);

  setTimeout(() => {
    preloader.style.opacity = '0';
    preloader.style.visibility = 'hidden';
    preloader.style.pointerEvents = 'none';
    document.body.style.overflow = '';
    document.querySelectorAll('.hero [data-animate]').forEach(el => {
      const d = el.dataset.delay || 0;
      setTimeout(() => el.classList.add('visible'), 200 + parseInt(d));
    });
  }, 1000);

  // Block scroll during preloader
  document.body.style.overflow = 'hidden';

  // ── Header scroll ──
  const header = document.getElementById('header');

  function onScroll() {
    const st = window.scrollY;
    header.classList.toggle('scrolled', st > 60);

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

  // ── More Projects Modal ──
  const modal = document.getElementById('moreProjectsModal');
  const moreBtn = document.getElementById('moreProjectsBtn');
  const closeBtn = document.getElementById('modalClose');

  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  moreBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

});
