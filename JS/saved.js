document.addEventListener("DOMContentLoaded", () => {
    const savedContainer = document.querySelector(".saved-list");
    if (!savedContainer) return;

    function renderSavedVenues() {
        const savedVenues = window.VibeStorage ? window.VibeStorage.getSaved() : [];
        savedContainer.innerHTML = "";

        if (!savedVenues || savedVenues.length === 0) {
            savedContainer.innerHTML = `
                <div class="empty-saved-state" style="text-align: center; padding: 4rem 2rem; background: rgba(24, 24, 27, 0.55); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; width: 100%; max-width: 520px;">
                    <h3 style="color: #fff; font-size: 1.4rem; margin-bottom: 0.5rem;">No vibes saved yet?</h3>
                    <p style="color: #a1a1aa; font-size: 0.95rem; margin-bottom: 1.5rem;">Save Johannesburg's hottest rooftops, lounges, and dinner spots to plan your night out.</p>
                    <a href="explore.html" style="display: inline-block; padding: 0.75rem 1.5rem; background: #22c55e; color: #09090b; font-weight: 700; border-radius: 12px; text-decoration: none;">Explore JHB Vibes</a>
                </div>
            `;
            return;
        }

        savedVenues.forEach(venue => {
            const isReserved = window.VibeStorage.getReservations().some(r => r.id === venue.id);
            const card = document.createElement("article");
            card.className = "saved-card";
            card.style.backgroundImage = `url('${venue.imageUrl}')`;
            card.style.backgroundSize = "cover";
            card.style.backgroundPosition = "center";

            card.innerHTML = `
                <div class="saved-info">
                    <span style="display:inline-block; background:rgba(0,0,0,0.7); backdrop-filter:blur(6px); padding:4px 10px; border-radius:12px; font-size:0.75rem; color:#22c55e; font-weight:600; margin-bottom:0.5rem;">${venue.vibe || 'JHB Spot'}</span>
                    <h3>${venue.venueName}</h3>
                    <p>${venue.price || 'R250 - R500'} • ${venue.doorRules || 'Smart Casual'}</p>
                </div>
                <div class="card-actions" style="display: flex; gap: 0.5rem;">
                    <button class="reserve-btn" style="flex: 1; background: ${isReserved ? '#22c55e' : 'rgba(34, 197, 94, 0.2)'}; color: ${isReserved ? '#09090b' : '#22c55e'}; border: 1px solid #22c55e; padding: 0.6rem; border-radius: 8px; font-size: 0.85rem; font-weight: 700; cursor: pointer;">
                        ${isReserved ? '✓ Reserved' : 'Reserve Vibe'}
                    </button>
                    <button class="remove-btn" style="flex: 1;" aria-label="Remove ${venue.venueName}">Remove</button>
                </div>
            `;

            // Book / Reserve button -> Adds to Heart Icon Drawer
            const reserveBtn = card.querySelector(".reserve-btn");
            reserveBtn.addEventListener("click", () => {
                window.VibeStorage.addReservation(venue);
                reserveBtn.textContent = "✓ Reserved";
                reserveBtn.style.background = "#22c55e";
                reserveBtn.style.color = "#09090b";
            });

            // Remove from Saved button
            const removeBtn = card.querySelector(".remove-btn");
            removeBtn.addEventListener("click", () => {
                window.VibeStorage.removeSave(venue.id);
                renderSavedVenues();
            });

            savedContainer.appendChild(card);
        });
    }

    renderSavedVenues();
});