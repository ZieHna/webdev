/* ==========================================================
   ClothCraft — splashpage.js
   Sections:
     1. DOM References
     2. Slideshow
     3. Side Navigation
     4. Header scroll effect
     5. Scroll-reveal (IntersectionObserver)
   ========================================================== */


/* ----------------------------------------------------------
   1. DOM REFERENCES
   ---------------------------------------------------------- */
const header         = document.getElementById('mainHeader');
const sidenav        = document.getElementById('sidenav');
const sidenavOverlay = document.getElementById('sidenavOverlay');

// Slideshow
const slides = document.querySelectorAll('.slide');
const dots   = document.querySelectorAll('.dot');

// All elements that animate in on scroll
const revealEls = document.querySelectorAll(
    '.video-container, .concept-text, .auth-text, .auth-video, .contact-info, .contact-form'
);


/* ----------------------------------------------------------
   2. SLIDESHOW
   Auto-advances every 4 s; clicking a dot resets the timer.
   ---------------------------------------------------------- */
let currentSlide = 0;
let slideInterval;

/** Activates the slide at [index] and syncs the dot indicators. */
function showSlide(index) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');

    currentSlide = index;

    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

/** Advances to the next slide, wrapping back to 0 at the end. */
function showNextSlide() {
    const next = (currentSlide + 1) % slides.length;
    showSlide(next);
}

/**
 * goToSlide — called by dot onclick attributes in the HTML.
 * Jumps to a specific slide and resets the auto-play timer
 * so it doesn't skip ahead immediately after a manual click.
 */
function goToSlide(index) {
    showSlide(index);
    clearInterval(slideInterval);
    slideInterval = setInterval(showNextSlide, 4000);
}

// Start auto-play
slideInterval = setInterval(showNextSlide, 4000);


/* ----------------------------------------------------------
   3. SIDE NAVIGATION
   ---------------------------------------------------------- */

/** Opens the slide-in side panel and dims the background. */
function showsidenav() {
    sidenav.classList.add('open');
    sidenavOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent background scroll
}

/** Closes the side panel and restores scrolling. */
function hidesidenav() {
    sidenav.classList.remove('open');
    sidenavOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Allow closing with the Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hidesidenav();
});


/* ----------------------------------------------------------
   4. HEADER SCROLL EFFECT
   Makes the header fully opaque once the user scrolls down.
   ---------------------------------------------------------- */
window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
        header.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
    } else {
        header.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
    }
}, { passive: true }); // passive: true = better scroll performance


/* ----------------------------------------------------------
   5. SCROLL-REVEAL  (IntersectionObserver)
   Replaces the old multiple scroll listeners with a single
   efficient observer.  Each element in revealEls starts
   off-screen (via CSS transform/opacity), and receives
   the .show class once 15% of it enters the viewport —
   triggering the transition defined in splash.css.
   ---------------------------------------------------------- */
const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                revealObserver.unobserve(entry.target); // reveal once, then stop watching
            }
        });
    },
    { threshold: 0.15 } // fire when 15% of the element is visible
);

revealEls.forEach((el) => revealObserver.observe(el));
