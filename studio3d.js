let scene, camera, renderer, controls;
let layers = {}; // Stocke les différentes strates (chape, colle, etc.)

function init3D() {
    const container = document.getElementById('canvas-container');
    if(scene) {
        while(scene.children.length > 0){ scene.remove(scene.children[0]); }
    } else {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xe2e8f0);
        
        camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.set(6, 6, 8);
        
        renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);
        
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 1, 0);
        
        window.addEventListener('resize', () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
        
        animate();
    }
    buildRoom();
}

function buildRoom() {
    const l = parseFloat(document.getElementById('dim-l').value) || 5;
    const w = parseFloat(document.getElementById('dim-w').value) || 4;
    const h = 2.5; 
    
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    let lightDir = new THREE.DirectionalLight(0xffffff, 0.8);
    lightDir.position.set(5, 10, 7);
    scene.add(lightDir);

    // CRÉATION DES COUCHES DU SOL
    const floorGeo = new THREE.PlaneGeometry(l, w);
    floorGeo.rotateX(-Math.PI / 2);
    
    layers['sol-chape'] = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({color: 0x9ca3af}));
    layers['sol-souscouche'] = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({color: 0x4ade80}));
    layers['sol-souscouche'].position.y = 0.01;
    layers['sol-colle'] = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({color: 0xd1d5db, wireframe: true}));
    layers['sol-colle'].position.y = 0.02;
    layers['sol-revetement'] = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({color: '#c2b280'}));
    layers['sol-revetement'].position.y = 0.03;

    // CRÉATION DES COUCHES DES MURS
    const wall1Geo = new THREE.PlaneGeometry(l, h);
    const wall2Geo = new THREE.PlaneGeometry(w, h);
    
    const groupMur1 = new THREE.Group(); groupMur1.position.set(0, h/2, -w/2);
    const groupMur2 = new THREE.Group(); groupMur2.position.set(-l/2, h/2, 0); groupMur2.rotation.y = Math.PI / 2;

    ['mur-brut', 'mur-spec', 'mur-colle', 'mur-finition'].forEach((nom, index) => {
        let color = 0xd1d5db;
        if(nom==='mur-spec') color = 0x60a5fa; 
        if(nom==='mur-colle') color = 0x9ca3af; 
        if(nom==='mur-finition') color = 0xfef08a; 
        
        let offset = index * 0.01;
        let isWire = (nom==='mur-colle');

        let m1 = new THREE.Mesh(wall1Geo, new THREE.MeshStandardMaterial({color: color, wireframe: isWire})); m1.position.z = offset;
        let m2 = new THREE.Mesh(wall2Geo, new THREE.MeshStandardMaterial({color: color, wireframe: isWire})); m2.position.z = offset;
        
        groupMur1.add(m1); groupMur2.add(m2);

        if(!layers[nom]) layers[nom] = [];
        layers[nom].push(m1, m2);
    });

    // Ajout à la scène
    Object.keys(layers).forEach(key => {
        let obj = layers[key];
        if(Array.isArray(obj)) obj.forEach(o => scene.add(o.parent || o)); 
        else scene.add(obj);
    });

    toggleLayer();
}

function toggleLayer() {
    Object.keys(layers).forEach(layerName => {
        const checkbox = document.getElementById(`layer-${layerName}`);
        if (checkbox) {
            let targets = Array.isArray(layers[layerName]) ? layers[layerName] : [layers[layerName]];
            targets.forEach(mesh => { if(mesh) mesh.visible = checkbox.checked; });
        }
    });
}

function updateRoom() { init3D(); }

function animate() {
    requestAnimationFrame(animate);
    if(controls) controls.update();
    if(renderer && scene && camera) renderer.render(scene, camera);
}
