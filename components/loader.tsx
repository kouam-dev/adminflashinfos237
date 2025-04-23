import { useState, useEffect } from 'react';

export default function FlashLoader() {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    // Animation de rotation continue par tours de 360°
    const spinInterval = setInterval(() => {
      setRotation(prev =>  prev + 6);
    }, 50);
    
    // Animation de pulsation
    const pulseInterval = setInterval(() => {
      setScale(prev => prev === 1 ? 1.1 : 1);
    }, 700);
    
    return () => {
      clearInterval(spinInterval);
      clearInterval(pulseInterval);
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center w-full h-64">
      <div 
        style={{ 
          transform: `rotate(${rotation}deg) scale(${scale})`,
          width: '80px',
          height: '80px',
          transformOrigin: 'center center',
          transition: 'transform 0.1s linear'
        }}
      >
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          {/* Définition du gradient avec plus d'espace pour le vert */}
          <defs>
            <linearGradient id="adjustedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="40%" stopColor="#047857" />
              <stop offset="60%" stopColor="#dc2626" />
              <stop offset="80%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          
          {/* Cercle avec le gradient ajusté */}
          <circle cx="16" cy="16" r="16" fill="url(#adjustedGradient)" />
          
          {/* Symbole éclair (flash) en blanc */}
          <path d="M18 4 L10 16 L15 16 L14 28 L22 16 L17 16 Z" fill="white" stroke="white" strokeWidth="0.5" />
        </svg>
      </div>
      
      <p className="mt-4 text-lg font-semibold text-gray-700">Chargement en cours...</p>
      
      {/* Points de chargement animés avec les couleurs thématiques */}
      <div className="flex mt-2">
        <LoadingDot delay={0} color="#047857" /> {/* Point vert */}
        <LoadingDot delay={300} color="#dc2626" /> {/* Point rouge */}
        <LoadingDot delay={600} color="#f59e0b" /> {/* Point jaune/orange */}
      </div>
    </div>
  );
}

// Composant pour les points de chargement colorés
function LoadingDot({ delay, color }: { delay: number; color: string }) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(prev => !prev);
    }, 600);
    
    // Décalage initial pour une animation en séquence
    const timeout = setTimeout(() => {
      setVisible(true);
    }, delay);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [delay]);
  
  return (
    <div 
      className={`h-3 w-3 mx-1 rounded-full transition-all duration-300 ${
        visible ? 'opacity-100' : 'opacity-30'
      }`}
      style={{ backgroundColor: color }}
    />
  );
}