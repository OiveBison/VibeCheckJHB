//  Menu Drawer/sidebar
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.querySelector('button[aria-label="Menu"]');
    const menuDrawer = document.getElementById('sidebarNav'); // Updated to match  sidebar ID
    const drawerOverlay = document.getElementById('drawer-overlay');
    window.updateReservationBadge();

    if (!menuBtn) return;

    function toggleMenu() {
        menuDrawer?.classList.toggle('open');
        drawerOverlay?.classList.toggle('active');
    }

    menuBtn.addEventListener('click', toggleMenu);
    if (drawerOverlay) {
        drawerOverlay.addEventListener('click', toggleMenu);
    }
    // =========================================================
    // GSAP INTERACTIONS #2 & #3: Entrance Timeline & ScrollTrigger
    // =========================================================
    function initGlobalGSAP() {
        if (typeof gsap === "undefined") return;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) return;

        // Interaction #2: Coordinated Page-Load GSAP Timeline
        const entranceTl = gsap.timeline({
            defaults: { ease: "power3.out", duration: 0.65, clearProps: "transform,opacity" }
        });

        if (document.querySelector(".brand-logo")) {
            entranceTl.from(".brand-logo", { y: -16, opacity: 0 });
        }
        if (document.querySelector("header nav a, .nav-links a, .header-actions button")) {
            entranceTl.from("header nav a, .nav-links a, .header-actions button", {
                y: -12,
                opacity: 0,
                stagger: 0.08
            }, "-=0.35");
        }
        if (document.querySelector("main h1, main h2, .hero-intro")) {
            entranceTl.from("main h1, main h2, .hero-intro", {
                y: 22,
                opacity: 0,
                stagger: 0.1
            }, "-=0.35");
        }

        // Interaction #3: ScrollTrigger Section & Grid Reveal
        if (typeof ScrollTrigger !== "undefined") {
            gsap.registerPlugin(ScrollTrigger);

            const revealTargets = gsap.utils.toArray("main section, footer");
            revealTargets.forEach((section) => {
                gsap.from(section, {
                    y: 28,
                    opacity: 0,
                    duration: 0.7,
                    ease: "power2.out",
                    clearProps: "transform,opacity",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 88%",
                        once: true
                    }
                });
            });
        }
    }

    initGlobalGSAP();
});

// Saved Vibes & Reservations shared storage

window.VibeStorage = {
    SAVED_KEY: 'vibecheck_saved_venues',
    RES_KEY: 'vibecheck_reservations',

    getSaved() {
        try {
            return JSON.parse(localStorage.getItem(this.SAVED_KEY)) || [];
        } catch (e) {
            return [];
        }
    },

    isSaved(id) {
        return this.getSaved().some(v => v.id === id);
    },

    toggleSave(venue) {
        let saved = this.getSaved();
        const exists = saved.some(v => v.id === venue.id);
        if (exists) {
            saved = saved.filter(v => v.id !== venue.id);
        } else {
            saved.push(venue);
        }
        localStorage.setItem(this.SAVED_KEY, JSON.stringify(saved));
        return !exists;
    },

    removeSave(id) {
        const saved = this.getSaved().filter(v => v.id !== id);
        localStorage.setItem(this.SAVED_KEY, JSON.stringify(saved));
    },

    getReservations() {
        try {
            return JSON.parse(localStorage.getItem(this.RES_KEY)) || [];
        } catch (e) {
            return [];
        }
    },

   addReservation(venue) {
        const current = this.getReservations();
        if (!current.some(r => r.id === venue.id)) {
            current.push({
                ...venue,
                bookedDate: venue.bookedDate || "This Weekend • 8:00 PM"
            });
            localStorage.setItem(this.RES_KEY, JSON.stringify(current));
            if (window.updateReservationBadge) window.updateReservationBadge();
        }
    },

    removeReservation(id) {
        const updated = this.getReservations().filter(r => r.id !== id);
        localStorage.setItem(this.RES_KEY, JSON.stringify(updated));
        if (window.updateReservationBadge) window.updateReservationBadge();
    }
};

window.updateReservationBadge = function() {
    const heartBtn = document.getElementById('reservations-toggle-btn') ||
                     document.querySelector('button[aria-label="Reservations"]') ||
                     document.querySelector('button[aria-label="Activity"]');
    if (!heartBtn) return;

    let badge = heartBtn.querySelector('.reservation-badge');
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'reservation-badge';
        badge.setAttribute('aria-live', 'polite');
        heartBtn.appendChild(badge);
    }

    const count = window.VibeStorage ? window.VibeStorage.getReservations().length : 0;
    badge.textContent = count;
    badge.classList.toggle('visible', count > 0);
};
function setFeedStatus(container, message, type = "info") {
    if (!container) return;
    container.style.display = "block";
    container.dataset.state = type;
    container.textContent = message;
}

