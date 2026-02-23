/**
 * PIXEL-SCRIPT INTERACTIVE LOGIC
 */

// 1. DYNAMIC BACKGROUND & GLOW TRACKER
const glowPoint = document.querySelector('.glow-point');
const gridOverlay = document.querySelector('.grid-overlay');

window.addEventListener('mousemove', (e) => {
    // Move the glow point with mouse position
    const x = e.clientX - 300; 
    const y = e.clientY - 300;
    
    // Using requestAnimationFrame for high-performance updates
    requestAnimationFrame(() => {
        if (glowPoint) {
            glowPoint.style.transform = `translate(${x}px, ${y}px)`;
        }
        // Subtle parallax effect on the grid
        if (gridOverlay) {
            gridOverlay.style.transform = `translate(${x * 0.02}px, ${y * 0.02}px)`;
        }
    });
});

// 2. 3D CUBE MOUSE TRACKING
const cube = document.querySelector('.pixel-cube');
const cubeContainer = document.querySelector('.hero-visual');

if (cubeContainer && cube) {
    cubeContainer.addEventListener('mousemove', (e) => {
        const { width, height, left, top } = cubeContainer.getBoundingClientRect();
        
        // Calculate rotation (Max 60 deg total swing)
        const xRotation = -((e.clientY - top) / height - 0.5) * 60; 
        const yRotation = ((e.clientX - left) / width - 0.5) * 60;

        cube.style.transform = `rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
    });

    // Smooth reset when mouse leaves
    cubeContainer.addEventListener('mouseleave', () => {
        cube.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        cube.style.transform = `rotateX(0deg) rotateY(0deg)`;
        
        setTimeout(() => {
            cube.style.transition = 'transform 0.1s ease-out';
        }, 800);
    });
}

// 3. GLOBAL SCROLL REVEAL ENGINE
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
        }
    });
}, { threshold: 0.1 });

// This looks for ANY element with a reveal class on ANY page
document.querySelectorAll('[class*="reveal-"]').forEach(el => {
    revealObserver.observe(el);
});

// 4. NAVBAR ENHANCEMENTS & ACTIVE LINK TRACKER
const navbar = document.querySelector('.navbar');
const sections = document.querySelectorAll('.snap-section');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    // Glass effect on scroll
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(15, 17, 26, 0.8)';
        navbar.style.borderBottom = '1px solid var(--accent-iris)';
        navbar.style.top = '10px'; // Slight lift-up effect
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.02)';
        navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        navbar.style.top = '20px';
    }

    // Active state tracker (Which section are we looking at?)
    let current = "";
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 100) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach((a) => {
        a.classList.remove("active");
        if (current && a.getAttribute("href").includes(current)) {
            a.classList.add("active");
        }
    });
});