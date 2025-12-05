import React, { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  width?: number;
  height?: number;
  spriteSrc?: string;
  onGameOver?: (score: number) => void;
  onDiscountEarned?: (discountData: DiscountData) => void;
};

// ---------------- Discount Interfaces ----------------
interface DiscountData {
  pointsEarned: number;
  discountPercent: number;
  totalDiscount: number;
  expirationDate: Date;
}

interface DiscountConfig {
  pointsPerPercent: number;
  maxDiscount: number;
  discountValidityDays: number;
}

const DISCOUNT_CONFIG: DiscountConfig = {
  pointsPerPercent: 100, // 100 points = 1% discount
  maxDiscount: 100,
  discountValidityDays: 7
};

// ---------------- Enhanced FullScreenDoodleJump Interfaces ----------------
interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  type: number;
  isBreakable: boolean;
  isDisappearing: boolean;
  disappearTimer: number;
  hasPowerUp?: boolean;
}

interface PowerUp {
  x: number;
  y: number;
  type: 'jetpack' | 'spring' | 'rocket' | 'shield';
  width: number;
  height: number;
  activeTime: number;
  isActive: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isMovingLeft: boolean;
  isMovingRight: boolean;
  isDead: boolean;
  hasJetpack: boolean;
  jetpackFuel: number;
  hasShield: boolean;
  shieldTimer: number;
  rocketBoost: number;
  isInvincible: boolean;
  invincibleTimer: number;
}

interface GameState {
  W: number;
  H: number;
  player: Player;
  platforms: Platform[];
  powerUps: PowerUp[];
  particles: Particle[];
  gravity: number;
  scrollThreshold: number;
  score: number;
  highScore: number;
  level: number;
  base: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  difficulty: number;
  lastPlatformY: number;
  platformGap: number;
  time: number;
  combo: number;
  comboMultiplier: number;
  discountData: DiscountData;
}

// ---------------- GuessTheWord Interfaces ----------------
interface GuessTheWordProps {
  onExit: () => void;
  onGuess?: (isCorrect: boolean, isFirstGuess: boolean) => void;
  onDiscountEarned?: (discountData: DiscountData) => void;
}

const MOCK_GAME_DATA = {
  question: "What has keys but can't open locks?",
  wordLength: 5,
  correctAnswer: "PIANO",
  maxAttempts: 3,
  hasBeenGuessedToday: false,
  firstGuesser: null as string | null,
  discountAmount: 5,
};

interface GuessGameState {
  question: string;
  wordLength: number;
  correctAnswer: string;
  maxAttempts: number;
  attemptsRemaining: number;
  hasBeenGuessedToday: boolean;
  firstGuesser: string | null;
  discountAmount: number;
  userAttempts: string[];
  gameDate: string;
}

// ---------------- Shared Styles ----------------
const ctaStyle: React.CSSProperties = {
  padding: "12px 22px",
  borderRadius: 12,
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
  background: "#FFB380",
  color: "#4A2E00",
  transition: "all 0.2s ease",
};

// ---------------- Discount Helper Functions ----------------
// Load existing discount from storage
// ---------------- Discount Helper Functions (WEB VERSION) ----------------

// Load discount from localStorage
const loadDiscount = (): DiscountData | null => {
  try {
    const raw = localStorage.getItem("user_discount");
    if (!raw) return null;

    const data = JSON.parse(raw);

    return {
      ...data,
      expirationDate: new Date(data.expirationDate)
    };
  } catch (error) {
    console.log("No existing discount found");
    return null;
  }
};

// Save discount to localStorage
const saveDiscount = (discount: DiscountData): void => {
  try {
    localStorage.setItem("user_discount", JSON.stringify(discount));
  } catch (error) {
    console.error("Failed to save discount:", error);
  }
};

const calculateDiscount = (score: number, config: DiscountConfig): DiscountData => {
  const pointsEarned = Math.floor(score);
  const discountPercent = Math.min(
    Math.floor(pointsEarned / config.pointsPerPercent),
    config.maxDiscount
  );

  const totalDiscount = discountPercent;

  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + config.discountValidityDays);

  return {
    pointsEarned,
    discountPercent,
    totalDiscount,
    expirationDate
  };
};

const updateDiscount = async (newPoints: number, source: "jump" | "guess"): Promise<DiscountData> => {
  const existing = loadDiscount();
  const now = new Date();

  // Expired -> start fresh
  if (existing && existing.expirationDate < now) {
    const fresh = calculateDiscount(newPoints, DISCOUNT_CONFIG);
    saveDiscount(fresh);
    return fresh;
  }

  // No previous discount -> create new
  if (!existing) {
    const fresh = calculateDiscount(newPoints, DISCOUNT_CONFIG);
    saveDiscount(fresh);
    return fresh;
  }

  // Already max → keep expiration, do not add points
  if (existing.totalDiscount >= DISCOUNT_CONFIG.maxDiscount) {
    return existing;
  }

  // Merge with existing
  let totalPoints = existing.pointsEarned;
  let totalDiscount = existing.totalDiscount;

  if (source === "jump") {
    totalPoints += newPoints;
    totalDiscount = Math.min(
      Math.floor(totalPoints / DISCOUNT_CONFIG.pointsPerPercent),
      DISCOUNT_CONFIG.maxDiscount
    );
  } else if (source === "guess") {
    totalDiscount = Math.min(existing.totalDiscount + 5, DISCOUNT_CONFIG.maxDiscount);
  }

  // Extend expiration
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + DISCOUNT_CONFIG.discountValidityDays);

  const updated: DiscountData = {
    pointsEarned: totalPoints,
    discountPercent: totalDiscount,
    totalDiscount,
    expirationDate
  };

  saveDiscount(updated);
  return updated;
};


