import React, { useEffect, useRef } from 'react';

interface Wind {
  x: number;
  y: number;
  lifetime: number;
}

class Particle {
  x: number;
  y: number;
  oldx: number;
  oldy: number;
  anchored: boolean;

  constructor(x: number, y: number, anchored = false) {
    this.x = x;
    this.y = y;
    this.oldx = x;
    this.oldy = y;
    this.anchored = anchored;
  }

  update(gravity: number, damping: number, windForces: Wind[]) {
    if (!this.anchored) {
      const windForce = windForces.reduce(
        (acc, wind) => {
          acc.x += wind.x;
          acc.y += wind.y;
          return acc;
        },
        { x: 0, y: 0 }
      );

      const vx = (this.x - this.oldx) * damping + windForce.x;
      const vy = (this.y - this.oldy) * damping + gravity + windForce.y;

      this.oldx = this.x;
      this.oldy = this.y;

      this.x += vx;
      this.y += vy;
    }
  }

  applyDamping(damping: number) {
    if (!this.anchored) {
      this.oldx = this.x - (this.x - this.oldx) * damping;
      this.oldy = this.y - (this.y - this.oldy) * damping;
    }
  }
}

class Spring {
  p1: Particle;
  p2: Particle;
  length: number;
  stiffness: number;

  constructor(p1: Particle, p2: Particle, length: number, stiffness = 0.2) {
    this.p1 = p1;
    this.p2 = p2;
    this.length = length;
    this.stiffness = stiffness;
  }

  update() {
    const dx = this.p2.x - this.p1.x;
    const dy = this.p2.y - this.p1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const difference = this.length - distance;
    const percent = (difference / distance) * this.stiffness * 0.5;
    const offsetX = dx * percent;
    const offsetY = dy * percent;

    if (!this.p1.anchored) {
      this.p1.x -= offsetX;
      this.p1.y -= offsetY;
    }
    if (!this.p2.anchored) {
      this.p2.x += offsetX;
      this.p2.y += offsetY;
    }
  }
}

