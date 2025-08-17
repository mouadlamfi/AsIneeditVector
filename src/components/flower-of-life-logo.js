"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Sacred geometry constants
const PHI = 1.618; // Golden ratio
const FIBONACCI = [1, 1, 2, 3, 5, 8, 13, 21]; // Fibonacci sequence
const ANIMATION_TIMINGS = {
  IDLE: 2584, // Fibonacci number for breathing
  HOVER: 1597, // Golden ratio * 1000
  CLICK: 377, // Fibonacci number
  CIRCLE_DELAY: 161.8, // Golden ratio * 100
};

export function FlowerOfLifeLogo({ 
  onClick, 
  className, 
  animated = true, 
  size = 60 
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('idle');

  // Circle positions based on sacred geometry
  const radius = size / 6; // Base radius
  const centerX = size / 2;
  const centerY = size / 2;
  
  // 7 circles: 1 center + 6 surrounding
  const circlePositions = [
    // Center circle
    { cx: centerX, cy: centerY, r: radius, delay: 0 },
    // 6 surrounding circles at 60° intervals
    { cx: centerX + radius * PHI, cy: centerY, r: radius, delay: 1 },
    { cx: centerX + radius * PHI * Math.cos(Math.PI / 3), cy: centerY + radius * PHI * Math.sin(Math.PI / 3), r: radius, delay: 2 },
    { cx: centerX + radius * PHI * Math.cos(2 * Math.PI / 3), cy: centerY + radius * PHI * Math.sin(2 * Math.PI / 3), r: radius, delay: 3 },
    { cx: centerX - radius * PHI, cy: centerY, r: radius, delay: 4 },
    { cx: centerX + radius * PHI * Math.cos(4 * Math.PI / 3), cy: centerY + radius * PHI * Math.sin(4 * Math.PI / 3), r: radius, delay: 5 },
    { cx: centerX + radius * PHI * Math.cos(5 * Math.PI / 3), cy: centerY + radius * PHI * Math.sin(5 * Math.PI / 3), r: radius, delay: 6 },
  ];

  // Handle click with animation
  const handleClick = () => {
    if (!animated) {
      onClick();
      return;
    }

    setIsClicked(true);
    setAnimationPhase('click');

    // Fibonacci expansion timing
    setTimeout(() => {
      onClick();
      setIsClicked(false);
      setAnimationPhase('idle');
    }, FIBONACCI[3] * 10); // 30ms delay
  };

  // Handle hover
  const handleMouseEnter = () => {
    if (animated) {
      setIsHovered(true);
      setAnimationPhase('hover');
    }
  };

  const handleMouseLeave = () => {
    if (animated) {
      setIsHovered(false);
      setAnimationPhase('idle');
    }
  };

  return (
    <div
      className={cn(
        "relative cursor-pointer select-none",
        "transition-all duration-300 ease-out",
        animated && "flower-logo",
        animationPhase === 'idle' && animated && "flower-logo-idle",
        animationPhase === 'hover' && animated && "flower-logo-hover",
        animationPhase === 'click' && animated && "flower-logo-click",
        className
      )}
      style={{
        width: size,
        height: size,
        transform: isClicked ? 'scale(0.95)' : isHovered ? 'scale(1.05)' : 'scale(1)',
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
        style={{ pointerEvents: 'none' }}
      >
        <defs>
          {/* Golden gradient definitions */}
          <radialGradient id="goldGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#FFA500" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FF8C00" stopOpacity="0.5" />
          </radialGradient>
          
          <radialGradient id="goldGradientHover" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF8DC" stopOpacity="1" />
            <stop offset="70%" stopColor="#FFD700" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFA500" stopOpacity="0.7" />
          </radialGradient>

          <radialGradient id="goldGradientClick" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="50%" stopColor="#FFD700" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFA500" stopOpacity="0.8" />
          </radialGradient>
        </defs>

        {/* Render each circle with individual animations */}
        {circlePositions.map((circle, index) => (
          <circle
            key={index}
            cx={circle.cx}
            cy={circle.cy}
            r={circle.r}
            fill="none"
            stroke={isClicked ? "url(#goldGradientClick)" : isHovered ? "url(#goldGradientHover)" : "url(#goldGradient)"}
            strokeWidth={isClicked ? "2.5" : isHovered ? "2" : "1.5"}
            className={cn(
              "transition-all duration-300 ease-out",
              animated && "flower-circle",
              `circle-${index}`
            )}
            style={{
              transformOrigin: `${circle.cx}px ${circle.cy}px`,
              animationDelay: `${circle.delay * ANIMATION_TIMINGS.CIRCLE_DELAY}ms`,
              opacity: isClicked ? 1 : isHovered ? 0.9 : 0.8,
            }}
          />
        ))}

        {/* Intersection points for sacred geometry effect */}
        {circlePositions.slice(1).map((circle, index) => {
          const angle = (index * 60) * Math.PI / 180;
          const intersectionX = centerX + radius * PHI * Math.cos(angle);
          const intersectionY = centerY + radius * PHI * Math.sin(angle);
          
          return (
            <circle
              key={`intersection-${index}`}
              cx={intersectionX}
              cy={intersectionY}
              r={isClicked ? "3" : isHovered ? "2" : "1"}
              fill={isClicked ? "#FFD700" : isHovered ? "#FFA500" : "#FF8C00"}
              className="transition-all duration-300 ease-out"
              style={{
                opacity: isClicked ? 1 : isHovered ? 0.8 : 0.6,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}