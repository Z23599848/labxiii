/**
 * LabXIII - Advanced 3D Mesh Engine (Three.js)
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Three.js: The Mesh Object ---
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Geometry: Torus Knot for "Complexity"
    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const wireframe = new THREE.WireframeGeometry(geometry);
    
    const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.25, // Subtle professional look
        linewidth: 1
    });

    const mesh = new THREE.LineSegments(wireframe, material);
    scene.add(mesh);

    camera.position.z = 30;

    // Interaction State
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('mousemove', (e) => {
        // Normalize mouse to -1 to 1
        targetX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
        targetY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    });

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // 3D Animation Loop
    function animate3D() {
        requestAnimationFrame(animate3D);

        // Smoothly interpolate mouse movement ("Active Reactivity")
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        // Base continuous rotation
        mesh.rotation.y += 0.002;
        mesh.rotation.z += 0.001;

        // Mouse-driven active tilt/rotation
        mesh.rotation.x = mouseY * 0.5;
        mesh.rotation.y += mouseX * 0.1;

        // Subtle pulsing scale factor
        const time = Date.now() * 0.001;
        mesh.scale.setScalar(1 + Math.sin(time) * 0.05);

        renderer.render(scene, camera);
    }

    animate3D();

    // --- 2. 2D Particle Grid Overlay ---
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = 100;
    const connectionDistance = 180;
    
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
            this.x += this.vx;
            this.y += this.vy;

            if (this.x > width) this.x = 0;
            if (this.x < 0) this.x = width;
            if (this.y > height) this.y = 0;
            if (this.y < 0) this.y = height;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fill();
        }
    }

    function init2D() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
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
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - dist / connectionDistance)})`;
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

    // --- 3. UI scroll logic ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    const reveals = document.querySelectorAll('.reveal');
    const callback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }
    const observer = new IntersectionObserver(callback, { threshold: 0.1 });
    reveals.forEach(r => observer.observe(r));

});
