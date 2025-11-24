import './style.css'

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;

// Matrix Rain Configuration
const fontSize = 14;
const columns = [];
const drops = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    const colCount = Math.floor(width / fontSize);
    drops.length = colCount;
    for (let i = 0; i < colCount; i++) {
        drops[i] = Math.random() * -100; // Start above screen
    }
}

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Fade effect
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#0F0'; // Green text
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
        const text = String.fromCharCode(0x30A0 + Math.random() * 96); // Katakana characters
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }

    requestAnimationFrame(drawMatrix);
}

window.addEventListener('resize', resize);

// Init Matrix
resize();
drawMatrix();

// Typing Animation
const text = "compiledkernel-idk";
const typingElement = document.querySelector('.typing-text');
let charIndex = 0;

function type() {
    if (charIndex < text.length) {
        typingElement.textContent += text.charAt(charIndex);
        charIndex++;
        setTimeout(type, 100); // Typing speed
    } else {
        // Add glitch class after typing is done
        typingElement.classList.add('glitch');
        typingElement.setAttribute('data-text', text);
    }
}

// Start typing after a short delay
setTimeout(type, 500);

// Scroll Animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});
