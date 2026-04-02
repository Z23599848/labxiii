/**
 * LabXIII - Advanced 3D Mesh Engine (Three.js)
 * Includes Dark/Light Mode support and Logo Inversion
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 0. Theme Management ---
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    
    // Default to dark or saved preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateIcons(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        updateIcons(newTheme);
        syncEngineColors(newTheme);
    });

    function updateIcons(theme) {
        if (theme === 'dark') {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        } else {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
    }

    // --- 1. Three.js: The Mesh Object ---
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Geometry: Torus Knot
    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const wireframe = new THREE.WireframeGeometry(geometry);
    
    // Initial Material Color based on theme
    const meshColor = savedTheme === 'dark' ? 0xffffff : 0x000000;
    const material = new THREE.LineBasicMaterial({
        color: meshColor,
        transparent: true,
        opacity: 0.25,
        linewidth: 1
    });

    const mesh = new THREE.LineSegments(wireframe, material);
    scene.add(mesh);

    camera.position.z = 30;

    // Interaction State
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;

    window.addEventListener('mousemove', (e) => {
        targetX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
        targetY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // 3D Animation Loop
    function animate3D() {
        requestAnimationFrame(animate3D);
        mouseX += (targetX - mouseX) * 0.02;
        mouseY += (targetY - mouseY) * 0.02;
        mesh.rotation.y += 0.0005;
        mesh.rotation.z += 0.0002;
        mesh.rotation.x = mouseY * 0.2;
        mesh.rotation.y += mouseX * 0.05;
        const time = Date.now() * 0.0005;
        mesh.scale.setScalar(1 + Math.sin(time) * 0.03);
        renderer.render(scene, camera);
    }
    animate3D();

    // --- 2. 2D Particle Grid Overlay ---
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let width, height, particles = [];
    const particleCount = 100;
    const connectionDistance = 180;
    let lineColor = savedTheme === 'dark' ? 'rgba(255, 255, 255, ' : 'rgba(0, 0, 0, ';
    
    function resize2D() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize2D);
    resize2D();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.size = Math.random() * 1.5;
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            if (this.x > width) this.x = 0; if (this.x < 0) this.x = width;
            if (this.y > height) this.y = 0; if (this.y < 0) this.y = height;
        }
        draw() {
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = savedTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
            ctx.fill();
        }
    }

    function init2D() {
        particles = [];
        for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    }

    function animate2D() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            for (let j = i + 1; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < connectionDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = `${lineColor}${0.1 * (1 - dist / connectionDistance)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate2D);
    }
    init2D();
    animate2D();

    // --- 3. Sync Logic ---
    function syncEngineColors(theme) {
        // Update Three.js Mesh
        const color = theme === 'dark' ? 0xffffff : 0x000000;
        mesh.material.color.setHex(color);
        
        // Update 2D Canvas Variables
        lineColor = theme === 'dark' ? 'rgba(255, 255, 255, ' : 'rgba(0, 0, 0, ';
        
        // Particles will pick up the color on their next draw cycle
        particles.forEach(p => {
            p.draw = function() {
                ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                ctx.fill();
            }
        });
    }

    // --- 4. UI scroll logic ---
    const reveals = document.querySelectorAll('.reveal');
    const callback = (entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }
    const observer = new IntersectionObserver(callback, { threshold: 0.1 });
    reveals.forEach(r => observer.observe(r));

});
