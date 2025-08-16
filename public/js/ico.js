/**
 * ICO - Exploding Objects Effect
 * Based on the original singularity design
 */

class ICO {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.ico = null;
    this.fragments = [];
    this.isExploding = false;
    this.animationId = null;
    
    this.init();
  }

  init() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add to DOM
    const container = document.getElementById('container');
    if (container) {
      container.appendChild(this.renderer.domElement);
    }

    // Create ICO
    this.createICO();

    // Lighting
    this.setupLighting();

    // Start animation
    this.animate();

    // Handle resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  createICO() {
    // Create icosahedron geometry
    const geometry = new THREE.IcosahedronGeometry(1.5, 0);
    const material = new THREE.MeshPhongMaterial({
      color: 0x3B82F6,
      transparent: true,
      opacity: 0.9,
      shininess: 100,
      emissive: 0x1E40AF,
      emissiveIntensity: 0.2
    });

    this.ico = new THREE.Mesh(geometry, material);
    this.ico.castShadow = true;
    this.ico.receiveShadow = true;
    this.scene.add(this.ico);
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // Point lights for dramatic effect
    const pointLight1 = new THREE.PointLight(0x3B82F6, 1, 10);
    pointLight1.position.set(2, 2, 2);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8B5CF6, 1, 10);
    pointLight2.position.set(-2, -2, -2);
    this.scene.add(pointLight2);
  }

  explode() {
    if (this.isExploding) return;
    
    this.isExploding = true;
    
    // Create fragments from the original geometry
    const geometry = this.ico.geometry;
    const positions = geometry.attributes.position.array;
    
    // Create fragments for each face
    for (let i = 0; i < positions.length; i += 9) {
      const fragmentGeometry = new THREE.BufferGeometry();
      const fragmentPositions = new Float32Array(9);
      
      for (let j = 0; j < 9; j++) {
        fragmentPositions[j] = positions[i + j];
      }
      
      fragmentGeometry.setAttribute('position', new THREE.BufferAttribute(fragmentPositions, 3));
      fragmentGeometry.computeVertexNormals();
      
      const fragmentMaterial = new THREE.MeshPhongMaterial({
        color: 0x3B82F6,
        transparent: true,
        opacity: 0.9,
        shininess: 100,
        emissive: 0x1E40AF,
        emissiveIntensity: 0.2
      });
      
      const fragment = new THREE.Mesh(fragmentGeometry, fragmentMaterial);
      fragment.position.copy(this.ico.position);
      fragment.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ),
        rotation: new THREE.Vector3(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        )
      };
      
      this.fragments.push(fragment);
      this.scene.add(fragment);
    }
    
    // Hide original ICO
    this.ico.visible = false;
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    if (!this.isExploding) {
      // Gentle floating animation
      this.ico.rotation.x = Math.sin(time * 0.5) * 0.3;
      this.ico.rotation.y = time * 0.3;
      this.ico.rotation.z = Math.cos(time * 0.3) * 0.2;
      this.ico.position.y = Math.sin(time * 2) * 0.1;
      this.ico.scale.setScalar(0.8 + Math.sin(time * 3) * 0.1);
    } else {
      // Explosion animation
      this.fragments.forEach((fragment, index) => {
        const userData = fragment.userData;
        
        // Update position with velocity
        fragment.position.add(userData.velocity.clone().multiplyScalar(0.016));
        
        // Update rotation
        fragment.rotation.x += userData.rotation.x * 0.016;
        fragment.rotation.y += userData.rotation.y * 0.016;
        fragment.rotation.z += userData.rotation.z * 0.016;
        
        // Fade out
        const material = fragment.material;
        material.opacity = Math.max(0, material.opacity - 0.01);
        
        // Remove fragment when fully transparent
        if (material.opacity <= 0) {
          this.scene.remove(fragment);
          fragment.geometry.dispose();
          material.dispose();
          this.fragments.splice(index, 1);
        }
      });
    }

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    if (this.ico) {
      this.ico.geometry.dispose();
      this.ico.material.dispose();
    }
    
    this.fragments.forEach(fragment => {
      fragment.geometry.dispose();
      fragment.material.dispose();
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.ico = new ICO();
});