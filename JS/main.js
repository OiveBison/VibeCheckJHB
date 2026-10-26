document.addEventListener('DOMContentLoaded', () => {
  // Find the menu button in header (using aria-label="Menu" or an id)
  const menuBtn = document.querySelector('button[aria-label="Menu"]');
  const menuDrawer = document.getElementById('menu-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const closeBtn = document.getElementById('close-drawer-btn');

  function openMenu() {
    menuDrawer.classList.add('open');
    drawerOverlay.classList.add('active');
  }

  function closeMenu() {
    menuDrawer.classList.remove('open');
    drawerOverlay.classList.remove('active');
  }

  if (menuBtn) menuBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeMenu);
});