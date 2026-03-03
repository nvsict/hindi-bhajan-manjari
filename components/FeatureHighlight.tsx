"use client";

import { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

interface FeatureHighlightProps {
  children: React.ReactNode;
  featureId: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export default function FeatureHighlight({ 
  children, 
  featureId, 
  title, 
  description,
  position = 'top',
  delay = 1000
}: FeatureHighlightProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [xOffset, setXOffset] = useState(0); // 🌟 Tracks how much to nudge the tooltip

  useEffect(() => {
    const hasSeen = localStorage.getItem(`has_seen_${featureId}`);
    if (!hasSeen) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [featureId, delay]);

  // 🌟 SMART EDGE DETECTION: Prevents mobile screen bleeding
  useEffect(() => {
    if (isVisible && tooltipRef.current && (position === 'top' || position === 'bottom')) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const safePadding = 16; // 16px gap from the edge of the phone screen
      
      let shift = 0;
      if (rect.right > window.innerWidth - safePadding) {
        shift = (window.innerWidth - safePadding) - rect.right; // Nudge left
      } else if (rect.left < safePadding) {
        shift = safePadding - rect.left; // Nudge right
      }
      setXOffset(shift);
    }
  }, [isVisible, position]);

  const dismissHighlight = () => {
    setIsVisible(false);
    localStorage.setItem(`has_seen_${featureId}`, 'true');
  };

  const positionMap = {
    top: 'bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2',
    bottom: 'top-[calc(100%+10px)] left-1/2 -translate-x-1/2',
    left: 'right-[calc(100%+10px)] top-1/2 -translate-y-1/2',
    right: 'left-[calc(100%+10px)] top-1/2 -translate-y-1/2',
  };

  const arrowMap = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-b border-r border-orange-200',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-t border-l border-orange-200',
    left: 'right-[-4px] top-1/2 -translate-y-1/2 border-t border-r border-orange-200',
    right: 'left-[-4px] top-1/2 -translate-y-1/2 border-b border-l border-orange-200',
  };

  return (
    <div className="relative flex w-full sm:w-auto items-center justify-center">
      <div onClick={dismissHighlight} className="relative z-[9999] w-full h-full">
        {children}
        {isVisible && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 z-20">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500 border border-white"></span>
          </span>
        )}
      </div>

      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`absolute z-[99999] w-52 ${positionMap[position]} animate-fade-in-up pointer-events-auto transition-all duration-300`}
          style={{ marginLeft: `${xOffset}px` }} // 🌟 Applies the exact nudge needed
        >
          {/* MICRO BUBBLE */}
          <div className="bg-white border border-orange-200 p-3 rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.15)] relative">
            
            {/* The Arrow (Counter-shifts to stay pointed at the button!) */}
            <div 
              className={`absolute w-2 h-2 bg-white rotate-45 ${arrowMap[position]}`}
              style={{ marginLeft: `${-xOffset}px` }} 
            ></div>
            
            <div className="flex justify-between items-start gap-2 relative z-10">
              <div className="flex-1">
                <h4 className="font-bold text-orange-600 text-[12px] leading-none mb-1">{title}</h4>
                <p className="text-[11px] text-gray-600 leading-tight">{description}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); dismissHighlight(); }}
                className="text-gray-400 hover:text-orange-500 transition-colors p-0.5"
                aria-label="Dismiss"
              >
                <FaTimes size={10} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}