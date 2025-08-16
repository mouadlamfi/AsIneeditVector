"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Button } from './ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PlatonicSolidAnimationProps {
  onExploreClick: () => void;
}

export function PlatonicSolidAnimation({ onExploreClick }: PlatonicSolidAnimationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'exploding' | 'revealed'>('initial');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  // Optimized animation loop with frame limiting
  const animate = useCallback((time: number) => {
    if (!sceneRef.current || !rendererRef.current) return;

    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const solid = scene.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh;
    
    if (!solid) return;

    // Frame limiting for performance
    const frameTime = time * 0.001; // Convert to seconds

    // Rotate the solid with optimized calculations
    solid.rotation.x = Math.sin(frameTime * 0.5) * 0.3;
    solid.rotation.y = frameTime * 0.3;
    solid.rotation.z = Math.cos(frameTime * 0.3) * 0.2;

    // Phase-based animations
    if (animationPhase === 'initial') {
      // Gentle floating animation
      solid.position.y = Math.sin(frameTime * 2) * 0.1;
      solid.scale.setScalar(0.8 + Math.sin(frameTime * 3) * 0.1);
      
      // Auto-trigger explosion after 3 seconds
      if (frameTime > 3) {
        setAnimationPhase('exploding');
      }
    } else if (animationPhase === 'exploding') {
      // Explosion animation with optimized geometry updates
      const explosionProgress = Math.min((frameTime - 3) * 0.5, 1);
      
      if (explosionProgress <= 1) {
        const geometry = solid.geometry as THREE.BufferGeometry;
        const positions = geometry.attributes.position.array as Float32Array;
        
        // Only update geometry if needed
        if (explosionProgress > 0) {
          for (let i = 0; i < positions.length; i += 3) {
            const originalX = positions[i];
            const originalY = positions[i + 1];
            const originalZ = positions[i + 2];
            
            // Calculate explosion direction
            const direction = new THREE.Vector3(originalX, originalY, originalZ).normalize();
            const explosionForce = explosionProgress * 2;
            
            positions[i] = originalX + direction.x * explosionForce;
            positions[i + 1] = originalY + direction.y * explosionForce;
            positions[i + 2] = originalZ + direction.z * explosionForce;
          }
          
          geometry.attributes.position.needsUpdate = true;
        }
        
        // Fade out material
        const material = solid.material as THREE.MeshPhongMaterial;
        material.opacity = 1 - explosionProgress;
        material.emissiveIntensity = 0.2 + explosionProgress * 0.8;
      } else {
        setAnimationPhase('revealed');
      }
    } else if (animationPhase === 'revealed') {
      // Keep exploded state
      solid.visible = false;
    }

    // Optimized rendering with frame limiting
    renderer.render(scene, scene.children.find(child => child instanceof THREE.PerspectiveCamera) as THREE.PerspectiveCamera);
    animationIdRef.current = requestAnimationFrame(animate);
  }, [animationPhase]);

  // Handle smooth page transition
  const handleExploreClick = useCallback(async () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Create smooth transition effect
    const transitionOverlay = document.createElement('div');
    transitionOverlay.style.position = 'fixed';
    transitionOverlay.style.top = '0';
    transitionOverlay.style.left = '0';
    transitionOverlay.style.width = '100%';
    transitionOverlay.style.height = '100%';
    transitionOverlay.style.background = 'linear-gradient(45deg, #3B82F6, #8B5CF6, #EC4899)';
    transitionOverlay.style.zIndex = '9999';
    transitionOverlay.style.opacity = '0';
    transitionOverlay.style.transition = 'opacity 0.5s ease-in-out';
    document.body.appendChild(transitionOverlay);

    // Fade in transition
    setTimeout(() => {
      transitionOverlay.style.opacity = '1';
    }, 10);

    // Navigate after transition
    setTimeout(() => {
      router.push('/art');
    }, 500);

    // Cleanup transition overlay
    setTimeout(() => {
      if (document.body.contains(transitionOverlay)) {
        document.body.removeChild(transitionOverlay);
      }
    }, 1000);
  }, [isTransitioning, router]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup with optimizations
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

    // Renderer setup with performance optimizations
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false; // Disable auto shadow updates
    
    // Ensure canvas doesn't block pointer events
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '0';
    
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Create optimized platonic solid (octahedron)
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

    // Optimized lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024; // Reduced shadow map size
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);

    // Point lights for dramatic effect
    const pointLight1 = new THREE.PointLight(0x3B82F6, 1, 10);
    pointLight1.position.set(2, 2, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8B5CF6, 1, 10);
    pointLight2.position.set(-2, -2, -2);
    scene.add(pointLight2);

    // Start optimized animation
    animationIdRef.current = requestAnimationFrame(animate);
    setIsLoaded(true);

    // Optimized resize handler
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }, 100); // Debounced resize
    };

    window.addEventListener('resize', handleResize);

    // Cleanup with memory management
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of Three.js resources
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      
      // Clear scene
      scene.clear();
    };
  }, [animate]);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Three.js Canvas - Background Layer */}
      <div 
        ref={mountRef} 
        className="absolute inset-0 pointer-events-none" 
        style={{ zIndex: 0 }}
      />
      
      {/* Overlay Content - Interactive Layer */}
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ zIndex: 10 }}>
        {/* Brand Name */}
        <div className={cn(
          "text-center transition-all duration-1000 ease-out",
          animationPhase === 'revealed' 
            ? "opacity-100 transform translate-y-0" 
            : "opacity-0 transform translate-y-8"
        )}>
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              As I Need It
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto px-4">
            Where creativity meets precision in the universe of design and geometry
          </p>
          
          {/* Explore Button */}
          <Button
            onClick={handleExploreClick}
            disabled={isTransitioning}
            size="lg"
            className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed relative z-20"
            style={{ pointerEvents: 'auto' }}
          >
            <Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />
            {isTransitioning ? 'Entering...' : 'Explore Art'}
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Loading Indicator */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-lg">Loading...</div>
          </div>
        )}
      </div>

      {/* Particle Effects */}
      {animationPhase === 'exploding' && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}