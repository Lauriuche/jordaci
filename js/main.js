/**
 * Jordaci - Costura & Arte (v2 + Galeria Automática GitHub)
 */

document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initNavbar();
    initMobileMenu();
    initContactForm();
    initSuccessModal();
    initPrivacyModal();
    initAutoGallery(); // ← nova função
});

/* ========================================
   CONFIGURAÇÃO DA GALERIA AUTOMÁTICA
   ======================================== */
const GITHUB_CONFIG = {
    user: 'web-sas',        // ← troque
    repo: 'jordaci',   // ← troque
    path: 'imagens/galeria',           // pasta raiz das imagens
    branch: 'main'                    // ou 'master'
};

/*
  ESTRUTURA RECOMENDADA NO REPOSITÓRIO:

  images/
    galeria/
      vestidos/
        foto1.jpg
        foto2.jpg
      esportes/
        uniforme1.jpg
      casuais/
        conjunto1.jpg
      consertos/
        barra1.jpg
*/

/* ========================================
   Galeria Automática via GitHub API
   ======================================== */
async function initAutoGallery() {
    const grid = document.getElementById('galleryGrid');
    const loading = document.getElementById('galleryLoading');
    const errorBox = document.getElementById('galleryError');

    if (!grid) return;

    // Mostra loading
    if (loading) loading.classList.remove('hidden');
    if (errorBox) errorBox.classList.add('hidden');

    try {
        const baseUrl = `https://api.github.com/repos/\( {GITHUB_CONFIG.user}/ \){GITHUB_CONFIG.repo}/contents/\( {GITHUB_CONFIG.path}?ref= \){GITHUB_CONFIG.branch}`;
        
        const response = await fetch(baseUrl);
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: não foi possível acessar a pasta no GitHub`);
        }

        const items = await response.json();

        // Separa pastas (categorias) e arquivos (imagens soltas)
        const folders = items.filter(item => item.type === 'dir');
        const rootImages = items.filter(item => item.type === 'file' && isImage(item.name));

        let allImages = [];

        // 1. Imagens soltas na raiz da pasta
        rootImages.forEach(file => {
            allImages.push({
                url: file.download_url,
                name: file.name,
                category: 'all' // ou 'casuais' como padrão
            });
        });

        // 2. Imagens dentro de subpastas (categorias)
        for (const folder of folders) {
            const category = folder.name.toLowerCase(); // vestidos, esportes, etc.
            const folderUrl = `https://api.github.com/repos/\( {GITHUB_CONFIG.user}/ \){GITHUB_CONFIG.repo}/contents/\( {GITHUB_CONFIG.path}/ \){folder.name}?ref=${GITHUB_CONFIG.branch}`;
            
            const folderRes = await fetch(folderUrl);
            if (!folderRes.ok) continue;

            const folderFiles = await folderRes.json();
            folderFiles
                .filter(f => f.type === 'file' && isImage(f.name))
                .forEach(file => {
                    allImages.push({
                        url: file.download_url,
                        name: file.name,
                        category: category
                    });
                });
        }

        // Limpa a grade
        grid.innerHTML = '';

        if (allImages.length === 0) {
            throw new Error('Nenhuma imagem encontrada na pasta.');
        }

        // Cria os cards
        allImages.forEach((img, index) => {
            const item = document.createElement('div');
            item.className = `gallery-item aspect-square bg-onyx-900 reveal ${index % 3 === 1 ? 'delay-100' : index % 3 === 2 ? 'delay-200' : ''}`;
            item.dataset.category = img.category;

            item.innerHTML = `
                <img src="${img.url}" 
                     alt="${img.name}" 
                     width="800" height="800"
                     class="w-full h-full object-cover" 
                     loading="lazy">
                <div class="gallery-overlay absolute inset-0 flex flex-col justify-end p-6">
                    <h4 class="text-white font-serif text-xl font-bold mb-1">${formatCategory(img.category)}</h4>
                    <p class="text-gold text-sm">\( {img.name.replace(/\.[^/.]+ \)/, '')}</p>
                </div>
            `;

            grid.appendChild(item);
        });

        // Reativa o reveal e o filtro
        initReveal();
        initGalleryFilter();

    } catch (err) {
        console.error('Galeria automática:', err);
        if (errorBox) {
            errorBox.textContent = 'Não foi possível carregar as imagens. Verifique a configuração do GitHub.';
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
   Restante do código (igual ao anterior)
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
        if (e.key === 'Escape' && !mobileMenu.classList.contains('translate-x-full')) {
            closeMenu();
        }
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

        const url = `https://wa.me/5599991325326?text=${encodeURIComponent(texto)}`;
        window.open(url, '_blank', 'noopener,noreferrer');

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
