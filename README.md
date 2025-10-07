/**
 * EZ-Globe.js v1.0 (formerly GlobeLib-Three.js v4.1)
 * A simple, self-contained library for creating interactive 3D globes.
 * This version uses an explicit init() function to receive user data, which is the most robust method.
 */
(function(window) {
    'use strict';

    // --- 1. PUBLIC API ---
    function init(userConfig) {
        if (!userConfig || !userConfig.customConfig || !userConfig.mySpotsData) {
            console.error("EZ-Globe Error: init() function requires an object with 'customConfig' and 'mySpotsData' properties.");
            document.body.innerHTML = `<div style="font-family:monospace;color:red;padding:2em;">EZ-Globe Error: Configuration data not passed to init(). Please check the browser console.</div>`;
            return;
        }
        injectMetaTags();
        loadDependencies().then(() => {
            console.log("EZ-Globe: All dependencies loaded. Initializing scene.");
            const fullConfig = { ...userConfig.customConfig, spotsData: userConfig.mySpotsData };
            initializeScene(fullConfig);
        }).catch(error => {
            console.error("EZ-Globe Error: Failed to load one or more required scripts.", error);
        });
    }

    // --- 2. HELPER FUNCTIONS ---
    function injectMetaTags() {
        const head = document.head;
        if (!head.querySelector('meta[charset]')) {
            const charset = document.createElement('meta');
            charset.setAttribute('charset', 'UTF-8');
            head.prepend(charset);
        }
        if (!head.querySelector('meta[name="viewport"]')) {
            const viewport = document.createElement('meta');
            viewport.setAttribute('name', 'viewport');
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
            head.prepend(viewport);
        }
    }

    function loadDependencies() {
        const SCRIPT_URLS = [
            "https://unpkg.com/three@0.128.0/build/three.min.js",
            "https://unpkg.com/three@0.128.0/examples/js/controls/OrbitControls.js",
            "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js"
        ];
        return Promise.all(SCRIPT_URLS.map(url => new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        })));
    }
    
    function latLonToVector3(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        return new THREE.Vector3(-(radius * Math.sin(phi) * Math.cos(theta)), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
    }

    // --- 3. CORE GLOBE LOGIC ---
    function initializeScene(config) {
        const domElements = injectLibraryAssets(config);
        const { container, infoBox, closeButton, infoName, infoImage, infoDescEn, infoDescZh, resetButton } = domElements;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        const clock = new THREE.Clock();
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        const initialCameraPosition = new THREE.Vector3(0, 5, 30);
        camera.position.copy(initialCameraPosition);
        scene.add(new THREE.AmbientLight(0xffffff, 0.3));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight.position.set(10, 10, 5);
        scene.add(dirLight);
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 12;
        controls.maxDistance = 50;
        controls.enablePan = false;
        const globeRadius = 10;
        const textureLoader = new THREE.TextureLoader();
        scene.add(new THREE.Points(new THREE.SphereGeometry(500, 64, 64), new THREE.PointsMaterial({ color: 0xaaaaaa, size: 0.7, sizeAttenuation: true })));
        scene.add(new THREE.Mesh(new THREE.SphereGeometry(globeRadius, 64, 64), new THREE.MeshPhongMaterial({ map: textureLoader.load('https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg'), bumpMap: textureLoader.load('https://raw.githubusercontent.com/turban/webgl-earth/master/images/elev_bump_4k.jpg'), bumpScale: 0.01, specularMap: textureLoader.load('https://raw.githubusercontent.com/turban/webgl-earth/master/images/water_4k.png'), specular: new THREE.Color('grey'), shininess: 10 })));
        scene.add(new THREE.Mesh(new THREE.SphereGeometry(globeRadius + 0.05, 64, 64), new THREE.MeshPhongMaterial({ map: textureLoader.load('https://raw.githubusercontent.com/turban/webgl-earth/master/images/fair_clouds_4k.png'), transparent: true, opacity: 0.8 })));
        const beaconGroup = new THREE.Group();
        const beacons = [];
        config.spotsData.forEach(spot => {
            const beacon = new THREE.Group();
            const core = new THREE.Mesh(new THREE.CircleGeometry(0.1, 32), new THREE.MeshBasicMaterial({ color: 0xffa500, side: THREE.DoubleSide }));
            core.userData = spot;
            beacon.add(core);
            const ring1 = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.2, 32), new THREE.MeshBasicMaterial({ color: 0xffa500, side: THREE.DoubleSide, transparent: true }));
            beacon.add(ring1);
            const ring2 = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.2, 32), new THREE.MeshBasicMaterial({ color: 0xffa500, side: THREE.DoubleSide, transparent: true }));
            beacon.add(ring2);
            beacon.position.copy(latLonToVector3(spot.lat, spot.lon, globeRadius));
            beacons.push({ group: beacon, core, ring1, ring2 });
            beaconGroup.add(beacon);
        });
        scene.add(beaconGroup);
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let lastHovered = null;
        function updateInteractivity() {
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(beacons.map(b => b.core));
            if (lastHovered && !intersects.find(i => i.object === lastHovered.core)) { gsap.to(lastHovered.group.scale, { x: 1, y: 1, z: 1, duration: 0.3 }); lastHovered = null; document.body.style.cursor = 'default'; }
            if (intersects.length > 0) { const hoveredBeacon = beacons.find(b => b.core === intersects[0].object); if (hoveredBeacon !== lastHovered) { gsap.to(hoveredBeacon.group.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.3 }); lastHovered = hoveredBeacon; } document.body.style.cursor = 'pointer'; }
        }
        window.addEventListener('mousemove', e => { mouse.x = (e.clientX / window.innerWidth) * 2 - 1; mouse.y = -(e.clientY / window.innerHeight) * 2 + 1; });
        window.addEventListener('click', () => { if (lastHovered) { const data = lastHovered.core.userData; infoName.textContent = data.name; infoImage.src = data.image_url; infoDescEn.textContent = data.desc_en; infoDescZh.textContent = data.desc_zh; infoBox.style.display = 'block'; gsap.to(camera.position, { ...lastHovered.group.position.clone().multiplyScalar(2.0), duration: 1.5, ease: "power3.inOut" }); gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 1.5, ease: "power3.inOut" }); } else { infoBox.style.display = 'none'; } });
        resetButton.onclick = () => { infoBox.style.display = 'none'; gsap.to(camera.position, { ...initialCameraPosition, duration: 2, ease: "power3.inOut" }); gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 2, ease: "power3.inOut" }); };
        closeButton.onclick = () => { infoBox.style.display = 'none'; };
        window.addEventListener('resize', () => { camera.aspect = container.clientWidth / container.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth, container.clientHeight); });
        function animate() {
            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();
            beacons.forEach(b => {
                b.group.lookAt(camera.position);
                const pulseTime1 = elapsedTime * 1.5, pulseTime2 = elapsedTime * 1.5 + Math.PI;
                b.ring1.scale.setScalar(1 + (Math.sin(pulseTime1) + 1) / 2); b.ring1.material.opacity = 1 - ((Math.sin(pulseTime1) + 1) / 2);
                b.ring2.scale.setScalar(1 + (Math.sin(pulseTime2) + 1) / 2); b.ring2.material.opacity = 1 - ((Math.sin(pulseTime2) + 1) / 2);
            });
            updateInteractivity();
            controls.update();
            renderer.render(scene, camera);
        }
        animate();
    }

    // --- 4. DOM & CSS INJECTION ---
    function injectLibraryAssets(config) {
        const css = `html,body{width:100%;height:100%;margin:0;padding:0;overflow:hidden;background:#000}#gl-container{position:relative;width:100%;height:100%}#gl-infoBox{display:none;position:absolute;top:20px;left:20px;width:320px;max-height:calc(100vh - 40px);background:rgba(25,25,25,.85);color:#fff;border:1px solid #444;border-radius:12px;padding:20px;box-shadow:0 8px 24px rgba(0,0,0,.7);overflow-y:auto;z-index:100;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;transition:all .3s ease}#gl-infoBox img{width:100%;height:auto;border-radius:8px;margin-bottom:15px;border:1px solid #555}#gl-infoBox h3{margin-top:0;margin-bottom:15px;color:#ffb700;font-size:1.4em}#gl-infoBox h4{margin-top:20px;margin-bottom:5px;color:#888;border-bottom:1px solid #444;padding-bottom:5px;font-size:.9em;text-transform:uppercase;letter-spacing:.5px}#gl-infoBox p{margin-top:0;line-height:1.6;color:#ccc}#gl-closeButton,#gl-resetButton{position:absolute;width:30px;height:30px;background:rgba(0,0,0,.5);color:#fff;border:1px solid #777;border-radius:50%;text-align:center;cursor:pointer;font-weight:700;font-size:16px;-webkit-user-select:none;user-select:none;z-index:101;transition:all .2s ease}#gl-closeButton{top:15px;right:15px;line-height:28px}#gl-resetButton{top:20px;right:20px;line-height:30px;font-size:18px}#gl-closeButton:hover,#gl-resetButton:hover{background:#ffb700;color:#000;transform:scale(1.1)}#gl-title{position:absolute;top:20px;left:50%;transform:translateX(-50%);color:#fff;font-size:1.5em;font-weight:300;text-shadow:0 0 10px rgba(0,0,0,.8);z-index:50;pointer-events:none;text-align:center}#gl-developer{position:absolute;bottom:15px;right:15px;font-size:.8em;color:#aaa;z-index:50}@media (max-width:500px){#gl-infoBox{width:calc(100% - 40px);left:50%;top:auto;bottom:20px;transform:translateX(-50%);max-height:45vh}#gl-title{font-size:1.1em;width:90%}#gl-resetButton{top:auto;bottom:20px}#gl-developer{font-size:.7em;bottom:5px;right:5px}}`;
        const styleElement = document.createElement('style');
        styleElement.id = 'globe-lib-styles';
        styleElement.innerHTML = css;
        document.head.appendChild(styleElement);
        const container = document.createElement('div');
        container.id = 'gl-container';
        document.body.innerHTML = '';
        document.body.appendChild(container);
        const titleHtml = config.title ? `<div id="gl-title">${config.title}</div>` : '';
        const devHtml = config.developerName ? `<div id="gl-developer">By ${config.developerName}</div>` : '';
        container.insertAdjacentHTML('beforeend', `<div id="gl-infoBox"><div id="gl-closeButton">×</div><h3 id="gl-infoName"></h3><img id="gl-infoImage" src="" alt="Location Image"><h4>Description</h4><p id="gl-infoDescEn"></p><h4>介紹</h4><p id="gl-infoDescZh"></p></div><div id="gl-resetButton">⟲</div>${titleHtml}${devHtml}`);
        return { container, infoBox: document.getElementById('gl-infoBox'), closeButton: document.getElementById('gl-closeButton'), infoName: document.getElementById('gl-infoName'), infoImage: document.getElementById('gl-infoImage'), infoDescEn: document.getElementById('gl-infoDescEn'), infoDescZh: document.getElementById('gl-infoDescZh'), resetButton: document.getElementById('gl-resetButton') };
    }

    // --- 5. EXPOSE THE PUBLIC API ---
    window.EZGlobe = {
        init: init
    };

})(window);

document.addEventListener("DOMContentLoaded", function () {
  GlobeLib.init({
    customConfig: customConfig,
    mySpotsData: mySpotsData
  });
});