window.setFeedStatus = setFeedStatus;

// API pipeline (Instagram Graph API in vibes.json)

window.fetchVenuesAPI = async function() {
    const INSTAGRAM_CONFIG = {
        accessToken: "YOUR_INSTAGRAM_GRAPH_API_ACCESS_TOKEN",
        fields: "id,caption,media_type,media_url,permalink,timestamp"
    };

    const venueMetaMap = {
        default: {
            vibe: "Rooftop & Chill",
            category: "rooftop",
            price: "R250 - R500",
            doorRules: "Smart Casual",
            outfitRestrictions: "No athletic vests, no flip-flops"
        },
        tigers_milk: {
            vibe: "Live DJ & Cocktail Bar",
            category: "bar",
            price: "R150 - R350",
            doorRules: "Casual / Trendy",
            outfitRestrictions: "No beachwear"
        },
        news_cafe: {
            vibe: "High Energy & Dining",
            category: "dining",
            price: "R200 - R450",
            doorRules: "Strictly 21+ after 8 PM",
            outfitRestrictions: "Smart casual required"
        }
    };

    //  Attempt live Instagram Graph API if a real token is configured
    if (INSTAGRAM_CONFIG.accessToken && !INSTAGRAM_CONFIG.accessToken.startsWith("YOUR_")) {
        try {
            const endpoint = `https://graph.instagram.com/me/media?fields=${INSTAGRAM_CONFIG.fields}&access_token=${INSTAGRAM_CONFIG.accessToken}`;
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error(`Instagram API HTTP ${response.status}`);
            const json = await response.json();

            if (Array.isArray(json.data) && json.data.length > 0) {
                return json.data.map(post => {
                    const caption = post.caption || "";
                    let meta = venueMetaMap.default;
                    if (caption.toLowerCase().includes("tiger")) meta = venueMetaMap.tigers_milk;
                    if (caption.toLowerCase().includes("news")) meta = venueMetaMap.news_cafe;

                    return {
                        id: post.id,
                        venueName: caption.split("\n")[0]?.slice(0, 32) || "VibeCheck JHB Spot",
                        imageUrl: post.media_url,
                        permalink: post.permalink,
                        ...meta
                    };
                });
            }
        } catch (err) {
            console.warn("Instagram Graph API unavailable, falling back to vibes.json:", err);
        }
    }

    // 2. Fallback to local vibes.json REST endpoint
    try {
        const jsonUrl = new URL("Assets/vibes.json", window.location.href).href;
        const localResponse = await fetch(jsonUrl);
        if (!localResponse.ok) throw new Error(`vibes.json HTTP ${localResponse.status}`);
        return await localResponse.json();
    } catch (fallbackErr) {
        console.error("Failed to load vibes.json:", fallbackErr);
        return [];
    }
};

//  Shared venue detail Modal card (Center Preview)

