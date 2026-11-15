document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector(".marquee-track");
    const loader = document.getElementById("feedLoader");
    if (!track) return;

    gsap.registerPlugin(Observer);

    const INSTAGRAM_CONFIG = {
        accessToken: "YOUR_INSTAGRAM_GRAPH_API_ACCESS_TOKEN",
        fields: "id, caption, media_type, media_url, permalink, timestamp"
    };

    const venueVibeDatabase = {
        default: {
            vibe: "Rooftop & Chill",
            price: "R250 - R500",
            doorRules: "Smart Casual",
            outfitRestrictions: "No athletic vests, no flip-flops"
        },
        "tigers_milk": {
            vibe: "Live DJ & Cocktail Bar",
            price: "R150 - R350",
            doorRules: "Casual / Trendy",
            outfitRestrictions: "No beachwear"
        },
        "news_cafe": {
            vibe: "High Energy & Dining",
            price: "R200 - R450",
            doorRules: "Strictly 21+ after 8 PM",
            outfitRestrictions: "Smart casual required"
        }
    };

    async function fetchInstagramFeed() {
        try {
            const endpoint = `https://graph.instagram.com/me/media?fields=${INSTAGRAM_CONFIG.fields}&access_token=${INSTAGRAM_CONFIG.accessToken}`;
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error("API response error");
            const data = await response.json();
            return normalizeInstagramData(data.data);
        } catch (err) {
            console.warn("Instagram API fetch failed or missing token. Falling back to sample JHB data:", err);
            return getFallbackVenueData();
        }
    }

    function normalizeInstagramData(posts) {
        return posts.map(post => {
            const caption = post.caption || "";
            let meta = venueVibeDatabase.default;
            if (caption.toLowerCase().includes("tiger")) meta = venueVibeDatabase["tigers_milk"];
            if (caption.toLowerCase().includes("news")) meta = venueVibeDatabase["news_cafe"];
            return {
                id: post.id,
                imageUrl: post.media_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600",
                caption: caption,
                permalink: post.permalink,
                ...meta,
                venueName: "VibeCheck JHB Spot"
            };
        });
    }

    function getFallbackVenueData() {
        return [
            { id: "ig_1", venueName: "Alto234 Rooftop", vibe: "Rooftop & Sunset Views", price: "R400 - R800", doorRules: "Booking Essential | 18+", outfitRestrictions: "Elevated Smart Casual", imageUrl: "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=600", permalink: "#" },
            { id: "ig_2", venueName: "Saint Rosebank", vibe: "Live DJ & Fine Dining", price: "R500 - R1200", doorRules: "Strict Door Policy | 21+", outfitRestrictions: "High Fashion / Formal", imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600", permalink: "#" },
            { id: "ig_3", venueName: "The Marabi Club", vibe: "Live Jazz & Speakeasy", price: "R300 - R700", doorRules: "Reservations Only", outfitRestrictions: "Smart Casual / Vintage", imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600", permalink: "#" },
            { id: "ig_4", venueName: "Zioux Sandton", vibe: "High Energy & Cocktail Bar", price: "R450 - R900", doorRules: "21+ Nightlife Policy", outfitRestrictions: "Glam / Chic (No Caps or Shorts)", imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600", permalink: "#" }
        ];
    }

    function renderCards(venues) {
        track.innerHTML = "";
        const itemsToRender = [...venues, ...venues]; // Infinite loop duplication
        itemsToRender.forEach(item => {
            const article = document.createElement("article");
            article.className = "vibe-card";
            article.setAttribute("tabindex", "0"); // Accessibility: make cards focusable
            article.innerHTML = `
                <figure>
                    <img src="${item.imageUrl}" alt="${item.venueName || 'Venue image'}" loading="lazy" />
                    <span class="vibe-badge">${item.vibe}</span>
                </figure>
                <div class="vibe-card-content">
                    <div class="vibe-title-row">
                        <h3>${item.venueName || 'JHB Venue'}</h3>
                        <span class="price-range">${item.price}</span>
                    </div>
                    <div class="door-rules">
                        <p><strong>Rules:</strong> ${item.doorRules}</p>
                        <p><strong>Dress:</strong> <span>${item.outfitRestrictions}</span></p>
                    </div>
                </div>
            `;
            track.appendChild(article);
        });
        if (loader) loader.style.display = "none";
    }

    function initGSAPLoop() {
        const cards = gsap.utils.toArray(".vibe-card");
        if (!cards.length) return;
        
        const totalWidth = track.scrollWidth / 2;
        
        // Respect prefers-reduced-motion for accessibility
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) return;

        const loop = gsap.to(track, {
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

        Observer.create({
            target: track,
            type: "pointer, touch, wheel",
            onPress: () => loop.pause(),
            onRelease: () => loop.play(),
            onChangeX: (self) => {
                const currentX = gsap.getProperty(track, "x");
                gsap.set(track, { x: currentX + self.deltaX });
            },
            onChangeY: (self) => {
                // Allows vertical mouse wheel to scroll the horizontal track smoothly
                const currentX = gsap.getProperty(track, "x");
                gsap.set(track, { x: currentX - self.deltaY });
            }
        });
    }

    async function init() {
        const data = await fetchInstagramFeed();
        renderCards(data);
        initGSAPLoop();
    }

    init();
});