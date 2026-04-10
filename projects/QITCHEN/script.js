// ===== PAGE TRANSITIONS =====
(function() {
    const overlay = document.getElementById('pageTransition');

    // On load: instantly show page, run animations
    window.addEventListener('DOMContentLoaded', () => {
        // Fade out the transition overlay (covers flash of unstyled content)
        if (overlay) overlay.classList.add('done');
        initAnimations();
        initRevealText();
    });

    // Intercept page-link clicks for smooth transition
    document.addEventListener('click', (e) => {
        const link = e.target.closest('.page-link');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href || href === '#' || href.startsWith('javascript')) return;

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        if (href === currentPage) { e.preventDefault(); return; }

        e.preventDefault();

        // Close mobile menu if open
        const mm = document.getElementById('mobileMenu');
        if (mm && mm.classList.contains('open')) {
            mm.classList.remove('open');
            document.body.style.overflow = '';
        }

        // Quick fade out then navigate
        if (overlay) overlay.classList.remove('done');
        setTimeout(() => { window.location.href = href; }, 250);
    });
})();

// ===== REVEAL TEXT ANIMATION =====
function initRevealText() {
    document.querySelectorAll('.reveal-text span').forEach((span, i) => {
        span.style.animationDelay = `${i * 0.1 + 0.05}s`;
    });
}

// ===== MOBILE MENU =====
const burger = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');

if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
}

// ===== SCROLL ANIMATIONS (Intersection Observer) =====
function initAnimations() {
    const animElements = document.querySelectorAll('[data-anim]');

    // Elements already in viewport — animate with stagger
    animElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const delay = parseFloat(el.dataset.delay || 0) * 1000;
            setTimeout(() => el.classList.add('visible'), delay);
        }
    });

    // Elements below fold — observe
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = parseFloat(el.dataset.delay || 0) * 1000;
                setTimeout(() => el.classList.add('visible'), delay);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    animElements.forEach(el => {
        if (!el.classList.contains('visible')) observer.observe(el);
    });
}

// ===== HOVER TILT EFFECT ON BENTO CARDS =====
document.querySelectorAll('.bento-card--img').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg) scale(0.99)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        card.style.transform = '';
        setTimeout(() => { card.style.transition = ''; }, 400);
    });
});

// ===== FORM INPUT ANIMATION =====
document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(input => {
    input.addEventListener('focus', () => input.parentElement.classList.add('focused'));
    input.addEventListener('blur', () => input.parentElement.classList.remove('focused'));
});
