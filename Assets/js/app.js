
        let itemMap = {};
        let allItemsList = [];
        let userFavorites = [];
        let currentLayout = 'grid';
        const INITIAL_PAGINATION_LIMIT = 6;

        try { userFavorites = JSON.parse(localStorage.getItem('zentry_favorites') || '[]'); } catch (e) { userFavorites = []; }

        const AudioEngine = {
            ctx: null,
            init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
            play(type) {
                try {
                    this.init();
                    if (this.ctx.state === 'suspended') this.ctx.resume();
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.connect(gain); gain.connect(this.ctx.destination);
                    
                    if (type === 'scan') {
                        osc.type = 'triangle'; osc.frequency.setValueAtTime(300, this.ctx.currentTime);
                        osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.1);
                        gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
                        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
                        osc.start(); osc.stop(this.ctx.currentTime + 0.3);
                    } else if (type === 'success') {
                        osc.type = 'sine'; osc.frequency.setValueAtTime(800, this.ctx.currentTime);
                        osc.frequency.setValueAtTime(1200, this.ctx.currentTime + 0.1);
                        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
                        osc.start(); osc.stop(this.ctx.currentTime + 0.5);
                    }
                } catch(e) { console.log("Audio blocked by browser."); }
            }
        };

        function initSystem() {
            const closedVersion = localStorage.getItem('zentry_banner_closed_version');
            if (closedVersion === CURRENT_SITE_VERSION) {
                document.getElementById('announcement-banner').classList.add('closed');
            }

            renderSkeletons();

            allItemsList = [];
            catalog.forEach(section => {
                section.subsections.forEach(sub => {
                    sub.items.forEach(item => {
                        itemMap[item.id] = item;
                        item.searchString = `${item.name} ${item.description} ${item.tags.join(' ')} ${section.title} ${sub.title} ${item.author}`.toLowerCase();
                        item.categoryString = (section.id + " " + item.tags.join(" ")).toLowerCase();
                        
                        const osString = (item.requirements?.os || "").toLowerCase();
                        item.osIcon = osString.includes("mac") || osString.includes("apple") ? "ph-apple-logo" : 
                                      osString.includes("linux") ? "ph-linux-logo" : 
                                      osString.includes("win") ? "ph-windows-logo" : "ph-desktop";

                        allItemsList.push(item);
                    });
                });
            });

            const sortedByDownloads = [...allItemsList].sort((a, b) => b.downloads - a.downloads);
            const topItem = sortedByDownloads[0];
            const maxDownloads = (topItem && topItem.downloads) ? topItem.downloads : 1; 

            allItemsList.forEach(item => {
                item.isTrending = (topItem && item.id === topItem.id && item.downloads > 0);
                const popularityRatio = item.downloads / maxDownloads;
                item.rating = (3.5 + (1.5 * popularityRatio)).toFixed(1);
            });

            // FEATURE 4: Render Trending Tags
            renderTrendingTags();

            setTimeout(() => {
                renderCatalog();
                allItemsList.forEach(item => item.domElement = document.getElementById(`card-${item.id}`));
                
                applySort('popular'); 
                checkDeepLink();
                initTicker(); 
                initMouseGlow(); 
                updateFilterCounters(); // FEATURE 2: Init Counters

                const container = document.getElementById('catalog-container');
                container.removeEventListener('click', handleCatalogClick);
                container.addEventListener('click', handleCatalogClick);
            }, 600); 
        }

        // --- FEATURE 4: Dynamic Trending Tags ---
        function renderTrendingTags() {
            const tagCounts = {};
            allItemsList.forEach(item => {
                item.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            });
            const trendingTags = Object.entries(tagCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(entry => entry[0]);

            const tagsContainer = document.getElementById('trending-tags-container');
            if (tagsContainer && trendingTags.length > 0) {
                tagsContainer.innerHTML = `<span class="font-semibold text-orange-400 flex items-center gap-1"><i class="ph-fill ph-fire"></i> Trending:</span> ` +
                    trendingTags.map(tag => `<span onclick="filterByTag(event, '${tag}')" class="cursor-pointer hover:text-blue-400 transition underline decoration-transparent hover:decoration-blue-400">#${tag}</span>`).join('<span class="text-slate-700 px-0.5">&bull;</span>');
            }
        }

        // --- OPTIMIZED: Back to Top with Passive Scroll Listener ---
        window.addEventListener('scroll', () => {
            const btn = document.getElementById('back-to-top');
            if(btn) {
                if (window.scrollY > 400) btn.classList.add('visible');
                else btn.classList.remove('visible');
            }
        }, { passive: true });

        // --- FEATURE 2: Dynamic Category Counters ---
        function updateFilterCounters() {
            document.querySelectorAll('.filter-pill').forEach(pill => {
                const cat = pill.dataset.category;
                if (!cat) return;
                
                let count = 0;
                if (cat === 'all') count = allItemsList.length;
                else if (cat === 'favorites') count = userFavorites.length;
                else count = allItemsList.filter(i => i.categoryString.includes(cat)).length;
                
                if (!pill.querySelector('.cat-count')) {
                    pill.innerHTML += ` <span class="cat-count opacity-50 ml-1 text-[10px]">(${count})</span>`;
                } else {
                    pill.querySelector('.cat-count').innerText = `(${count})`;
                }
            });
        }

        // --- FEATURE 3: Report Issue ---
        function openReportModal(itemId) {
            const item = itemMap[itemId];
            if(!item) return;
            document.getElementById('report-item-name').value = item.name;
            document.getElementById('report-item-display').innerText = item.name;
            document.getElementById('report-reason').value = "";
            document.getElementById('report-details').value = "";
            document.getElementById('report-modal').classList.remove('hidden');
        }

        function closeReportModal() {
            document.getElementById('report-modal').classList.add('hidden');
        }

        function submitReport(event) {
            event.preventDefault();
            const itemName = document.getElementById('report-item-name').value;
            const reason = document.getElementById('report-reason').value;
            const details = document.getElementById('report-details').value;
            
            const webhookUrl = "https://discord.com/api/webhooks/1471347980673224726/g7FNDVCbVi1v0W3NfcTYHDsegk_yMEV1D_Np99w-jkg6xJMK6sK7BBcyMyoD4Oz2t0Io";

            closeReportModal();
            showToast(`Report submitted for "${itemName}". Thank you!`, 'success');

            fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: `🚨 **New Report** 🚨\n**Item:** ${itemName}\n**Reason:** ${reason}\n**Details:** ${details || "None provided."}`
                })
            }).catch(error => console.error('Error sending report:', error));
        }

        // --- FEATURE 4: Author Filtering ---
        function filterByAuthor(e, authorName) {
            e.stopPropagation();
            closeProductModal();
            document.getElementById('global-search').value = authorName;
            filterGrid(authorName);
            window.scrollTo({ top: document.getElementById('products').offsetTop - 100, behavior: 'smooth' });
        }

        // OPTIMIZED: Mouse glow with throttling and RAF to prevent layout thrashing
        function initMouseGlow() {
            let rafId = null;
            let mouseX = 0, mouseY = 0;
            
            document.getElementById('catalog-container').addEventListener('mousemove', e => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                
                if (rafId === null) {
                    rafId = requestAnimationFrame(() => {
                        const cards = document.querySelectorAll('.product-card');
                        for(const card of cards) {
                            const rect = card.getBoundingClientRect();
                            const x = mouseX - rect.left;
                            const y = mouseY - rect.top;
                            card.style.setProperty('--mouse-x', `${x}px`);
                            card.style.setProperty('--mouse-y', `${y}px`);
                        }
                        rafId = null;
                    });
                }
            }, { passive: true });
        }

        function initTicker() {
            const tickerEl = document.getElementById('live-ticker');
            setInterval(() => {
                const randomItem = allItemsList[Math.floor(Math.random() * allItemsList.length)];
                if(randomItem) {
                    tickerData.pop();
                    tickerData.unshift(`Guest_${Math.floor(Math.random()*900)+100} downloaded ${randomItem.name}`);
                    tickerEl.innerHTML = Array(5).fill(tickerData.join(' &nbsp;&bull;&nbsp; ')).join(' &nbsp;&bull;&nbsp; ');
                }
            }, 5000);
            tickerEl.innerHTML = Array(5).fill(tickerData.join(' &nbsp;&bull;&nbsp; ')).join(' &nbsp;&bull;&nbsp; ');
        }

        function surpriseMe() {
            if(allItemsList.length === 0) return;
            const randomItem = allItemsList[Math.floor(Math.random() * allItemsList.length)];
            openProductModal(randomItem.id);
        }

        function filterByTag(e, tag) {
            e.stopPropagation();
            closeProductModal();
            document.getElementById('global-search').value = tag;
            filterGrid(tag);
            window.scrollTo({ top: document.getElementById('products').offsetTop - 100, behavior: 'smooth' });
        }

        function openLightbox(src) {
            document.getElementById('lightbox-img').src = src;
            document.getElementById('lightbox').style.display = 'flex';
        }

        function toggleLayout(type) {
            currentLayout = type;
            const container = document.getElementById('catalog-container');
            const btnGrid = document.getElementById('btn-layout-grid');
            const btnList = document.getElementById('btn-layout-list');
            
            if(type === 'list') {
                container.classList.add('layout-list');
                btnList.classList.replace('text-slate-500', 'text-blue-400');
                btnList.classList.add('bg-slate-800');
                btnGrid.classList.replace('text-blue-400', 'text-slate-500');
                btnGrid.classList.remove('bg-slate-800');
            } else {
                container.classList.remove('layout-list');
                btnGrid.classList.replace('text-slate-500', 'text-blue-400');
                btnGrid.classList.add('bg-slate-800');
                btnList.classList.replace('text-blue-400', 'text-slate-500');
                btnList.classList.remove('bg-slate-800');
            }
        }

        function applySort(sortType) {
            let sorted = [...allItemsList];
            if(sortType === 'popular') sorted.sort((a, b) => b.downloads - a.downloads);
            else if(sortType === 'newest') sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
            else if(sortType === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));

            sorted.forEach((item, index) => {
                if(item.domElement) item.domElement.style.order = index;
            });
        }

        function renderSkeletons() {
            const container = document.getElementById('catalog-container');
            let html = '';
            for(let i=0; i<1; i++) {
                html += `<div class="mb-24 pt-8"><div class="flex justify-center mb-16"><div class="h-8 w-48 skeleton rounded-full"></div></div><div class="mb-16"><div class="flex items-center gap-3 mb-8 pl-4 border-l-4 border-slate-700"><div class="h-8 w-32 skeleton rounded"></div></div><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${Array(3).fill(0).map(() => `<div class="glass-effect rounded-xl p-6 border border-slate-700 h-[320px] flex flex-col"><div class="flex justify-between mb-6"><div class="h-12 w-12 skeleton rounded-lg"></div><div class="h-6 w-16 skeleton rounded"></div></div><div class="h-6 w-3/4 skeleton rounded mb-4"></div><div class="h-4 w-full skeleton rounded mb-2"></div><div class="h-4 w-2/3 skeleton rounded mb-6"></div><div class="mt-auto flex justify-between items-center"><div class="h-4 w-12 skeleton rounded"></div><div class="h-10 w-28 skeleton rounded-lg"></div></div></div>`).join('')}</div></div></div>`;
            }
            container.innerHTML = html;
        }

        // --- FEATURE 1: URL Browser Back Button Integration ---
        function checkDeepLink() {
            const urlParams = new URLSearchParams(window.location.search);
            const itemIdSearch = urlParams.get('id');
            const hash = window.location.hash;
            
            if (itemIdSearch && itemMap[itemIdSearch]) {
                openProductModal(itemIdSearch, true);
            } else if (hash.startsWith('#item-')) {
                const itemIdHash = hash.replace('#item-', '');
                if (itemMap[itemIdHash]) openProductModal(itemIdHash, true);
            }
        }

        window.addEventListener('hashchange', () => {
            if (window.location.hash.startsWith('#item-')) {
                const itemId = window.location.hash.replace('#item-', '');
                if (itemMap[itemId]) openProductModal(itemId, true);
            } else {
                document.getElementById('product-modal').classList.add('hidden');
            }
        });

        function handleCatalogClick(e) {
            const favBtn = e.target.closest('[data-action="favorite"]');
            if (favBtn) { e.stopPropagation(); toggleFavorite(favBtn.dataset.id, favBtn); return; }

            const dlBtn = e.target.closest('[data-action="download"]');
            if (dlBtn) {
                e.stopPropagation(); e.preventDefault(); 
                if(dlBtn.dataset.type === 'Script') handleCopyScript(dlBtn, dlBtn.dataset.id);
                else handleDownload(dlBtn, dlBtn.dataset.id, dlBtn.dataset.url, dlBtn.dataset.name);
                return;
            }

            const card = e.target.closest('[data-action="open-modal"]');
            if (card) openProductModal(card.dataset.id);
        }

        function showToast(message, type = 'info', duration = 3000) {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            let icon = type === 'success' ? 'ph-check-circle' : 'ph-info';
            if (type === 'download') icon = 'ph-download-simple';
            
            toast.innerHTML = `
                <div class="toast-content"><i class="ph-fill ${icon} text-lg"></i> <span>${message}</span></div>
                <div class="toast-progress"></div>
            `;
            container.appendChild(toast);
            
            const progress = toast.querySelector('.toast-progress');
            setTimeout(() => { progress.style.width = '100%'; progress.style.transitionDuration = `${duration}ms`; }, 50);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(10px)';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }

        function toggleFavorite(itemId, btnElement) {
            if (userFavorites.includes(itemId)) {
                userFavorites = userFavorites.filter(id => id !== itemId);
                btnElement.classList.remove('active');
                btnElement.innerHTML = '<i class="ph-bold ph-heart text-slate-500 hover:text-pink-500 transition-colors"></i>';
                showToast("Removed from favorites");
            } else {
                userFavorites.push(itemId);
                btnElement.classList.add('active');
                btnElement.innerHTML = '<i class="ph-fill ph-heart text-pink-500"></i>';
                showToast("Added to favorites", "success");
            }
            localStorage.setItem('zentry_favorites', JSON.stringify(userFavorites));
            
            updateFilterCounters();

            const activeFilter = document.querySelector('.filter-pill.active');
            if (activeFilter && activeFilter.innerText.includes('Favorites')) {
                applyCategoryFilter('favorites');
            }
        }

        function handleCopyScript(btnElement, itemId) {
            const item = itemMap[itemId];
            if(!item || !item.scriptContent) return showToast("Script content missing.", "info");
            
            const originalContent = btnElement.innerHTML;
            const originalWidth = btnElement.offsetWidth;
            btnElement.style.width = `${originalWidth}px`;
            
            btnElement.innerHTML = `<i class="ph-bold ph-shield-check animate-pulse text-emerald-400"></i> Scanning...`;
            btnElement.classList.add('cursor-wait', 'opacity-90', 'border-emerald-500');
            AudioEngine.play('scan');

            setTimeout(() => {
                btnElement.innerHTML = `<i class="ph-bold ph-spinner animate-spin text-blue-400"></i> Copying...`;
                btnElement.classList.remove('border-emerald-500');

                setTimeout(() => {
                    const copyText = item.scriptContent;
                    navigator.clipboard.writeText(copyText).then(() => {
                        AudioEngine.play('success');
                        btnElement.innerHTML = `<i class="ph-bold ph-check"></i> Copied!`;
                        btnElement.classList.replace('bg-slate-800', 'bg-emerald-600');
                        btnElement.classList.replace('text-blue-400', 'text-white');
                        showToast(`Loadstring copied to clipboard!`, "success", 2000);
                        setTimeout(() => {
                            btnElement.innerHTML = originalContent;
                            btnElement.classList.remove('cursor-wait', 'opacity-90', 'bg-emerald-600', 'text-white');
                            btnElement.style.width = '';
                        }, 2000);
                    }).catch(err => {
                        showToast("Failed to copy.", "info");
                        btnElement.innerHTML = originalContent;
                        btnElement.classList.remove('cursor-wait', 'opacity-90');
                    });
                }, 600);
            }, 800);
        }

        function handleDownload(btnElement, itemId, url, itemName) {
            if (url === "#") return showToast("This item is not available yet.", "info");
            showToast(`Initiating secure transfer...`, "info", 1000);

            const item = itemMap[itemId];
            if (item) {
                item.downloads++;
                const countSpan = document.getElementById(`dl-count-${itemId}`);
                if (countSpan) {
                    countSpan.innerText = (item.downloads/1000).toFixed(1) + "k DLs";
                    countSpan.classList.add("text-emerald-400", "font-bold");
                    setTimeout(() => countSpan.classList.remove("text-emerald-400", "font-bold"), 1000);
                }
                const modalCount = document.getElementById('modal-dl-count');
                if(modalCount) modalCount.innerText = item.downloads.toLocaleString() + " downloads";
            }

            const originalContent = btnElement.innerHTML;
            const originalWidth = btnElement.offsetWidth; 
            btnElement.style.width = `${originalWidth}px`;
            
            btnElement.innerHTML = `<i class="ph-bold ph-shield-check animate-pulse text-emerald-400"></i> Scanning...`;
            btnElement.classList.add('cursor-wait', 'opacity-90');
            AudioEngine.play('scan');
            
            setTimeout(() => {
                btnElement.innerHTML = `<i class="ph-bold ph-spinner animate-spin"></i> Transferring...`;
                
                setTimeout(() => {
                    AudioEngine.play('success');
                    btnElement.innerHTML = `<i class="ph-bold ph-check"></i> Done`;
                    const link = document.createElement('a');
                    link.href = url; link.download = url.split('/').pop();
                    document.body.appendChild(link); link.click(); document.body.removeChild(link);
                    setTimeout(() => {
                        btnElement.innerHTML = originalContent;
                        btnElement.classList.remove('cursor-wait', 'opacity-90');
                        btnElement.style.width = '';
                    }, 1500);
                }, 800);
            }, 800);
        }

        function shareItem(itemId) {
            const url = window.location.origin + window.location.pathname + "#item-" + itemId;
            navigator.clipboard.writeText(url).then(() => {
                showToast("Direct link copied to clipboard!", "success");
            });
        }

        function closeBanner() { 
            document.getElementById('announcement-banner').classList.add('closed'); 
            localStorage.setItem('zentry_banner_closed_version', CURRENT_SITE_VERSION); 
        }
        function toggleAbout() { document.getElementById('about-modal').classList.toggle('hidden'); }
        function toggleSubmitModal() { document.getElementById('submit-modal').classList.toggle('hidden'); }
        
        function closeProductModal() { 
            document.getElementById('product-modal').classList.add('hidden'); 
            try {
                if(window.location.hash) {
                    window.history.replaceState('', document.title, window.location.pathname + window.location.search); 
                }
            } catch(e) {
                // Ignore SecurityError in restricted/sandboxed iframe environments
            }
        }

        function openProductModal(itemId, fromHash = false) {
            const item = itemMap[itemId];
            if (!item) return;

            if (!fromHash) {
                window.location.hash = 'item-' + itemId;
            }

            const relatedApps = allItemsList.filter(other => other.id !== item.id && other.tags.some(tag => item.tags.includes(tag))).slice(0, 2); 
            let relatedAppsHtml = '';
            if (relatedApps.length > 0) {
                const cards = relatedApps.map(app => `<div onclick="openProductModal('${app.id}')" class="bg-slate-800 p-3 rounded-xl border border-slate-700 cursor-pointer hover:border-blue-500 transition flex items-center gap-3"><div class="bg-slate-900 p-2 rounded-lg"><i class="ph ${app.icon} text-xl text-blue-400"></i></div><div><h4 class="font-bold text-white text-sm">${app.name}</h4><p class="text-xs text-slate-400">View Details</p></div></div>`).join('');
                relatedAppsHtml = `<div class="border-t border-slate-800 pt-6 mt-6"><h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">You might also like</h4><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${cards}</div></div>`;
            }

            const modalContent = document.getElementById('product-modal-content');
            const isScript = item.type === "Script";
            const isReady = item.downloadLink !== "#" || isScript;
            
            let btnClass = isReady ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-700 cursor-not-allowed text-slate-400";
            let btnText = isScript ? "Copy Code" : (isReady ? "Download Now" : "Coming Soon");
            let btnIcon = isScript ? "ph-copy" : "ph-download-simple";
            let btnAction = isScript ? `handleCopyScript(this, '${item.id}')` : `handleDownload(this, '${item.id}', '${item.downloadLink}', '${item.name}')`;
            
            const reqs = item.requirements || { os: "N/A", processor: "N/A", ram: "N/A", graphics: "N/A" };
            const isFav = userFavorites.includes(item.id);
            const favIconClass = isFav ? "ph-fill ph-heart text-pink-500" : "ph-bold ph-heart text-slate-400";

            const verifiedHtml = item.isVerified ? `<i class="ph-fill ph-seal-check text-blue-400 ml-1" title="Verified Author"></i>` : '';

            let galleryHtml = '';
            if (item.screenshots && item.screenshots.length > 0) {
                const imgs = item.screenshots.map(src => `<img src="${src}" onclick="openLightbox('${src}')" class="h-40 rounded-lg object-cover border border-slate-700 shrink-0 cursor-zoom-in hover:border-blue-500 transition" alt="Screenshot">`).join('');
                galleryHtml = `<div class="mb-6"><h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Media</h4><div class="flex gap-3 overflow-x-auto hide-scroll pb-2">${imgs}</div></div>`;
            }

            let snippetHtml = '';
            if (isScript && item.scriptContent) {
                snippetHtml = `
                    <div class="mb-6 relative group bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-hidden cursor-crosshair">
                        <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between"><span>Code Snippet</span> <span class="text-[10px] text-blue-400 normal-case opacity-0 group-hover:opacity-100 transition">Hover to view</span></h4>
                        <pre class="text-[10px] text-emerald-300/80 font-mono overflow-hidden opacity-50 filter blur-[2px] group-hover:blur-none group-hover:opacity-100 transition duration-300">${item.scriptContent.substring(0, 150)}${item.scriptContent.length > 150 ? '...' : ''}</pre>
                        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950 pointer-events-none"></div>
                    </div>
                `;
            }

            const liveViewers = Math.floor(Math.random() * 40) + 5;

            modalContent.innerHTML = `
                <div class="relative">
                    <div class="h-32 bg-gradient-to-r from-blue-900/50 to-slate-900 border-b border-slate-700 flex items-center justify-center relative">
                        <i class="ph ${item.icon} text-6xl text-blue-400 drop-shadow-lg"></i>
                        <div class="absolute top-4 right-4 flex gap-2">
                            <button onclick="openReportModal('${item.id}')" class="bg-black/30 hover:bg-red-500/30 text-slate-400 hover:text-red-400 rounded-full p-2 transition" title="Report Issue"><i class="ph-bold ph-warning text-lg"></i></button>
                            <button onclick="shareItem('${item.id}')" class="bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition" title="Share"><i class="ph-bold ph-share-network text-lg"></i></button>
                            <button onclick="toggleFavorite('${item.id}', this)" class="bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition heart-btn ${isFav ? 'active' : ''}"><i class="${favIconClass} text-lg"></i></button>
                            <button onclick="closeProductModal()" class="bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition"><i class="ph-bold ph-x text-lg"></i></button>
                        </div>
                    </div>
                    <div class="p-8 bg-slate-900">
                        <div class="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                            <div>
                                <h2 class="text-3xl font-bold text-white mb-1 flex items-center gap-2">${item.name}</h2>
                                <p class="text-slate-400 text-sm flex items-center flex-wrap gap-y-1">by <span class="text-slate-300 ml-1 font-medium hover:text-blue-400 cursor-pointer transition underline decoration-transparent hover:decoration-blue-400" onclick="filterByAuthor(event, '${item.author}')">${item.author}</span>${verifiedHtml} <span class="mx-2">&bull;</span> <span class="text-slate-300 font-semibold bg-slate-800 px-1.5 rounded text-xs">${item.type || 'App'}</span> <span class="mx-2">&bull;</span> ${item.version} <span class="mx-2">&bull;</span> <span class="text-slate-500 text-xs flex items-center gap-1"><i class="ph-bold ph-clock"></i> ${item.lastUpdated || 'Recently'}</span></p>
                            </div>
                            <div class="text-left sm:text-right">
                                <div class="flex items-center sm:justify-end gap-1 text-yellow-400 text-sm font-bold mb-1"><span>${item.rating}</span><i class="ph-fill ph-star"></i></div>
                                <div class="text-slate-500 text-xs" id="modal-dl-count">${item.downloads.toLocaleString()} downloads</div>
                                <div class="text-blue-400 text-[10px] mt-1 flex items-center sm:justify-end gap-1 animate-pulse"><i class="ph-fill ph-users text-xs"></i> ${liveViewers} viewing right now</div>
                            </div>
                        </div>
                        <div class="space-y-6">
                            ${galleryHtml}
                            ${snippetHtml}
                            <p class="text-slate-300 leading-relaxed text-sm bg-slate-950/50 p-4 rounded-xl border border-slate-800">${item.longDescription}</p>
                            <div class="bg-slate-950/50 p-4 rounded-xl border border-slate-800"><h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">What's New</h4><ul class="list-disc list-inside text-sm text-slate-400 space-y-1">${item.changelog ? item.changelog.map(log => `<li>${log}</li>`).join('') : '<li>No recent changes.</li>'}</ul></div>
                            <div>
                                <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">System Requirements</h4>
                                <div class="grid grid-cols-2 gap-4 text-sm">
                                    <div class="bg-slate-800 p-3 rounded-lg border border-slate-700 flex items-center gap-2"><i class="ph-bold ${item.osIcon} text-slate-500 text-lg"></i> <div><span class="block text-slate-500 text-[10px] uppercase">OS</span><span class="text-white font-medium line-clamp-1">${reqs.os}</span></div></div>
                                    <div class="bg-slate-800 p-3 rounded-lg border border-slate-700"><span class="block text-slate-500 text-[10px] uppercase">Processor</span><span class="text-white font-medium line-clamp-1">${reqs.processor}</span></div>
                                    <div class="bg-slate-800 p-3 rounded-lg border border-slate-700"><span class="block text-slate-500 text-[10px] uppercase">RAM</span><span class="text-white font-medium line-clamp-1">${reqs.ram}</span></div>
                                    <div class="bg-slate-800 p-3 rounded-lg border border-slate-700"><span class="block text-slate-500 text-[10px] uppercase">Graphics</span><span class="text-white font-medium line-clamp-1">${reqs.graphics}</span></div>
                                </div>
                            </div>
                            <div class="pt-4 flex items-center justify-between border-t border-slate-800">
                                <!-- FEATURE 6: Clickable Tags in Modal -->
                                <div class="flex gap-2 flex-wrap">${item.tags.map(tag => `<span onclick="filterByTag(event, '${tag}')" class="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700 hover:bg-blue-600 hover:text-white cursor-pointer transition">${tag}</span>`).join('')}</div>
                                <button onclick="${btnAction}" class="${btnClass} px-8 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-blue-900/20 text-center justify-center min-w-[160px] shrink-0"><i class="ph-bold ${btnIcon}"></i> ${btnText}</button>
                            </div>
                            ${relatedAppsHtml}
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('product-modal').classList.remove('hidden');
        }

        function createCardHtml(product, extraClass = '') {
            const isScript = product.type === "Script";
            const isReady = product.downloadLink !== "#" || isScript;
            
            let buttonClass = isReady 
                ? (isScript ? "bg-slate-800 text-blue-400 hover:bg-slate-700 hover:text-white border border-slate-700" : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20")
                : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700";
            let buttonText = isScript ? "Copy" : (isReady ? "Download" : "Soon");
            let btnIcon = isScript ? "ph-copy" : "ph-download-simple";

            const itemType = product.type || "App";
            const isFav = userFavorites.includes(product.id);
            const favClass = isFav ? "active" : "";
            const favIcon = isFav ? '<i class="ph-fill ph-heart text-pink-500"></i>' : '<i class="ph-bold ph-heart text-slate-500 hover:text-pink-500 transition-colors"></i>';
            
            let badgeHtml = product.isTrending ? `<span class="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-orange-500/20 border border-orange-400 z-10 flex items-center gap-1 animate-pulse"><i class="ph-fill ph-fire"></i> HOT</span>` 
                          : product.isNew ? `<span class="absolute -top-2 -right-2 bg-green-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-green-500/20 border border-green-400 z-10">NEW</span>` : '';

            const verifiedHtml = product.isVerified ? `<i class="ph-fill ph-seal-check text-blue-400 absolute -bottom-1 -right-1 bg-slate-800 rounded-full text-sm border border-slate-700"></i>` : '';

            return `
                <div id="card-${product.id}" data-action="open-modal" data-id="${product.id}" class="glass-effect rounded-xl p-6 product-card border border-slate-700 flex flex-col h-full relative group ${extraClass}">
                    ${badgeHtml}
                    <div class="flex items-start justify-between mb-4 card-header">
                        <div class="relative bg-slate-800 p-3 rounded-lg border border-slate-700 group-hover:border-blue-500/50 transition-colors">
                            <i class="ph ${product.icon} text-2xl text-blue-400"></i>
                            ${verifiedHtml}
                        </div>
                        <div class="flex flex-col items-end gap-1 card-stats">
                             <div class="flex gap-2 items-center">
                                 <button data-action="favorite" data-id="${product.id}" class="heart-btn ${favClass} p-1 rounded-full hover:bg-slate-800 transition">${favIcon}</button>
                                 <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">${itemType}</span>
                             </div>
                             <span class="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-md border border-slate-700 font-mono block mb-1">${product.version}</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <h3 class="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors filter-name line-clamp-1">${product.name}</h3>
                        <p class="text-slate-400 text-sm mb-4 flex-grow leading-relaxed filter-desc line-clamp-2">${product.description}</p>
                        <div class="flex flex-wrap gap-2 mb-4 filter-tags">
                            ${product.tags.slice(0,3).map(tag => `<span onclick="filterByTag(event, '${tag}')" class="text-[10px] font-medium text-blue-300 bg-blue-900/20 px-2 py-1 rounded border border-blue-800/30 hover:bg-blue-600 hover:text-white cursor-pointer transition z-10 relative">${tag}</span>`).join('')}
                            ${product.tags.length > 3 ? `<span class="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">+${product.tags.length - 3}</span>` : ''}
                        </div>
                    </div>
                    <div class="mt-auto pt-4 border-t border-slate-700/50 flex items-center justify-between card-footer">
                        <div class="text-xs text-slate-500 font-mono flex flex-col stats-row">
                            <span class="flex items-center gap-1"><i class="ph-bold ${product.osIcon}"></i> ${product.size}</span>
                            <span id="dl-count-${product.id}" class="text-[10px] mt-0.5 transition-colors duration-300">${(product.downloads/1000).toFixed(1)}k DLs</span>
                        </div>
                        <button data-action="download" data-type="${product.type}" data-id="${product.id}" data-url="${product.downloadLink}" data-name="${product.name}" class="${buttonClass} px-4 py-2 rounded-lg text-sm font-semibold transition-all transform active:scale-95 flex items-center gap-2 justify-center min-w-[100px]">
                           <i class="ph-bold ${btnIcon}"></i> ${buttonText}
                        </button>
                    </div>
                </div>
            `;
        }

        // --- FEATURE 2 & 5: Collapsible Categories + Pagination ---
        function toggleCategory(subId, headerElement) {
            const content = document.getElementById(subId);
            const icon = headerElement.querySelector('i.ph-caret-up, i.ph-caret-down');
            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                if(icon) icon.classList.replace('ph-caret-down', 'ph-caret-up');
            } else {
                content.classList.add('hidden');
                if(icon) icon.classList.replace('ph-caret-up', 'ph-caret-down');
            }
        }

        function loadMoreItems(subId, btnElement) {
            const container = document.getElementById(subId);
            if (container) {
                container.querySelectorAll('.pagination-hidden').forEach(card => {
                    card.classList.remove('hidden', 'pagination-hidden');
                });
            }
            btnElement.parentElement.remove();
        }

        function renderCatalog() {
            const container = document.getElementById('catalog-container');
            let fullHtml = '';
            
            catalog.forEach(section => {
                const subsectionsHtml = section.subsections.map(sub => {
                    const safeSubId = `sub-${section.id}-${sub.title.replace(/\\s+/g, '-')}`;
                    
                    const cardsHtml = sub.items.map((item, index) => {
                        const hiddenClass = index >= INITIAL_PAGINATION_LIMIT ? 'hidden pagination-hidden' : '';
                        return createCardHtml(item, hiddenClass);
                    }).join('');

                    let loadMoreHtml = '';
                    if (sub.items.length > INITIAL_PAGINATION_LIMIT) {
                        loadMoreHtml = `
                            <div class="mt-8 text-center load-more-btn-container">
                                <button onclick="loadMoreItems('${safeSubId}', this)" class="bg-slate-800 hover:bg-slate-700 text-blue-400 font-semibold py-2 px-6 rounded-lg transition border border-slate-700 shadow-lg flex items-center gap-2 mx-auto">
                                    <i class="ph-bold ph-caret-down"></i> Show All (${sub.items.length})
                                </button>
                            </div>
                        `;
                    }

                    return `
                        <div class="mb-16 subsection-wrapper">
                            <div class="flex items-center justify-between mb-8 pl-4 border-l-4 border-blue-500 cursor-pointer group select-none" onclick="toggleCategory('${safeSubId}', this)">
                                <div class="flex items-center gap-3">
                                    <h3 class="text-2xl font-bold text-slate-200 tracking-tight group-hover:text-blue-400 transition">${sub.title}</h3>
                                    <span class="bg-slate-800 text-slate-500 text-xs font-bold px-2 py-1 rounded-full">${sub.items.length}</span>
                                </div>
                                <i class="ph-bold ph-caret-up text-slate-500 group-hover:text-blue-400 transition transform duration-300"></i>
                            </div>
                            <div id="${safeSubId}" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-wrapper flex-col lg:grid transition-all duration-300">
                                ${cardsHtml}
                            </div>
                            ${loadMoreHtml}
                        </div>
                    `;
                }).join('');

                fullHtml += `<div id="${section.id}" class="mb-24 pt-8 section-wrapper"><div class="text-center mb-16 relative"><div class="absolute inset-0 flex items-center" aria-hidden="true"><div class="w-full border-t border-slate-800"></div></div><div class="relative flex justify-center"><span class="px-4 bg-slate-900 text-lg font-semibold text-blue-500 tracking-wider uppercase">${section.title}</span></div><p class="mt-4 text-slate-400 max-w-2xl mx-auto">${section.description}</p></div>${subsectionsHtml}</div>`;
            });
            
            container.innerHTML = fullHtml;
            if(currentLayout === 'list') toggleLayout('list'); 
        }

        let debounceTimer;
        function debouncedSearch(term) { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => { filterGrid(term); }, 300); }

        // OPTIMIZED: Batch DOM operations to prevent layout thrashing
        function filterGrid(term) {
            const searchTerm = term.toLowerCase();
            const noResults = document.getElementById('no-results-msg');
            let totalVisible = 0;

            if (searchTerm !== '') {
                document.querySelectorAll('.pagination-hidden').forEach(card => card.classList.remove('hidden', 'pagination-hidden'));
                document.querySelectorAll('.load-more-btn-container').forEach(btn => btn.remove());
            }

            // PHASE 1: Calculate what needs to change (no DOM reads/writes mixed)
            const matchingIds = new Set();
            allItemsList.forEach(item => { if (item.searchString.includes(searchTerm)) matchingIds.add(item.id); });

            const updates = [];
            allItemsList.forEach(item => {
                if (item.domElement) {
                    const shouldShow = matchingIds.has(item.id);
                    const currentlyHidden = item.domElement.style.display === 'none' || item.domElement.classList.contains('hidden');
                    
                    if (shouldShow !== !currentlyHidden) {
                        updates.push({ element: item.domElement, show: shouldShow });
                    }
                    if (shouldShow) totalVisible++;
                }
            });

            // PHASE 2: Apply all DOM changes at once (batched writes)
            requestAnimationFrame(() => {
                updates.forEach(({ element, show }) => {
                    element.style.display = show ? 'flex' : 'none';
                    if (show) element.classList.remove('hidden');
                });

                // Update visibility of sections/subsections
                document.querySelectorAll('.subsection-wrapper').forEach(sub => {
                    const visibleCards = Array.from(sub.querySelectorAll('.product-card')).filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
                    sub.style.display = visibleCards.length > 0 ? 'block' : 'none';
                });
                
                document.querySelectorAll('.section-wrapper').forEach(sec => {
                    const visibleSubs = Array.from(sec.querySelectorAll('.subsection-wrapper')).filter(s => s.style.display !== 'none');
                    sec.style.display = visibleSubs.length > 0 ? 'block' : 'none';
                });

                if (totalVisible === 0 && searchTerm !== '') noResults.classList.remove('hidden');
                else noResults.classList.add('hidden');
            });
        }

        function applyCategoryFilter(category) {
            const buttons = document.querySelectorAll('.filter-pill');
            buttons.forEach(btn => {
                if(btn.innerText.toLowerCase().includes(category) || (category === 'all' && btn.innerText === 'All')) btn.classList.add('active');
                else btn.classList.remove('active');
            });

            document.querySelectorAll('.pagination-hidden').forEach(card => card.classList.remove('hidden', 'pagination-hidden'));
            document.querySelectorAll('.load-more-btn-container').forEach(btn => btn.remove());
            document.querySelectorAll('.grid-wrapper').forEach(wrapper => {
                wrapper.classList.remove('hidden');
                const icon = wrapper.previousElementSibling.querySelector('i.ph-caret-down');
                if(icon) icon.classList.replace('ph-caret-down', 'ph-caret-up');
            });
            
            if (category === 'favorites') {
                filterGrid(''); 
                allItemsList.forEach(item => {
                    if (item.domElement) item.domElement.style.display = userFavorites.includes(item.id) ? 'flex' : 'none';
                });
            } else {
                document.getElementById('global-search').value = '';
                filterGrid(category === 'all' ? '' : category);
            }
        }

        let secretKeys = '';
        document.addEventListener('keydown', (e) => {
            secretKeys += e.key.toLowerCase();
            if (secretKeys.length > 10) secretKeys = secretKeys.substring(1);
            if (secretKeys.includes('zentry')) {
                document.body.classList.toggle('matrix-mode');
                showToast("Matrix Protocol Initiated", "success");
                AudioEngine.play('scan');
                secretKeys = '';
            }

            if (e.key === 'Escape') {
                document.getElementById('global-search').value = '';
                filterGrid('');
                document.getElementById('global-search').blur();
                closeProductModal();
                document.getElementById('submit-modal').classList.add('hidden');
                document.getElementById('about-modal').classList.add('hidden');
                document.getElementById('report-modal').classList.add('hidden');
            }
            if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                document.getElementById('global-search').focus();
            }
        });

        document.addEventListener('DOMContentLoaded', initSystem);