// ---------------- Enhanced FullScreenDoodleJump Component ----------------
function FullScreenDoodleJump({ 
  onExit, 
  spriteSrc = "/sprite.png", 
  onGameOver,
  onDiscountEarned 
}: any) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const spriteRef = useRef<HTMLImageElement | null>(null);
  const lastScoreRef = useRef<number>(0);

  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('giraffeJumpHighScore') || '0');
  });
  const [gameOver, setGameOver] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth <= 768 : true);
  const [discountInfo, setDiscountInfo] = useState<DiscountData | null>(null);

  // Load existing discount on mount
  useEffect(() => {
    const loadExistingDiscount = async () => {
      const existing = await loadDiscount();
      if (existing) {
        setDiscountInfo(existing);
      }
    };
    loadExistingDiscount();
  }, []);

  // Load sprite image
  useEffect(() => {
    const img = new Image();
    img.src = spriteSrc;
    img.onload = () => {
      spriteRef.current = img;
    };
    img.onerror = () => {
      console.error("Failed to load sprite:", spriteSrc);
    };
  }, [spriteSrc]);

  // Resize handling
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const targetW = isMobile ? window.innerWidth : Math.min(900, window.innerWidth - 40);
    const targetH = isMobile ? window.innerHeight : Math.min(800, window.innerHeight - 160);

    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = `${targetW}px`;
    canvas.style.height = `${targetH}px`;
    canvas.width = Math.floor(targetW * dpr);
    canvas.height = Math.floor(targetH * dpr);

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, [isMobile]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [resizeCanvas]);

  const createParticles = useCallback((x: number, y: number, count: number, color: string) => {
    const particles: Particle[] = [];
    const actualCount = Math.min(count, 8); // Limit particles for performance
    for (let i = 0; i < actualCount; i++) {
      particles.push({
        x: x + Math.random() * 10 - 5,
        y: y + Math.random() * 10 - 5,
        vx: Math.random() * 3 - 1.5,
        vy: Math.random() * 3 - 1.5,
        size: Math.random() * 2 + 1,
        color,
        life: 1,
        maxLife: 0.5 + Math.random() * 0.3
      });
    }
    return particles;
  }, []);

  const resetState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const W = canvas.clientWidth || 420;
    const H = canvas.clientHeight || 600;

    const player: Player = {
      x: W / 2 - 27,
      y: H - 220,
      vx: 0,
      vy: 8, // Reduced from 11
      width: 80,
      height: 80,
      isMovingLeft: false,
      isMovingRight: false,
      isDead: false,
      hasJetpack: false,
      jetpackFuel: 0,
      hasShield: false,
      shieldTimer: 0,
      rocketBoost: 0,
      isInvincible: false,
      invincibleTimer: 0
    };

    const platforms: Platform[] = [];
    const powerUps: PowerUp[] = [];
    const platformCount = 15;

    // Create initial platforms with variety
    let y = 30;
    for (let i = 0; i < platformCount; i++) {
      const pw = 50 + Math.random() * 30;
      const type = Math.floor(Math.random() * 5) + 1;
      const isBreakable = type === 4 && Math.random() > 0.7;
      const isDisappearing = type === 5 && Math.random() > 0.5;
      
      platforms.push({
        x: Math.random() * (W - pw),
        y,
        width: pw,
        height: 16,
        vx: Math.random() > 0.85 ? (Math.random() > 0.5 ? 1.5 : -1.5) : 0,
        type,
        isBreakable,
        isDisappearing,
        disappearTimer: 0,
        hasPowerUp: Math.random() > 0.85
      });
      y += H / (platformCount - 1);
    }

    // Ensure there's a platform directly beneath player's start area
    const startPlatform: Platform = {
      x: Math.max(10, player.x - 10),
      y: player.y + player.height + 8,
      width: 80,
      height: 16,
      vx: 0,
      type: 1,
      isBreakable: false,
      isDisappearing: false,
      disappearTimer: 0
    };
    platforms.push(startPlatform);

    stateRef.current = {
      W,
      H,
      player,
      platforms,
      powerUps,
      particles: [],
      gravity: 0.25, // Reduced from 0.28
      scrollThreshold: H * 0.36,
      score: 0,
      highScore: parseInt(localStorage.getItem('giraffeJumpHighScore') || '0'),
      level: 1,
      base: { x: 0, y: H - 6, width: W, height: 6 },
      difficulty: 1,
      lastPlatformY: -100,
      platformGap: H / (platformCount - 1),
      time: 0,
      combo: 0,
      comboMultiplier: 1,
      discountData: calculateDiscount(0, DISCOUNT_CONFIG)
    };

    setScore(0);
    setGameOver(false);
  }, []);

  const gameLoop = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update time
    s.time += 1/60;

    // Clear
    ctx.clearRect(0, 0, s.W, s.H);

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, s.H);
    gradient.addColorStop(0, '#FFF7EE');
    gradient.addColorStop(1, '#FFEEDD');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, s.W, s.H);

    const p = s.player;

    // Update power-ups
    s.powerUps = s.powerUps.filter(powerUp => {
      powerUp.activeTime -= 1/60;
      return powerUp.activeTime > 0;
    });

    // Update shield
    if (p.hasShield) {
      p.shieldTimer -= 1/60;
      if (p.shieldTimer <= 0) {
        p.hasShield = false;
      }
    }

    // Update invincibility
    if (p.isInvincible) {
      p.invincibleTimer -= 1/60;
      if (p.invincibleTimer <= 0) {
        p.isInvincible = false;
      }
    }

    // Update jetpack
    if (p.hasJetpack && p.jetpackFuel > 0) {
      p.vy = Math.max(p.vy - 0.5, -20);
      p.jetpackFuel -= 1/60;
      if (p.jetpackFuel <= 0) {
        p.hasJetpack = false;
      }
    }

    // Update rocket boost
    if (p.rocketBoost > 0) {
      p.vy = -18;
      p.rocketBoost -= 1/60;
    }

    // Horizontal movement with acceleration
    if (p.isMovingLeft) p.vx = Math.max(p.vx - 0.8, -10);
    else if (p.isMovingRight) p.vx = Math.min(p.vx + 0.8, 10);
    else p.vx *= 0.85;

    p.x += p.vx;

    // Wrap around screen
    if (p.x > s.W) p.x = -p.width;
    if (p.x < -p.width) p.x = s.W;

    // Vertical movement with gravity
    p.y += p.vy;
    p.vy += s.gravity * (p.hasJetpack ? 0.3 : 1);

    // Update particles
    s.particles = s.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1;
      particle.life -= 1/60;
      return particle.life > 0;
    });

    // Draw particles
    s.particles.forEach(particle => {
      ctx.globalAlpha = particle.life / particle.maxLife;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Scrolling with adjusted scoring
    if (p.y < s.scrollThreshold) {
      const scroll = s.scrollThreshold - p.y;
      p.y = s.scrollThreshold;

      for (const pl of s.platforms) {
        pl.y += scroll;
      }
      for (const powerUp of s.powerUps) {
        powerUp.y += scroll;
      }
      s.base.y += scroll;
      
      // Reduced scoring rate - 0.2 instead of 0.5
      const pointsEarned = scroll * 0.2;
      s.score += pointsEarned;
      
      // Update discount data
      s.discountData = calculateDiscount(s.score, DISCOUNT_CONFIG);
    }

    // Draw platforms and check collisions
    for (const pl of s.platforms) {
      // Update disappearing platforms
      if (pl.isDisappearing) {
        pl.disappearTimer += 1/60;
        if (pl.disappearTimer > 1) {
          pl.y = -1000;
          s.particles.push(...createParticles(pl.x + pl.width/2, pl.y, 8, '#FF6B6B'));
          continue;
        }
      }

      // Moving platforms
      if (pl.vx) {
        pl.x += pl.vx;
        if (pl.x < 0 || pl.x + pl.width > s.W) pl.vx *= -1;
      }

      // Platform colors based on type
      let platformColor;
      switch(pl.type) {
        case 1: platformColor = '#D9F7E8'; break;
        case 2: platformColor = '#CDECF6'; break;
        case 3: platformColor = '#FBE6C8'; break;
        case 4: platformColor = '#FFCCCB'; break;
        case 5: platformColor = '#E6E6FA'; break;
        default: platformColor = '#D9F7E8';
      }

      ctx.fillStyle = platformColor;
      if (pl.isDisappearing) {
        ctx.globalAlpha = 1 - pl.disappearTimer;
      }
      ctx.fillRect(pl.x, pl.y, pl.width, pl.height);
      ctx.globalAlpha = 1;

      // Draw platform outline
      ctx.strokeStyle = pl.type === 4 ? '#FF6B6B' : pl.type === 5 ? '#9370DB' : '#AAAAAA';
      ctx.lineWidth = 1;
      ctx.strokeRect(pl.x, pl.y, pl.width, pl.height);

      // Draw power-up indicator
      if (pl.hasPowerUp) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(pl.x + pl.width/2, pl.y - 5, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Collision detection with enhanced physics
      if (
        p.vy > 0 &&
        p.x < pl.x + pl.width &&
        p.x + p.width > pl.x &&
        p.y + p.height > pl.y &&
        p.y + p.height < pl.y + pl.height + 10
      ) {
        // Platform-specific behavior
        if (pl.type === 3) { // Bouncy
          p.vy = -13; // Reduced from -16
          s.score += 5; // Reduced from 15
        } else if (pl.type === 4 && pl.isBreakable) { // Breakable
          p.vy = -10; // Reduced from -12
          pl.y = -1000;
          s.particles.push(...createParticles(pl.x + pl.width/2, pl.y, 8, '#FF6B6B'));
        } else if (pl.type === 5 && pl.isDisappearing) { // Disappearing
          p.vy = -10;
          pl.disappearTimer = 0.1;
        } else {
          p.vy = -10; // Reduced from -12
        }
        
        // Reduced landing bonus
        s.score += 3;
        s.discountData = calculateDiscount(s.score, DISCOUNT_CONFIG);
        
        // Fewer particles
        s.particles.push(...createParticles(p.x + p.width/2, p.y + p.height, 5, '#4ECDC4'));

        // Chance to spawn power-up
        if (pl.hasPowerUp && Math.random() > 0.7) {
          const powerUpTypes: PowerUp['type'][] = ['jetpack', 'spring', 'rocket', 'shield'];
          const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
          
          s.powerUps.push({
            x: pl.x + pl.width/2 - 15,
            y: pl.y - 30,
            type,
            width: 30,
            height: 30,
            activeTime: type === 'jetpack' ? 5 : type === 'shield' ? 10 : 0,
            isActive: true
          });
          
          pl.hasPowerUp = false;
        }
      }

      // Recycle platforms with simpler generation
      if (pl.y > s.H + 40) {
        pl.x = Math.random() * (s.W - pl.width);
        pl.y = -20 - Math.random() * 50;
        
        // Simple platform type distribution
        const rand = Math.random();
        if (rand > 0.85) {
          pl.type = Math.random() > 0.5 ? 4 : 5; // Breakable or disappearing
        } else if (rand > 0.7) {
          pl.type = 3; // Bouncy
        } else if (rand > 0.5) {
          pl.type = 2; // Moving
        } else {
          pl.type = 1; // Normal
        }
          
        pl.isBreakable = pl.type === 4 && Math.random() > 0.5;
        pl.isDisappearing = pl.type === 5 && Math.random() > 0.5;
        pl.disappearTimer = 0;
        
        pl.vx = pl.type === 2 && Math.random() > 0.6 ? 
          (Math.random() > 0.5 ? 1 : -1) : 
          0;
          
        pl.width = 50 + Math.random() * 30;
        pl.hasPowerUp = Math.random() > 0.92;
      }
    }

    // Draw power-ups
    for (const powerUp of s.powerUps) {
      let color;
      switch(powerUp.type) {
        case 'jetpack': color = '#FF6B6B'; break;
        case 'spring': color = '#4ECDC4'; break;
        case 'rocket': color = '#45B7D1'; break;
        case 'shield': color = '#96CEB4'; break;
      }
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Power-up collision
      if (
        p.x < powerUp.x + powerUp.width &&
        p.x + p.width > powerUp.x &&
        p.y < powerUp.y + powerUp.height &&
        p.y + p.height > powerUp.y
      ) {
        switch(powerUp.type) {
          case 'jetpack':
            p.hasJetpack = true;
            p.jetpackFuel = 3;
            break;
          case 'spring':
            p.vy = -20; // Reduced from -25
            break;
          case 'rocket':
            p.rocketBoost = 1;
            break;
          case 'shield':
            p.hasShield = true;
            p.shieldTimer = 10;
            break;
        }
        powerUp.activeTime = -1;
        s.score += 20; // Reduced from 50
        s.discountData = calculateDiscount(s.score, DISCOUNT_CONFIG);
        s.particles.push(...createParticles(powerUp.x + 15, powerUp.y + 15, 10, color));
      }
    }

    // Draw player
    if (spriteRef.current && spriteRef.current.complete) {
      if (!p.isInvincible || Math.floor(s.time * 10) % 2 === 0) {
        const scale = 1.0;
        const scaledWidth = p.width * scale;
        const scaledHeight = p.height * scale;
        const offsetX = (p.width - scaledWidth) / 2;
        const offsetY = (p.height - scaledHeight) / 2;
        
        ctx.drawImage(
          spriteRef.current,
          p.x + offsetX,
          p.y + offsetY,
          scaledWidth,
          scaledHeight
        );
      }
      
      if (p.hasShield) {
        ctx.strokeStyle = '#96CEB4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width/2 + 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      if (!p.isInvincible || Math.floor(s.time * 10) % 2 === 0) {
        ctx.fillStyle = '#FFB88C';
        ctx.fillRect(p.x, p.y, p.width, p.height);
        
        ctx.fillStyle = '#7A3E00';
        ctx.fillRect(p.x + 10, p.y + 10, 8, 8);
        ctx.fillRect(p.x + p.width - 18, p.y + 10, 8, 8);
        ctx.fillRect(p.x + 20, p.y + 25, p.width - 40, 4);
      }
      
      if (p.hasShield) {
        ctx.strokeStyle = '#96CEB4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width/2 + 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Draw base
    ctx.fillStyle = '#E6D8CF';
    ctx.fillRect(s.base.x, s.base.y, s.base.width, s.base.height);

    // Draw score with shadow
    ctx.fillStyle = '#7A3E00';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`Score: ${Math.floor(s.score)}`, 12, 24);
    
    // Draw high score
    ctx.fillStyle = '#E67A3C';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Best: ${s.highScore}`, 12, 44);
    
    // Draw current discount
    if (discountInfo) {
      ctx.fillStyle = '#4CAF50';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`Discount: ${discountInfo.totalDiscount}%`, s.W - 120, 24);
      
      // Show expiration countdown
      const now = new Date();
      const timeLeft = discountInfo.expirationDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
      if (daysLeft > 0) {
        ctx.font = '12px sans-serif';
        ctx.fillText(`${daysLeft}d left`, s.W - 120, 42);
      }
    }

    // Check game over with shield protection
    if (p.y > s.H + 60) {
      if (p.hasShield) {
        p.hasShield = false;
        p.y = s.H - 100;
        p.vy = -15;
        p.isInvincible = true;
        p.invincibleTimer = 2;
      } else {
        p.isDead = true;
        setIsRunning(false);
        setGameOver(true);
        const finalScore = Math.floor(s.score);
        setScore(finalScore);
        
        // Update high score
        if (finalScore > s.highScore) {
          s.highScore = finalScore;
          setHighScore(s.highScore);
          localStorage.setItem('giraffeJumpHighScore', s.highScore.toString());
        }
        
        // Calculate and save final discount
        (async () => {
          const finalDiscount = await updateDiscount(finalScore, 'jump');
          setDiscountInfo(finalDiscount);
          
          // Notify parent component
          if (onDiscountEarned) {
            onDiscountEarned(finalDiscount);
          }
        })();
        
        if (onGameOver) onGameOver(finalScore);
        
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        return;
      }
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [onGameOver, onDiscountEarned, createParticles, discountInfo]);

  const startGame = useCallback(() => {
    resetState();
    setIsRunning(true);
    setGameOver(false);
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [resetState, gameLoop]);

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!stateRef.current) return;
      if (e.key === 'ArrowLeft') stateRef.current.player.isMovingLeft = true;
      if (e.key === 'ArrowRight') stateRef.current.player.isMovingRight = true;
      if (e.key === ' ' && !isRunning) startGame();
      if (e.key === ' ' && isRunning && stateRef.current.player.hasJetpack) {
        stateRef.current.player.hasJetpack = true;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!stateRef.current) return;
      if (e.key === 'ArrowLeft') stateRef.current.player.isMovingLeft = false;
      if (e.key === 'ArrowRight') stateRef.current.player.isMovingRight = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRunning, startGame]);

  const handlePointerStart = (direction: 'left' | 'right') => {
    if (!stateRef.current) return;
    if (direction === 'left') {
      stateRef.current.player.isMovingLeft = true;
      stateRef.current.player.isMovingRight = false;
    } else {
      stateRef.current.player.isMovingRight = true;
      stateRef.current.player.isMovingLeft = false;
    }
  };

  const handlePointerEnd = () => {
    if (!stateRef.current) return;
    stateRef.current.player.isMovingLeft = false;
    stateRef.current.player.isMovingRight = false;
  };

  // Initialize
  useEffect(() => {
    resetState();
  }, [resetState]);

  const onCanvasClickStart = () => {
    if (!isRunning && !gameOver) startGame();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#FFF7EE', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10000 }}>
      <div style={{ width: '100%', maxWidth: 1200, display: 'flex', justifyContent: 'space-between', padding: 14, boxSizing: 'border-box', gap: 12, flexWrap: 'wrap' }}>
        {!gameOver && (
          <button 
            onClick={onExit} 
            style={{ 
              padding: '8px 14px', 
              borderRadius: 16, 
              background: '#FFF1E6', 
              border: '1px solid rgba(230,122,60,0.16)', 
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>←</span> Back
          </button>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ 
            padding: '8px 14px', 
            borderRadius: 20, 
            background: '#FFF1E6', 
            border: '1px solid rgba(230,122,60,0.12)', 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ color: '#E67A3C' }}>★</span>
            Score: {Math.floor(score)}
          </div>
          
          {discountInfo && (
            <div style={{ 
              padding: '8px 14px', 
              borderRadius: 20, 
              background: '#E8F5E9', 
              border: '1px solid rgba(76,175,80,0.12)', 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ color: '#4CAF50' }}>🎁</span>
              Discount: {discountInfo.totalDiscount}%
            </div>
          )}
        </div>
      </div>

      <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12, boxSizing: 'border-box' }}>
        <div style={{ width: '100%', maxWidth: isMobile ? '100%' : 900, borderRadius: 12, overflow: 'hidden', boxShadow: '0 14px 40px rgba(0,0,0,0.06)', position: 'relative' }}>
          <canvas 
            ref={canvasRef} 
            onClick={onCanvasClickStart} 
            style={{ 
              width: '100%', 
              display: 'block', 
              background: '#FFF7EE', 
              touchAction: 'none', 
              border: '6px solid rgba(255,160,80,0.12)' 
            }} 
          />

          {!isRunning && (
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              pointerEvents: 'none',
              padding: 20
            }}>
              <div style={{ 
                pointerEvents: 'auto', 
                width: Math.min(window.innerWidth - 48, 480), 
                background: gameOver ? 'rgba(0,0,0,0.72)' : 'linear-gradient(180deg,#FFFDF9,#FFF7EE)', 
                padding: '30px 26px', 
                borderRadius: 16, 
                textAlign: 'center', 
                color: gameOver ? '#fff' : '#7A3E00', 
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                transform: 'translateY(-20px)'
              }}>
                {gameOver ? (
                  <>
                    <h2 style={{ margin: 0, fontSize: 30, color: '#FF9C8A' }}>Game Over!</h2>
                    <p style={{ marginTop: 12, fontSize: 16 }}>Your score</p>
                    <p style={{ fontSize: 48, margin: '12px 0 30px 0', color: '#FFD6B0', fontWeight: 'bold' }}>{Math.floor(score)}</p>
                    
                    {discountInfo && discountInfo.totalDiscount > 0 && (
                      <div style={{
                        background: 'rgba(76, 175, 80, 0.1)',
                        padding: '15px',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        border: '2px solid rgba(76, 175, 80, 0.3)'
                      }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#4CAF50' }}>
                          🎉 Total Discount!
                        </h3>
                        <p style={{ margin: '5px 0', fontSize: '20px' }}>
                          <strong>{discountInfo.totalDiscount}% OFF</strong>
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '14px', opacity: 0.9 }}>
                          Valid until: {discountInfo.expirationDate.toLocaleDateString()}
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '12px', opacity: 0.7 }}>
                          ({DISCOUNT_CONFIG.pointsPerPercent} points per 1%)
                        </p>
                      </div>
                    )}
                    
                    {score > highScore && (
                      <div style={{
                        background: 'rgba(255, 193, 7, 0.1)',
                        padding: '10px',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        border: '2px solid rgba(255, 193, 7, 0.3)'
                      }}>
                        <p style={{ margin: 0, color: '#FFC107' }}>
                          🏆 <strong>NEW HIGH SCORE!</strong>
                        </p>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <button 
                        onClick={startGame} 
                        style={{ 
                          ...ctaStyle, 
                          background: '#FFB380',
                          padding: '16px 24px'
                        }}
                      >
                        Play Again
                      </button>
                      <button 
                        onClick={onExit} 
                        style={{ 
                          ...ctaStyle, 
                          background: 'rgba(255,255,255,0.2)', 
                          color: '#fff',
                          padding: '16px 24px',
                          border: '1px solid rgba(255,255,255,0.3)'
                        }}
                      >
                        Back to Menu
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 style={{ margin: '0 0 16px 0', fontSize: 32, color: '#E67A3C' }}>Giraffe Jump</h2>
                    <p style={{ margin: '0 0 8px 0', color: '#6b6b6b', fontSize: 16 }}>
                      Earn {DISCOUNT_CONFIG.pointsPerPercent} points for 1% discount!
                    </p>
                    
                    {discountInfo && discountInfo.totalDiscount > 0 && (
                      <div style={{
                        background: '#E8F5E9',
                        padding: '15px',
                        borderRadius: '10px',
                        margin: '15px 0',
                        border: '2px solid rgba(76,175,80,0.3)'
                      }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold', color: '#2E7D32' }}>
                          Current Discount: {discountInfo.totalDiscount}%
                        </p>
                        <p style={{ margin: '0', fontSize: '13px', color: '#388E3C' }}>
                          Expires: {discountInfo.expirationDate.toLocaleDateString()}
                          {discountInfo.totalDiscount >= 100 ? ' (Max reached!)' : ''}
                        </p>
                      </div>
                    )}
                    
                    <div style={{
                      background: '#FFF1E6',
                      padding: '15px',
                      borderRadius: '10px',
                      margin: '20px 0',
                      border: '1px solid rgba(230,122,60,0.1)'
                    }}>
                      <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#7A3E00' }}>
                        Game Features:
                      </p>
                      <ul style={{
                        margin: 0,
                        paddingLeft: '20px',
                        textAlign: 'left',
                        fontSize: '13px',
                        color: '#7A3E00',
                        lineHeight: '1.6'
                      }}>
                        <li>Jump on platforms to climb higher</li>
                        <li>Different platform types with special effects</li>
                        <li>Collect power-ups for bonuses</li>
                        <li>Higher score = more discount!</li>
                      </ul>
                    </div>
                    <p style={{ margin: '0 0 24px 0', color: '#A19A95', fontSize: 14 }}>
                      {isMobile ? 'Touch left/right sides to move' : 'Use arrow keys to move'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button 
                        onClick={startGame} 
                        style={{ 
                          ...ctaStyle, 
                          background: '#FFD6B0',
                          padding: '16px 40px',
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}
                      >
                        Start Game
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {isRunning && (
            <>
              <div 
                style={{ 
                  position: 'absolute', 
                  left: 0, 
                  top: 0, 
                  height: '100%', 
                  width: '50%', 
                  touchAction: 'none' 
                }} 
                onPointerDown={() => handlePointerStart('left')} 
                onPointerUp={handlePointerEnd} 
                onPointerLeave={handlePointerEnd} 
              />
              <div 
                style={{ 
                  position: 'absolute', 
                  right: 0, 
                  top: 0, 
                  height: '100%', 
                  width: '50%', 
                  touchAction: 'none' 
                }} 
                onPointerDown={() => handlePointerStart('right')} 
                onPointerUp={handlePointerEnd} 
                onPointerLeave={handlePointerEnd} 
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------- GuessTheWord Component (with discount integration) ----------------
function GuessTheWord({ onExit, onGuess, onDiscountEarned }: GuessTheWordProps) {
  const [inputValue, setInputValue] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "success" | "error" | "warning">("info");
  const [gameState, setGameState] = useState<GuessGameState>({
    ...MOCK_GAME_DATA,
    attemptsRemaining: MOCK_GAME_DATA.maxAttempts,
    userAttempts: [],
    gameDate: new Date().toDateString(),
  });
  const [hasGuessedCorrectly, setHasGuessedCorrectly] = useState(false);
  const [hasAlreadyPlayedToday, setHasAlreadyPlayedToday] = useState(false);
  const [discountEarned, setDiscountEarned] = useState<DiscountData | null>(null);

  useEffect(() => {
    const hasPlayedToday = localStorage.getItem(`guessGamePlayed_${gameState.gameDate}`);
    if (hasPlayedToday) {
      setHasAlreadyPlayedToday(true);
      setMessage("You've already played today. Come back tomorrow!");
      setMessageType("info");
    } else {
      setMessage("");
      setMessageType("info");
    }
  }, [gameState.gameDate]);

  useEffect(() => {
    const preventZoom = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('touchstart', preventZoom, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventZoom);
    };
  }, []);

  const calculateGuessDiscount = async (isFirst: boolean): Promise<DiscountData> => {
    if (!isFirst) {
      const existing = await loadDiscount();
      if (existing) return existing;
      
      return {
        pointsEarned: 0,
        discountPercent: 0,
        totalDiscount: 0,
        expirationDate: new Date()
      };
    }
    
    return await updateDiscount(0, 'guess');
  };

  const handleGuess = () => {
    const guess = inputValue.trim().toUpperCase();
    
    if (!guess) {
      setMessage("Please enter a guess!");
      setMessageType("error");
      return;
    }

    if (guess.length !== gameState.wordLength) {
      setMessage(`Please enter a ${gameState.wordLength}-letter word!`);
      setMessageType("error");
      return;
    }

    if (hasGuessedCorrectly) {
      setMessage("You've already guessed correctly today!");
      setMessageType("info");
      return;
    }

    if (gameState.attemptsRemaining <= 0) {
      setMessage("No attempts remaining. Try again tomorrow!");
      setMessageType("error");
      return;
    }

    const newAttempts = [...gameState.userAttempts, guess];
    const newAttemptsRemaining = gameState.attemptsRemaining - 1;

    if (guess === gameState.correctAnswer) {
      setHasGuessedCorrectly(true);
      const isFirstCorrect = !gameState.hasBeenGuessedToday;
      
      localStorage.setItem(`guessGamePlayed_${gameState.gameDate}`, "true");
      
      (async () => {
        const discountData = await calculateGuessDiscount(isFirstCorrect);
        setDiscountEarned(discountData);
        
        if (onDiscountEarned) {
          onDiscountEarned(discountData);
        }
      })();
      
      setGameState(prev => ({
        ...prev,
        hasBeenGuessedToday: true,
        firstGuesser: isFirstCorrect ? "You" : prev.firstGuesser,
        userAttempts: newAttempts,
        attemptsRemaining: newAttemptsRemaining,
      }));

      if (isFirstCorrect) {
        setMessage(`CONGRATULATIONS! You're the first to guess today! You win ${gameState.discountAmount}% discount!`);
      } else {
        setMessage("Correct! But someone else guessed first today. Try again tomorrow!");
      }
      setMessageType("success");

      if (onGuess) {
        onGuess(true, isFirstCorrect);
      }
    } else {
      setGameState(prev => ({
        ...prev,
        userAttempts: newAttempts,
        attemptsRemaining: newAttemptsRemaining,
      }));

      if (newAttemptsRemaining > 0) {
        setMessage(`Incorrect! ${newAttemptsRemaining} attempt(s) remaining.`);
        setMessageType("warning");
      } else {
        setMessage(`Game over! The word was: ${gameState.correctAnswer}. Try again tomorrow!`);
        setMessageType("error");
        localStorage.setItem(`guessGamePlayed_${gameState.gameDate}`, "true");
      }

      if (onGuess) {
        onGuess(false, false);
      }
    }

    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGuess();
    }
  };

  if (hasAlreadyPlayedToday) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: '#FFF7EE',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: 20,
      }}>
        <button
          onClick={onExit}
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            padding: "12px 24px",
            background: "rgba(255, 255, 255, 0.9)",
            border: "2px solid #FFB347",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
          }}
        >
          <span style={{ fontSize: "20px" }}>←</span>
          Back to Games
        </button>

        <div style={{
          width: "100%",
          maxWidth: "500px",
          background: "white",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(255, 160, 80, 0.15)",
          textAlign: "center",
        }}>
          <h1 style={{
            margin: "0 0 20px 0",
            color: "#E67A3C",
            fontSize: "36px",
            fontWeight: "700",
          }}>
            Guess the Word
          </h1>
          
          <div style={{
            padding: "30px",
            background: "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)",
            borderRadius: "15px",
            border: "2px solid #FF980040",
            marginBottom: "30px",
          }}>
            <p style={{
              margin: "0",
              color: "#EF6C00",
              fontSize: "18px",
              fontWeight: "500",
              lineHeight: "1.5",
            }}>
              You've already played today. Come back tomorrow for a new word!
            </p>
          </div>

          <button
            onClick={onExit}
            style={{
              padding: "16px 40px",
              background: "#FFB347",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: "linear-gradient(135deg, #FFF7F0 0%, #FFF0E6 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      zIndex: 10000,
      overflow: "auto",
      overflowY: "auto",
      WebkitOverflowScrolling: "touch",
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "600px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        flexWrap: "wrap",
        gap: "15px",
      }}>
        <button
          onClick={onExit}
          style={{
            padding: "12px 24px",
            background: "rgba(255, 255, 255, 0.9)",
            border: "2px solid #FFB347",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
          }}
        >
          <span style={{ fontSize: "20px" }}>←</span>
          Back
        </button>

        <div style={{
          padding: "12px 24px",
          background: "rgba(255, 255, 255, 0.9)",
          border: "2px solid rgba(255, 179, 71, 0.3)",
          borderRadius: "12px",
          fontSize: "clamp(14px, 3vw, 16px)",
          fontWeight: 600,
          textAlign: "center",
        }}>
          Attempts: <span style={{ 
            color: gameState.attemptsRemaining > 1 ? "#4CAF50" : "#FF5722",
            fontWeight: "bold"
          }}>
            {gameState.attemptsRemaining}/{gameState.maxAttempts}
          </span>
        </div>
      </div>

      <div style={{
        width: "100%",
        maxWidth: "600px",
        background: "white",
        borderRadius: "20px",
        padding: "clamp(20px, 4vw, 40px)",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
        border: "1px solid rgba(255, 160, 80, 0.15)",
        display: "flex",
        flexDirection: "column",
        gap: "clamp(15px, 3vw, 30px)",
      }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{
            margin: "0 0 10px 0",
            color: "#E67A3C",
            fontSize: "36px",
            fontWeight: "700",
          }}>
            Guess the Word
          </h1>
          <p style={{
            margin: "0",
            color: "#6b6b6b",
            fontSize: "18px",
          }}>
            Daily word puzzle • Win discounts!
          </p>
          
          <div style={{
            marginTop: "15px",
            padding: "12px",
            background: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
            borderRadius: "10px",
            border: "2px solid #4CAF5040",
            display: "inline-block",
          }}>
            <p style={{
              margin: "0",
              color: "#2E7D32",
              fontSize: "14px",
              fontWeight: "600",
            }}>
              🎯 First guess: {gameState.discountAmount}% discount • Valid for {DISCOUNT_CONFIG.discountValidityDays} days
            </p>
          </div>
        </div>

        <div style={{
          background: "#F9F9F9",
          padding: "25px",
          borderRadius: "15px",
          borderLeft: "4px solid #FFB347",
        }}>
          <h3 style={{
            margin: "0 0 15px 0",
            color: "#333",
            fontSize: "20px",
            fontWeight: "600",
          }}>
            Today's Riddle:
          </h3>
          <p style={{
            margin: "0",
            color: "#555",
            fontSize: "18px",
            lineHeight: "1.5",
          }}>
            {gameState.question}
          </p>
          <div style={{
            marginTop: "20px",
            padding: "15px",
            background: "rgba(255, 179, 71, 0.1)",
            borderRadius: "10px",
            border: "1px dashed #FFB347",
          }}>
            <p style={{
              margin: "0 0 10px 0",
              color: "#E67A3C",
              fontSize: "16px",
              fontWeight: "600",
            }}>
              Word length: {gameState.wordLength} letters
            </p>
            <div style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}>
              {Array.from({ length: gameState.wordLength }).map((_, index) => (
                <div key={index} style={{
                  width: "clamp(32px, 8vw, 40px)",
                  height: "clamp(32px, 8vw, 40px)",
                  background: "white",
                  border: "2px solid #FFB347",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "clamp(14px, 4vw, 18px)",
                  fontWeight: "bold",
                  color: hasGuessedCorrectly && index < gameState.correctAnswer.length 
                    ? "#4CAF50" 
                    : "#666",
                  flexShrink: 0,
                }}>
                  {hasGuessedCorrectly ? gameState.correctAnswer[index] : "_"}
                </div>
              ))}
            </div>
          </div>
        </div>

        {discountEarned && (
          <div style={{
            padding: "20px",
            background: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
            borderRadius: "12px",
            border: "2px solid #4CAF50",
            textAlign: "center",
            animation: "pulse 2s infinite",
          }}>
            <h3 style={{
              margin: "0 0 10px 0",
              color: "#2E7D32",
              fontSize: "20px",
              fontWeight: "bold",
            }}>
              🎉 DISCOUNT EARNED! 🎉
            </h3>
            <p style={{
              margin: "0 0 8px 0",
              color: "#1B5E20",
              fontSize: "18px",
              fontWeight: "600",
            }}>
              {discountEarned.totalDiscount}% OFF your next order!
            </p>
            <p style={{
              margin: "0",
              color: "#388E3C",
              fontSize: "14px",
            }}>
              Valid until: {discountEarned.expirationDate.toLocaleDateString()}
            </p>
          </div>
        )}

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}>
          <div>
            <label style={{
              display: "block",
              marginBottom: "10px",
              color: "#333",
              fontSize: "18px",
              fontWeight: "600",
            }}>
              Your Guess ({gameState.wordLength} letters):
            </label>
            <div style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              justifyContent: "center",
              width: "100%",
            }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                maxLength={gameState.wordLength}
                disabled={hasGuessedCorrectly || gameState.attemptsRemaining <= 0}
                style={{
                  flex: "1",
                  minWidth: "min(200px, 100%)",
                  padding: "clamp(16px, 4vw, 20px) clamp(12px, 3vw, 20px)",
                  fontSize: "clamp(18px, 5vw, 24px)",
                  fontWeight: "600",
                  border: "2px solid #FFB347",
                  borderRadius: "12px",
                  outline: "none",
                  transition: "all 0.2s ease",
                  textTransform: "uppercase",
                  textAlign: "center",
                  letterSpacing: "clamp(2px, 1vw, 4px)",
                  background: hasGuessedCorrectly || gameState.attemptsRemaining <= 0 
                    ? "#f5f5f5" 
                    : "white",
                  color: "#333",
                  WebkitAppearance: "none",
                  appearance: "none",
                  minHeight: "60px",
                }}
                placeholder="TYPE HERE"
                inputMode="text"
                autoCapitalize="characters"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              <button
                onClick={handleGuess}
                disabled={hasGuessedCorrectly || gameState.attemptsRemaining <= 0 || !inputValue.trim()}
                style={{
                  padding: "clamp(16px, 4vw, 20px) clamp(24px, 6vw, 36px)",
                  background: hasGuessedCorrectly || gameState.attemptsRemaining <= 0 
                    ? "#CCCCCC" 
                    : "#FFB347",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "clamp(16px, 4vw, 20px)",
                  fontWeight: "bold",
                  cursor: hasGuessedCorrectly || gameState.attemptsRemaining <= 0 || !inputValue.trim()
                    ? "not-allowed" 
                    : "pointer",
                  transition: "all 0.2s ease",
                  minWidth: "min(140px, 100%)",
                  width: "fit-content",
                  margin: "0 auto",
                  minHeight: "60px",
                  touchAction: "manipulation",
                }}
              >
                {hasGuessedCorrectly ? "GUESSED!" : "GUESS"}
              </button>
            </div>
          </div>

          {message && (
            <div style={{
              padding: "20px",
              background: messageType === "success" 
                ? "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)"
                : messageType === "error"
                ? "linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)"
                : messageType === "warning"
                ? "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)"
                : "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
              borderRadius: "12px",
              border: `2px solid ${
                messageType === "success" ? "#4CAF50" :
                messageType === "error" ? "#F44336" :
                messageType === "warning" ? "#FF9800" : "#2196F3"
              }40`,
              textAlign: "center",
            }}>
              <p style={{
                margin: "0",
                color: messageType === "success" ? "#2E7D32" :
                       messageType === "error" ? "#D32F2F" :
                       messageType === "warning" ? "#EF6C00" : "#1565C0",
                fontSize: "16px",
                fontWeight: "500",
                lineHeight: "1.5",
              }}>
                {message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------- Card Component ----------------
function Card({ onClick, title, subtitle, hint, buttonText }: any) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onClick={onClick} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        cursor: "pointer", 
        borderRadius: 18, 
        padding: 24, 
        background: "linear-gradient(180deg,#FFFDF9,#FFF7EE)", 
        border: "2px solid rgba(255,160,80,0.2)", 
        boxShadow: isHovered 
          ? "0 12px 40px rgba(234,160,110,0.15)" 
          : "0 8px 30px rgba(234,160,110,0.06)", 
        display: "flex", 
        flexDirection: "column", 
        gap: 12,
        transition: "all 0.3s ease",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, color: "#E67A3C", fontSize: "22px" }}>{title}</h2>
          <p style={{ margin: "4px 0 0 0", color: "#6b6b6b", fontSize: "14px" }}>{subtitle}</p>
        </div>
        <div style={{ 
          width: 72, 
          height: 72, 
          borderRadius: 14, 
          background: isHovered ? "#FFE8CC" : "#FFF1E6", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          border: "1px solid rgba(230,122,60,0.12)",
          transition: "all 0.3s ease"
        }}>
          <span style={{ fontSize: 32 }}>
            {title.includes("Guess") ? "🧩" : "🦒"}
          </span>
        </div>
      </div>

      {hint && <p style={{ margin: "8px 0 0 0", color: "#A19A95", fontSize: "13px" }}>{hint}</p>}

      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <button 
          onClick={onClick} 
          style={{ 
            padding: "14px 28px",
            borderRadius: 12,
            border: "none",
            fontWeight: 700,
            cursor: "pointer",
            background: isHovered ? "#FFB347" : "#FFD6B0", 
            color: "#7A3E00",
            fontSize: "15px",
            transition: "all 0.2s ease",
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

// ---------------- Main GamesPage Component ----------------
export default function GamesPage({ 
  width = 422, 
  height = 552, 
  spriteSrc = "/sprite.png", 
  onGameOver,
  onDiscountEarned 
}: Props) {
  const navigate = useNavigate();
  const [showGame, setShowGame] = useState(false);
  const [showGuess, setShowGuess] = useState(false);

  const handleDiscountEarned = (discountData: DiscountData) => {
    console.log('Discount earned:', discountData);
    if (onDiscountEarned) {
      onDiscountEarned(discountData);
    }
  };

  const handleGuessGameGuess = (isCorrect: boolean, isFirstGuess: boolean) => {
    console.log(`Guess result: ${isCorrect ? 'Correct' : 'Incorrect'}, First: ${isFirstGuess}`);
  };

  if (showGame || showGuess) {
    return (
      <>
        {showGame && !showGuess && (
          <FullScreenDoodleJump
            onExit={() => setShowGame(false)}
            spriteSrc={spriteSrc}
            onGameOver={onGameOver}
            onDiscountEarned={handleDiscountEarned}
          />
        )}

        {showGuess && !showGame && (
          <GuessTheWord
            onExit={() => setShowGuess(false)}
            onGuess={handleGuessGameGuess}
            onDiscountEarned={handleDiscountEarned}
          />
        )}
      </>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#FFF7F0", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      padding: 20, 
      gap: 20,
      position: "relative"
    }}>
      <div style={{
        width: "100%",
        maxWidth: 520,
        display: "flex",
        justifyContent: "flex-start",
        marginBottom: 10
      }}>
        <button 
          onClick={() => navigate('/')} 
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            border: "2px solid #FFB347",
            borderRadius: "12px",
            padding: "10px 20px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
          }}
        >
          <span style={{ fontSize: "18px" }}>←</span>
          Back
        </button>
      </div>

      <h1 style={{
        margin: "0 0 10px 0",
        color: "#E67A3C",
        fontSize: "28px",
        textAlign: "center"
      }}>
        Choose Your Game
      </h1>
      <p style={{
        margin: "0 0 20px 0",
        color: "#6b6b6b",
        textAlign: "center",
        maxWidth: 500
      }}>
        Play games to earn discounts on our menu!
      </p>

      <div style={{
        width: "100%",
        maxWidth: 520,
        padding: "15px",
        background: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
        borderRadius: "12px",
        border: "2px solid #4CAF5040",
        marginBottom: "10px",
      }}>
        <h3 style={{
          margin: "0 0 8px 0",
          color: "#2E7D32",
          fontSize: "16px",
          fontWeight: "600",
          textAlign: "center",
        }}>
          How Discounts Work
        </h3>
        <div style={{
          display: "flex",
          justifyContent: "space-around",
          flexWrap: "wrap",
          gap: "10px",
          fontSize: "12px",
          color: "#388E3C",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: "bold" }}>Giraffe Jump</div>
            <div>{DISCOUNT_CONFIG.pointsPerPercent} points = 1% discount</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: "bold" }}>Guess the Word</div>
            <div>First guess: 5% discount</div>
          </div>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 520, display: "grid", gap: 20 }}>
        <Card 
          onClick={() => setShowGame(true)} 
          title="Giraffe Jump" 
          subtitle={`Earn ${DISCOUNT_CONFIG.pointsPerPercent} points for 1% discount`} 
          buttonText="Start Game" 
        />

        <Card 
          onClick={() => setShowGuess(true)} 
          title="Guess the Word" 
          subtitle="First guesser gets 5% off" 
          hint="Play daily to win" 
          buttonText="Start Game" 
        />
      </div>
    </div>
  );
}