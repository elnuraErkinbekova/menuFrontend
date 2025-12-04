import React, { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  width?: number;
  height?: number;
  spriteSrc?: string;
  onGameOver?: (score: number) => void;
};

interface FullScreenDoodleJumpProps {
  onExit: () => void;
  spriteSrc?: string;
  onGameOver?: (score: number) => void;
}

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  type: number;
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
}

interface GameState {
  W: number;
  H: number;
  player: Player;
  platforms: Platform[];
  gravity: number;
  scrollThreshold: number;
  score: number;
  base: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

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

export default function GiraffeJumpPage({ width = 422, height = 552, spriteSrc = "/sprite.png", onGameOver }: Props) {
  const navigate = useNavigate();
  const [showGame, setShowGame] = useState(false);
  const [showGuess, setShowGuess] = useState(false);

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
      {/* Back button positioned nicely in the header area */}
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
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#FFB347";
            e.currentTarget.style.color = "white";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
            e.currentTarget.style.color = "black";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span style={{ fontSize: "18px" }}>←</span>
          Back
        </button>
      </div>

      {/* Page title */}
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

      {/* Two cards stacked nicely */}
      {!showGame && (
        <div style={{ width: "100%", maxWidth: 520, display: "grid", gap: 20 }}>
          <Card 
            onClick={() => setShowGame(true)} 
            title="Giraffe Jump" 
            subtitle="Get up to 100% off from playing!" 
            hint="Swipe and hold left / right half of screen" 
            buttonText="Start Game" 
          />

          <Card 
            onClick={() => { setShowGuess(true); }} 
            title="Guess the Word" 
            subtitle="The first winner gets 10% off!" 
            hint="Play daily to win" 
            buttonText="Start Game" 
          />
        </div>
      )}

      {/* When guess card opened, you can show something minimal */}
      {showGuess && !showGame && (
        <div style={{ width: "100%", maxWidth: 520 }}>
          <div style={{ 
            padding: 24, 
            borderRadius: 16, 
            background: "linear-gradient(180deg,#fff4ea,#fff8f2)", 
            border: "1px solid rgba(255,160,80,0.18)", 
            boxShadow: "0 6px 20px rgba(255,160,80,0.08)" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <button 
                onClick={() => setShowGuess(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#E67A3C",
                  padding: "4px 8px",
                  borderRadius: "8px"
                }}
              >
                ←
              </button>
              <h3 style={{ margin: 0, color: "#E67A3C" }}>Guess the Word — Coming Soon</h3>
            </div>
            <p style={{ marginTop: 8, color: "#6b6b6b" }}>
              Placeholder — when you press Start here you will later be taken to the Guess-the-Word flow or modal.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button 
                onClick={() => setShowGuess(false)} 
                style={{ 
                  ...ctaStyle, 
                  background: "#E6E6E6", 
                  color: "#333",
                  flex: 1
                }}
              >
                Close
              </button>
              <button 
                onClick={() => navigate('/guess-word')} 
                style={{ 
                  ...ctaStyle, 
                  background: "#FFD6B0", 
                  color: "#7A3E00",
                  flex: 1
                }}
              >
                Go to Guess
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen game component */}
      {showGame && (
        <FullScreenDoodleJump
          onExit={() => setShowGame(false)}
          spriteSrc={spriteSrc}
          onGameOver={onGameOver}
        />
      )}
    </div>
  );
}

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
          <p style={{ marginTop: "20px", color: "#6b6b6b", fontSize: "14px" }}>{subtitle}</p>
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
          <span style={{ fontSize: 32 }}>🐾</span>
        </div>
      </div>

      <p style={{ margin: "8px 0 0 0", color: "#A19A95", fontSize: "13px" }}>{hint}</p>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <button 
          onClick={onClick} 
          style={{ 
            ...ctaStyle, 
            background: isHovered ? "#FFB347" : "#FFD6B0", 
            color: "#7A3E00",
            padding: "14px 28px",
            fontSize: "15px"
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

// ---------------- FullScreenDoodleJump ----------------
// [Keep the FullScreenDoodleJump component exactly as I provided in the previous corrected version]
// ... rest of the FullScreenDoodleJump component remains the same ...

// ---------------- FullScreenDoodleJump ----------------
// ---------------- FullScreenDoodleJump ----------------
function FullScreenDoodleJump({ onExit, spriteSrc = "/sprite.png", onGameOver }: FullScreenDoodleJumpProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const spriteRef = useRef<HTMLImageElement | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth <= 768 : true);
  
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

  const resetState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const W = canvas.clientWidth || 420;
    const H = canvas.clientHeight || 600;

    const player: Player = {
      x: W / 2 - 27,
      y: H - 220,
      vx: 0,
      vy: 11,
      width: 54,
      height: 38,
      isMovingLeft: false,
      isMovingRight: false,
      isDead: false,
    };

    const platforms: Platform[] = [];
    const platformCount = 12;

    // Create spaced platforms
    let y = 30;
    for (let i = 0; i < platformCount; i++) {
      const pw = 60;
      platforms.push({
        x: Math.random() * (W - pw),
        y,
        width: pw,
        height: 16,
        vx: Math.random() > 0.75 ? (Math.random() > 0.5 ? 1.2 : -1.2) : 0,
        type: Math.floor(Math.random() * 3) + 1,
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
    };
    platforms.push(startPlatform);

    stateRef.current = {
      W,
      H,
      player,
      platforms,
      gravity: 0.28,
      scrollThreshold: H * 0.36,
      score: 0,
      base: { x: 0, y: H - 6, width: W, height: 6 },
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

    // Clear
    ctx.clearRect(0, 0, s.W, s.H);

    // Background
    ctx.fillStyle = '#FFF7EE';
    ctx.fillRect(0, 0, s.W, s.H);

    const p = s.player;

    // Horizontal movement
    if (p.isMovingLeft) p.vx = Math.max(p.vx - 0.6, -8);
    else if (p.isMovingRight) p.vx = Math.min(p.vx + 0.6, 8);
    else p.vx *= 0.88;

    p.x += p.vx;

    if (p.x > s.W) p.x = -p.width;
    if (p.x < -p.width) p.x = s.W;

    // Vertical movement
    p.y += p.vy;
    p.vy += s.gravity;

    // Scrolling
    if (p.y < s.scrollThreshold) {
      const scroll = s.scrollThreshold - p.y;
      p.y = s.scrollThreshold;
      for (const pl of s.platforms) {
        pl.y += scroll;
      }
      s.base.y += scroll;
      s.score += Math.round(scroll * 0.5);
    }

    // Draw platforms and check collisions
    for (const pl of s.platforms) {
      // Moving platforms
      if (pl.vx) {
        pl.x += pl.vx;
        if (pl.x < 0 || pl.x + pl.width > s.W) pl.vx *= -1;
      }

      // Platform colors
      ctx.fillStyle = pl.type === 2 ? '#CDECF6' : pl.type === 3 ? '#FBE6C8' : '#D9F7E8';
      ctx.fillRect(pl.x, pl.y, pl.width, pl.height);

      // Collision detection
      if (
        p.vy > 0 &&
        p.x < pl.x + pl.width &&
        p.x + p.width > pl.x &&
        p.y + p.height > pl.y &&
        p.y + p.height < pl.y + pl.height
      ) {
        p.vy = -12;
        s.score += 8;
      }

      // Recycle platforms
      if (pl.y > s.H + 40) {
        pl.x = Math.random() * (s.W - pl.width);
        pl.y = -20 - Math.random() * 80;
        pl.vx = Math.random() > 0.75 ? (Math.random() > 0.5 ? 1.2 : -1.2) : 0;
        pl.width = 50 + Math.random() * 40;
      }
    }

    // Draw player - USE SPRITE IMAGE IF AVAILABLE
    if (spriteRef.current && spriteRef.current.complete) {
      // Draw sprite with scaling
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
    } else {
      // Fallback: Draw placeholder box
      ctx.fillStyle = '#FFB88C';
      ctx.fillRect(p.x, p.y, p.width, p.height);
      
      // Draw simple face on placeholder
      ctx.fillStyle = '#7A3E00';
      ctx.fillRect(p.x + 10, p.y + 10, 8, 8); // Left eye
      ctx.fillRect(p.x + p.width - 18, p.y + 10, 8, 8); // Right eye
      ctx.fillRect(p.x + 20, p.y + 25, p.width - 40, 4); // Mouth
    }

    // Draw base
    ctx.fillStyle = '#E6D8CF';
    ctx.fillRect(s.base.x, s.base.y, s.base.width, s.base.height);

    // Draw score
    ctx.fillStyle = '#7A3E00';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Score: ${s.score}`, 12, 22);

    // Check game over
    if (p.y > s.H + 60) {
      p.isDead = true;
      setIsRunning(false);
      setGameOver(true);
      setScore(s.score);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (onGameOver) onGameOver(s.score);
      return;
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [onGameOver]);

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
      {/* Top bar */}
      <div style={{ width: '100%', maxWidth: 1200, display: 'flex', justifyContent: 'space-between', padding: 14, boxSizing: 'border-box', gap: 12 }}>
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

        <div style={{ marginLeft: 'auto' }}>
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
            Score: {score}
          </div>
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

          {/* Overlay */}
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
                width: Math.min(window.innerWidth - 48, 420), 
                background: gameOver ? 'rgba(0,0,0,0.72)' : 'linear-gradient(180deg,#FFFDF9,#FFF7EE)', 
                padding: '30px 26px', 
                borderRadius: 14, 
                textAlign: 'center', 
                color: gameOver ? '#fff' : '#7A3E00', 
                boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
                transform: 'translateY(-60px)'
              }}>
                {gameOver ? (
                  <>
                    <h2 style={{ margin: 0, fontSize: 30, color: '#FF9C8A' }}>Game Over!</h2>
                    <p style={{ marginTop: 8 }}>Your score</p>
                    <p style={{ fontSize: 42, margin: '8px 0', color: '#FFD6B0' }}>{score}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <button 
                        onClick={startGame} 
                        style={{ 
                          ...ctaStyle, 
                          background: '#FFB380',
                          padding: '14px 24px'
                        }}
                      >
                        Play Again
                      </button>
                      <button 
                        onClick={onExit} 
                        style={{ 
                          ...ctaStyle, 
                          background: '#C9C9C9', 
                          color: '#222',
                          padding: '14px 24px'
                        }}
                      >
                        Back to Menu
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 style={{ margin: 0, fontSize: 28, color: '#E67A3C' }}>Giraffe Jump</h2>
                    <p style={{ marginTop: 8, color: '#6b6b6b' }}>Get up to 100% discount from playing!</p>
                    <p style={{ margin: '10px 0 18px 0', color: '#A19A95' }}>
                      Tap the canvas or press Start to begin — full screen on mobile.
                    </p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                      <button 
                        onClick={startGame} 
                        style={{ 
                          ...ctaStyle, 
                          background: '#FFD6B0',
                          padding: '14px 32px',
                          fontSize: '16px'
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

          {/* Touch controls */}
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