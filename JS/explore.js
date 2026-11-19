document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.querySelector(".explore-grid");
    const searchInput = document.querySelector('.explore-search input[type="search"]');
    if (!grid) return;

    let allVenues = [];

    function renderGrid(venues) {
        grid.innerHTML = "";

        if (!venues || venues.length === 0) {
            grid.innerHTML = `<p style="grid-column: span 3; text-align: center; color: #a1a1aa; padding: 3rem;">No vibes matched your search. Try searching "rooftop", "jazz", or "cocktail"!</p>`;
            return;
        }

        venues.forEach(item => {
            const card = document.createElement("div");
            card.className = "venue-card";
            card.setAttribute("tabindex", "0");
            card.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.venueName}" loading="lazy" />
                <div class="venue-card-overlay">
                    <h4>${item.venueName}</h4>
                    <p>${item.vibe}</p>
                    <span style="font-size: 0.75rem; color: #22c55e; font-weight: 600;">${item.price}</span>
                </div>
            `;

            card.addEventListener("click", () => {
                if (window.openVenueModal) window.openVenueModal(item);
            });

            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (window.openVenueModal) window.openVenueModal(item);
                }
            });

            grid.appendChild(card);
        });
    }

    // Fetch live API / vibes.json data
    allVenues = window.fetchVenuesAPI ? await window.fetchVenuesAPI() : [];
    renderGrid(allVenues);

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtered = allVenues.filter(v =>
                (v.venueName && v.venueName.toLowerCase().includes(query)) ||
                (v.vibe && v.vibe.toLowerCase().includes(query)) ||
                (v.category && v.category.toLowerCase().includes(query)) ||
                (v.doorRules && v.doorRules.toLowerCase().includes(query))
            );
            renderGrid(filtered);
        });
    }
});