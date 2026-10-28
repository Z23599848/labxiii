/**
 * LabXIII - Universal 3D Engine (Three.js)
 * Static 'Celestial Sphere' representing the universe. Zero movement.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 0. Theme Management ---
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
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
            sunIcon.style.display = 'block'; moonIcon.style.display = 'none';
        } else {
            sunIcon.style.display = 'none'; moonIcon.style.display = 'block';
        }
    }

    // --- 1. Three.js: The Universal Sphere ---
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Initial Color
    const activeColor = savedTheme === 'dark' ? 0xffffff : 0x000000;

    // layer 1: The Celestial Grid (Architecture of the Universe)
    const gridGeometry = new THREE.SphereGeometry(12, 32, 24);
    const gridWireframe = new THREE.WireframeGeometry(gridGeometry);
    const gridMaterial = new THREE.LineBasicMaterial({
        color: activeColor,
        transparent: true,
        opacity: 0.15
    });
    const gridMesh = new THREE.LineSegments(gridWireframe, gridMaterial);
    scene.add(gridMesh);

    // layer 2: The Star Field (Matter in the Universe)
    const pointsCount = 4000;
    const pointsGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(pointsCount * 3);
    for (let i = 0; i < pointsCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 50;
    }
    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pointsMaterial = new THREE.PointsMaterial({
        color: activeColor,
        size: 0.1,
        transparent: true,
        opacity: 0.4
    });
    const starField = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(starField);

    camera.position.z = 25;

    // Static rendering, no movement
    function renderStatic() {
        renderer.render(scene, camera);
    }
    renderStatic();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderStatic();
    });

    // --- 2. 2D Particle Overlay (Secondary Texture) ---
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let width, height, particles = [];
    
    function resize2D() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize2D);
    resize2D();

    class Particle {
        constructor() {
            this.x = Math.random() * width; this.y = Math.random() * height;
            this.size = Math.random() * 1.2;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
            ctx.fill();
        }
    }

    function init2D() {
        particles = [];
        for (let i = 0; i < 150; i++) particles.push(new Particle());
    }

    function render2D() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => p.draw());
    }
    init2D();
    render2D();

    // --- 3. Sync Logic ---
    function syncEngineColors(theme) {
        const color = theme === 'dark' ? 0xffffff : 0x000000;
        gridMaterial.color.setHex(color);
        pointsMaterial.color.setHex(color);
        renderStatic();
        render2D();
    }

    // --- 4. Scroll reveals ---
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.1 });
    reveals.forEach(r => observer.observe(r));

});


// --- 5. Semantic Remote Control (SRC) Pre-Order Modal Logic ---
window.openPreorderModal = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const modal = document.getElementById('preorder-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

window.closePreorderModal = function() {
    const modal = document.getElementById('preorder-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// Close modal when clicking backdrop
document.addEventListener('click', (e) => {
    const modal = document.getElementById('preorder-modal');
    if (modal && e.target === modal) {
        closePreorderModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePreorderModal();
});

// Handle Form Submission
window.handlePreorderSubmit = function(e) {
    e.preventDefault();
    
    const name = document.getElementById('po-name').value.trim();
    const email = document.getElementById('po-email').value.trim();
    const org = document.getElementById('po-org').value.trim();
    const units = document.getElementById('po-units').value;
    const usecase = document.getElementById('po-usecase').value;
    const notes = document.getElementById('po-notes').value.trim();

    // Generate unique reservation ID
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const reservationCode = 'SRC-B1-' + randomSuffix;

    const reservationData = {
        code: reservationCode,
        name,
        email,
        org,
        units,
        usecase,
        notes,
        timestamp: new Date().toISOString()
    };

    // Save to localStorage for returning session
    try {
        localStorage.setItem('labxiii_src_reservation', JSON.stringify(reservationData));
    } catch(err) {
        console.warn('Storage error:', err);
    }

    // Prepare mailto link for direct record keeping
    const subject = encodeURIComponent('LabXIII SRC Pre-Order Reservation [' + reservationCode + '] - ' + org);
    const body = encodeURIComponent(
        'RESERVATION DETAILS\n' +
        '------------------------------------\n' +
        'Reservation Code: ' + reservationCode + '\n' +
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        'Organization: ' + org + '\n' +
        'Units: ' + units + '\n' +
        'Deployment Environment: ' + usecase + '\n' +
        'Notes: ' + notes + '\n' +
        'Timestamp: ' + new Date().toLocaleString() + '\n' +
        '------------------------------------\n' +
        'LabXIII Ltd • Company No: 16523432\n'
    );
    const mailtoUrl = 'mailto:aliganji@labxiii.org?subject=' + subject + '&body=' + body;

    // Show Confirmation View
    document.getElementById('preorder-form-container').style.display = 'none';
    const confirmView = document.getElementById('preorder-confirmation');
    confirmView.style.display = 'block';
    
    document.getElementById('confirmed-res-code').textContent = reservationCode;
    document.getElementById('confirmed-email-display').textContent = email;
    
    const emailBtn = document.getElementById('email-confirmation-link');
    if (emailBtn) {
        emailBtn.href = mailtoUrl;
    }
};

// Check if visitor has prior reservation
document.addEventListener('DOMContentLoaded', () => {
    try {
        const existing = localStorage.getItem('labxiii_src_reservation');
        if (existing) {
            const data = JSON.parse(existing);
            const bannerBadges = document.querySelectorAll('.preorder-batch-badge');
            bannerBadges.forEach(b => {
                b.innerHTML = '<span>✅ You have reserved: <strong>' + data.code + '</strong></span>';
            });
        }
    } catch(err){}
});
