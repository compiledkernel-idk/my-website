import './style.css'

// =====================================================
// EXTREME VISUAL EFFECTS ENGINE
// Particles, Lightning, Aurora, Mouse Trails, and more
// =====================================================

const canvas = document.getElementById('bg-canvas');
if (!canvas) throw new Error("Canvas not found");
const ctx = canvas.getContext('2d');

let width, height;
let orbs = [];
let particles = [];
let lightningBolts = [];
let mousePath = [];
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, isMoving: false };
let lastMouseMove = 0;

// Color palette
const colors = {
    cyan: { r: 0, g: 240, b: 255 },
    blue: { r: 0, g: 102, b: 255 },
    purple: { r: 157, g: 0, b: 255 },
    pink: { r: 255, g: 0, b: 170 },
    green: { r: 0, g: 255, b: 136 }
};

// =====================================================
// ORB CLASS - Massive glowing energy spheres
// =====================================================
class Orb {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 300 + 200;
        this.baseVx = (Math.random() - 0.5) * 0.3;
        this.baseVy = (Math.random() - 0.5) * 0.3;
        this.vx = this.baseVx;
        this.vy = this.baseVy;

        // Random color selection
        const colorKeys = Object.keys(colors);
        const selectedColor = colors[colorKeys[Math.floor(Math.random() * colorKeys.length)]];
        this.color = selectedColor;

        this.opacity = Math.random() * 0.15 + 0.08;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulseOffset = Math.random() * Math.PI * 2;
        this.breathe = 0;
    }

    update() {
        // Breathing/pulsing effect
        this.breathe = Math.sin(Date.now() * this.pulseSpeed + this.pulseOffset) * 0.2 + 1;

        // Mouse interaction - attract slightly then repel
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 400 && mouse.isMoving) {
            const force = (400 - distance) / 400;
            this.vx -= (dx / distance) * force * 0.8;
            this.vy -= (dy / distance) * force * 0.8;
        }

        // Return to base velocity
        this.vx += (this.baseVx - this.vx) * 0.03;
        this.vy += (this.baseVy - this.vy) * 0.03;

        this.x += this.vx;
        this.y += this.vy;

        // Wrap around
        if (this.x < -this.radius * 2) this.x = width + this.radius;
        if (this.x > width + this.radius * 2) this.x = -this.radius;
        if (this.y < -this.radius * 2) this.y = height + this.radius;
        if (this.y > height + this.radius * 2) this.y = -this.radius;
    }

    draw() {
        const currentRadius = this.radius * this.breathe;
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, currentRadius
        );

        const { r, g, b } = this.color;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${this.opacity * 0.8})`);
        gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${this.opacity * 0.4})`);
        gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${this.opacity * 0.1})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// =====================================================
// PARTICLE CLASS - Floating energy motes
// =====================================================
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = -Math.random() * 0.5 - 0.2;
        this.opacity = Math.random() * 0.8 + 0.2;
        this.color = Object.values(colors)[Math.floor(Math.random() * 5)];
        this.twinkleSpeed = Math.random() * 0.1 + 0.05;
        this.twinkleOffset = Math.random() * Math.PI * 2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Twinkle effect
        this.currentOpacity = this.opacity * (Math.sin(Date.now() * this.twinkleSpeed + this.twinkleOffset) * 0.5 + 0.5);

        // Reset when out of bounds
        if (this.y < -10 || this.x < -10 || this.x > width + 10) {
            this.x = Math.random() * width;
            this.y = height + 10;
        }
    }

    draw() {
        const { r, g, b } = this.color;

        // Glowing core
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${this.currentOpacity})`;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.currentOpacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core
        ctx.fillStyle = `rgba(255, 255, 255, ${this.currentOpacity * 0.5})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
    }
}

// =====================================================
// LIGHTNING CLASS - Electric discharge effects
// =====================================================
class Lightning {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.segments = [];
        this.life = 1;
        this.decay = Math.random() * 0.03 + 0.02;
        this.generateSegments();
    }

    generateSegments() {
        this.segments = [];
        const dx = this.x2 - this.x1;
        const dy = this.y2 - this.y1;
        const segmentCount = Math.floor(Math.random() * 5 + 8);

        let x = this.x1;
        let y = this.y1;

        for (let i = 0; i < segmentCount; i++) {
            const progress = (i + 1) / segmentCount;
            const targetX = this.x1 + dx * progress;
            const targetY = this.y1 + dy * progress;

            const offsetX = (Math.random() - 0.5) * 40 * (1 - progress);
            const offsetY = (Math.random() - 0.5) * 40 * (1 - progress);

            this.segments.push({
                x1: x,
                y1: y,
                x2: targetX + offsetX,
                y2: targetY + offsetY
            });

            x = targetX + offsetX;
            y = targetY + offsetY;
        }
    }

    update() {
        this.life -= this.decay;
        if (Math.random() < 0.3) {
            this.generateSegments(); // Flicker effect
        }
        return this.life > 0;
    }

    draw() {
        ctx.strokeStyle = `rgba(0, 240, 255, ${this.life})`;
        ctx.lineWidth = 2 * this.life;
        ctx.shadowBlur = 20;
        ctx.shadowColor = `rgba(0, 240, 255, ${this.life})`;

        ctx.beginPath();
        this.segments.forEach(seg => {
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
        });
        ctx.stroke();

        // Bright core
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.life * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.shadowBlur = 0;
    }
}

