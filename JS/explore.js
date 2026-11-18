document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector(".explore-grid");
    const searchInput = document.querySelector('.explore-search input[type="search"]');
    if (!grid) return;

    const allVenues = [
        { id: "ig_1", venueName: "Alto234 Rooftop", vibe: "Rooftop & Sunset Views", price: "R400 - R800", doorRules: "Booking Essential | 18+", outfitRestrictions: "Elevated Smart Casual", imageUrl: "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=600", category: "rooftop" },
        { id: "ig_2", venueName: "Saint Rosebank", vibe: "Live DJ & Fine Dining", price: "R500 - R1200", doorRules: "Strict Door Policy | 21+", outfitRestrictions: "High Fashion / Formal", imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600", category: "dining" },
        { id: "ig_3", venueName: "The Marabi Club", vibe: "Live Jazz & Speakeasy", price: "R300 - R700", doorRules: "Reservations Only", outfitRestrictions: "Smart Casual / Vintage", imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600", category: "jazz" },
        { id: "ig_4", venueName: "Zioux Sandton", vibe: "High Energy & Cocktail Bar", price: "R450 - R900", doorRules: "21+ Nightlife Policy", outfitRestrictions: "Glam / Chic (No Caps or Shorts)", imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600", category: "cocktail" },
        { id: "ig_5", venueName: "Tiger's Milk Rosebank", vibe: "Live DJ & Cocktail Bar", price: "R150 - R350", doorRules: "Casual / Trendy", outfitRestrictions: "No beachwear", imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600", category: "bar" },
        { id: "ig_6", venueName: "News Cafe Oxford", vibe: "High Energy & Dining", price: "R200 - R450", doorRules: "Strictly 21+ after 8 PM", outfitRestrictions: "Smart casual required", imageUrl: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=600", category: "dining" }
    ];

    function renderGrid(venues) {
        grid.innerHTML = "";

        if (venues.length === 0) {
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
                if (window.openVenueModal) {
                    window.openVenueModal(item);
                }
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

    renderGrid(allVenues);

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtered = allVenues.filter(v =>
                v.venueName.toLowerCase().includes(query) ||
                v.vibe.toLowerCase().includes(query) ||
                v.category.toLowerCase().includes(query) ||
                v.doorRules.toLowerCase().includes(query)
            );
            renderGrid(filtered);
        });
    }
});
