// UI Interaction
document.addEventListener('DOMContentLoaded', () => {
    const revealBtn = document.getElementById('reveal-location-btn');
    const locationCard = document.getElementById('location-reveal');
    const closeBtn = document.getElementById('close-location-btn');
    const card = document.querySelector('.card.glass-effect');

    // Mini Game: Runaway Button
    let runawayCount = 0;
    const maxRunaway = 5;

    revealBtn.addEventListener('mouseover', (e) => {
        if (runawayCount < maxRunaway) {
            const moveX = (Math.random() - 0.5) * 500;
            const moveY = (Math.random() - 0.5) * 500;
            revealBtn.style.transform = `translate(${moveX}px, ${moveY}px)`;
            runawayCount++;
        } else {
            revealBtn.style.transform = 'translate(0, 0)';
            revealBtn.innerText = "Giờ bấm đượt ròi đó! 🤣";
            revealBtn.style.cursor = 'pointer';
        }
    });

    revealBtn.addEventListener('click', (e) => {
        if (runawayCount < maxRunaway) {
            e.preventDefault();
            return;
        }
        locationCard.classList.remove('hidden');
        locationCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        console.log("Location revealed! ❤️");
    });

    closeBtn.addEventListener('click', () => {
        locationCard.classList.add('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// Three.js 3D Background
let scene, camera, renderer, hearts = [];

function init() {
    const container = document.getElementById('canvas-container');

    // Scene setup
    scene = new THREE.Scene();
    // Soft pink fog for depth
    scene.fog = new THREE.FogExp2(0xffe6ea, 0.002);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 1000;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Create hearts
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

    // Make it cute pink
    const material = new THREE.MeshPhongMaterial({
        color: 0xff6b81,
        shininess: 100,
        specular: 0xffffff
    });

    // Add a point light to make them shine
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(200, 200, 200);
    scene.add(pointLight);

    for (let i = 0; i < 50; i++) {
        const heart = new THREE.Mesh(geometry, material);

        // Random position
        heart.position.x = (Math.random() - 0.5) * 2000;
        heart.position.y = (Math.random() - 0.5) * 2000;
        heart.position.z = (Math.random() - 0.5) * 2000;

        // Random rotation
        heart.rotation.x = Math.random() * 2 * Math.PI;
        heart.rotation.y = Math.random() * 2 * Math.PI;
        heart.rotation.z = Math.random() * 2 * Math.PI; // Flip it upright mostly? Nah, random is chaos cute

        // Random scale
        const scale = Math.random() * 2 + 0.5;
        heart.scale.set(scale, scale, scale);

        scene.add(heart);
        hearts.push({
            mesh: heart,
            speed: Math.random() * 0.5 + 0.1,
            rotationSpeed: Math.random() * 0.02
        });
    }

    // Lights (even though basic material doesn't need them, good habit)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // --- Add Floating Heart-Shaped Photos ---
    const photoUrls = [
        './images/DSCF0502.JPG',
        './images/DSCF1218.JPG',
        './images/IMG_4631.JPG'
    ];

    const loader = new THREE.TextureLoader();

    // Create a flat heart shape for photos
    const photoHeartShape = new THREE.Shape();
    const px = 0, py = 0;
    photoHeartShape.moveTo(px + 5, py + 5);
    photoHeartShape.bezierCurveTo(px + 5, py + 5, px + 4, py, px, py);
    photoHeartShape.bezierCurveTo(px - 6, py, px - 6, py + 7, px - 6, py + 7);
    photoHeartShape.bezierCurveTo(px - 6, py + 11, px - 3, py + 15.4, px + 5, py + 19);
    photoHeartShape.bezierCurveTo(px + 12, py + 15.4, px + 16, py + 11, px + 16, py + 7);
    photoHeartShape.bezierCurveTo(px + 16, py + 7, px + 16, py, px + 10, py);
    photoHeartShape.bezierCurveTo(px + 7, py, px + 5, py + 5, px + 5, py + 5);

    photoUrls.forEach(url => {
        loader.load(url, (texture) => {
            // Adjust UV mapping to fit the texture inside the heart shape
            const geometry = new THREE.ShapeGeometry(photoHeartShape);

            // Calculate bounding box to normalize UVs
            geometry.computeBoundingBox();
            const max = geometry.boundingBox.max;
            const min = geometry.boundingBox.min;
            const size = new THREE.Vector3().subVectors(max, min);

            const uvAttribute = geometry.attributes.uv;
            for (let i = 0; i < uvAttribute.count; i++) {
                const x = geometry.attributes.position.getX(i);
                const y = geometry.attributes.position.getY(i);
                const u = (x - min.x) / size.x;
                const v = (y - min.y) / size.y;
                uvAttribute.setXY(i, u, v);
            }
            geometry.attributes.uv.needsUpdate = true;

            const photoMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide
            });

            // Increase quantity: 15 of each photo
            for (let i = 0; i < 15; i++) {
                const photo = new THREE.Mesh(geometry, photoMaterial);

                // Need a wider spread
                photo.position.x = (Math.random() - 0.5) * 2000;
                photo.position.y = (Math.random() - 0.5) * 2000;
                photo.position.z = (Math.random() - 0.5) * 2000;

                photo.rotation.x = Math.random() * Math.PI;
                photo.rotation.y = Math.random() * Math.PI;
                photo.rotation.z = Math.PI; // Flip to be upright generally

                const scale = Math.random() * 2 + 1.5;
                photo.scale.set(scale, scale, scale);

                scene.add(photo);
                hearts.push({
                    mesh: photo,
                    speed: Math.random() * 0.4 + 0.2,
                    rotationSpeed: Math.random() * 0.015
                });
            }
        });
    });

    // --- Magic Particles System ---
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;

    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 2500; // Spread wide
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 4,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
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

    // Animate hearts & photos
    hearts.forEach(item => {
        item.mesh.position.y += item.speed;
        item.mesh.rotation.y += item.rotationSpeed;
        item.mesh.rotation.z += item.rotationSpeed;

        // Reset if goes too high
        if (item.mesh.position.y > 1000) {
            item.mesh.position.y = -1000;
        }
    });

    // Animate Particles
    if (particlesMesh) {
        particlesMesh.rotation.y += 0.0005;
        particlesMesh.rotation.x += 0.0002;
    }

    // Gentle camera movement
    const time = Date.now() * 0.0005;
    camera.position.x += (Math.cos(time) * 10 - camera.position.x) * 0.05;
    camera.position.y += (Math.sin(time) * 10 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

init();