// =====================================================
// MOUSE TRAIL EFFECT
// =====================================================
class TrailPoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 1;
        this.decay = 0.02;
        this.size = 8;
    }

    update() {
        this.life -= this.decay;
        this.size *= 0.98;
        return this.life > 0;
    }

    draw() {
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * this.life * 3
        );

        gradient.addColorStop(0, `rgba(0, 240, 255, ${this.life * 0.8})`);
        gradient.addColorStop(0.5, `rgba(157, 0, 255, ${this.life * 0.3})`);
        gradient.addColorStop(1, `rgba(255, 0, 170, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life * 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// =====================================================
// GRID OVERLAY - Cyberpunk aesthetic
// =====================================================
function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
    ctx.lineWidth = 1;

    const gridSize = 100;
    const time = Date.now() * 0.0002;

    // Horizontal lines
    for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + Math.sin(time + y * 0.01) * 5);
        ctx.lineTo(width, y + Math.sin(time + y * 0.01 + 1) * 5);
        ctx.stroke();
    }

    // Vertical lines
    for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x + Math.sin(time + x * 0.01) * 5, 0);
        ctx.lineTo(x + Math.sin(time + x * 0.01 + 1) * 5, height);
        ctx.stroke();
    }
}

// =====================================================
// INITIALIZATION
// =====================================================
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    // Create orbs
    orbs = [];
    const orbCount = Math.max(6, Math.floor((width * height) / 80000));
    for (let i = 0; i < orbCount; i++) {
        orbs.push(new Orb());
    }

    // Create particles
    particles = [];
    const particleCount = Math.max(30, Math.floor((width * height) / 15000));
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

// =====================================================
// ANIMATION LOOP
// =====================================================
function animate() {
    // Dark fade effect for motion blur
    ctx.fillStyle = 'rgba(5, 5, 16, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    drawGrid();

    // Update and draw orbs
    orbs.forEach(orb => {
        orb.update();
        orb.draw();
    });

    // Update and draw particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Update and draw lightning
    lightningBolts = lightningBolts.filter(bolt => {
        const alive = bolt.update();
        if (alive) bolt.draw();
        return alive;
    });

    // Update and draw mouse trail
    mousePath = mousePath.filter(point => {
        const alive = point.update();
        if (alive) point.draw();
        return alive;
    });

    // Spawn random lightning occasionally
    if (Math.random() < 0.002) {
        const x1 = Math.random() * width;
        const y1 = 0;
        const x2 = x1 + (Math.random() - 0.5) * 300;
        const y2 = Math.random() * height * 0.5;
        lightningBolts.push(new Lightning(x1, y1, x2, y2));
    }

    // Mouse idle check
    if (Date.now() - lastMouseMove > 100) {
        mouse.isMoving = false;
    }

    requestAnimationFrame(animate);
}

// =====================================================
// EVENT LISTENERS
// =====================================================
window.addEventListener('resize', resize);

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.isMoving = true;
    lastMouseMove = Date.now();

    // Add trail point
    if (Math.random() < 0.5) {
        mousePath.push(new TrailPoint(e.clientX, e.clientY));
    }
});

// Click creates lightning burst
window.addEventListener('click', (e) => {
    for (let i = 0; i < 3; i++) {
        const angle = (Math.PI * 2 / 3) * i + Math.random() * 0.5;
        const distance = Math.random() * 150 + 100;
        const x2 = e.clientX + Math.cos(angle) * distance;
        const y2 = e.clientY + Math.sin(angle) * distance;
        lightningBolts.push(new Lightning(e.clientX, e.clientY, x2, y2));
    }
});

// =====================================================
// INITIALIZATION
// =====================================================
resize();
animate();

// =====================================================
// TYPING ANIMATION - Enhanced
// =====================================================
const text = "compiledkernel-idk";
const typingElement = document.querySelector('.typing-text');
let charIndex = 0;

function type() {
    if (charIndex < text.length) {
        typingElement.textContent += text.charAt(charIndex);
        typingElement.setAttribute('data-text', typingElement.textContent); // For glitch effect
        charIndex++;

        // Random slight delay variation for more natural typing
        const delay = Math.random() * 50 + 80;
        setTimeout(type, delay);
    } else {
        // After typing complete, set the full text for glitch effect
        typingElement.setAttribute('data-text', text);
    }
}

if (typingElement) {
    setTimeout(type, 800);
}

// =====================================================
// SCROLL ANIMATIONS - Enhanced with parallax
// =====================================================
const observerOptions = {
    root: null,
    rootMargin: '-50px',
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5]
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Parallax effect on scroll
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroSection = document.getElementById('hero');

    if (heroSection) {
        const heroElements = heroSection.querySelectorAll('h1, .subtitle, .scroll-indicator');
        heroElements.forEach((el, i) => {
            el.style.transform = `translateY(${scrolled * (0.2 + i * 0.1)}px)`;
        });
    }
});

// =====================================================
// CARD TILT EFFECT - 3D hover
// =====================================================
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        card.style.transform = `
            perspective(1000px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            translateY(-15px)
            scale(1.02)
        `;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// =====================================================
// FLOATING PARTICLES IN DOM (for extra layer)
// =====================================================
function createFloatingParticles() {
    const container = document.createElement('div');
    container.className = 'floating-particles';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
    `;
    document.body.appendChild(container);

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: #00f0ff;
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: floatUp ${Math.random() * 10 + 15}s linear infinite;
            animation-delay: ${Math.random() * -20}s;
            opacity: ${Math.random() * 0.5 + 0.3};
            box-shadow: 0 0 10px #00f0ff, 0 0 20px #00f0ff;
        `;
        container.appendChild(particle);
    }

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            0% {
                transform: translateY(100vh) rotate(0deg);
                opacity: 0;
            }
            10% { opacity: 0.5; }
            90% { opacity: 0.5; }
            100% {
                transform: translateY(-100vh) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

createFloatingParticles();

// =====================================================
// GEOMETRIC SHAPES LAYER
// =====================================================
function createGeometricShapes() {
    const container = document.createElement('div');
    container.className = 'geo-layer';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
    `;
    document.body.appendChild(container);

    const shapes = [
        { size: 100, top: '10%', left: '5%', delay: 0 },
        { size: 150, top: '60%', right: '10%', delay: 5 },
        { size: 80, bottom: '20%', left: '15%', delay: 10 },
        { size: 120, top: '30%', right: '5%', delay: 15 },
        { size: 60, bottom: '40%', left: '80%', delay: 20 }
    ];

    shapes.forEach((config, i) => {
        const shape = document.createElement('div');
        const isTriangle = i % 3 === 0;

        if (isTriangle) {
            shape.style.cssText = `
                position: absolute;
                width: 0;
                height: 0;
                border-left: ${config.size / 2}px solid transparent;
                border-right: ${config.size / 2}px solid transparent;
                border-bottom: ${config.size}px solid rgba(0, 240, 255, 0.05);
                ${config.top ? `top: ${config.top};` : ''}
                ${config.bottom ? `bottom: ${config.bottom};` : ''}
                ${config.left ? `left: ${config.left};` : ''}
                ${config.right ? `right: ${config.right};` : ''}
                animation: shapeFloat ${25 + i * 5}s ease-in-out infinite;
                animation-delay: ${-config.delay}s;
                filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.3));
            `;
        } else {
            shape.style.cssText = `
                position: absolute;
                width: ${config.size}px;
                height: ${config.size}px;
                border: 1px solid rgba(0, 240, 255, 0.1);
                background: rgba(0, 240, 255, 0.02);
                ${i % 2 === 0 ? '' : 'border-radius: 50%;'}
                ${config.top ? `top: ${config.top};` : ''}
                ${config.bottom ? `bottom: ${config.bottom};` : ''}
                ${config.left ? `left: ${config.left};` : ''}
                ${config.right ? `right: ${config.right};` : ''}
                animation: shapeFloat ${25 + i * 5}s ease-in-out infinite;
                animation-delay: ${-config.delay}s;
                box-shadow: 0 0 30px rgba(0, 240, 255, 0.05);
            `;
        }
        container.appendChild(shape);
    });

    // Add keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shapeFloat {
            0%, 100% {
                transform: rotate(0deg) translateY(0) scale(1);
                opacity: 0.3;
            }
            25% {
                transform: rotate(90deg) translateY(-30px) scale(1.1);
                opacity: 0.5;
            }
            50% {
                transform: rotate(180deg) translateY(0) scale(1);
                opacity: 0.3;
            }
            75% {
                transform: rotate(270deg) translateY(30px) scale(0.9);
                opacity: 0.5;
            }
        }
    `;
    document.head.appendChild(style);
}

createGeometricShapes();

console.log('🚀 Extreme visual effects initialized!');
