// ========================================
// TRILOKA — Website Scripts
// ========================================

document.addEventListener('DOMContentLoaded', () => {

  // ── Full i18n translations ──
  const translations = {
    en: {
      'nav.home': 'Home',
      'nav.services': 'Services',
      'nav.portfolio': 'Portfolio',
      'nav.about': 'About',
      'nav.contact': 'Contact',
      'hero.badge': "Dubai's Premier Design Studio",
      'hero.subtitle': 'Architecture. Interior Design. Turnkey Construction.',
      'hero.cta1': 'Start Your Project',
      'hero.cta2': 'View Portfolio',
      'hero.stat1': 'Years Experience',
      'hero.stat2': 'Projects Delivered',
      'hero.stat3': 'Client Satisfaction',
      'services.tag': 'What We Do',
      'services.title': 'Our Expertise',
      'services.desc': "Comprehensive design and construction solutions tailored to the unique demands of Dubai's luxury market.",
      'svc1.title': 'Interior Design',
      'svc1.desc': 'Transforming spaces into unique works of art where Arabic tradition meets contemporary luxury. Bespoke interiors crafted with impeccable attention to detail.',
      'svc2.title': 'Architecture',
      'svc2.desc': "Residences and villas inspired by the region's nature and culture. Innovative technologies and premium materials ensuring impeccable quality in every detail.",
      'svc3.title': 'Joinery',
      'svc3.desc': 'Bespoke furniture and finishes with uncompromising quality. Precise realization of your design ideas with meticulous attention to every element.',
      'svc4.title': 'Office & Commercial Fit-out',
      'svc4.desc': 'Premium workspaces for commercial properties of any scale. Turnkey solutions from initial concept to final handover.',
      'svc.link': 'Learn More',
      'portfolio.tag': 'Selected Works',
      'portfolio.title': 'Our Portfolio',
      'about.tag': 'About Us',
      'about.title': 'We Are Ready to Share Our Experience',
      'about.p1': 'With over two decades of experience in design, architecture, and construction, TRILOKA has established itself as a premier design studio in Dubai. We transform visions into reality, creating spaces that inspire and endure.',
      'about.p2': 'Our team combines deep knowledge of Arabic design traditions with cutting-edge contemporary trends, delivering bespoke solutions that reflect the unique character and aspirations of each client.',
      'about.f1.title': 'Turnkey Solutions',
      'about.f1.desc': 'From concept to handover',
      'about.f2.title': 'Premium Quality',
      'about.f2.desc': 'Only the finest materials',
      'about.f3.title': 'Bespoke Approach',
      'about.f3.desc': 'Personalized to your vision',
      'about.btn': 'Get in Touch',
      'process.tag': 'How We Work',
      'process.title': 'Our Process',
      'proc1.title': 'Consultation',
      'proc1.desc': 'We begin by understanding your vision, requirements, and budget to create a tailored project roadmap.',
      'proc2.title': 'Concept & Design',
      'proc2.desc': 'Our designers develop detailed concepts with 3D visualizations, material palettes, and layout plans.',
      'proc3.title': 'Construction',
      'proc3.desc': 'Expert craftsmen bring the design to life with precision, using only premium materials and techniques.',
      'proc4.title': 'Handover',
      'proc4.desc': 'Final quality inspection, styling, and a seamless handover of your completed dream space.',
      'cta.title': 'Ready to Create Something Extraordinary?',
      'cta.desc': "Let's discuss your project and bring your vision to life.",
      'cta.btn': 'Book a Consultation',
      'contact.tag': 'Get in Touch',
      'contact.title': "Let's Build Your Dream Space",
      'contact.desc': "Contact us today to discuss your project. We'd love to hear about your vision.",
      'contact.office': 'Office',
      'contact.phone': 'Phone',
      'contact.email': 'Email',
      'form.name': 'Your Name',
      'form.phone': 'Phone Number',
      'form.email': 'Email (optional)',
      'form.message': 'Tell us about your project',
      'form.submit': 'Send Request',
      'form.sent': "Sent! We'll contact you soon.",
      'footer.desc': 'Architecture, Interior Design, and Turnkey Construction in Dubai',
      'footer.services': 'Services',
      'footer.company': 'Company',
      'footer.about': 'About Us',
      'footer.copy': '&copy; 2025 TRILOKA. All rights reserved.',
      'hero.t1': 'Crafting',
      'hero.t2': '<em>Extraordinary</em>',
      'hero.t3': 'Spaces',
      'about.exp': 'Years of<br>Excellence',
      'm.arch': 'Architecture',
      'm.int': 'Interior Design',
      'm.join': 'Joinery',
      'm.turn': 'Turnkey Construction',
      'm.villa': 'Villa Residences',
      'm.comm': 'Commercial Fit-out',
      'p1.tag': 'Residential',
      'p1.title': 'Luxury Villa Interior',
      'p1.loc': 'Palm Jumeirah, Dubai',
      'p2.tag': 'Architecture',
      'p2.title': 'Modern Residence',
      'p2.loc': 'Emirates Hills',
      'p3.tag': 'Interior',
      'p3.title': 'Penthouse Design',
      'p3.loc': 'Downtown Dubai',
      'p4.tag': 'Commercial',
      'p4.title': 'Executive Office',
      'p4.loc': 'Business Bay',
      'p5.tag': 'Architecture',
      'p5.title': 'Contemporary Villa',
      'p5.loc': 'Jumeirah Islands',
      'p6.tag': 'Joinery',
      'p6.title': 'Bespoke Kitchen',
      'p6.loc': 'Jumeirah Golf Estates',
      'footer.svc4': 'Commercial Fit-out',
    },
    ru: {
      'nav.home': 'Главная',
      'nav.services': 'Услуги',
      'nav.portfolio': 'Портфолио',
      'nav.about': 'О нас',
      'nav.contact': 'Контакты',
      'hero.badge': 'Премиальная дизайн-студия в Дубае',
      'hero.subtitle': 'Архитектура. Дизайн интерьера. Строительство под ключ.',
      'hero.cta1': 'Начать проект',
      'hero.cta2': 'Портфолио',
      'hero.stat1': 'Лет опыта',
      'hero.stat2': 'Проектов выполнено',
      'hero.stat3': 'Довольных клиентов',
      'services.tag': 'Наши услуги',
      'services.title': 'Направления',
      'services.desc': 'Комплексные решения в области дизайна и строительства для рынка премиальной недвижимости Дубая.',
      'svc1.title': 'Дизайн интерьера',
      'svc1.desc': 'Превращаем пространства в уникальные произведения искусства, где арабские традиции встречаются с современной роскошью.',
      'svc2.title': 'Архитектура',
      'svc2.desc': 'Резиденции и виллы, вдохновлённые природой и культурой региона. Инновационные технологии и премиальные материалы.',
      'svc3.title': 'Столярные работы',
      'svc3.desc': 'Мебель на заказ и отделка с бескомпромиссным качеством. Точная реализация ваших дизайнерских идей.',
      'svc4.title': 'Офисы и коммерческая отделка',
      'svc4.desc': 'Премиальные рабочие пространства для объектов любого масштаба. Решения под ключ от концепции до сдачи.',
      'svc.link': 'Подробнее',
      'portfolio.tag': 'Избранные работы',
      'portfolio.title': 'Наше портфолио',
      'about.tag': 'О компании',
      'about.title': 'Мы готовы поделиться опытом',
      'about.p1': 'Более двух десятилетий опыта в дизайне, архитектуре и строительстве позволили TRILOKA стать ведущей дизайн-студией в Дубае. Мы воплощаем идеи в реальность, создавая пространства, которые вдохновляют.',
      'about.p2': 'Наша команда сочетает глубокие знания арабских традиций дизайна с передовыми современными тенденциями, создавая индивидуальные решения для каждого клиента.',
      'about.f1.title': 'Решения под ключ',
      'about.f1.desc': 'От концепции до сдачи',
      'about.f2.title': 'Премиальное качество',
      'about.f2.desc': 'Только лучшие материалы',
      'about.f3.title': 'Индивидуальный подход',
      'about.f3.desc': 'Персонализировано под ваше видение',
      'about.btn': 'Связаться с нами',
      'process.tag': 'Как мы работаем',
      'process.title': 'Наш процесс',
      'proc1.title': 'Консультация',
      'proc1.desc': 'Мы начинаем с понимания вашего видения, требований и бюджета для создания индивидуального плана проекта.',
      'proc2.title': 'Концепция и дизайн',
      'proc2.desc': 'Наши дизайнеры разрабатывают детальные концепции с 3D-визуализациями, палитрами материалов и планировками.',
      'proc3.title': 'Строительство',
      'proc3.desc': 'Опытные мастера воплощают дизайн в жизнь с точностью, используя только премиальные материалы и технологии.',
      'proc4.title': 'Сдача объекта',
      'proc4.desc': 'Финальная проверка качества, стайлинг и безупречная сдача вашего готового пространства.',
      'cta.title': 'Готовы создать нечто необыкновенное?',
      'cta.desc': 'Давайте обсудим ваш проект и воплотим идею в жизнь.',
      'cta.btn': 'Записаться на консультацию',
      'contact.tag': 'Связаться с нами',
      'contact.title': 'Построим пространство вашей мечты',
      'contact.desc': 'Свяжитесь с нами для обсуждения вашего проекта. Мы будем рады узнать о вашем видении.',
      'contact.office': 'Офис',
      'contact.phone': 'Телефон',
      'contact.email': 'Почта',
      'form.name': 'Ваше имя',
      'form.phone': 'Телефон',
      'form.email': 'Email (необязательно)',
      'form.message': 'Расскажите о вашем проекте',
      'form.submit': 'Отправить заявку',
      'form.sent': 'Отправлено! Мы свяжемся с вами.',
      'footer.desc': 'Архитектура, дизайн интерьера и строительство под ключ в Дубае',
      'footer.services': 'Услуги',
      'footer.company': 'Компания',
      'footer.about': 'О нас',
      'footer.copy': '&copy; 2025 TRILOKA. Все права защищены.',
      'hero.t1': 'Создаём',
      'hero.t2': '<em>исключительные</em>',
      'hero.t3': 'пространства',
      'about.exp': 'Лет<br>мастерства',
      'm.arch': 'Архитектура',
      'm.int': 'Дизайн интерьера',
      'm.join': 'Столярные работы',
      'm.turn': 'Строительство под ключ',
      'm.villa': 'Виллы и резиденции',
      'm.comm': 'Коммерческая отделка',
      'p1.tag': 'Жилой',
      'p1.title': 'Интерьер люкс-виллы',
      'p1.loc': 'Палм Джумейра, Дубай',
      'p2.tag': 'Архитектура',
      'p2.title': 'Современная резиденция',
      'p2.loc': 'Эмирейтс Хиллз',
      'p3.tag': 'Интерьер',
      'p3.title': 'Дизайн пентхауса',
      'p3.loc': 'Даунтаун Дубай',
      'p4.tag': 'Коммерческий',
      'p4.title': 'Офис руководителя',
      'p4.loc': 'Бизнес Бэй',
      'p5.tag': 'Архитектура',
      'p5.title': 'Современная вилла',
      'p5.loc': 'Джумейра Айлендс',
      'p6.tag': 'Столярные работы',
      'p6.title': 'Кухня на заказ',
      'p6.loc': 'Джумейра Голф Эстейтс',
      'footer.svc4': 'Коммерческая отделка',
    }
  };

  let currentLang = 'en';

  function setLanguage(lang) {
    currentLang = lang;
    const dict = translations[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
      }
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.dataset.i18nHtml;
      if (dict[key] !== undefined) {
        el.innerHTML = dict[key];
      }
    });
    // Update placeholder attributes on form inputs
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (dict[key]) el.placeholder = dict[key];
    });
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    document.documentElement.lang = lang;
  }

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  // ── Preloader — CSS fills the bar smoothly, then doors open ──
  const preloader = document.getElementById('preloader');

  // Bar CSS animation: 1.7s. Small pause at 100%, then open doors.
  setTimeout(() => {
    preloader.classList.add('done');
    setTimeout(() => { preloader.style.display = 'none'; }, 1300);
  }, 1900);

  // ── Custom cursor ──
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');

  if (window.matchMedia('(pointer: fine)').matches) {
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
    });

    function animateFollower() {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      follower.style.left = followerX + 'px';
      follower.style.top = followerY + 'px';
      requestAnimationFrame(animateFollower);
    }
    animateFollower();

    const hoverTargets = document.querySelectorAll('a, button, .portfolio-item, .service-card, .process-step');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => follower.classList.add('hover'));
      el.addEventListener('mouseleave', () => follower.classList.remove('hover'));
    });
  }

  // ── Header scroll ──
  const header = document.getElementById('header');

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 100);
  });

  // ── Mobile menu (no scrollbar jump) ──
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function toggleMenu(open) {
    menuToggle.classList.toggle('active', open);
    mobileMenu.classList.toggle('active', open);
    document.body.classList.toggle('no-scroll', open);
  }

  menuToggle.addEventListener('click', () => {
    toggleMenu(!mobileMenu.classList.contains('active'));
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = 80;
        const pos = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: pos, behavior: 'smooth' });
      }
    });
  });

  // ── Scroll animations ──
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => entry.target.classList.add('visible'), parseInt(delay));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

  // ── Counter animation ──
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const duration = 2000;
        const start = performance.now();

        function tick(now) {
          const p = Math.min((now - start) / duration, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(c => counterObserver.observe(c));

  // ── Form handling ──
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalHTML = btn.innerHTML;
      const msg = translations[currentLang]['form.sent'];
      btn.innerHTML = `<span>${msg}</span>`;
      btn.disabled = true;
      btn.style.background = '#2d8a4e';

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        btn.style.background = '';
        contactForm.reset();
      }, 3000);
    });
  }
});
