let scene, camera, renderer, controls;
let layers = {}; 

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

// Générateur de textures réalistes procédurales
function generateRealisticTexture(type) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; 
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    if (type === 'moquette') {
        // Texture type Moquette Bouclée Anthracite (Maas)
        ctx.fillStyle = '#4a4c50';
        ctx.fillRect(0, 0, 1024, 1024);
        for(let i=0; i<80000; i++) {
            let shade = Math.random() > 0.5 ? '#333538' : '#5e6066';
            ctx.fillStyle = shade;
            ctx.fillRect(Math.random()*1024, Math.random()*1024, 3, 3);
        }
    } 
    else if (type === 'carrelage' || type === 'dalle_pvc') {
        // Carrelage ou Dalles PVC (Motif carré)
        let baseColor = type === 'carrelage' ? '#e5e7eb' : '#374151'; // Clair vs Anthracite
        let jointColor = type === 'carrelage' ? '#9ca3af' : '#1f2937';
        
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 1024, 1024);
        
        // Léger bruit pour le réalisme (effet minéral)
        for(let i=0; i<10000; i++) {
            ctx.fillStyle = 'rgba(0,0,0,0.03)';
            ctx.fillRect(Math.random()*1024, Math.random()*1024, 4, 4);
        }

        ctx.strokeStyle = jointColor;
        ctx.lineWidth = 6;
        for(let x=0; x<=1024; x+=256) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1024); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, x); ctx.lineTo(1024, x); ctx.stroke();
        }
    } 
    else {
        // Lames PVC (Capella), Stratifié (Kirton) ou Parquet massif (Motif rectangulaire pose à l'anglaise)
        let baseColor = '#dcb484'; // Par défaut
        if (type === 'lame_pvc') baseColor = '#e2cca6'; // Lame Capella Blond
        if (type === 'stratifie') baseColor = '#c89966'; // Stratifié Kirton Brut
        if (type === 'parquet') baseColor = '#b87c4c'; // Parquet Chêne Massif
        
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 1024, 1024);

        // Ajout des veines du bois
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        for(let i=0; i<300; i++) {
            ctx.fillRect(0, Math.random()*1024, 1024, Math.random()*4);
        }

        // Calepinage des lames (pose décalée)
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 3;
        const plankHeight = 128;
        const plankWidth = 512;
        
        for(let y=0; y<1024; y+=plankHeight) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
            // Décalage une ligne sur deux
            let offset = (y/plankHeight) % 2 === 0 ? 0 : plankWidth/2;
            for(let x=offset; x<1024; x+=plankWidth) {
                ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y+plankHeight); ctx.stroke();
            }
        }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3); // Répétition sur le sol
    return tex;
}

function buildRoom() {
    const l = parseFloat(document.getElementById('dim-l').value) || 5;
    const w = parseFloat(document.getElementById('dim-w').value) || 4;
    const revetementType = document.getElementById('revetement-type').value;
    
    // Lumières (plus réalistes)
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    let lightDir = new THREE.DirectionalLight(0xffffff, 0.5);
    lightDir.position.set(5, 10, 7);
    lightDir.castShadow = true;
    scene.add(lightDir);

    const floorGeo = new THREE.PlaneGeometry(l, w);
    floorGeo.rotateX(-Math.PI / 2);
    
    // 1. Chape Béton
    layers['sol-chape'] = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({color: 0x9ca3af, roughness: 1}));
    
    // 2. Sous-couche (ex: isolation thermique)
    layers['sol-souscouche'] = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({color: 0x4ade80, roughness: 0.9}));
    layers['sol-souscouche'].position.y = 0.01;
    
    // 3. Adhésif Aluminium (Ruban de masquage)
    const adhesifGroup = new THREE.Group();
    // Création du matériau métallique pour l'adhésif (style Alu Selit)
    const adhesifMat = new THREE.MeshStandardMaterial({
        color: 0xc0c0c0, 
        metalness: 0.8, // Très réfléchissant
        roughness: 0.2
    });
    // Tracé de lignes adhésives tous les mètres
    for(let i = -l/2 + 1; i < l/2; i+=1) {
        let bande = new THREE.Mesh(new THREE.PlaneGeometry(0.05, w), adhesifMat);
        bande.rotateX(-Math.PI / 2);
        bande.position.set(i, 0.011, 0);
        adhesifGroup.add(bande);
    }
    layers['sol-adhesif'] = adhesifGroup;

    // 4. Revêtement (Généré dynamiquement)
    const revetementMat = new THREE.MeshStandardMaterial({
        map: generateRealisticTexture(revetementType),
        roughness: revetementType === 'carrelage' ? 0.3 : (revetementType === 'moquette' ? 1 : 0.6)
    });
    layers['sol-revetement'] = new THREE.Mesh(floorGeo, revetementMat);
    layers['sol-revetement'].position.y = 0.02;

    // 5. Cales de dilatation (Uniquement si pas moquette ni carrelage)
    if (revetementType !== 'moquette' && revetementType !== 'carrelage') {
        const calesGroup = new THREE.Group();
        const caleGeo = new THREE.BoxGeometry(0.03, 0.02, 0.08); // Dimension d'une cale 8mm
        const caleMat = new THREE.MeshStandardMaterial({color: 0xef4444}); // Rouge fluo
        
        // Placement des cales le long des murs virtuels (bords)
        for(let i= -l/2 + 0.2; i < l/2; i+=0.5){
            let cale = new THREE.Mesh(caleGeo, caleMat);
            cale.position.set(i, 0.03, -w/2 + 0.015);
            calesGroup.add(cale);
        }
        layers['sol-cales'] = calesGroup;
    } else {
        layers['sol-cales'] = new THREE.Group(); // Groupe vide pour éviter l'erreur si on coche la case
    }

    // Ajout à la scène
    Object.keys(layers).forEach(key => {
        let obj = layers[key];
        scene.add(obj);
    });

    toggleLayer();
}

function toggleLayer() {
    Object.keys(layers).forEach(layerName => {
        const checkbox = document.getElementById(`layer-${layerName}`);
        if (checkbox && layers[layerName]) {
            layers[layerName].visible = checkbox.checked;
        }
    });
}

function updateRoom() { init3D(); }

function animate() {
    requestAnimationFrame(animate);
    if(controls) controls.update();
    if(renderer && scene && camera) renderer.render(scene, camera);
}
