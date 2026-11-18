document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector(".marquee-track");
    const loader = document.getElementById("feedLoader");
    if (!track) return;

    if (typeof gsap !== "undefined" && typeof Observer !== "undefined") {
        gsap.registerPlugin(Observer);
    }

    const venueMap = new Map();

    function getFallbackVenueData() {
        return [
            { id: "ig_1", venueName: "Alto234 Rooftop", vibe: "Rooftop & Sunset Views", price: "R400 - R800", doorRules: "Booking Essential | 18+", outfitRestrictions: "Elevated Smart Casual", imageUrl: "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=600" },
            { id: "ig_2", venueName: "Saint Rosebank", vibe: "Live DJ & Fine Dining", price: "R500 - R1200", doorRules: "Strict Door Policy | 21+", outfitRestrictions: "High Fashion / Formal", imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600" },
            { id: "ig_3", venueName: "The Marabi Club", vibe: "Live Jazz & Speakeasy", price: "R300 - R700", doorRules: "Reservations Only", outfitRestrictions: "Smart Casual / Vintage", imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600" },
            { id: "ig_4", venueName: "Zioux Sandton", vibe: "High Energy & Cocktail Bar", price: "R450 - R900", doorRules: "21+ Nightlife Policy", outfitRestrictions: "Glam / Chic (No Caps or Shorts)", imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600" }
        ];
    }

    function renderCards(venues) {
        track.innerHTML = "";
        venueMap.clear();
        venues.forEach(v => venueMap.set(v.id, v));

        const itemsToRender = [...venues, ...venues];
        itemsToRender.forEach(item => {
            const article = document.createElement("article");
            article.className = "vibe-card";
            article.dataset.venueId = item.id;
            article.setAttribute("tabindex", "0");
            article.style.cursor = "pointer";
            article.innerHTML = `
                <figure>
                    <img src="${item.imageUrl}" alt="${item.venueName}" loading="lazy" />
                    <span class="vibe-badge">${item.vibe}</span>
                </figure>
                <div class="vibe-card-content">
                    <div class="vibe-title-row">
                        <h3>${item.venueName}</h3>
                        <span class="price-range">${item.price}</span>
                    </div>
                    <div class="door-rules">
                        <p><strong>Rules:</strong> ${item.doorRules}</p>
                        <p><strong>Dress:</strong> <span>${item.outfitRestrictions}</span></p>
                    </div>
                </div>
            `;

            article.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (window.openVenueModal) window.openVenueModal(item);
                }
            });

            track.appendChild(article);
        });

        if (loader) loader.style.display = "none";
    }

    function initGSAPLoop() {
        const cards = gsap.utils.toArray(".vibe-card");
        if (!cards.length || typeof gsap === "undefined") return;

        const totalWidth = track.scrollWidth / 2;
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let loop = null;
        if (!prefersReducedMotion) {
            loop = gsap.to(track, {
                x: `-=${totalWidth}`,
                duration: 30,
                ease: "none",
                repeat: -1,
                modifiers: {
                    x: gsap.utils.unitize(x => parseFloat(x) % totalWidth)
                }
            });

            track.addEventListener("mouseenter", () => loop.pause());
            track.addEventListener("mouseleave", () => loop.play());
        }

        if (typeof Observer !== "undefined") {
            Observer.create({
                target: track,
                type: "pointer, touch, wheel",
                onPress: () => { if (loop) loop.pause(); },
                onRelease: () => { if (loop) loop.play(); },
                onClick: (self) => {
                    const clickedCard = self.event.target.closest(".vibe-card");
                    if (clickedCard && window.openVenueModal) {
                        const venue = venueMap.get(clickedCard.dataset.venueId);
                        if (venue) window.openVenueModal(venue);
                    }
                },
                onChangeX: (self) => {
                    const currentX = gsap.getProperty(track, "x");
                    gsap.set(track, { x: currentX + self.deltaX });
                },
                onChangeY: (self) => {
                    const currentX = gsap.getProperty(track, "x");
                    gsap.set(track, { x: currentX - self.deltaY });
                }
            });
        }
    }

    const venues = getFallbackVenueData();
    renderCards(venues);
    initGSAPLoop();
});