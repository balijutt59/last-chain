/* Particles Animation */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
    }
    update() {
        this.x += this.speedX; this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0; if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0; if (this.y < 0) this.y = canvas.height;
    }
    draw() { ctx.fillStyle = 'rgba(0, 255, 204, 0.4)'; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
}
function initParticles() { for (let i = 0; i < 100; i++) particles.push(new Particle()); }
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
        p.update(); p.draw();
        for (let j = i; j < particles.length; j++) {
            const dx = p.x - particles[j].x; const dy = p.y - particles[j].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 100) { ctx.strokeStyle = `rgba(0, 255, 204, ${0.15 - dist/700})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke(); }
        }
    });
    requestAnimationFrame(animate);
}
initParticles(); animate();

/* Cursor Movement */
window.addEventListener('mousemove', (e) => { 
    document.getElementById('cursor-dot').style.left = e.x + 'px'; document.getElementById('cursor-dot').style.top = e.y + 'px';
    document.getElementById('cursor-outline').style.left = (e.x - 16) + 'px'; document.getElementById('cursor-outline').style.top = (e.y - 16) + 'px';
});

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }
function switchTab(id, title) { document.querySelectorAll('.tab-content').forEach(t=>t.classList.add('hidden')); document.getElementById(id).classList.remove('hidden'); document.getElementById('page-title').innerText=title; toggleSidebar(); }
