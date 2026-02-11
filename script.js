// UI Interaction
document.addEventListener('DOMContentLoaded', () => {
    const revealBtn = document.getElementById('reveal-location-btn');
    const locationCard = document.getElementById('location-reveal');
    const closeBtn = document.getElementById('close-location-btn');

    // ==========================================
    // Mini Game: Runaway Button
    // Desktop: hover to dodge | Mobile: tap to dodge
    // After 4 dodges → return to original position
    // ==========================================
    let runawayCount = 0;
    const maxRunaway = 4;
    let gameComplete = false;
    let isMoving = false;

    const messages = [
        "Hehe, bắt được hông? 😜",
        "Nhanh tay lên nào! 🏃‍♀️",
        "Gần được rồi...! 💨",
        "Cố lên nào vợ ơi! 💪"
    ];

    function getSafeArea() {
        const viewW = window.innerWidth;
        const viewH = window.innerHeight;
        const btnW = revealBtn.offsetWidth;
        const btnH = revealBtn.offsetHeight;

        // Hard cap: button stays in top ~40% of viewport
        // On iPhone 15 Pro Max (932px height), maxY ≈ 350px
        const maxYLimit = Math.min(viewH * 0.4, 350);

        return {
            minX: 20,
            maxX: viewW - btnW - 20,
            minY: 30,
            maxY: maxYLimit
        };
    }

    function runAway() {
        if (gameComplete || isMoving) return;
        isMoving = true;

        runawayCount++;

        if (runawayCount <= maxRunaway) {
            const safe = getSafeArea();

            // Pick random position within safe top area
            const newX = safe.minX + Math.floor(Math.random() * (safe.maxX - safe.minX));
            const newY = safe.minY + Math.floor(Math.random() * (safe.maxY - safe.minY));

            // First dodge: anchor at current position first to avoid layout jump
            if (runawayCount === 1) {
                const rect = revealBtn.getBoundingClientRect();
                revealBtn.style.transition = 'none';
                revealBtn.style.position = 'fixed';
                revealBtn.style.left = rect.left + 'px';
                revealBtn.style.top = rect.top + 'px';
                revealBtn.style.zIndex = '9999';

                // Force reflow, then animate to new position
                revealBtn.offsetHeight;
                revealBtn.style.transition = '';
            }

            revealBtn.style.position = 'fixed';
            revealBtn.style.left = newX + 'px';
            revealBtn.style.top = newY + 'px';
            revealBtn.style.zIndex = '9999';

            revealBtn.innerText = messages[runawayCount - 1] || "Hehe 😜";

            // Prevent rapid-fire triggers
            setTimeout(() => { isMoving = false; }, 750);
        }

        // Done dodging → return to original position
        if (runawayCount >= maxRunaway) {
            setTimeout(() => {
                gameComplete = true;
                revealBtn.style.position = '';
                revealBtn.style.left = '';
                revealBtn.style.top = '';
                revealBtn.style.zIndex = '';
                revealBtn.innerText = "Giờ bấm được rồi đó vợ! 🤣❤️";
                revealBtn.classList.add('caught');
                isMoving = false;
            }, 1000);
        }
    }

    // Desktop: mouseover triggers runaway
    revealBtn.addEventListener('mouseover', () => {
        if (!gameComplete) runAway();
    });

    // Mobile: touchstart triggers runaway
    revealBtn.addEventListener('touchstart', (e) => {
        if (!gameComplete) {
            e.preventDefault();
            runAway();
        }
    }, { passive: false });

    // Click: only works after game is complete
    revealBtn.addEventListener('click', (e) => {
        if (!gameComplete) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        // Reveal location
        locationCard.classList.remove('hidden');
        locationCard.style.display = 'flex';
        setTimeout(() => {
            locationCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    });

    closeBtn.addEventListener('click', () => {
        locationCard.classList.add('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// ==========================================
// Three.js 3D Background
// ==========================================
let scene, camera, renderer, hearts = [];

function init() {
    const container = document.getElementById('canvas-container');

    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xffe6ea, 0.002);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 1000;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create heart shape
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;
    heartShape.moveTo(x + 5, y + 5);
    heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
    heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
    heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
    heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
    heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
    heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

    const extrudeSettings = {
        depth: 2,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 2,
        bevelSize: 1,
        bevelThickness: 1
    };

    const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);

    // Multiple colors for hearts
    const colors = [0xff6b81, 0xff9eb5, 0xff4757, 0xffcccc, 0xff8a9e];

    // Lights
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(200, 200, 200);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xff9eb5, 0.8);
    pointLight2.position.set(-200, -200, 100);
    scene.add(pointLight2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    for (let i = 0; i < 60; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const material = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 100,
            specular: 0xffffff
        });

        const heart = new THREE.Mesh(geometry, material);

        heart.position.x = (Math.random() - 0.5) * 2000;
        heart.position.y = (Math.random() - 0.5) * 2000;
        heart.position.z = (Math.random() - 0.5) * 2000;

        heart.rotation.x = Math.random() * 2 * Math.PI;
        heart.rotation.y = Math.random() * 2 * Math.PI;
        heart.rotation.z = Math.random() * 2 * Math.PI;

        const scale = Math.random() * 2 + 0.5;
        heart.scale.set(scale, scale, scale);

        scene.add(heart);
        hearts.push({
            mesh: heart,
            speed: Math.random() * 0.5 + 0.1,
            rotationSpeed: Math.random() * 0.02
        });
    }

    // --- Magic Particles System ---
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 800;
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 2500;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 3,
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Event listeners
    window.addEventListener('resize', onWindowResize, false);

    animate(particlesMesh);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(particlesMesh) {
    requestAnimationFrame(() => animate(particlesMesh));

    hearts.forEach(item => {
        item.mesh.position.y += item.speed;
        item.mesh.rotation.y += item.rotationSpeed;
        item.mesh.rotation.z += item.rotationSpeed;

        if (item.mesh.position.y > 1000) {
            item.mesh.position.y = -1000;
        }
    });

    if (particlesMesh) {
        particlesMesh.rotation.y += 0.0005;
        particlesMesh.rotation.x += 0.0002;
    }

    const time = Date.now() * 0.0005;
    camera.position.x += (Math.cos(time) * 10 - camera.position.x) * 0.05;
    camera.position.y += (Math.sin(time) * 10 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

init();
