document.addEventListener("DOMContentLoaded", () => {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
    const closeMobileMenuBtn = document.getElementById('close-mobile-menu');

    if (!mobileMenuBtn || !mobileMenuOverlay || !mobileMenuDrawer || !closeMobileMenuBtn) {
        // Fallback to find by class if id not present
        const menuIcon = Array.from(document.querySelectorAll('.material-symbols-outlined')).find(el => el.textContent.trim() === 'menu');
        if (menuIcon && menuIcon.parentElement) {
            menuIcon.parentElement.id = 'mobile-menu-btn';
            // Need to re-fetch
            const newBtn = document.getElementById('mobile-menu-btn');
            if (newBtn && mobileMenuOverlay && mobileMenuDrawer) {
                setupMenu(newBtn, mobileMenuOverlay, mobileMenuDrawer, closeMobileMenuBtn);
            }
        }
        return;
    }

    setupMenu(mobileMenuBtn, mobileMenuOverlay, mobileMenuDrawer, closeMobileMenuBtn);
});

function setupMenu(openBtn, overlay, drawer, closeBtn) {
    const openMenu = () => {
        overlay.classList.remove('hidden');
        // Small delay to allow display:block to apply before animating opacity
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            drawer.classList.remove('-translate-x-full');
            drawer.style.transform = 'translateX(0)';
        }, 10);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    const closeMenu = () => {
        overlay.classList.add('opacity-0');
        drawer.classList.add('-translate-x-full');
        drawer.style.transform = '';
        setTimeout(() => {
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300); // Wait for transition
    };

    openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openMenu();
    });

    closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
}
