import React, { useEffect, useRef } from 'react';

const MeshGradientBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const pointsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Встановлюємо розмір canvas
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      initializePoints();
    };

    // Ініціалізуємо точки градієнтного мешу
    const initializePoints = () => {
      const rect = canvas.getBoundingClientRect();
      const spacing = 120;
      const cols = Math.ceil(rect.width / spacing) + 1;
      const rows = Math.ceil(rect.height / spacing) + 1;
      
      pointsRef.current = [];
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * spacing;
          const y = row * spacing;
          
          pointsRef.current.push({
            originalX: x,
            originalY: y,
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            color: {
              r: 59 + Math.random() * 40,
              g: 130 + Math.random() * 40, 
              b: 246 + Math.random() * 10,
              a: 0.1 + Math.random() * 0.1
            },
            size: 80 + Math.random() * 40,
            phase: Math.random() * Math.PI * 2
          });
        }
      }
    };

    // Обробник руху миші
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Функція оновлення точок
    const updatePoints = (time) => {
      pointsRef.current.forEach((point, index) => {
        // Базовий хвильовий рух
        const baseWaveX = Math.sin(time * 0.0008 + point.phase) * 15;
        const baseWaveY = Math.cos(time * 0.0012 + point.phase + Math.PI / 4) * 10;
        
        // Вплив миші
        const dx = mouseRef.current.x - point.originalX;
        const dy = mouseRef.current.y - point.originalY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxInfluence = 200;
        
        let mouseInfluenceX = 0;
        let mouseInfluenceY = 0;
        
        if (distance < maxInfluence) {
          const influence = (maxInfluence - distance) / maxInfluence;
          const angle = Math.atan2(dy, dx);
          mouseInfluenceX = Math.cos(angle) * influence * 50;
          mouseInfluenceY = Math.sin(angle) * influence * 50;
        }
        
        // Цільова позиція
        const targetX = point.originalX + baseWaveX + mouseInfluenceX;
        const targetY = point.originalY + baseWaveY + mouseInfluenceY;
        
        // Плавний рух до цільової позиції
        point.vx += (targetX - point.x) * 0.02;
        point.vy += (targetY - point.y) * 0.02;
        
        // Затухання
        point.vx *= 0.95;
        point.vy *= 0.95;
        
        // Оновлюємо позицію
        point.x += point.vx;
        point.y += point.vy;
        
        // Анімація кольору
        point.color.a = 0.05 + Math.sin(time * 0.001 + index * 0.1) * 0.03;
        
        // Збільшуємо прозорість біля курсора
        if (distance < maxInfluence) {
          point.color.a += (maxInfluence - distance) / maxInfluence * 0.1;
        }
      });
    };

    // Функція малювання градієнтного мешу
    const drawMeshGradient = () => {
      // Створюємо gradients для кожної точки
      pointsRef.current.forEach(point => {
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, point.size
        );
        
        gradient.addColorStop(0, `rgba(${point.color.r}, ${point.color.g}, ${point.color.b}, ${point.color.a})`);
        gradient.addColorStop(0.7, `rgba(${point.color.r}, ${point.color.g}, ${point.color.b}, ${point.color.a * 0.3})`);
        gradient.addColorStop(1, `rgba(${point.color.r}, ${point.color.g}, ${point.color.b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Функція малювання додаткових ефектів
    const drawAdditionalEffects = (time) => {
      // Додаємо анімовані кільця
      const ringCount = 3;
      for (let i = 0; i < ringCount; i++) {
        const x = canvas.clientWidth * (0.2 + i * 0.3);
        const y = canvas.clientHeight * (0.3 + Math.sin(time * 0.0005 + i) * 0.2);
        const radius = 100 + Math.sin(time * 0.001 + i * Math.PI) * 30;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0)');
        gradient.addColorStop(0.8, 'rgba(168, 85, 247, 0.03)');
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0.08)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Додаємо плаваючі частинки
      const particleCount = 12;
      for (let i = 0; i < particleCount; i++) {
        const x = (canvas.clientWidth / particleCount) * i + Math.sin(time * 0.0003 + i) * 100;
        const y = canvas.clientHeight * 0.5 + Math.cos(time * 0.0007 + i * 0.5) * 150;
        const size = 3 + Math.sin(time * 0.002 + i) * 2;
        const opacity = 0.1 + Math.sin(time * 0.001 + i) * 0.05;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
        gradient.addColorStop(0, `rgba(34, 197, 94, ${opacity})`);
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Функція малювання ефекту навколо курсора
    const drawMouseEffect = () => {
      const gradient = ctx.createRadialGradient(
        mouseRef.current.x, mouseRef.current.y, 0,
        mouseRef.current.x, mouseRef.current.y, 150
      );
      
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.03)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mouseRef.current.x, mouseRef.current.y, 150, 0, Math.PI * 2);
      ctx.fill();
    };

    // Головна функція анімації
    const animate = (time) => {
      // Очищаємо canvas
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      
      // Встановлюємо режим змішування для плавних градієнтів
      ctx.globalCompositeOperation = 'normal';
      
      // Малюємо базовий градієнтний фон
      const bgGradient = ctx.createLinearGradient(0, 0, canvas.clientWidth, canvas.clientHeight);
      bgGradient.addColorStop(0, '#ffffff');
      bgGradient.addColorStop(0.25, '#f8fafc');
      bgGradient.addColorStop(0.5, '#f1f5f9');
      bgGradient.addColorStop(0.75, '#e2e8f0');
      bgGradient.addColorStop(1, '#cbd5e1');
      
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      
      // Встановлюємо режим змішування для ефектів
      ctx.globalCompositeOperation = 'multiply';
      
      // Оновлюємо та малюємо точки
      updatePoints(time);
      drawMeshGradient();
      
      // Повертаємо нормальний режим змішування
      ctx.globalCompositeOperation = 'normal';
      
      // Малюємо додаткові ефекти
      drawAdditionalEffects(time);
      
      // Малюємо ефект курсора
      drawMouseEffect();
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Ініціалізація
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate(0);

    // Очищення при розмонтуванні
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{
          mixBlendMode: 'normal',
          filter: 'blur(0.5px)'
        }}
      />
      
      {/* Додатковий градієнтний оверлей для тонування */}
      <div 
        className="fixed inset-0 pointer-events-none z-1 opacity-30"
        style={{
          background: `
            radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.05) 0%, transparent 70%)
          `
        }}
      />
      
      {/* Тонкий noise оверлей для текстури */}
      <div 
        className="fixed inset-0 pointer-events-none z-2 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay'
        }}
      />
    </>
  );
};

export default MeshGradientBackground;