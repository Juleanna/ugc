import React, { useEffect, useState } from 'react';

const FloatingElements = () => {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    // Створюємо плаваючі елементи
    const createElements = () => {
      const newElements = [];
      const shapes = ['circle', 'square', 'triangle', 'hexagon'];
      const colors = [
        'rgba(59, 130, 246, 0.1)',
        'rgba(168, 85, 247, 0.1)', 
        'rgba(34, 197, 94, 0.1)',
        'rgba(249, 115, 22, 0.1)'
      ];

      for (let i = 0; i < 15; i++) {
        newElements.push({
          id: i,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 60 + 20,
          x: Math.random() * 100,
          y: Math.random() * 100,
          duration: Math.random() * 20 + 15,
          delay: Math.random() * 5
        });
      }
      setElements(newElements);
    };

    createElements();
  }, []);

  const getShapeStyles = (element) => {
    const baseStyles = {
      width: `${element.size}px`,
      height: `${element.size}px`,
      backgroundColor: element.color,
      position: 'absolute',
      left: `${element.x}%`,
      top: `${element.y}%`,
      animation: `float-${element.id} ${element.duration}s ease-in-out infinite`,
      animationDelay: `${element.delay}s`,
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    };

    switch (element.shape) {
      case 'circle':
        return { ...baseStyles, borderRadius: '50%' };
      case 'square':
        return { ...baseStyles, borderRadius: '12px', transform: 'rotate(45deg)' };
      case 'triangle':
        return {
          ...baseStyles,
          width: 0,
          height: 0,
          backgroundColor: 'transparent',
          borderLeft: `${element.size / 2}px solid transparent`,
          borderRight: `${element.size / 2}px solid transparent`,
          borderBottom: `${element.size}px solid ${element.color}`,
        };
      case 'hexagon':
        return { 
          ...baseStyles, 
          borderRadius: '12px',
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
        };
      default:
        return baseStyles;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-1 overflow-hidden">
      <style jsx>{`
        ${elements.map(element => `
          @keyframes float-${element.id} {
            0%, 100% {
              transform: translateY(0px) translateX(0px) rotate(0deg);
            }
            25% {
              transform: translateY(-20px) translateX(10px) rotate(90deg);
            }
            50% {
              transform: translateY(-10px) translateX(-15px) rotate(180deg);
            }
            75% {
              transform: translateY(-30px) translateX(5px) rotate(270deg);
            }
          }
        `).join('')}
      `}</style>
      
      {elements.map((element) => (
        <div
          key={element.id}
          style={getShapeStyles(element)}
          className="opacity-60 hover:opacity-80 transition-opacity duration-300"
        />
      ))}

      {/* Додаткові градієнтні blur елементи */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/5 rounded-full filter blur-3xl animate-pulse" />
      <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-purple-400/5 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-400/5 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
    </div>
  );
};

export default FloatingElements;