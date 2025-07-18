import React, { useEffect, useState } from 'react';

const FloatingElements = () => {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    // Створюємо плаваючі швейні елементи
    const createElements = () => {
      const newElements = [];
      const sewingItems = ['scissors', 'needle', 'button', 'thread-spool', 'thimble'];
      const colors = [
        'rgba(59, 130, 246, 0.15)',
        'rgba(147, 51, 234, 0.15)', 
        'rgba(34, 197, 94, 0.15)',
        'rgba(249, 115, 22, 0.15)',
        'rgba(236, 72, 153, 0.15)'
      ];

      for (let i = 0; i < 12; i++) {
        newElements.push({
          id: i,
          type: sewingItems[Math.floor(Math.random() * sewingItems.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 40 + 25,
          x: Math.random() * 100,
          y: Math.random() * 100,
          duration: Math.random() * 25 + 20,
          delay: Math.random() * 8,
          rotation: Math.random() * 360
        });
      }
      setElements(newElements);
    };

    createElements();
  }, []);

  const renderSewingElement = (element) => {
    const baseStyles = {
      width: `${element.size}px`,
      height: `${element.size}px`,
      position: 'absolute',
      left: `${element.x}%`,
      top: `${element.y}%`,
      animation: `float-${element.id} ${element.duration}s ease-in-out infinite`,
      animationDelay: `${element.delay}s`,
      filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
      transform: `rotate(${element.rotation}deg)`,
    };

    const iconColor = element.color.replace('0.15', '0.8');

    switch (element.type) {
      case 'scissors':
        return (
          <div key={element.id} style={baseStyles}>
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" stroke={iconColor} strokeWidth="1.5"/>
              <circle cx="6" cy="6" r="3" stroke={iconColor} strokeWidth="1.5" fill="none"/>
              <circle cx="6" cy="18" r="3" stroke={iconColor} strokeWidth="1.5" fill="none"/>
              <path d="M9 12L12 9l9-6" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M21 3L12 9l-3 3" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        );

      case 'needle':
        return (
          <div key={element.id} style={baseStyles}>
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
              <line x1="2" y1="22" x2="22" y2="2" stroke={iconColor} strokeWidth="2"/>
              <circle cx="19" cy="5" r="2" fill={iconColor}/>
              <path d="M12 12l-2 2" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        );

      case 'button':
        return (
          <div key={element.id} style={baseStyles}>
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke={iconColor} strokeWidth="2" fill={element.color}/>
              <circle cx="9" cy="9" r="1" fill={iconColor}/>
              <circle cx="15" cy="9" r="1" fill={iconColor}/>
              <circle cx="9" cy="15" r="1" fill={iconColor}/>
              <circle cx="15" cy="15" r="1" fill={iconColor}/>
            </svg>
          </div>
        );

      case 'thread-spool':
        return (
          <div key={element.id} style={baseStyles}>
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
              <rect x="8" y="4" width="8" height="16" rx="4" stroke={iconColor} strokeWidth="2" fill={element.color}/>
              <ellipse cx="12" cy="6" rx="4" ry="1" fill={iconColor}/>
              <ellipse cx="12" cy="18" rx="4" ry="1" fill={iconColor}/>
              <ellipse cx="12" cy="12" rx="3" ry="1" stroke={iconColor} strokeWidth="1"/>
              <path d="M9 12c0 .5 1.3 1 3 1s3-.5 3-1" stroke={iconColor} strokeWidth="1"/>
            </svg>
          </div>
        );

      case 'thimble':
        return (
          <div key={element.id} style={baseStyles}>
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
              <path d="M8 20c0-4.4 1.8-8 4-8s4 3.6 4 8" stroke={iconColor} strokeWidth="2" fill={element.color}/>
              <circle cx="10" cy="16" r="0.5" fill={iconColor}/>
              <circle cx="12" cy="14" r="0.5" fill={iconColor}/>
              <circle cx="14" cy="16" r="0.5" fill={iconColor}/>
              <circle cx="11" cy="18" r="0.5" fill={iconColor}/>
              <circle cx="13" cy="18" r="0.5" fill={iconColor}/>
              <ellipse cx="12" cy="20" rx="4" ry="1" fill={iconColor}/>
            </svg>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-1 overflow-hidden">
      <style jsx>{`
        ${elements.map(element => `
          @keyframes float-${element.id} {
            0%, 100% {
              transform: translateY(0px) translateX(0px) rotate(${element.rotation}deg);
            }
            25% {
              transform: translateY(-25px) translateX(15px) rotate(${element.rotation + 90}deg);
            }
            50% {
              transform: translateY(-15px) translateX(-20px) rotate(${element.rotation + 180}deg);
            }
            75% {
              transform: translateY(-35px) translateX(8px) rotate(${element.rotation + 270}deg);
            }
          }
        `).join('')}
      `}</style>
      
      {elements.map(renderSewingElement)}

      {/* Додаткові швейні blur елементи */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/3 rounded-full filter blur-3xl animate-pulse">
        <div className="w-full h-full flex items-center justify-center">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="opacity-20">
            <path d="M9 12l2 2 4-4M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
      </div>
      
      <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-purple-400/3 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}>
        <div className="w-full h-full flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="opacity-20">
            <rect x="8" y="4" width="8" height="16" rx="4" fill="currentColor"/>
          </svg>
        </div>
      </div>
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-400/3 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}>
        <div className="w-full h-full flex items-center justify-center">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="opacity-20">
            <circle cx="12" cy="12" r="9" fill="currentColor"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default FloatingElements;