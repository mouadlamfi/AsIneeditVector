"use client";

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Button } from './ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

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

    // Renderer setup with optimizations
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add point lights for dramatic effect
    const pointLight1 = new THREE.PointLight(0x3B82F6, 1, 10);
    pointLight1.position.set(2, 2, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8B5CF6, 1, 10);
    pointLight2.position.set(-2, -2, -2);
    scene.add(pointLight2);

    // Animation variables
    let time = 0;
    let explosionProgress = 0;
    const originalVertices = geometry.attributes.position.clone();
    const originalPositions = new Float32Array(originalVertices.array);

    // Optimized animation loop
    const animate = () => {
      time += 0.016; // ~60fps

      // Rotate the solid
      solid.rotation.x = Math.sin(time * 0.5) * 0.3;
      solid.rotation.y = time * 0.3;
      solid.rotation.z = Math.cos(time * 0.3) * 0.2;

      // Phase-based animations
      if (animationPhase === 'initial') {
        // Gentle floating animation
        solid.position.y = Math.sin(time * 2) * 0.1;
        solid.scale.setScalar(0.8 + Math.sin(time * 3) * 0.1);
        
        // Auto-trigger explosion after 3 seconds
        if (time > 3) {
          setAnimationPhase('exploding');
        }
      } else if (animationPhase === 'exploding') {
        // Explosion animation
        explosionProgress += 0.02;
        
        if (explosionProgress <= 1) {
          // Distort geometry
          const positions = geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < positions.length; i += 3) {
            const originalX = originalPositions[i];
            const originalY = originalPositions[i + 1];
            const originalZ = originalPositions[i + 2];
            
            // Calculate explosion direction
            const direction = new THREE.Vector3(originalX, originalY, originalZ).normalize();
            const explosionForce = explosionProgress * 2;
            
            positions[i] = originalX + direction.x * explosionForce;
            positions[i + 1] = originalY + direction.y * explosionForce;
            positions[i + 2] = originalZ + direction.z * explosionForce;
          }
          
          geometry.attributes.position.needsUpdate = true;
          
          // Fade out material
          material.opacity = 1 - explosionProgress;
          material.emissiveIntensity = 0.2 + explosionProgress * 0.8;
        } else {
          setAnimationPhase('revealed');
        }
      } else if (animationPhase === 'revealed') {
        // Keep exploded state
        solid.visible = false;
      }

      // Optimized rendering
      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();
    setIsLoaded(true);

    // Handle resize
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
    };
  }, [animationPhase]);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Three.js Canvas */}
      <div ref={mountRef} className="absolute inset-0" />
      
      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
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
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Where creativity meets precision in the universe of design and geometry
          </p>
          
          {/* Explore Button */}
          <Button
            onClick={onExploreClick}
            size="lg"
            className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />
            Explore Art
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
        <div className="absolute inset-0 pointer-events-none">
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