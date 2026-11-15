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