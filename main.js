import './style.css'

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let orbs = [];

class Orb {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 150 + 100;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.hue = Math.random() * 60 + 220; // Blue to purple range
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < -this.radius) this.x = width + this.radius;
        if (this.x > width + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = height + this.radius;
        if (this.y > height + this.radius) this.y = -this.radius;
    }

    draw() {
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );

        gradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, 0.1)`);
        gradient.addColorStop(0.5, `hsla(${this.hue}, 70%, 50%, 0.05)`);
        gradient.addColorStop(1, `hsla(${this.hue}, 70%, 40%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    orbs = [];
    const orbCount = Math.floor((width * height) / 80000);
    for (let i = 0; i < orbCount; i++) {
        orbs.push(new Orb());
    }
}

function animate() {
    ctx.fillStyle = 'rgba(10, 15, 28, 0.05)';
    ctx.fillRect(0, 0, width, height);

    orbs.forEach(orb => {
        orb.update();
        orb.draw();
    });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);

// Init
resize();
animate();

// Typing Animation
const text = "compiledkernel-idk";
const typingElement = document.querySelector('.typing-text');
let charIndex = 0;

function type() {
    if (charIndex < text.length) {
        typingElement.textContent += text.charAt(charIndex);
        charIndex++;
        setTimeout(type, 100);
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