const Fabric: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const springsRef = useRef<Spring[]>([]);
  const windGustsRef = useRef<Wind[]>([]);

  const SPACING = 10;
  const GRAVITY = 0.02;
  const DAMPING = 0.85;
  const STIFFNESS = 0.2;
  const DIAGONAL_STIFFNESS = 0.2;
  const CONSTRAINT_ITERATIONS = 25;
  const WIND_GUST_INTERVAL = 100;
  const WIND_GUST_LIFETIME = 50 * 1.05; // Increased by 5%

  const initializeParticlesAndSprings = (width: number, height: number) => {
    const particles: Particle[] = [];
    const springs: Spring[] = [];

    const GRID_WIDTH = Math.ceil((width / 6) / SPACING) + 1; // Reduce columns by 1/3
    const GRID_HEIGHT = Math.ceil(height / SPACING) + 1;

    const offsetX = (width - (GRID_WIDTH - 1) * SPACING) / 2;

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const anchored = y === 0 || y === GRID_HEIGHT - 1 || x === 0 || y === GRID_HEIGHT - 1;
        particles.push(new Particle(offsetX + x * SPACING, y * SPACING, anchored));
      }
    }

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (x < GRID_WIDTH - 1) {
          springs.push(new Spring(particles[y * GRID_WIDTH + x], particles[y * GRID_WIDTH + x + 1], SPACING, STIFFNESS));
        }
        if (y < GRID_HEIGHT - 1) {
          springs.push(new Spring(particles[y * GRID_WIDTH + x], particles[(y + 1) * GRID_WIDTH + x], SPACING, STIFFNESS));
        }
        if (x < GRID_WIDTH - 1 && y < GRID_HEIGHT - 1) {
          springs.push(new Spring(particles[y * GRID_WIDTH + x], particles[(y + 1) * GRID_WIDTH + x + 1], SPACING * Math.sqrt(2), DIAGONAL_STIFFNESS));
          springs.push(new Spring(particles[(y + 1) * GRID_WIDTH + x], particles[y * GRID_WIDTH + x + 1], SPACING * Math.sqrt(2), DIAGONAL_STIFFNESS));
        }
      }
    }

    particlesRef.current = particles;
    springsRef.current = springs;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context) return;

    const resizeCanvas = () => {
      const width = (canvas.width = window.innerWidth);
      const height = (canvas.height = window.innerHeight);
      initializeParticlesAndSprings(width, height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const update = () => {
      const width = canvas.width;
      const height = canvas.height;
      context.clearRect(0, 0, width, height);

      windGustsRef.current.forEach((wind, index) => {
        wind.lifetime -= 1;
        if (wind.lifetime <= 0) {
          windGustsRef.current.splice(index, 1);
        }
      });

      for (let i = 0; i < CONSTRAINT_ITERATIONS; i++) {
        for (const spring of springsRef.current) {
          spring.update();
        }
      }

      for (const particle of particlesRef.current) {
        particle.update(GRAVITY, DAMPING, windGustsRef.current);
      }

      for (const particle of particlesRef.current) {
        particle.applyDamping(DAMPING);
      }

      render();
      requestAnimationFrame(update);
    };

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      context.clearRect(0, 0, width, height);

      const GRID_WIDTH = Math.ceil((width / 6) / SPACING) + 1; // Reduce columns by 1/3
      const GRID_HEIGHT = Math.ceil(height / SPACING) + 1;

      for (let y = 0; y < GRID_HEIGHT - 1; y++) {
        for (let x = 0; x < GRID_WIDTH - 1; x++) {
          const p1 = particlesRef.current[y * GRID_WIDTH + x];
          const p2 = particlesRef.current[y * GRID_WIDTH + x + 1];
          const p3 = particlesRef.current[(y + 1) * GRID_WIDTH + x];
          const p4 = particlesRef.current[(y + 1) * GRID_WIDTH + x + 1];

          if (p1 && p2 && p3) drawTriangle(context, p1, p2, p3);
          if (p2 && p3 && p4) drawTriangle(context, p2, p4, p3);
        }
      }

      for (const spring of springsRef.current) {
        drawSpring(context, spring);
      }
    };

    const drawTriangle = (context: CanvasRenderingContext2D, p1: Particle, p2: Particle, p3: Particle) => {
      if (!p1 || !p2 || !p3) return;
      const normal = calculateNormal(p1, p2, p3);
      const shading = Math.max(0, Math.min(1, normal.y));
      context.fillStyle = `rgba(0, 0, 0, ${shading})`; // Changed to red

      context.beginPath();
      context.moveTo(p1.x, p1.y);
      context.lineTo(p2.x, p2.y);
      context.lineTo(p3.x, p3.y);
      context.closePath();
      context.fill();
    };

    const drawSpring = (context: CanvasRenderingContext2D, spring: Spring) => {
      const { p1, p2 } = spring;
      if (!p1 || !p2) return;
      const normal = calculateNormal(p1, p2, { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 });
      const shading = Math.max(0, Math.min(1, normal.y));
      context.strokeStyle = `rgba(0, 0, 0, ${shading})`;

      context.beginPath();
      context.moveTo(p1.x, p1.y);
      context.lineTo(p2.x, p2.y);
      context.stroke();
    };

    const calculateNormal = (p1: Particle, p2: Particle, p3: { x: number; y: number }) => {
      if (!p1 || !p2 || !p3) return { x: 0, y: 1 };
      const u = { x: p2.x - p1.x, y: p2.y - p1.y };
      const v = { x: p3.x - p1.x, y: p3.y - p1.y };
      return { x: u.y * v.x - u.x * v.y, y: 1 };
    };

    const createWindGust = () => {
      const force = {
        x: (Math.random() - 0.5) * 1.0,
        y: (Math.random() - 0.5) * 1.0
      };
      const lifetime = Math.floor(Math.random() * (WIND_GUST_LIFETIME * 1.05));
      windGustsRef.current.push({ ...force, lifetime });
    };

    setInterval(createWindGust, WIND_GUST_INTERVAL);

    update();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef}></canvas>;
};

export default Fabric;
