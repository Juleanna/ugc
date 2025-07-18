import React, { useEffect, useRef } from 'react';

const InteractiveBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Встановлюємо розмір canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Клас частинки
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 15 + 10; // Розмір для іконок
        this.opacity = Math.random() * 0.4 + 0.1;
        this.targetX = this.x;
        this.targetY = this.y;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.type = Math.random() > 0.5 ? 'scissors' : 'sewing-machine'; // Тип іконки
      }

      update() {
        // Рух до цільової позиції
        this.x += (this.targetX - this.x) * 0.02;
        this.y += (this.targetY - this.y) * 0.02;
        
        // Додаємо базовий рух
        this.x += this.vx;
        this.y += this.vy;

        // Обертання
        this.rotation += this.rotationSpeed;

        // Відскок від меж
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Утримуємо в межах canvas
        this.x = Math.max(0, Math.min(canvas.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height, this.y));
      }

      drawScissors() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.size / 20, this.size / 20);
        
        ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
        ctx.strokeStyle = `rgba(59, 130, 246, ${this.opacity})`;
        ctx.lineWidth = 1.5;

        // Малюємо ножиці
        ctx.beginPath();
        
        // Ліве лезо
        ctx.moveTo(-8, -5);
        ctx.lineTo(-15, -12);
        ctx.lineTo(-12, -15);
        ctx.lineTo(-5, -8);
        ctx.closePath();
        
        // Праве лезо
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

      drawSewingMachine() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.size / 20, this.size / 20);
        
        ctx.fillStyle = `rgba(147, 51, 234, ${this.opacity})`;
        ctx.strokeStyle = `rgba(147, 51, 234, ${this.opacity})`;
        ctx.lineWidth = 1.5;

        // Основа швейної машини
        ctx.beginPath();
        ctx.roundRect(-12, -5, 24, 15, 3);
        ctx.fill();
        
        // Верхня частина (голова)
        ctx.beginPath();
        ctx.roundRect(-8, -15, 16, 12, 3);
        ctx.fill();
        
        // Ніжка
        ctx.beginPath();
        ctx.rect(-2, 10, 4, 8);
        ctx.fill();
        
        // Шпулька
        ctx.beginPath();
        ctx.arc(0, -8, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
        ctx.fill();
        
        // Нитка
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(0, 5);
        ctx.strokeStyle = `rgba(34, 197, 94, ${this.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
      }

      draw() {
        if (this.type === 'scissors') {
          this.drawScissors();
        } else {
          this.drawSewingMachine();
        }
      }

      // Реакція на курсор миші
      attractToMouse(mouseX, mouseY) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const force = (150 - distance) / 150;
          this.targetX = this.x + dx * force * 0.03;
          this.targetY = this.y + dy * force * 0.03;
          // Прискорюємо обертання при наближенні миші
          this.rotationSpeed *= 1.5;
        } else {
          // Повертаємось до випадкового руху
          this.targetX = this.x + (Math.random() - 0.5) * 2;
          this.targetY = this.y + (Math.random() - 0.5) * 2;
          // Нормалізуємо швидкість обертання
          this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        }
      }
    }

    // Створюємо частинки
    const createParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 20000));
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(new Particle());
      }
    };
    createParticles();

    // Обробник руху миші
    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

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

    // Головна функція анімації
    const animate = () => {
      // Очищаємо canvas з градієнтом
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(248, 250, 252, 0.95)');
      gradient.addColorStop(1, 'rgba(241, 245, 249, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Оновлюємо та малюємо частинки
      particlesRef.current.forEach(particle => {
        particle.attractToMouse(mouseRef.current.x, mouseRef.current.y);
        particle.update();
        particle.draw();
      });

      // Малюємо з'єднання
      drawConnections();

      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

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
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)'
      }}
    />
  );
};

export default InteractiveBackground;