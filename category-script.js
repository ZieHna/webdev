/* ============================================================
   CLOTHCRAFT — script.js
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    /* ── SIDE NAV ── */
    const sidenav        = document.getElementById("sidenav");
    const sidenavOverlay = document.getElementById("sidenavOverlay");

    window.showSidenav = function () {
        sidenav.classList.add("open");
        sidenavOverlay.classList.add("open");
        document.body.style.overflow = "hidden";
    };

    window.closeSidenav = function () {
        sidenav.classList.remove("open");
        sidenavOverlay.classList.remove("open");
        document.body.style.overflow = "";
    };

    /* ── HELPER: Build a carousel controller ── */
    function buildCarousel({ trackId, prevId, nextId, currentId, totalId, visibleCount }) {

        const track   = document.getElementById(trackId);
        const prevBtn = document.getElementById(prevId);
        const nextBtn = document.getElementById(nextId);
        const currentEl = document.getElementById(currentId);
        const totalEl   = document.getElementById(totalId);

        if (!track || !prevBtn || !nextBtn) return;

        const items = track.children;
        const total = items.length;
        let index   = 0;

        /* Update displayed counter */
        function updateCounter() {
            if (currentEl) currentEl.textContent = String(index + 1).padStart(2, "0");
            if (totalEl)   totalEl.textContent   = String(total).padStart(2, "0");
        }

        /* Slide the track */
        function slide() {
            if (items.length === 0) return;
            const itemWidth   = items[0].getBoundingClientRect().width;
            const gap         = parseFloat(getComputedStyle(track).gap) || 20;
            const offset      = index * (itemWidth + gap);
            track.style.transform = `translateX(-${offset}px)`;
            updateCounter();

            prevBtn.style.opacity = index === 0 ? "0.35" : "1";
            nextBtn.style.opacity = index >= total - visibleCount ? "0.35" : "1";
        }

        prevBtn.addEventListener("click", () => {
            if (index > 0) { index--; slide(); }
        });

        nextBtn.addEventListener("click", () => {
            if (index < total - visibleCount) { index++; slide(); }
        });

        /* Keyboard nav when focused */
        [prevBtn, nextBtn].forEach(btn => {
            btn.addEventListener("keydown", (e) => {
                if (e.key === "ArrowLeft")  { if (index > 0) { index--; slide(); } }
                if (e.key === "ArrowRight") { if (index < total - visibleCount) { index++; slide(); } }
            });
        });

        /* Touch / swipe support */
        let touchStartX = 0;
        track.addEventListener("touchstart", (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        track.addEventListener("touchend", (e) => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) < 30) return; // too short a swipe
            if (diff > 0 && index < total - visibleCount) { index++; slide(); }
            if (diff < 0 && index > 0)                    { index--; slide(); }
        }, { passive: true });

        /* Recalculate on resize */
        let resizeTimer;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(slide, 120);
        });

        /* Init */
        slide();
    }

    /* ── SHOWCASE CAROUSEL (Section 01) ── */
    buildCarousel({
        trackId:      "carousel",
        prevId:       "prevBtn",
        nextId:       "nextBtn",
        currentId:    "carouselCurrent",
        totalId:      "carouselTotal",
        visibleCount: 3,
    });

    /* ── STYLES CAROUSEL (Section 02) ── */
    buildCarousel({
        trackId:      "gridCarousel",
        prevId:       "gridPrev",
        nextId:       "gridNext",
        currentId:    "gridCurrent",
        totalId:      "gridTotal",
        visibleCount: 3,
    });

    /* ── SCROLL REVEAL ── */
    const revealEls = document.querySelectorAll(
        ".carousel-card, .style-card, .cta-strip, .section-label"
    );

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

        revealEls.forEach((el, i) => {
            el.style.opacity    = "0";
            el.style.transform  = "translateY(20px)";
            el.style.transition = `opacity 0.5s ease ${i * 0.04}s, transform 0.5s ease ${i * 0.04}s`;
            observer.observe(el);
        });
    }

});

/* ── Reveal class applied by IntersectionObserver ── */
document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement("style");
    style.textContent = `
        .revealed {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
});
