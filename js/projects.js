// --- CONFIGURATION ---
const GITHUB_USERNAME = 'krsxianley'; 
const FIGMA_ACCESS_TOKEN = 'figd_TdmobNPB3JJiZrcPeMWAFUSRUjZVgPVx3E73yFGB';

// Focused on single project to prevent 429 Rate Limits
const FIGMA_FILE_KEYS = [
    '1vwyFb6wqIGnyhzpRjApfR' // PROJECT_FIT
];

// Global Gallery State
let currentGallery = [];
let currentIndex = 0;
let isFigmaLoading = false;

// Helper: Wait between requests to avoid 429 errors
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    fetchGitHubProfile();
    fetchFigmaDesigns();
    loadSpotlightArchive(); 
    initScrollEffects();
    initMap(); 
    setupMagneticButtons();
    handleHeroParallax();
    if (typeof lucide !== 'undefined') lucide.createIcons();
});

// --- 1. GITHUB API ---
async function fetchGitHubProfile() {
    const profileContainer = document.getElementById('github-profile-card');
    if (!profileContainer) return;

    try {
        const [userRes, reposRes] = await Promise.all([
            fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
            fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=3`)
        ]);

        const user = await userRes.json();
        const repos = await reposRes.json();

        profileContainer.innerHTML = `
            <div class="github-dashboard-wrapper">
                <div class="github-profile-side">
                    <div class="github-section-header">
                        <span class="status-chip"><span class="pulse-dot"></span> UPLINK_ACTIVE</span>
                        <h2>GITHUB_IDENTITY</h2>
                        <p>Real-time synchronization with source code repository.</p>
                    </div>
                    <div class="github-main-card">
                        <img src="${user.avatar_url}" alt="Profile" class="gh-avatar">
                        <div class="github-text">
                            <h3>${user.name || user.login}</h3>
                            <p>${user.bio || 'Architecting digital solutions.'}</p>
                            <div class="github-stats-row">
                                <div class="stat-item"><span>REPOS</span><strong>${user.public_repos}</strong></div>
                                <div class="stat-item"><span>FOLLOWERS</span><strong>${user.followers}</strong></div>
                            </div>
                            <a href="${user.html_url}" target="_blank" class="gh-link-btn">PROFIL_ACCESS <i data-lucide="external-link"></i></a>
                        </div>
                    </div>
                </div>
                <div class="github-repos-side">
                    <div class="repo-feed-header" style="font-family: 'JetBrains Mono'; font-size: 0.7rem; color: var(--accent-iris); margin-bottom: 15px; letter-spacing: 2px;">LATEST_DEPLOYMENTS</div>
                    <div class="repo-list">
                        ${repos.map(repo => {
                            const lastUpdated = new Date(repo.updated_at).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric'
                            });
                            return `
                                <a href="${repo.html_url}" target="_blank" class="repo-item">
                                    <div class="repo-main">
                                        <span class="repo-name">${repo.name.toUpperCase()}</span>
                                        <span class="repo-lang">${repo.language || 'Code'}</span>
                                    </div>
                                    <p class="repo-desc">${repo.description || 'System module initialized and deployed.'}</p>
                                    <div class="repo-meta">
                                        <span><i data-lucide="star" style="width:12px"></i> ${repo.stargazers_count}</span>
                                        <span><i data-lucide="git-fork" style="width:12px"></i> ${repo.forks_count}</span>
                                        <span style="margin-left: auto; font-size: 0.6rem; opacity: 0.6;"><i data-lucide="clock" style="width:10px"></i> ${lastUpdated.toUpperCase()}</span>
                                    </div>
                                </a>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (error) {
        console.error("GitHub API Error:", error);
    }
}

// --- 2. FIGMA API (OPTIMIZED SINGLE UPLINK) ---
// --- 2. FIGMA API (OPTIMIZED SINGLE UPLINK) ---
async function fetchFigmaDesigns() {
    const figmaContainer = document.getElementById('figma-feed-container');
    if (!figmaContainer || isFigmaLoading) return;
    
    isFigmaLoading = true;
    figmaContainer.innerHTML = `<div class="api-loader">ESTABLISHING_SINGLE_UPLINK...</div>`;

    // Advanced Recursive Search: Handles nested layers and partial name matches
    const findProjectFrame = (node) => {
        const name = node.name ? node.name.trim().toUpperCase() : "";
        
        // Logs node names to Console to help you debug what the API is seeing
        if (name) console.log("System scanning node:", name);

        // Matches if name is exactly PROJECT_FIT or starts with PROJECT_
        if (name === 'PROJECT_FIT' || name.startsWith('PROJECT_')) {
            return node;
        }

        if (node.children) {
            for (const child of node.children) {
                const found = findProjectFrame(child);
                if (found) return found;
            }
        }
        return null;
    };

    try {
        const key = FIGMA_FILE_KEYS[0];
        
        // Fetch full file data (No depth limit to ensure we find nested frames)
        const res = await fetch(`https://api.figma.com/v1/files/${key}`, {
            headers: { 'X-Figma-Token': FIGMA_ACCESS_TOKEN }
        });

        if (res.status === 429) {
            figmaContainer.innerHTML = `<p class="tech-pill" style="color:#ff4d4d">RATE_LIMIT_EXCEEDED: STANDBY</p>`;
            return;
        }

        const data = await res.json();
        console.log("Figma File Data Received:", data);

        const match = findProjectFrame(data.document);

        if (match) {
            console.log("Match Found! Extracting Image for ID:", match.id);
            await sleep(500); // Prevent rapid-fire API hits
            
            // Request the high-res image URL
            const imgRes = await fetch(`https://api.figma.com/v1/images/${key}?ids=${match.id}&format=png&scale=2`, {
                headers: { 'X-Figma-Token': FIGMA_ACCESS_TOKEN }
            });
            const imgData = await imgRes.json();
            const finalImageUrl = imgData.images[match.id];

            // Final Render
            figmaContainer.innerHTML = `
                <div class="figma-card reveal-up" style="max-width: 600px; margin: 0 auto;">
                    <div class="figma-status">
                        <span class="pulse-dot"></span> 
                        UPLINK_STABLE // ${match.name.toUpperCase()}
                    </div>
                    <div class="figma-img-wrapper">
                        <img src="${finalImageUrl}" alt="${match.name}" loading="lazy" onerror="this.src='https://placehold.co/800x500/1a1a1a/6366f1?text=UPLINK_LOST'">
                        <div class="scan-line"></div>
                    </div>
                    <div class="figma-details">
                        <div class="figma-info">
                            <span class="figma-label">NODE_ID: ${match.id}</span>
                            <h3 class="figma-name">${match.name.replace(/^PROJECT_/i, '').replace(/_/g, ' ').toUpperCase()}</h3>
                        </div>
                        <a href="https://www.figma.com/file/${key}" target="_blank" class="figma-link-icon">
                             <i data-lucide="arrow-up-right"></i>
                        </a>
                    </div>
                </div>
            `;
        } else {
            console.warn("Search complete: PROJECT_FIT not found.");
            figmaContainer.innerHTML = `<p class="tech-pill">NODE_NOT_FOUND: 'PROJECT_FIT'</p>`;
        }
    } catch (error) {
        console.error("Figma Sync Error:", error);
        figmaContainer.innerHTML = `<p class="tech-pill">UPLINK_CRITICAL_FAILURE</p>`;
    } finally {
        isFigmaLoading = false;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        initScrollEffects(); 
    }
}

// --- 3. SPOTLIGHT ARCHIVE ---
async function loadSpotlightArchive() {
    const deckContainer = document.getElementById('perspective-deck-container');
    if (!deckContainer) return;
    try {
        const response = await fetch('json/projects-data.json');
        const items = await response.json();

        deckContainer.innerHTML = items.map((item) => {
            const isCert = item.category_type === 'certification';
            const fullProjectGallery = isCert ? [item.gallery[0]] : [item.video, ...(item.gallery || [])];
            const galleryJSON = JSON.stringify(fullProjectGallery).replace(/"/g, '&quot;');

            const certVisual = `
                <div class="cert-image-frame" onclick="openLightbox('${item.gallery[0]}', ${galleryJSON})">
                    <div class="expand-hint"><i data-lucide="maximize-2"></i></div>
                    <img src="${item.gallery[0]}" alt="${item.title}" class="cert-main-img" onerror="this.style.display='none'">
                    <div class="cert-glass-overlay"></div>
                </div>
            `;

            const projectVisual = `
                <div class="main-video-frame" onclick="openLightbox('${item.video}', ${galleryJSON})">
                    <div class="expand-hint"><i data-lucide="maximize-2"></i></div>
                    <video loop muted playsinline autoplay><source src="${item.video}" type="video/mp4"></video>
                </div>
                <div class="image-sub-grid">
                    ${(item.gallery || []).slice(0, 3).map(img => `
                        <div class="sub-img" style="background-image: url('${img}'); cursor: pointer;" 
                             onclick="openLightbox('${img}', ${galleryJSON})">
                             <div class="expand-hint-small"><i data-lucide="maximize-2"></i></div>
                        </div>
                    `).join('')}
                </div>
            `;

            return `
                <div class="spotlight-card reveal-up" data-category="${item.category_type}">
                    <div class="spotlight-info">
                        <div class="status-row" style="display: flex; gap: 10px; margin-bottom: 15px; align-items:center;">
                            <div class="status-chip"><span class="pulse-dot"></span> ${item.category}</div>
                            <div class="tech-pill" style="border-color: rgba(255,255,255,0.1); color: var(--text-silver); font-size:0.6rem;">${item.status || 'SYSTEM_OK'}</div>
                        </div>
                        <h3 class="spotlight-title">${item.title}</h3>
                        <p class="spotlight-desc">${item.description}</p>
                        <div class="tech-stack-grid" style="margin-bottom: 25px;">
                            ${item.tech.map(t => `<span class="tech-pill">${t}</span>`).join('')}
                        </div>
                        ${item.link && item.link !== "#" ? `
                            <a href="${item.link}" target="_blank" class="btn-primary" style="text-decoration:none; display:inline-flex; align-items:center; gap:8px;">
                                VIEW_PROJECT <i data-lucide="external-link" style="width:14px"></i>
                            </a>
                        ` : ''}
                    </div>
                    <div class="spotlight-visuals">${isCert ? certVisual : projectVisual}</div>
                </div>
            `;
        }).join('');

        initFilters();
        const projectBtn = document.querySelector('[data-filter="project"]');
        if(projectBtn) projectBtn.click();
        
        setTimeout(() => {
            initScrollEffects();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 150);
    } catch (error) {
        deckContainer.innerHTML = `<div class="api-loader">LINK_ERROR</div>`;
    }
}

// --- 4. LIGHTBOX & UI ---
function openLightbox(src, gallerySet) {
    currentGallery = gallerySet;
    currentIndex = currentGallery.indexOf(src);
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox-overlay';
    lightbox.onclick = (e) => { if(e.target.id === 'lightbox-overlay') { lightbox.style.opacity = '0'; setTimeout(() => lightbox.remove(), 300); } };
    renderLightboxContent(lightbox);
    document.body.appendChild(lightbox);
    
    const keyHandler = (e) => {
        if (e.key === "Escape") lightbox.click();
        if (e.key === "ArrowRight") changeSlide(1, e);
        if (e.key === "ArrowLeft") changeSlide(-1, e);
        if (!document.getElementById('lightbox-overlay')) document.removeEventListener('keydown', keyHandler);
    };
    document.addEventListener('keydown', keyHandler);
}

function renderLightboxContent(container) {
    const src = currentGallery[currentIndex];
    if (!src) return;
    const isVideo = src.toLowerCase().endsWith('.mp4');
    container.innerHTML = `
        <div class="lightbox-content">
            <button class="close-lightbox" onclick="document.getElementById('lightbox-overlay').click()"><i data-lucide="x"></i></button>
            ${currentGallery.length > 1 ? `
                <button class="nav-btn prev" onclick="changeSlide(-1, event)"><i data-lucide="chevron-left"></i></button>
                <button class="nav-btn next" onclick="changeSlide(1, event)"><i data-lucide="chevron-right"></i></button>
            ` : ''}
            <div class="media-container">
                <div class="media-wrapper">
                    ${isVideo ? `<video src="${src}" controls autoplay loop class="zoom-media"></video>` : `<img src="${src}" class="zoom-media">`}
                    <div class="scan-line"></div>
                </div>
            </div>
            <div class="lightbox-counter" style="text-align: center; margin-top: 20px; font-family: 'JetBrains Mono'; color: var(--accent-iris); font-size: 0.9rem;">
                ${(currentIndex + 1).toString().padStart(2, '0')} // ${currentGallery.length.toString().padStart(2, '0')}
            </div>
        </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function changeSlide(direction, event) {
    if(event) event.stopPropagation();
    currentIndex = (currentIndex + direction + currentGallery.length) % currentGallery.length;
    renderLightboxContent(document.getElementById('lightbox-overlay'));
}

function setupMagneticButtons() {
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
            btn.style.transform = `translate(${x}px, ${y}px)`;
        });
        btn.addEventListener('mouseleave', () => btn.style.transform = 'translate(0, 0)');
    });
}

function handleHeroParallax() {
    const laptop = document.querySelector('.laptop-wrapper');
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        if (laptop && scrolled < 1000) {
            laptop.style.transform = `rotateX(${10 + scrolled * 0.02}deg) rotateY(${-15 + scrolled * 0.01}deg) translateY(${scrolled * 0.1}px)`;
        }
    });
}

function initFilters() {
    const btns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.spotlight-card');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            cards.forEach(card => {
                if (card.getAttribute('data-category') === filter) {
                    card.style.display = 'grid';
                    setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });
        });
    });
}

function initMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl || typeof L === 'undefined') return;
    const bicolCoords = [14.0113, 122.9553]; 
    const map = L.map('map', { center: bicolCoords, zoom: 11, zoomControl: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
    const customIcon = L.divIcon({ className: 'custom-marker', html: `<div class="pulse-dot" style="width:15px; height:15px; background:var(--accent-iris); border: 2px solid #fff; box-shadow: 0 0 15px var(--accent-iris);"></div>` });
    L.marker(bicolCoords, { icon: customIcon }).addTo(map);
}

function initScrollEffects() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('reveal-visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => observer.observe(el));
}