window.openVenueModal = function(venue) {
    let modalOverlay = document.getElementById('venue-detail-modal');

    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'venue-detail-modal';
        modalOverlay.className = 'venue-modal-overlay';
        modalOverlay.setAttribute('role', 'dialog');
        modalOverlay.setAttribute('aria-modal', 'true');
        document.body.appendChild(modalOverlay);

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
            }
        });
    }

    const isSaved = window.VibeStorage.isSaved(venue.id);

    modalOverlay.innerHTML = `
        <div class="venue-modal-card">
            <button type="button" class="venue-modal-close" aria-label="Close Venue Preview">&times;</button>
            <div class="venue-modal-media">
                <img src="${venue.imageUrl}" alt="${venue.venueName || 'Venue preview'}" />
                <span class="vibe-badge">${venue.vibe || 'JHB Vibe'}</span>
            </div>
            <div class="venue-modal-body">
                <div class="venue-modal-header">
                    <div>
                        <h3>${venue.venueName || 'JHB Venue'}</h3>
                        <span class="price-range">${venue.price || 'R250 - R500'}</span>
                    </div>
                    <button type="button" class="modal-bookmark-btn ${isSaved ? 'saved' : ''}" aria-label="Save Vibe">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2"
                             fill="${isSaved ? 'currentColor' : 'none'}" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="19 21 12 16 5 21 5 3 19 3 19 21"></polygon>
                        </svg>
                        <span>${isSaved ? 'Saved' : 'Save'}</span>
                    </button>
                </div>
                <div class="venue-modal-meta">
                    <p><strong>Door Rules:</strong> ${venue.doorRules || 'Smart Casual'}</p>
                    <p><strong>Dress Code:</strong> <span>${venue.outfitRestrictions || 'No athletic wear'}</span></p>
                </div>
            </div>
        </div>
    `;

    modalOverlay.classList.add('active');

    modalOverlay.querySelector('.venue-modal-close').addEventListener('click', () => {
        modalOverlay.classList.remove('active');
    });

    const saveBtn = modalOverlay.querySelector('.modal-bookmark-btn');
    saveBtn.addEventListener('click', () => {
        const nowSaved = window.VibeStorage.toggleSave(venue);
        saveBtn.classList.toggle('saved', nowSaved);
        saveBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2"
                 fill="${nowSaved ? 'currentColor' : 'none'}" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="19 21 12 16 5 21 5 3 19 3 19 21"></polygon>
            </svg>
            <span>${nowSaved ? 'Saved' : 'Save'}</span>
        `;
    });
};

//  Hamburger Menu & Heart Reservations shared drawer

document.addEventListener('DOMContentLoaded', () => {
    window.updateReservationBadge();

    const overlay = document.getElementById('drawer-overlay');
    const menuDrawer = document.getElementById('menu-drawer');
    const resDrawer = document.getElementById('reservations-drawer');
    const resList = document.getElementById('reservations-list');

    // Save the original Menu HTML so the Back button can restore it
    const defaultMenuHTML = menuDrawer ? menuDrawer.innerHTML : '';

    const MENU_VIEWS = {
        '#settings': `
            <div class="drawer-header">
                <button type="button" class="drawer-back-btn" aria-label="Back to Menu">&larr; Back</button>
                <h3>Settings</h3>
                <button type="button" class="close-btn" aria-label="Close Menu">&times;</button>
            </div>
            <div class="drawer-subview">
                <div class="setting-row">
                    <div>
                        <h4>App Theme</h4>
                        <p>Nightclub Dark (Default)</p>
                    </div>
                    <span class="setting-pill">Dark</span>
                </div>
                <div class="setting-row">
                    <div>
                        <h4>Notifications</h4>
                        <p>Reservation &amp; vibe alerts</p>
                    </div>
                    <span class="setting-pill">On</span>
                </div>
                <div class="setting-actions">
                    <button type="button" class="drawer-action-btn secondary">Sign In</button>
                    <button type="button" class="drawer-action-btn danger">Log Out</button>
                </div>
            </div>
        `,
        '#about': `
            <div class="drawer-header">
                <button type="button" class="drawer-back-btn" aria-label="Back to Menu">&larr; Back</button>
                <h3>About VibeCheck</h3>
                <button type="button" class="close-btn" aria-label="Close Menu">&times;</button>
            </div>
            <div class="drawer-subview">
                <p class="drawer-copy">
                    <strong>VibeCheck JHB</strong> is the new venue discovery platform that makes finding your vibe and booking a spot for a night out super easy and hassle-free.
                </p>
                <p class="drawer-copy">
                    Preview the atmosphere, music energy, dress codes, and entry policies before you pull up, saving you time and preventing unexpected door rules or surprise vibes from ruining your night.
                </p>
            </div>
        `,
        '#contact': `
            <div class="drawer-header">
                <button type="button" class="drawer-back-btn" aria-label="Back to Menu">&larr; Back</button>
                <h3>Contact Us</h3>
                <button type="button" class="close-btn" aria-label="Close Menu">&times;</button>
            </div>
            <div class="drawer-subview">
                <p class="drawer-copy">Have a venue to list or need help with a booking in Johannesburg? Reach out to our team:</p>
                <div class="contact-card">
                    <span class="contact-label">Email</span>
                    <a href="mailto:hello@vibecheckjhb.co.za" class="contact-value">hello@vibecheckjhb.co.za</a>
                </div>
                <div class="contact-card">
                    <span class="contact-label">WhatsApp</span>
                    <a href="https://wa.me/27110000000" target="_blank" rel="noopener noreferrer" class="contact-value">+27 11 000 0000</a>
                </div>
            </div>
        `,
        '#help': `
            <div class="drawer-header">
                <button type="button" class="drawer-back-btn" aria-label="Back to Menu">&larr; Back</button>
                <h3>Help &amp; FAQ</h3>
                <button type="button" class="close-btn" aria-label="Close Menu">&times;</button>
            </div>
            <div class="drawer-subview">
                <div class="faq-item">
                    <h4>How do I save a venue for later?</h4>
                    <p>Tap any venue card on the Home feed or Explore grid to open its preview, then hit the Save bookmark button.</p>
                </div>
                <div class="faq-item">
                    <h4>Where do my reservations go?</h4>
                    <p>Once you reserve a vibe from your Saved page, it appears under the Heart icon in the top header.</p>
                </div>
                <div class="faq-item">
                    <h4>Are door rules and dress codes accurate?</h4>
                    <p>Yes—each venue card lists current age limits, dress codes, and estimated spend so you arrive prepared.</p>
                </div>
            </div>
        `
    };

    function closeAllDrawers() {
        document.querySelectorAll('.menu-drawer').forEach(drawer => {
            drawer.classList.remove('open');
            drawer.setAttribute('aria-hidden', 'true');
        });
        if (overlay) overlay.classList.remove('active');
        const modal = document.getElementById('venue-detail-modal');
        if (modal) modal.classList.remove('active');
    }

    function openMenuDrawer() {
        closeAllDrawers();
        if (menuDrawer) {
            if (defaultMenuHTML) menuDrawer.innerHTML = defaultMenuHTML;
            menuDrawer.classList.add('open');
            menuDrawer.setAttribute('aria-hidden', 'false');
        }
        if (overlay) overlay.classList.add('active');
    }

    function renderReservationsDrawer() {
        if (!resList) return;
        const reservations = window.VibeStorage.getReservations();
        resList.innerHTML = '';

        if (reservations.length === 0) {
            resList.innerHTML = `
                <div style="text-align: center; padding: 3rem 1rem; color: #a1a1aa;">
                    <p style="font-size: 1.05rem; color: #fff; font-weight: 600; margin-bottom: 0.4rem;">No reservations made yet</p>
                    <p style="font-size: 0.85rem; line-height: 1.5;">You haven't reserved any vibes yet. Book a table from your Saved venues!</p>
                </div>
            `;
            return;
        }

        reservations.forEach(item => {
            const div = document.createElement('div');
            div.className = 'reservation-item';
            div.innerHTML = `
                <h4>${item.venueName}</h4>
                <p>${item.bookedDate}</p>
                <button type="button" class="cancel-res-btn">Cancel Reservation</button>
            `;
            div.querySelector('.cancel-res-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                window.VibeStorage.removeReservation(item.id);
                renderReservationsDrawer();
            });
            resList.appendChild(div);
        });
    }

    function openReservationsDrawer() {
        closeAllDrawers();
        renderReservationsDrawer();
        if (resDrawer) {
            resDrawer.classList.add('open');
            resDrawer.setAttribute('aria-hidden', 'false');
        }
        if (overlay) overlay.classList.add('active');
    }

    document.addEventListener('click', (e) => {
        // 1. Open Hamburger Menu
        if (e.target.closest('#menu-toggle-btn') || e.target.closest('button[aria-label="Menu"]')) {
            e.preventDefault();
            openMenuDrawer();
            return;
        }

        // 2. Open Reservations Drawer
        if (e.target.closest('#reservations-toggle-btn') || e.target.closest('button[aria-label="Reservations"]') || e.target.closest('button[aria-label="Activity"]')) {
            e.preventDefault();
            openReservationsDrawer();
            return;
        }

        // 3. Switch Menu Sub-Views (Settings, About, Contact, Help)
        const navLink = e.target.closest('.drawer-nav a');
        if (navLink && menuDrawer) {
            const targetHash = navLink.getAttribute('href');
            if (MENU_VIEWS[targetHash]) {
                e.preventDefault();
                menuDrawer.innerHTML = MENU_VIEWS[targetHash];
                return;
            }
        }

        // 4. Back Button inside Menu Sub-Views
        if (e.target.closest('.drawer-back-btn') && menuDrawer) {
            e.preventDefault();
            menuDrawer.innerHTML = defaultMenuHTML;
            return;
        }

        // 5. Close on ANY close button (×) or backdrop overlay click
        if (
            e.target.closest('.close-btn') ||
            e.target.closest('#close-menu-btn') ||
            e.target.closest('#close-reservations-btn') ||
            e.target.closest('#close-drawer-btn') ||
            e.target.id === 'drawer-overlay'
        ) {
            closeAllDrawers();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllDrawers();
    });
});