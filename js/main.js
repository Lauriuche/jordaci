let galleryData = [];
let currentFilter = 'all';
let currentPage = 1;
const itemsPerPage = 4;

/* ========================================
   Galeria Automática + Paginação
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

        rootImages.forEach(file => {
            galleryData.push({
                url: file.download_url,
                name: file.name,
                category: 'all'
            });
        });

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

        if (galleryData.length === 0) {
            throw new Error('Nenhuma imagem encontrada.');
        }

        // Contador real
        if (counterEl) {
            counterEl.textContent = `+${galleryData.length}`;
        }

        updateFilterButtons();
        renderGalleryPage();

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

function getFilteredImages() {
    if (currentFilter === 'all') return galleryData;
    return galleryData.filter(img => img.category === currentFilter);
}

function renderGalleryPage() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    const filtered = getFilteredImages();
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

    // Garante que a página atual é válida
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filtered.slice(start, end);

    grid.innerHTML = '';

    pageItems.forEach((img, index) => {
        const globalIndex = galleryData.indexOf(img); // para o lightbox
        const item = document.createElement('div');
        item.className = `gallery-item aspect-square bg-onyx-900 reveal`;
        item.dataset.category = img.category;

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

        item.addEventListener('click', () => openLightbox(globalIndex));
        grid.appendChild(item);
    });

    // Atualiza controles de paginação
    updatePaginationControls(totalPages);
    initReveal();
}

function updatePaginationControls(totalPages) {
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');
    const pageInfo = document.getElementById('galleryPageInfo');

    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
        prevBtn.classList.toggle('opacity-40', currentPage <= 1);
    }
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
        nextBtn.classList.toggle('opacity-40', currentPage >= totalPages);
    }
    if (pageInfo) {
        pageInfo.textContent = `${currentPage} / ${totalPages}`;
    }
}

function changeGalleryPage(direction) {
    const filtered = getFilteredImages();
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;

    renderGalleryPage();
}

/* ========================================
   Filtros
   ======================================== */
function updateFilterButtons() {
    const categories = new Set(galleryData.map(img => img.category));
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        const filter = btn.getAttribute('data-filter');
        if (filter === 'all') return;

        if (categories.has(filter)) {
            btn.classList.remove('hidden');
        } else {
            btn.classList.add('hidden');
        }
    });
}

function initGalleryFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentFilter = btn.getAttribute('data-filter');
            currentPage = 1; // volta para a primeira página
            renderGalleryPage();
        });
    });
}
