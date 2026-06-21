"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

interface DivineTitleProps {
  children: React.ReactNode;
}

export default function DivineTitle({ children }: DivineTitleProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values tracking mouse position (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for fluid physics (prevents jerky movements)
  const springConfig = { damping: 20, stiffness: 120, mass: 0.4 };
  const rotateXSpring = useSpring(y, springConfig);
  const rotateYSpring = useSpring(x, springConfig);

  // Map position to degrees of rotation (Max 4 degrees for an elegant, subtle look)
  const rotateX = useTransform(rotateXSpring, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(rotateYSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

  // 🌟 BONUS: Metallic Sweep Translation (Shimmer moves slightly with mouse)
  const shimmerX = useTransform(rotateYSpring, [-0.5, 0.5], ["30%", "70%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!targetRef.current) return;

    const rect = targetRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate normalized mouse coords from center of the text (-0.5 to 0.5)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={targetRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="inline-block relative overflow-visible select-none"
      style={{ perspective: "1000px" }} // Enables 3D space depth
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="transition-all duration-100 ease-out"
      >
        {/* 🌟 METALLIC SHIMMER OVERLAY (Applies gradient clip-text to children if they are standard text) */}
        <div 
          className={`relative transition-all duration-700 ${
            isHovered 
              ? 'brightness-125 saturate-110 drop-shadow-[0_10px_20px_rgba(245,158,11,0.15)]' 
              : ''
          }`}
          style={{
            transform: "translateZ(30px)", // Pushes text out in 3D space
          }}
        >
          {children}

          {/* Golden Shimmer Sheen Effect */}
          <motion.div
            className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `linear-gradient(90deg, transparent 0%, rgba(254,243,199,0.4) 50%, transparent 100%)`,
              left: "-50%",
              right: "-50%",
              x: shimmerX,
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}