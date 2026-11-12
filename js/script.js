// Portfolio interactions: mobile navigation, project filters, scroll effects.
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

function closeMenu() {
    if (!menuToggle || !navLinks) return;
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
}

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const opening = menuToggle.getAttribute("aria-expanded") !== "true";
        navLinks.classList.toggle("open", opening);
        menuToggle.setAttribute("aria-expanded", String(opening));
        menuToggle.setAttribute("aria-label", opening ? "Close navigation menu" : "Open navigation menu");
    });

    navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("click", (event) => {
        if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
            menuToggle.focus();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 680) closeMenu();
    });
}

// Project category filters.
const filterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card[data-category]");

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const filter = button.dataset.filter;

        filterButtons.forEach((item) => {
            const selected = item === button;
            item.classList.toggle("active", selected);
            item.setAttribute("aria-pressed", String(selected));
        });

        projectCards.forEach((card) => {
            const categories = (card.dataset.category || "").split(" ");
            const show = filter === "all" || categories.includes(filter);
            card.classList.toggle("is-hidden", !show);
        });
    });
});

// Reveal sections as they enter the viewport; respect reduced-motion preference.
const revealItems = document.querySelectorAll(".reveal");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealItems.forEach((item) => revealObserver.observe(item));
} else {
    revealItems.forEach((item) => item.classList.add("visible"));
}

// Header polish: compact the sticky header and show reading progress.
const siteHeader = document.querySelector(".site-header");
let scrollTicking = false;
const updateHeaderState = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    if (siteHeader) {
        siteHeader.classList.toggle("scrolled", window.scrollY > 24);
        siteHeader.style.setProperty("--scroll-progress", String(Math.min(1, Math.max(0, progress))));
    }
    scrollTicking = false;
};
window.addEventListener("scroll", () => {
    if (!scrollTicking) {
        window.requestAnimationFrame(updateHeaderState);
        scrollTicking = true;
    }
}, { passive: true });
updateHeaderState();

// Subtle pointer-following highlight on desktop cards (no effect on touch screens).
const glowCards = document.querySelectorAll(".skill-group, .project-card, .about-highlight, .connect-card, .additional-project");
glowCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch") return;
        const bounds = card.getBoundingClientRect();
        card.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
        card.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
    });
});

// Highlight the current section in the navigation.
const sections = [...document.querySelectorAll("main section[id]")];
const navItems = [...document.querySelectorAll(".nav-link[href^='#']")];

function setActiveNavigation() {
    const marker = Math.min(window.innerHeight * 0.38, 300);
    let current = sections[0];
    sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= marker) current = section;
    });
    navItems.forEach((link) => {
        const active = link.getAttribute("href") === `#${current?.id}`;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
    });
}

let navTicking = false;
window.addEventListener("scroll", () => {
    if (navTicking) return;
    window.requestAnimationFrame(() => {
        setActiveNavigation();
        navTicking = false;
    });
    navTicking = true;
}, { passive: true });
window.addEventListener("resize", setActiveNavigation);
setActiveNavigation();

// Back-to-top control and footer year.
const backToTop = document.querySelector(".back-to-top");
if (backToTop) {
    const updateBackToTop = () => backToTop.classList.toggle("visible", window.scrollY > 500);
    window.addEventListener("scroll", updateBackToTop, { passive: true });
    updateBackToTop();
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
}

const currentYear = document.getElementById("current-year");
if (currentYear) currentYear.textContent = new Date().getFullYear();
