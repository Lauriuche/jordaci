/**
 * Jordaci - Costura & Arte
 * Galeria automática + Lightbox + Filtros inteligentes + WhatsApp contextual
 */

document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initNavbar();
    initMobileMenu();
    initContactForm();
    initSuccessModal();
    initPrivacyModal();
    initAutoGallery();
});

const GITHUB_CONFIG = {
    user: 'web-sas',
    repo: 'jordaci',
    path: 'imagens/galeria',
    branch: 'main'
};

let galleryData = []; // guarda todas as imagens para o lightbox

/* ========================================
   Galeria Automática
   ======================================== */
async function initAutoGallery() {
    const grid = document.getElementById('galleryGrid');
    const loading = document.getElementById('galleryLoading');
    const errorBox = document.getElementById('galleryError');
    const counterEl = document.getElementById('pecasCounter');

    if (!grid) return;

    if (loading) loading.classList.remove('hidden');
    if (errorBox) errorBox.classList.add('hidden');

    try {
        const baseUrl = `https://api.github.com/repos/${GITHUB_CONFIG.user}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}?ref=${GITHUB_CONFIG.branch}`;
        const response = await fetch(baseUrl);
        if (!response.ok) throw new Error('Erro ao acessar pasta no GitHub');

        const items = await response.json();
        const folders = items.filter(item => item.type === 'dir');
        const rootImages = items.filter(item => item.type === 'file' && isImage(item.name));

        galleryData = [];

        // Imagens na raiz
        rootImages.forEach(file => {
            galleryData.push({
                url: file.download_url,
                name: file.name,
                category: 'all'
            });
        });

        // Imagens nas subpastas
        for (const folder of folders) {
            const category = folder.name.toLowerCase();
            const folderUrl = `https://api.github.com/repos/${GITHUB_CONFIG.user}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}/${folder.name}?ref=${GITHUB_CONFIG.branch}`;
            const folderRes = await fetch(folderUrl);
            if (!folderRes.ok) continue;

            const folderFiles = await folderRes.json();
            folderFiles
                .filter(f => f.type === 'file' && isImage(f.name))
                .forEach(file => {
                    galleryData.push({
                        url: file.download_url,
                        name: file.name,
                        category: category
                    });
                });
        }

        grid.innerHTML = '';

        if (galleryData.length === 0) {
            throw new Error('Nenhuma imagem encontrada.');
        }

        // Atualiza contador de peças
        if (counterEl) {
            counterEl.textContent = `+${galleryData.length}`;
        }

        // Cria os cards
        galleryData.forEach((img, index) => {
            const item = document.createElement('div');
            item.className = `gallery-item aspect-square bg-onyx-900 reveal ${index % 3 === 1 ? 'delay-100' : index % 3 === 2 ? 'delay-200' : ''}`;
            item.dataset.category = img.category;
            item.dataset.index = index;

            item.innerHTML = `
                <img src="${img.url}" 
                     alt="${img.name}" 
                     width="800" height="800"
                     class="w-full h-full object-cover" 
                     loading="lazy">
                <div class="gallery-overlay absolute inset-0 flex flex-col justify-end p-6">
                    <h4 class="text-white font-serif text-xl font-bold mb-1">${formatCategory(img.category)}</h4>
                    <p class="text-gold text-sm">${img.name.replace(/\.[^/.]+$/, '')}</p>
                </div>
            `;

            // Clique abre o lightbox
            item.addEventListener('click', () => openLightbox(index));

            grid.appendChild(item);
        });

        // Esconde filtros vazios
        updateFilterButtons();

        initReveal();
        initGalleryFilter();

    } catch (err) {
        console.error(err);
        if (errorBox) {
            errorBox.textContent = 'Não foi possível carregar as imagens.';
            errorBox.classList.remove('hidden');
        }
    } finally {
        if (loading) loading.classList.add('hidden');
    }
}

function isImage(filename) {
    return /\.(jpe?g|png|gif|webp|avif)$/i.test(filename);
}

