/**
 * Jordaci - Costura & Arte
 * Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initNavbar();
    initMobileMenu();
    initGalleryFilter();
    initContactForm();
    initSuccessModal();
});

/* ========================================
   Reveal on Scroll
   ======================================== */
function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
}

/* ========================================
   Navbar Shadow on Scroll
   ======================================== */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const handleScroll = () => {
        if (window.scrollY > 12) {
            navbar.classList.add('shadow-lg', 'py-2');
            navbar.classList.remove('py-3');
        } else {
            navbar.classList.remove('shadow-lg', 'py-2');
            navbar.classList.add('py-3');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
}

/* ========================================
   Mobile Menu
   ======================================== */
function initMobileMenu() {
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const closeBtn = document.getElementById('closeMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const links = document.querySelectorAll('.mobile-link');

    if (!mobileBtn || !mobileMenu) return;

    const openMenu = () => {
        mobileMenu.classList.remove('translate-x-full');
        mobileBtn.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');
    };

    const closeMenu = () => {
        mobileMenu.classList.add('translate-x-full');
        mobileBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
    };

    mobileBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    links.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileMenu.classList.contains('translate-x-full')) {
            closeMenu();
        }
    });
}

/* ========================================
   Gallery Filter
   ======================================== */
function initGalleryFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (!filterBtns.length || !galleryItems.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                const shouldShow = filterValue === 'all' || category === filterValue;

                if (shouldShow) {
                    item.classList.remove('hide');
                    requestAnimationFrame(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    });
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.85)';
                    setTimeout(() => {
                        item.classList.add('hide');
                    }, 300);
                }
            });
        });
    });
}

/* ========================================
   Contact Form → WhatsApp
   ======================================== */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name')?.value.trim() || '';
        const phone = document.getElementById('phone')?.value.trim() || '';
        const service = document.getElementById('service')?.value || '';
        const message = document.getElementById('message')?.value.trim() || '';

        if (!name || !phone) {
            alert('Por favor, preencha nome e telefone.');
            return;
        }

        let texto = `Olá! Vim pelo site da Jordaci 😊\n\n`;
        texto += `*Nome:* ${name}\n`;
        texto += `*Telefone:* ${phone}\n`;
        texto += `*Serviço:* ${service}\n`;
        if (message) {
            texto += `*Detalhes:* ${message}\n`;
        }
        texto += `\nGostaria de um orçamento, por favor.`;

        const url = `https://wa.me/5599991325326?text=${encodeURIComponent(texto)}`;
        window.open(url, '_blank', 'noopener,noreferrer');

        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.remove('opacity-0', 'pointer-events-none');
        }

        form.reset();
    });
}

/* ========================================
   Success Modal
   ======================================== */
function initSuccessModal() {
    const modal = document.getElementById('successModal');
    const closeBtn = document.getElementById('closeSuccessBtn');

    if (!modal) return;

    const closeModal = () => {
        modal.classList.add('opacity-0', 'pointer-events-none');
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('opacity-0')) {
            closeModal();
        }
    });
}
