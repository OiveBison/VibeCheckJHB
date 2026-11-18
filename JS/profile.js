document.addEventListener("DOMContentLoaded", () => {
    const savedCountEl = document.getElementById("saved-vibes-count");
    if (savedCountEl && window.VibeStorage) {
        const saved = window.VibeStorage.getSaved();
        savedCountEl.textContent = saved.length;
    }
});