function formatCategory(cat) {
    const map = {
        vestidos: 'Vestidos',
        esportes: 'Equipagem Esportiva',
        casuais: 'Conjuntos & Shorts',
        consertos: 'Consertos',
        all: 'Trabalho'
    };
    return map[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
}

/* ========================================
   Filtros inteligentes (esconde vazios)
   ======================================== */
function updateFilterButtons() {
    const categories = new Set(galleryData.map(img => img.category));
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        const filter = btn.getAttribute('data-filter');
        if (filter === 'all') return; // sempre mostra "Todos"

        if (categories.has(filter)) {
            btn.classList.remove('hidden');
        } else {
            btn.classList.add('hidden');
        }
    });
}

/* ========================================
   Lightbox
   ======================================== */
function openLightbox(index) {
    const lightbox = document.getElementById('lightbox');
    const imgEl = document.getElementById('lightboxImg');
    const titleEl = document.getElementById('lightboxTitle');
    const categoryEl = document.getElementById('lightboxCategory');
    const waBtn = document.getElementById('lightboxWhatsapp');

    if (!lightbox || !galleryData[index]) return;

    const img = galleryData[index];

    imgEl.src = img.url;
    imgEl.alt = img.name;
    titleEl.textContent = img.name.replace(/\.[^/.]+$/, '');
    categoryEl.textContent = formatCategory(img.category);

    // WhatsApp contextual
    const msg = `Olá! Vi este trabalho no site da Jordaci (${formatCategory(img.category)} - ${img.name}) e gostaria de um orçamento.`;
    waBtn.href = `https://wa.me/5599991325326?text=${encodeURIComponent(msg)}`;

    lightbox.dataset.current = index;
    lightbox.classList.remove('opacity-0', 'pointer-events-none');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    lightbox.classList.add('opacity-0', 'pointer-events-none');
    document.body.style.overflow = '';
}

function navigateLightbox(direction) {
    const lightbox = document.getElementById('lightbox');
    let current = parseInt(lightbox.dataset.current || 0);
    current += direction;

    if (current < 0) current = galleryData.length - 1;
    if (current >= galleryData.length) current = 0;

    openLightbox(current);
}

function initLightboxEvents() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
    document.getElementById('lightboxPrev')?.addEventListener('click', () => navigateLightbox(-1));
    document.getElementById('lightboxNext')?.addEventListener('click', () => navigateLightbox(1));

    // Fecha clicando no fundo
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Teclado
    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('opacity-0')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });
}

// Chama os eventos do lightbox
document.addEventListener('DOMContentLoaded', initLightboxEvents);

/* ========================================
   Restante do código
   ======================================== */

function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
}

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
    links.forEach(link => link.addEventListener('click', closeMenu));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileMenu.classList.contains('translate-x-full')) closeMenu();
    });
}

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
                    setTimeout(() => item.classList.add('hide'), 300);
                }
            });
        });
    });
}

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
        if (message) texto += `*Detalhes:* ${message}\n`;
        texto += `\nGostaria de um orçamento, por favor.`;

        window.open(`https://wa.me/5599991325326?text=${encodeURIComponent(texto)}`, '_blank');

        const modal = document.getElementById('successModal');
        if (modal) modal.classList.remove('opacity-0', 'pointer-events-none');
        form.reset();
    });
}

function initSuccessModal() {
    const modal = document.getElementById('successModal');
    const closeBtn = document.getElementById('closeSuccessBtn');
    if (!modal) return;

    const close = () => modal.classList.add('opacity-0', 'pointer-events-none');
    if (closeBtn) closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('opacity-0')) close();
    });
}

function initPrivacyModal() {
    const modal = document.getElementById('privacyModal');
    const openBtn = document.getElementById('privacyLink');
    const closeBtn = document.getElementById('closePrivacyBtn');
    if (!modal) return;

    const open = (e) => {
        e.preventDefault();
        modal.classList.remove('opacity-0', 'pointer-events-none');
    };
    const close = () => modal.classList.add('opacity-0', 'pointer-events-none');

    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('opacity-0')) close();
    });
}
