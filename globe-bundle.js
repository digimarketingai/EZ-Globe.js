/*!
 * Globe Bundle v1.0
 * Single include. Injects vendors, styles, UI, and initializes the globe.
 */
(function() {
  'use strict';

  // -------------------------
  // User Overridables
  // -------------------------
  // Option 1: Put your data on window.GLOBE_SPOTS before DOMContentLoaded.
  // Option 2: Provide data-spots-url on #globe-container to fetch JSON.
  // Option 3: Library falls back to demo data.

  // -------------------------
  // Dynamic vendor loader
  // -------------------------
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  const VENDORS = [
    'https://unpkg.com/three@0.128.0/build/three.min.js',
    'https://unpkg.com/three@0.128.0/examples/js/controls/OrbitControls.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js'
  ];

  function loadVendors() {
    return VENDORS.reduce((p, src) => p.then(() => loadScript(src)), Promise.resolve());
  }

  // -------------------------
  // Styles and UI injection
  // -------------------------
  function injectBaseLayout() {
    // Ensure page fills viewport and is dark without touching author CSS files
    const baseStyle = document.createElement('style');
    baseStyle.innerHTML = `
      html, body { height: 100%; margin: 0; padding: 0; background: #000; overflow: hidden; }
      #globe-container { width: 100%; height: 100%; }
    `;
    document.head.appendChild(baseStyle);
  }

  function injectGlobeUI(config) {
    if (document.getElementById('gl-ui-container')) return;

    const css = `
      #gl-infoBox{display:none;position:absolute;top:20px;left:20px;width:320px;max-height:calc(100vh - 40px);background:rgba(25,25,25,0.85);color:white;border:1px solid #444;border-radius:12px;padding:20px;box-shadow:0 8px 24px rgba(0,0,0,0.7);overflow-y:auto;z-index:100;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;transition:all 0.3s ease;}
      #gl-infoBox img{width:100%;height:auto;border-radius:8px;margin-bottom:15px;border:1px solid #555;}
      #gl-infoBox h3{margin-top:0;margin-bottom:15px;color:#ffb700;font-size:1.4em;}
      #gl-infoBox h4{margin-top:20px;margin-bottom:5px;color:#888;border-bottom:1px solid #444;padding-bottom:5px;font-size:0.9em;text-transform:uppercase;letter-spacing:0.5px;}
      #gl-infoBox p{margin-top:0;line-height:1.6;color:#ccc;}
      #gl-closeButton, #gl-resetButton{position:absolute;width:30px;height:30px;background:rgba(0,0,0,0.5);color:white;border:1px solid #777;border-radius:50%;text-align:center;cursor:pointer;font-weight:700;font-size:16px;user-select:none;z-index:101;transition:all 0.2s ease;}
      #gl-closeButton{top:15px;right:15px;line-height:28px;}
      #gl-resetButton{top:20px; right: 20px; line-height:30px; font-size:18px;}
      #gl-closeButton:hover, #gl-resetButton:hover{background:#ffb700;color:#000;transform:scale(1.1);}
      #gl-title{position:absolute;top:20px;left:50%;transform:translateX(-50%);color:#fff;font-size:1.5em;font-weight:300;text-shadow:0 0 10px rgba(0,0,0,0.8);z-index:50;pointer-events:none;text-align:center;}
      #gl-developer{position:absolute;bottom:15px;right:15px;font-size:0.8em;color:#aaa;z-index:50;}
      @media (max-width: 500px) {
        #gl-infoBox { width: calc(100% - 40px); left: 50%; top: auto; bottom: 20px; transform: translateX(-50%); max-height: 45vh; }
        #gl-title { font-size: 1.1em; width: 90%; }
        #gl-resetButton { top: auto; bottom: 20px; }
        #gl-developer { font-size: 0.7em; bottom: 5px; right: 5px; }
      }`;
    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    const uiHtml = `
      <div id="gl-ui-container">
        <div id="gl-infoBox">
          <div id="gl-closeButton">×</div>
          <h3 id="gl-infoName"></h3>
          <img id="gl-infoImage" src="" alt="Location Image">
          <h4>Description</h4>
          <p id="gl-infoDescEn"></p>
          <h4>介绍</h4>
          <p id="gl-infoDescZh"></p>
        </div>
        <div id="gl-resetButton">⟲</div>
        ${config.title ? `<div id="gl-title">${config.title}</div>` : ''}
        ${config.developerName ? `<div id="gl-developer">By ${config.developerName}</div>` : ''}
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', uiHtml);
  }

  function getUIRefs() {
    return {
      infoBox: document.getElementById('gl-infoBox'),
      closeButton: document.getElementById('gl-closeButton'),
      infoName: document.getElementById('gl-infoName'),
      infoImage: document.getElementById('gl-infoImage'),
      infoDescEn: document.getElementById('gl-infoDescEn'),
      infoDescZh: document.getElementById('gl-infoDescZh'),
      resetButton: document.getElementById('gl-resetButton')
    };
  }

  // -------------------------
  // Core globe logic
  // -------------------------
  function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  function createGlobe({ container, spotsData, title, developerName }) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const clock = new THREE.Clock();

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    container.appendChild(renderer.domElement);

    const initialCameraPosition = new THREE.Vector3(0, 5, 30);
    camera.position.copy(initialCameraPosition);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 10, 5);
    scene.add(dirLight);

    // Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 12;
    controls.maxDistance = 50;
    controls.enablePan = false;

    // Globe + stars + clouds
    const globeRadius = 10;
    const textureLoader = new THREE.TextureLoader();
    const stars = new THREE.Points(
      new THREE.SphereGeometry(500, 64, 64),
      new THREE.PointsMaterial({ color: 0xaaaaaa, size: 0.7, sizeAttenuation: true })
    );
    scene.add(stars);

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(globeRadius, 64, 64),
      new THREE.MeshPhongMaterial({
        map: textureLoader.load('https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg'),
        bumpMap: textureLoader.load('https://raw.githubusercontent.com/turban/webgl-earth/master/images/elev_bump_4k.jpg'),
        bumpScale: 0.01,
        specularMap: textureLoader.load('https://raw.githubusercontent.com/turban/webgl-earth/master/images/water_4k.png'),
        specular: new THREE.Color('grey'),
        shininess: 10
      })
    );
    scene.add(globe);

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(globeRadius + 0.05, 64, 64),
      new THREE.MeshPhongMaterial({
        map: textureLoader.load('https://raw.githubusercontent.com/turban/webgl-earth/master/images/fair_clouds_4k.png'),
        transparent: true,
        opacity: 0.8
      })
    );
    scene.add(clouds);

    // Beacons
    const beaconGroup = new THREE.Group();
    const beacons = [];
    spotsData.forEach(spot => {
      const beacon = new THREE.Group();

      const core = new THREE.Mesh(
        new THREE.CircleGeometry(0.1, 32),
        new THREE.MeshBasicMaterial({ color: 0xffa500, side: THREE.DoubleSide })
      );
      core.userData = spot;
      beacon.add(core);

      const ring1 = new THREE.Mesh(
        new THREE.RingGeometry(0.15, 0.2, 32),
        new THREE.MeshBasicMaterial({ color: 0xffa500, side: THREE.DoubleSide, transparent: true })
      );
      beacon.add(ring1);

      const ring2 = new THREE.Mesh(
        new THREE.RingGeometry(0.15, 0.2, 32),
        new THREE.MeshBasicMaterial({ color: 0xffa500, side: THREE.DoubleSide, transparent: true })
      );
      beacon.add(ring2);

      const position = latLonToVector3(spot.lat, spot.lon, globeRadius);
      beacon.position.copy(position);

      beacons.push({ group: beacon, core, ring1, ring2 });
      beaconGroup.add(beacon);
    });
    scene.add(beaconGroup);

    // UI
    injectGlobeUI({ title, developerName });
    const { infoBox, closeButton, infoName, infoImage, infoDescEn, infoDescZh, resetButton } = getUIRefs();

    // Interactivity
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let lastHovered = null;

    function updateInteractivity() {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(beacons.map(b => b.core));

      if (lastHovered && !intersects.find(i => i.object === lastHovered.core)) {
        gsap.to(lastHovered.group.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
        lastHovered = null;
        document.body.style.cursor = 'default';
      }
      if (intersects.length > 0) {
        const hoveredBeacon = beacons.find(b => b.core === intersects[0].object);
        if (hoveredBeacon && hoveredBeacon !== lastHovered) {
          gsap.to(hoveredBeacon.group.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.3 });
          lastHovered = hoveredBeacon;
        }
        document.body.style.cursor = 'pointer';
      }
    }

    function onMouseMove(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      mouse.x = x * 2 - 1;
      mouse.y = -(y * 2 - 1);
    }
    function onClick() {
      if (lastHovered) {
        const spot = lastHovered.core.userData;
        infoName.textContent = spot.name || '';
        infoImage.src = spot.image_url || '';
        infoDescEn.textContent = spot.desc_en || '';
        infoDescZh.textContent = spot.desc_zh || '';
        infoBox.style.display = 'block';

        const target = lastHovered.group.position.clone().multiplyScalar(2.0);
        gsap.to(camera.position, { x: target.x, y: target.y, z: target.z, duration: 1.5, ease: 'power3.inOut' });
        gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 1.5, ease: 'power3.inOut' });
      } else {
        infoBox.style.display = 'none';
      }
    }
    resetButton.onclick = () => {
      infoBox.style.display = 'none';
      gsap.to(camera.position, { x: initialCameraPosition.x, y: initialCameraPosition.y, z: initialCameraPosition.z, duration: 2, ease: 'power3.inOut' });
      gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 2, ease: 'power3.inOut' });
    };
    closeButton.onclick = () => { infoBox.style.display = 'none'; };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    // Resize
    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // Loop
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Billboarding and pulse
      beacons.forEach(b => {
        b.group.lookAt(camera.position);
        const p1 = t * 1.5;
        const s1 = 1 + (Math.sin(p1) + 1) / 2;
        b.ring1.scale.setScalar(s1);
        b.ring1.material.opacity = 1 - ((Math.sin(p1) + 1) / 2);

        const p2 = t * 1.5 + Math.PI;
        const s2 = 1 + (Math.sin(p2) + 1) / 2;
        b.ring2.scale.setScalar(s2);
        b.ring2.material.opacity = 1 - ((Math.sin(p2) + 1) / 2);
      });

      updateInteractivity();
      controls.update();
      renderer.render(scene, camera);
    }
    animate();
  }

  // -------------------------
  // Bootstrap
  // -------------------------
  function readConfig(container) {
    const title = container.getAttribute('data-title') || 'World Scenic Wonders';
    const developerName = container.getAttribute('data-developer') || '';
    const spotsUrl = container.getAttribute('data-spots-url') || '';
    return { title, developerName, spotsUrl };
  }

  function getSpotsData(container, cfg) {
    if (Array.isArray(window.GLOBE_SPOTS)) {
      return Promise.resolve(window.GLOBE_SPOTS);
    }
    if (cfg.spotsUrl) {
      return fetch(cfg.spotsUrl).then(r => r.json()).catch(() => DEMO_SPOTS);
    }
    return Promise.resolve(DEMO_SPOTS);
  }

  function ensureContainer() {
    let container = document.getElementById('globe-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'globe-container';
      document.body.appendChild(container);
    }
    container.style.width = '100%';
    container.style.height = '100%';
    return container;
  }

  function init() {
    injectBaseLayout();
    const container = ensureContainer();
    const cfg = readConfig(container);

    loadVendors()
      .then(() => getSpotsData(container, cfg))
      .then(spotsData => {
        createGlobe({
          container,
          spotsData,
          title: cfg.title,
          developerName: cfg.developerName
        });
      })
      .catch(err => {
        console.error('Globe initialization failed:', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
