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

//  Shared venue detail card (Center Preview)

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
        const modal = document.getElementById('venue-detail-modal');
        if (modal) modal.classList.remove('active');
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
        if (e.target.closest('#menu-toggle-btn') || e.target.closest('button[aria-label="Menu"]')) {
            e.preventDefault();
            openMenuDrawer();
            return;
        }

        if (e.target.closest('#reservations-toggle-btn') || e.target.closest('button[aria-label="Reservations"]') || e.target.closest('button[aria-label="Activity"]')) {
            e.preventDefault();
            openReservationsDrawer();
            return;
        }

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

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllDrawers();
    });
});