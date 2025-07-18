import React, { useEffect, useRef } from 'react';

const UnifiedBackground = () => {
  // Refs для canvas та анімацій
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const pointsRef = useRef([]);
  const particlesRef = useRef([]);

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
      createParticles();
    };

    // Ініціалізуємо точки градієнтного мешу (з MeshGradientBackground)
    const initializePoints = () => {
      const rect = canvas.getBoundingClientRect();
      const spacing = 150;
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
              a: 0.02 + Math.random() * 0.03
            },
            size: 200 + Math.random() * 100,
            phase: Math.random() * Math.PI * 2
          });
        }
      }
    };

    // Створюємо інтерактивні частинки зі швейними іконками
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 15 + 15; // Трохи більший розмір для швейних елементів
        this.opacity = Math.random() * 0.6 + 0.2;
        this.targetX = this.x;
        this.targetY = this.y;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        
        // Випадковий швейний елемент
        const sewingTypes = ['scissors', 'needle', 'button', 'thread-spool', 'thimble'];
        this.type = sewingTypes[Math.floor(Math.random() * sewingTypes.length)];
        
        // Кольори для швейних елементів
        const colors = [
          { r: 59, g: 130, b: 246 },   // Синій
          { r: 147, g: 51, b: 234 },   // Фіолетовий
          { r: 34, g: 197, b: 94 },    // Зелений
          { r: 249, g: 115, b: 22 },   // Оранжевий
          { r: 236, g: 72, b: 153 }    // Рожевий
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += (this.targetX - this.x) * 0.02;
        this.y += (this.targetY - this.y) * 0.02;
        
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        this.x = Math.max(0, Math.min(canvas.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height, this.y));
      }

      drawScissors() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.size / 20, this.size / 20);
        
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
        ctx.lineWidth = 1.5;

        // Ліве лезо
        ctx.beginPath();
        ctx.moveTo(-8, -5);
        ctx.lineTo(-15, -12);
        ctx.lineTo(-12, -15);
        ctx.lineTo(-5, -8);
        ctx.closePath();
        ctx.fill();
        
        // Праве лезо
        ctx.beginPath();
        ctx.moveTo(8, -5);
        ctx.lineTo(15, -12);
        ctx.lineTo(12, -15);
        ctx.lineTo(5, -8);
        ctx.closePath();
        ctx.fill();
        
        // Центральна частина (шарнір)
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Ручки
        ctx.beginPath();
        ctx.arc(-3, 8, 4, 0, Math.PI * 2);
        ctx.arc(3, 8, 4, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
      }

      drawNeedle() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.size / 20, this.size / 20);
        
        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
        ctx.lineWidth = 2;

        // Тіло голки
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(0, 15);
        ctx.stroke();
        
        // Вушко голки
        ctx.beginPath();
        ctx.arc(0, -12, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
        ctx.fill();
        
        // Гострий кінець
        ctx.beginPath();
        ctx.moveTo(-1, 15);
        ctx.lineTo(0, 18);
        ctx.lineTo(1, 15);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
        ctx.fill();
        
        ctx.restore();
      }

      drawButton() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.size / 20, this.size / 20);
        
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity + 0.2})`;
        ctx.lineWidth = 2;

        // Основа ґудзика
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Дірочки
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity + 0.3})`;
        ctx.beginPath();
        ctx.arc(-3, -3, 1, 0, Math.PI * 2);
        ctx.arc(3, -3, 1, 0, Math.PI * 2);
        ctx.arc(-3, 3, 1, 0, Math.PI * 2);
        ctx.arc(3, 3, 1, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }

      drawThreadSpool() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.size / 20, this.size / 20);
        
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity + 0.2})`;
        ctx.lineWidth = 1;

        // Котушка
        ctx.beginPath();
        ctx.roundRect(-6, -12, 12, 24, 2);
        ctx.fill();
        
        // Верхній та нижній кружок
        ctx.beginPath();
        ctx.ellipse(0, -12, 8, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(0, 12, 8, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Нитка
        ctx.strokeStyle = `rgba(${this.color.r + 50}, ${this.color.g + 50}, ${this.color.b + 50}, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = -10; i <= 10; i += 3) {
          ctx.moveTo(-6, i);
          ctx.lineTo(6, i);
        }
        ctx.stroke();
        
        ctx.restore();
      }

      drawThimble() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.size / 20, this.size / 20);
        
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity + 0.2})`;
        ctx.lineWidth = 1.5;

        // Основа наперстка
        ctx.beginPath();
        ctx.moveTo(-6, 12);
        ctx.lineTo(-8, -8);
        ctx.quadraticCurveTo(0, -12, 8, -8);
        ctx.lineTo(6, 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Ямочки на наперстку
        ctx.fillStyle = `rgba(0, 0, 0, ${this.opacity * 0.3})`;
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            const x = (col - 1) * 3;
            const y = (row - 1) * 4 - 2;
            ctx.beginPath();
            ctx.arc(x, y, 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        ctx.restore();
      }

      draw() {
        switch (this.type) {
          case 'scissors':
            this.drawScissors();
            break;
          case 'needle':
            this.drawNeedle();
            break;
          case 'button':
            this.drawButton();
            break;
          case 'thread-spool':
            this.drawThreadSpool();
            break;
          case 'thimble':
            this.drawThimble();
            break;
          default:
            this.drawScissors();
        }
      }

      attractToMouse(mouseX, mouseY) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const force = (150 - distance) / 150;
          this.targetX = this.x + dx * force * 0.03;
          this.targetY = this.y + dy * force * 0.03;
          this.rotationSpeed *= 1.5;
        } else {
          this.targetX = this.x + (Math.random() - 0.5) * 2;
          this.targetY = this.y + (Math.random() - 0.5) * 2;
          this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        }
      }
    }

    const createParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 30000));
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(new Particle());
      }
    };

    // Обробник руху миші
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    // Функція оновлення точок мешу
    const updatePoints = (time) => {
      pointsRef.current.forEach((point, index) => {
        const baseWaveX = Math.sin(time * 0.0005 + point.phase) * 8;
        const baseWaveY = Math.cos(time * 0.0008 + point.phase + Math.PI / 4) * 6;
        
        const dx = mouseRef.current.x - point.originalX;
        const dy = mouseRef.current.y - point.originalY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxInfluence = 150;
        
        let mouseInfluenceX = 0;
        let mouseInfluenceY = 0;
        
        if (distance < maxInfluence) {
          const influence = (maxInfluence - distance) / maxInfluence;
          const angle = Math.atan2(dy, dx);
          mouseInfluenceX = Math.cos(angle) * influence * 30;
          mouseInfluenceY = Math.sin(angle) * influence * 30;
        }
        
        const targetX = point.originalX + baseWaveX + mouseInfluenceX;
        const targetY = point.originalY + baseWaveY + mouseInfluenceY;
        
        point.vx += (targetX - point.x) * 0.015;
        point.vy += (targetY - point.y) * 0.015;
        
        point.vx *= 0.98;
        point.vy *= 0.98;
        
        point.x += point.vx;
        point.y += point.vy;
        
        point.color.a = 0.01 + Math.sin(time * 0.0008 + index * 0.15) * 0.015;
        
        if (distance < maxInfluence) {
          point.color.a += (maxInfluence - distance) / maxInfluence * 0.02;
        }
      });
    };

    // Функція малювання тонкого градієнтного фону
    const drawSubtleBackground = () => {
      pointsRef.current.forEach(point => {
        const gradient = ctx.createLinearGradient(
          point.x - point.size/4, point.y - point.size/4,
          point.x + point.size/4, point.y + point.size/4
        );
        
        gradient.addColorStop(0, `rgba(${point.color.r}, ${point.color.g}, ${point.color.b}, ${point.color.a})`);
        gradient.addColorStop(0.5, `rgba(${point.color.r}, ${point.color.g}, ${point.color.b}, ${point.color.a * 0.5})`);
        gradient.addColorStop(1, `rgba(${point.color.r}, ${point.color.g}, ${point.color.b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
          point.x - point.size/8, 
          point.y - point.size/8, 
          point.size/4, 
          point.size/4
        );
      });
    };

    // Функція малювання з'єднань між частинками
    const drawConnections = () => {
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const dx = particlesRef.current[i].x - particlesRef.current[j].x;
          const dy = particlesRef.current[i].y - particlesRef.current[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const opacity = (120 - distance) / 120 * 0.15;
            ctx.beginPath();
            ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y);
            ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    };

    // Функція малювання тонких хвиль
    const drawSubtleWaves = (time) => {
      const waveCount = 2;
      for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(168, 85, 247, 0.02)`;
        ctx.lineWidth = 1;
        
        for (let x = 0; x < canvas.clientWidth; x += 20) {
          const y = canvas.clientHeight * (0.3 + i * 0.4) + 
                   Math.sin(time * 0.0003 + x * 0.01 + i * Math.PI) * 30;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    };

    // Функція малювання ефекту курсора
    const drawMouseEffect = () => {
      const gradient = ctx.createLinearGradient(
        mouseRef.current.x - 100, mouseRef.current.y - 100,
        mouseRef.current.x + 100, mouseRef.current.y + 100
      );
      
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.03)');
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.01)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(
        mouseRef.current.x - 100, 
        mouseRef.current.y - 100, 
        200, 
        200
      );
    };

    // Головна функція анімації
    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      
      // Базовий градієнтний фон
      const bgGradient = ctx.createLinearGradient(0, 0, canvas.clientWidth, canvas.clientHeight);
      bgGradient.addColorStop(0, '#ffffff');
      bgGradient.addColorStop(0.25, '#f8fafc');
      bgGradient.addColorStop(0.5, '#f1f5f9');
      bgGradient.addColorStop(0.75, '#e2e8f0');
      bgGradient.addColorStop(1, '#cbd5e1');
      
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      
      // Малюємо mesh gradient
      ctx.globalCompositeOperation = 'multiply';
      updatePoints(time);
      drawSubtleBackground();
      
      // Повертаємо нормальний режим
      ctx.globalCompositeOperation = 'normal';
      
      // Малюємо тонкі хвилі
      drawSubtleWaves(time);
      
      // Оновлюємо та малюємо інтерактивні частинки
      particlesRef.current.forEach(particle => {
        particle.attractToMouse(mouseRef.current.x, mouseRef.current.y);
        particle.update();
        particle.draw();
      });

      // Малюємо з'єднання
      drawConnections();
      
      // Малюємо ефект курсора
      drawMouseEffect();
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Ініціалізація
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    animate(0);

    // Очищення
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
      {/* Canvas з усіма ефектами */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{
          mixBlendMode: 'normal',
          filter: 'blur(0.3px)'
        }}
      />
      
      {/* Додатковий градієнтний оверлей */}
      <div 
        className="fixed inset-0 pointer-events-none z-1 opacity-20"
        style={{
          background: `
            linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, transparent 30%),
            linear-gradient(225deg, rgba(168, 85, 247, 0.03) 0%, transparent 30%),
            linear-gradient(45deg, rgba(34, 197, 94, 0.02) 0%, transparent 50%)
          `
        }}
      />
      
      {/* Noise оверлей */}
      <div 
        className="fixed inset-0 pointer-events-none z-2 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay'
        }}
      />
    </>
  );
};

export default UnifiedBackground;