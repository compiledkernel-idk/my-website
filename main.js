import './style.css'

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let orbs = [];
let mouse = { x: 0, y: 0 };

class Orb {
    constructor() {
        this.reset();
        this.targetX = this.x;
        this.targetY = this.y;
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.targetX = this.x;
        this.targetY = this.y;
        this.radius = Math.random() * 200 + 150;
        this.baseVx = (Math.random() - 0.5) * 0.3;
        this.baseVy = (Math.random() - 0.5) * 0.3;
        this.vx = this.baseVx;
        this.vy = this.baseVy;
        this.hue = Math.random() * 60 + 220; // Blue to purple range
        this.opacity = Math.random() * 0.15 + 0.05;
    }

    update() {
        // Mouse interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 300) {
            const force = (300 - distance) / 300;
            this.vx -= (dx / distance) * force * 0.5;
            this.vy -= (dy / distance) * force * 0.5;
        }

        // Gradual return to base velocity
        this.vx += (this.baseVx - this.vx) * 0.05;
        this.vy += (this.baseVy - this.vy) * 0.05;

        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen
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

        gradient.addColorStop(0, `hsla(${this.hue}, 80%, 65%, ${this.opacity * 0.8})`);
        gradient.addColorStop(0.4, `hsla(${this.hue}, 75%, 55%, ${this.opacity * 0.4})`);
        gradient.addColorStop(1, `hsla(${this.hue}, 70%, 45%, 0)`);

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
    const orbCount = Math.max(5, Math.floor((width * height) / 60000));
    for (let i = 0; i < orbCount; i++) {
        orbs.push(new Orb());
    }
}

function animate() {
    ctx.fillStyle = 'rgba(10, 15, 28, 0.08)';
    ctx.fillRect(0, 0, width, height);

    orbs.forEach(orb => {
        orb.update();
        orb.draw();
    });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

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
