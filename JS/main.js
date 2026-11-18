//  Menu Drawer/sidebar
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.querySelector('button[aria-label="Menu"]');
    const menuDrawer = document.getElementById('sidebarNav'); // Updated to match your sidebar ID
    const drawerOverlay = document.getElementById('drawer-overlay');
    
    if (!menuBtn) return;

    function toggleMenu() {
        menuDrawer?.classList.toggle('open');
        drawerOverlay?.classList.toggle('active');
    }

    menuBtn.addEventListener('click', toggleMenu);
    if (drawerOverlay) {
        drawerOverlay.addEventListener('click', toggleMenu);
    }
});
// --- SHARED STORAGE ENGINE: Saved Vibes & Reservations ---
window.VibeStorage = {
    SAVED_KEY: 'vibecheck_saved_venues',
    RES_KEY: 'vibecheck_reservations',

    // --- Saved Venues (For saved.html) ---
    getSaved() {
        try { return JSON.parse(localStorage.getItem(this.SAVED_KEY)) || []; }
        catch { return []; }
    },
    isSaved(id) {
        return this.getSaved().some(v => v.id === id);
    },
    toggleSave(venue) {
        let saved = this.getSaved();
        const exists = saved.some(v => v.id === venue.id);
        saved = exists ? saved.filter(v => v.id !== venue.id) : [...saved, venue];
        localStorage.setItem(this.SAVED_KEY, JSON.stringify(saved));
        return !exists;
    },
    removeSave(id) {
        const saved = this.getSaved().filter(v => v.id !== id);
        localStorage.setItem(this.SAVED_KEY, JSON.stringify(saved));
    },

    // --- Reservations (For Heart Icon Drawer) ---
    getReservations() {
        try { return JSON.parse(localStorage.getItem(this.RES_KEY)) || []; }
        catch { return []; }
    },
    addReservation(venue) {
        const current = this.getReservations();
        if (!current.some(r => r.id === venue.id)) {
            current.push({
                ...venue,
                bookedDate: venue.bookedDate || "This Weekend • 8:00 PM"
            });
            localStorage.setItem(this.RES_KEY, JSON.stringify(current));
        }
    },
    removeReservation(id) {
        const updated = this.getReservations().filter(r => r.id !== id);
        localStorage.setItem(this.RES_KEY, JSON.stringify(updated));
    }
};

// --- SHARED UI: Hamburger Menu & Heart Reservations Drawers ---
// --- SHARED UI: Bulletproof Hamburger Menu & Heart Reservations Drawers ---
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('drawer-overlay');
    const menuDrawer = document.getElementById('menu-drawer');
    const resDrawer = document.getElementById('reservations-drawer');
    const resList = document.getElementById('reservations-list');

    function closeAllDrawers() {
        document.querySelectorAll('.menu-drawer').forEach(drawer => {
            drawer.classList.remove('open');
            drawer.setAttribute('aria-hidden', 'true');
        });
        if (overlay) overlay.classList.remove('active');
    }

    function openMenuDrawer() {
        closeAllDrawers();
        if (menuDrawer) {
            menuDrawer.classList.add('open');
            menuDrawer.setAttribute('aria-hidden', 'false');
        }
        if (overlay) overlay.classList.add('active');
    }

    function renderReservationsDrawer() {
        if (!resList) return;
        const reservations = window.VibeStorage ? window.VibeStorage.getReservations() : [];
        resList.innerHTML = '';

        if (reservations.length === 0) {
            resList.innerHTML = `
                <div style="text-align: center; padding: 3rem 1rem; color: #a1a1aa;">
                    <p style="font-size: 1.05rem; color: #fff; font-weight: 600; margin-bottom: 0.4rem;">No reservations made yet</p>
                    <p style="font-size: 0.85rem; line-height: 1.5;">You haven't reserved any vibes yet. Book a table from your Saved venues or Explore page!</p>
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
                <button type="button" class="cancel-res-btn" data-id="${item.id}">Cancel Reservation</button>
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

    // Global delegated click listener so close buttons & overlay NEVER get stuck
    document.addEventListener('click', (e) => {
        // Open Menu
        if (e.target.closest('#menu-toggle-btn') || e.target.closest('button[aria-label="Menu"]')) {
            e.preventDefault();
            openMenuDrawer();
            return;
        }

        // Open Reservations
        if (e.target.closest('#reservations-toggle-btn') || e.target.closest('button[aria-label="Reservations"]') || e.target.closest('button[aria-label="Activity"]')) {
            e.preventDefault();
            openReservationsDrawer();
            return;
        }

        // Close on ANY close button (×), overlay click, or drawer nav link click
        if (
            e.target.closest('.close-btn') ||
            e.target.closest('#close-menu-btn') ||
            e.target.closest('#close-reservations-btn') ||
            e.target.closest('#close-drawer-btn') ||
            e.target.id === 'drawer-overlay' ||
            e.target.closest('.drawer-nav a')
        ) {
            closeAllDrawers();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllDrawers();
    });
});