// SHOWCASE — Portfolio Scripts

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
      'about.label': 'About',
      'about.title': 'Every detail<br>is <span class="gradient-text">intentional</span>',
      'about.desc': 'From premium landing pages to interactive web apps — each project is built from scratch with performance, usability, and attention to detail. No bloat, no shortcuts.',
      'm.handcoded': 'Hand-coded',
      'm.loadtime': 'Load time',
      'm.deps': 'Dependencies',
      'contact.label': 'Contact',
      'contact.title': 'Have a project in mind?',
      'contact.desc': 'Let\'s talk about your next web project.',
      // Card 1
      'c1.t': 'TRILOKA',
      'c1.d': 'Architecture & interior design studio. Premium landing with door-reveal preloader, RU/EN localization, scroll animations, and responsive design.',
      'c1.cta': 'View Project',
      // Card 2
      'c2.t': 'Poker Timer',
      'c2.d': 'Tournament blind timer with 48-tick progress bar, level navigation, auto-advance, and break management. Interactive demo of the full desktop app.',
      'c2.cta': 'View Project',
      // Card 3
      'c3.t': 'Psihologiya na Salfetke',
      'c3.d': 'Psychology blog with card-based article grid, warm design, and 7 thematic categories. Practical self-help content in a clean, readable format.',
      'c3.cta': 'View Project',
      'footer.sub': 'Curated project portfolio',
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
      'about.label': 'Обо мне',
      'about.title': 'Каждая деталь<br><span class="gradient-text">продумана</span>',
      'about.desc': 'От премиальных лендингов до интерактивных веб-приложений — каждый проект создаётся с нуля с вниманием к производительности, удобству и деталям.',
      'm.handcoded': 'Код вручную',
      'm.loadtime': 'Загрузка',
      'm.deps': 'Зависимости',
      'contact.label': 'Контакты',
      'contact.title': 'Есть проект?',
      'contact.desc': 'Давайте обсудим ваш следующий веб-проект.',
      'c1.t': 'TRILOKA',
      'c1.d': 'Архитектурно-дизайнерская студия. Премиальный лендинг с прелоадером-дверями, локализацией RU/EN, анимациями прокрутки и адаптивным дизайном.',
      'c1.cta': 'Открыть проект',
      'c2.t': 'Покер Таймер',
      'c2.d': 'Таймер блайндов для покерных турниров с прогресс-баром из 48 тиков, навигацией по уровням, автопереходом и управлением перерывами.',
      'c2.cta': 'Открыть проект',
      'c3.t': 'Психология на салфетке',
      'c3.d': 'Блог по психологии с карточной сеткой статей, тёплым дизайном и 7 тематическими категориями. Практичный контент для саморазвития.',
      'c3.cta': 'Открыть проект',
      'footer.sub': 'Портфолио проектов',
    }
  };

  function setLang(lang) {
    const d = T[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.dataset.i18n;
      if (d[k] !== undefined) el.textContent = d[k];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const k = el.dataset.i18nHtml;
      if (d[k] !== undefined) el.innerHTML = d[k];
    });
    // Hero title uses innerHTML (has <br> and <span>)
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && d['hero.title']) heroTitle.innerHTML = d['hero.title'];

    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    document.documentElement.lang = lang;
  }

  document.querySelectorAll('.lang-btn').forEach(b => {
    b.addEventListener('click', () => setLang(b.dataset.lang));
  });

  // ── Smooth scroll ──
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const t = document.querySelector(a.getAttribute('href'));
      if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 40, behavior: 'smooth' });
    });
  });

  // ── Scroll animations ──
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const d = entry.target.dataset.delay || 0;
        setTimeout(() => entry.target.classList.add('visible'), parseInt(d));
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
});
