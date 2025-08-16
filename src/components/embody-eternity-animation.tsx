"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

interface EmbodyEternityAnimationProps {
  onTakeMeIn: () => void;
}

export function EmbodyEternityAnimation({ onTakeMeIn }: EmbodyEternityAnimationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'loading' | 'idle' | 'exploding' | 'revealed'>('loading');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  // Explosion effect with fragments
  const createExplosionEffect = useCallback((solid: THREE.Mesh) => {
    const fragments: THREE.Mesh[] = [];
    const geometry = solid.geometry as THREE.BufferGeometry;
    const positions = geometry.attributes.position.array as Float32Array;
    
    // Create fragments from the original geometry
    for (let i = 0; i < positions.length; i += 9) { // Every 3 vertices form a triangle
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
      fragment.position.copy(solid.position);
      fragment.userData = {
        originalPosition: new THREE.Vector3(),
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
      
      fragments.push(fragment);
      sceneRef.current?.add(fragment);
    }
    
    return fragments;
  }, []);

  // Animation loop
  const animate = useCallback((time: number) => {
    if (!sceneRef.current || !rendererRef.current) return;

    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = scene.children.find(child => child instanceof THREE.PerspectiveCamera) as THREE.PerspectiveCamera;
    
    if (!camera) return;

    const frameTime = time * 0.001;

    if (animationPhase === 'idle') {
      // Gentle floating animation
      const solid = scene.children.find(child => child instanceof THREE.Mesh && !child.userData.isFragment) as THREE.Mesh;
      if (solid) {
        solid.rotation.x = Math.sin(frameTime * 0.5) * 0.3;
        solid.rotation.y = frameTime * 0.3;
        solid.rotation.z = Math.cos(frameTime * 0.3) * 0.2;
        solid.position.y = Math.sin(frameTime * 2) * 0.1;
        solid.scale.setScalar(0.8 + Math.sin(frameTime * 3) * 0.1);
      }
    } else if (animationPhase === 'exploding') {
      // Explosion animation
      const fragments = scene.children.filter(child => child instanceof THREE.Mesh && child.userData.isFragment) as THREE.Mesh[];
      
      fragments.forEach((fragment, index) => {
        const userData = fragment.userData;
        
        // Update position with velocity
        fragment.position.add(userData.velocity.clone().multiplyScalar(0.016)); // 60fps
        
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
        }
      });
      
      // Check if explosion is complete
      if (fragments.length === 0) {
        setAnimationPhase('revealed');
      }
    }

    renderer.render(scene, camera);
    animationIdRef.current = requestAnimationFrame(animate);
  }, [animationPhase]);

  // Handle "Take me in" click
  const handleTakeMeIn = useCallback(async () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setAnimationPhase('exploding');
    
    // Create explosion effect
    const solid = sceneRef.current?.children.find(child => child instanceof THREE.Mesh && !child.userData.isFragment) as THREE.Mesh;
    if (solid) {
      const fragments = createExplosionEffect(solid);
      solid.visible = false;
      
      // Mark fragments for animation
      fragments.forEach(fragment => {
        fragment.userData.isFragment = true;
      });
    }
    
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

    // Create platonic solid (octahedron)
    const geometry = new THREE.OctahedronGeometry(1.5, 0);
    const material = new THREE.MeshPhongMaterial({
      color: 0x3B82F6,
      transparent: true,
      opacity: 0.9,
      shininess: 100,
      emissive: 0x1E40AF,
      emissiveIntensity: 0.2
    });

    const solid = new THREE.Mesh(geometry, material);
    solid.castShadow = true;
    solid.receiveShadow = true;
    scene.add(solid);

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
    setAnimationPhase('idle');

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
    <div className="relative h-screen w-screen overflow-hidden embody-eternity">
      {/* Three.js Canvas - Background Layer */}
      <div 
        ref={mountRef} 
        className="absolute inset-0 pointer-events-none" 
        style={{ zIndex: 0 }}
      />
      
      {/* Frame - Top Section */}
      <div className="absolute top-0 left-0 right-0 z-10 p-8">
        <div className="flex justify-between items-start">
          <div className="text-white">
            <h1 className="text-2xl frame-title">EMBODY ETERNITY</h1>
          </div>
          <div className="text-white text-sm">
            <a href="mailto:Contact@asineedit.com" className="hover:text-blue-400 transition-colors">
              Contact@asineedit.com
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        {/* Take me in button */}
        <div className="mb-8">
          <Button
            onClick={handleTakeMeIn}
            disabled={isTransitioning}
            size="lg"
            className="group content-button px-8 py-4 text-lg rounded-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative z-20"
            style={{ pointerEvents: 'auto' }}
          >
            {isTransitioning ? 'EXPLODING...' : 'TAKE ME IN'}
          </Button>
        </div>

        {/* Content details */}
        <div className="text-center text-white mb-12">
          <h3 className="text-lg content-location mb-2">SINGULARITY</h3>
          <h1 className="text-6xl md:text-8xl content-title">
            AS&nbsp;I&nbsp;NEED&nbsp;IT
          </h1>
        </div>

        {/* Artist list */}
        <div className="grid grid-cols-2 gap-8 text-white text-sm max-w-4xl mx-auto px-8">
          <div className="space-y-2">
            <div className="content-inner-item--date">14</div>
            <div className="content-inner-item">DJ Madow</div>
            <div className="content-inner-item">Franklin Doe</div>
            <div className="content-inner-item">Josh Z</div>
            <div className="content-inner-item">Stevvy</div>
            <div className="content-inner-item">Supernova</div>
            <div className="content-inner-item">Kiz</div>
            <div className="content-inner-item">BrickX</div>
            <div className="content-inner-item">Miss Kara</div>
            <div className="content-inner-item">Beatlove</div>
            <div className="content-inner-item">DJ Oxymoron</div>
            <div className="content-inner-item">Couture</div>
            <div className="content-inner-item">The Wild B</div>
            <div className="content-inner-item">Honey</div>
            <div className="content-inner-item">DJ K</div>
            <div className="content-inner-item">Frankie</div>
            <div className="content-inner-item">Soundfreak</div>
            <div className="content-inner-item">Grind</div>
          </div>
          <div className="space-y-2">
            <div className="content-inner-item--date">15</div>
            <div className="content-inner-item">Fan C</div>
            <div className="content-inner-item">The Kid</div>
            <div className="content-inner-item">Nelly</div>
            <div className="content-inner-item">Bubblegum</div>
            <div className="content-inner-item">Hot Monogram</div>
            <div className="content-inner-item">DJ Maximus</div>
            <div className="content-inner-item">Laura Gambler</div>
            <div className="content-inner-item">Starduust</div>
            <div className="content-inner-item">General XYZ</div>
            <div className="content-inner-item">Frank The Tank</div>
            <div className="content-inner-item">Pestcontrol</div>
            <div className="content-inner-item">Free Room</div>
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