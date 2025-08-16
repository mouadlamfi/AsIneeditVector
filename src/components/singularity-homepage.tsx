"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

interface SingularityHomepageProps {
  onTakeMeIn: () => void;
}

export function SingularityHomepage({ onTakeMeIn }: SingularityHomepageProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const fragmentsRef = useRef<THREE.Mesh[]>([]);
  const icoRef = useRef<THREE.Mesh | null>(null);

  // Create explosion effect
  const createExplosionEffect = useCallback(() => {
    if (!icoRef.current || !sceneRef.current) return;

    const ico = icoRef.current;
    const scene = sceneRef.current;
    const geometry = ico.geometry as THREE.BufferGeometry;
    const positions = geometry.attributes.position.array as Float32Array;
    
    // Create fragments from the original geometry
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
      fragment.position.copy(ico.position);
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
      
      fragmentsRef.current.push(fragment);
      scene.add(fragment);
    }
    
    // Hide original ICO
    ico.visible = false;
  }, []);

  // Animation loop
  const animate = useCallback((time: number) => {
    if (!sceneRef.current || !rendererRef.current) return;

    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = scene.children.find(child => child instanceof THREE.PerspectiveCamera) as THREE.PerspectiveCamera;
    
    if (!camera) return;

    const frameTime = time * 0.001;

    if (!isExploding) {
      // Gentle floating animation
      if (icoRef.current) {
        icoRef.current.rotation.x = Math.sin(frameTime * 0.5) * 0.3;
        icoRef.current.rotation.y = frameTime * 0.3;
        icoRef.current.rotation.z = Math.cos(frameTime * 0.3) * 0.2;
        icoRef.current.position.y = Math.sin(frameTime * 2) * 0.1;
        icoRef.current.scale.setScalar(0.8 + Math.sin(frameTime * 3) * 0.1);
      }
    } else {
      // Explosion animation
      fragmentsRef.current.forEach((fragment, index) => {
        const userData = fragment.userData;
        
        // Update position with velocity
        fragment.position.add(userData.velocity.clone().multiplyScalar(0.016));
        
        // Update rotation
        fragment.rotation.x += userData.rotation.x * 0.016;
        fragment.rotation.y += userData.rotation.y * 0.016;
        fragment.rotation.z += userData.rotation.z * 0.016;
        
        // Fade out
        const material = fragment.material as THREE.MeshPhongMaterial;
        material.opacity = Math.max(0, material.opacity - 0.01);
        
        // Remove fragment when fully transparent
        if (material.opacity <= 0) {
          scene.remove(fragment);
          fragment.geometry.dispose();
          material.dispose();
          fragmentsRef.current.splice(index, 1);
        }
      });
    }

    renderer.render(scene, camera);
    animationIdRef.current = requestAnimationFrame(animate);
  }, [isExploding]);

  // Handle "Take me in" click
  const handleTakeMeIn = useCallback(async () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setIsExploding(true);
    
    // Create explosion effect
    createExplosionEffect();
    
    // Wait for explosion to complete, then navigate
    setTimeout(() => {
      onTakeMeIn();
    }, 2000);
  }, [isTransitioning, createExplosionEffect, onTakeMeIn]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    scene.add(camera);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Ensure canvas doesn't block pointer events
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '0';
    
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Create icosahedron
    const geometry = new THREE.IcosahedronGeometry(1.5, 0);
    const material = new THREE.MeshPhongMaterial({
      color: 0x3B82F6,
      transparent: true,
      opacity: 0.9,
      shininess: 100,
      emissive: 0x1E40AF,
      emissiveIntensity: 0.2
    });

    const ico = new THREE.Mesh(geometry, material);
    ico.castShadow = true;
    ico.receiveShadow = true;
    scene.add(ico);
    icoRef.current = ico;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Point lights for dramatic effect
    const pointLight1 = new THREE.PointLight(0x3B82F6, 1, 10);
    pointLight1.position.set(2, 2, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8B5CF6, 1, 10);
    pointLight2.position.set(-2, -2, -2);
    scene.add(pointLight2);

    // Start animation
    animationIdRef.current = requestAnimationFrame(animate);
    setIsLoaded(true);

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      scene.clear();
    };
  }, [animate, createExplosionEffect]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Three.js Canvas - Background Layer */}
      <div 
        ref={mountRef} 
        className="absolute inset-0 pointer-events-none" 
        style={{ zIndex: 0 }}
      />
      
      {/* Frame - Top Section */}
      <div className="absolute top-0 left-0 right-0 z-[9999] p-8">
        <div className="flex justify-between items-start">
          <div className="text-white">
            <h1 className="text-2xl font-bold tracking-wider">EMBODY ETERNITY</h1>
          </div>
          <div className="text-white text-sm">
            <a href="mailto:Contact@asineedit.com" className="hover:text-blue-400 transition-colors">
              Contact@asineedit.com
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-[9999]">
        {/* Take me in button */}
        <div className="mb-8">
          <button
            onClick={handleTakeMeIn}
            disabled={isTransitioning}
            className="group bg-transparent border-2 border-white text-white px-8 py-4 text-lg font-semibold rounded-none hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ pointerEvents: 'auto' }}
          >
            {isTransitioning ? 'EXPLODING...' : 'TAKE ME IN'}
          </button>
        </div>

        {/* Content details */}
        <div className="text-center text-white mb-12">
          <h3 className="text-lg font-light tracking-wider mb-2">SINGULARITY</h3>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
            AS&nbsp;I&nbsp;NEED&nbsp;IT
          </h1>
        </div>

        {/* Artist list */}
        <div className="grid grid-cols-2 gap-8 text-white text-sm max-w-4xl mx-auto px-8">
          <div className="space-y-2">
            <div className="font-bold text-lg">14</div>
            <div>DJ Madow</div>
            <div>Franklin Doe</div>
            <div>Josh Z</div>
            <div>Stevvy</div>
            <div>Supernova</div>
            <div>Kiz</div>
            <div>BrickX</div>
            <div>Miss Kara</div>
            <div>Beatlove</div>
            <div>DJ Oxymoron</div>
            <div>Couture</div>
            <div>The Wild B</div>
            <div>Honey</div>
            <div>DJ K</div>
            <div>Frankie</div>
            <div>Soundfreak</div>
            <div>Grind</div>
          </div>
          <div className="space-y-2">
            <div className="font-bold text-lg">15</div>
            <div>Fan C</div>
            <div>The Kid</div>
            <div>Nelly</div>
            <div>Bubblegum</div>
            <div>Hot Monogram</div>
            <div>DJ Maximus</div>
            <div>Laura Gambler</div>
            <div>Starduust</div>
            <div>General XYZ</div>
            <div>Frank The Tank</div>
            <div>Pestcontrol</div>
            <div>Free Room</div>
          </div>
        </div>

        {/* Loading Indicator */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-lg">Loading...</div>
          </div>
        )}
      </div>
    </div>
  );
}