import React, { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from 'react-router-dom'; // Add this import


type Props = {
  width?: number;
  height?: number;
  spriteSrc?: string;
  onGameOver?: (score: number) => void;
  onBack?: () => void;
};

// Proper TypeScript interfaces
interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  flag: number;
  state: number;
  moved: number;
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
  dir: 'left' | 'right';
}

interface Spring {
  x: number;
  y: number;
  width: number;
  height: number;
  state: number;
}

interface Subs {
  x: number;
  y: number;
  appearance: boolean;
}

interface GameState {
  width: number;
  height: number;
  platforms: Platform[];
  platformCount: number;
  position: number;
  gravity: number;
  flag: number;
  broken: number;
  score: number;
  firstRun: boolean;
  dir: 'left' | 'right';
  base: { height: number; width: number; x: number; y: number; moved: number };
  player: Player;
  spring: Spring;
  subs: Subs;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export default function DoodleJumpReact({
  width = 422,
  height = 552,
  spriteSrc = "/sprite.png",
  onGameOver,
  onBack,
}: Props) {
  const navigate = useNavigate();  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const spriteRef = useRef<HTMLImageElement | null>(null);
  
  // Properly typed state ref
  const stateRef = useRef<GameState | null>(null);

  // Initialize game state
  const resetState = useCallback(() => {
    const platformCount = 10;
    
    const player: Player = {
      vy: 11,
      vx: 0,
      isMovingLeft: false,
      isMovingRight: false,
      isDead: false,
      width: 55,
      height: 40,
      dir: 'left',
      x: width / 2 - 55 / 2,
      y: height - 250, // Start above the bottom
    };

    const platforms: Platform[] = [];
    let position = 0;
    
    for (let i = 0; i < platformCount; i++) {
      platforms.push({
        width: 70,
        height: 17,
        x: Math.random() * (width - 70),
        y: position,
        flag: 0,
        state: 0,
        moved: 0,
        vx: Math.random() > 0.5 ? 1 : -1,
        type: Math.floor(Math.random() * 3) + 1, // 1-3
      });
      position += height / platformCount;
    }

    const gameState: GameState = {
      width,
      height,
      platforms,
      platformCount,
      position,
      gravity: 0.2,
      flag: 0,
      broken: 0,
      score: 0,
      firstRun: false,
      dir: 'left',
      base: {
        height: 5,
        width: width,
        x: 0,
        y: height - 5,
        moved: 0,
      },
      player,
      spring: { x: -100, y: -100, width: 26, height: 30, state: 0 },
      subs: { x: 0, y: 0, appearance: false },
    };

    stateRef.current = gameState;
    setScore(0);
    setGameOver(false);
  }, [width, height]);

  // Load sprite
  useEffect(() => {
    const img = new Image();
    img.src = spriteSrc;
    img.onload = () => {
      spriteRef.current = img;
    };
  }, [spriteSrc]);

  // Resize canvas
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const parentWidth = parent.clientWidth;
    const scale = Math.min(1, parentWidth / width);
    const displayWidth = Math.floor(width * scale);
    const displayHeight = Math.floor(height * scale);

    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr * scale);
    canvas.height = Math.floor(height * dpr * scale);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    }
  }, [width, height]);

  // Setup
  useEffect(() => {
    resetState();
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimation();
    };
  }, []);

  const cancelAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  // Game loop
  const gameLoop = useCallback(() => {
    if (!stateRef.current) return;
    
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, s.width, s.height);
    
    // Draw background
    ctx.fillStyle = "#eaf6ff";
    ctx.fillRect(0, 0, s.width, s.height);

    // Update player
    const player = s.player;
    
    // Horizontal movement
    if (player.isMovingLeft) {
      player.vx = Math.max(player.vx - 0.5, -8);
    } else if (player.isMovingRight) {
      player.vx = Math.min(player.vx + 0.5, 8);
    } else {
      // Friction
      player.vx *= 0.9;
    }
    
    player.x += player.vx;
    
    // Wrap around screen
    if (player.x > s.width) {
      player.x = -player.width;
    } else if (player.x < -player.width) {
      player.x = s.width;
    }

    // Vertical movement
    player.y += player.vy;
    player.vy += s.gravity;

    // Scroll platforms when player is high enough
    if (player.y < s.height / 3) {
      const scrollAmount = s.height / 3 - player.y;
      player.y = s.height / 3;
      
      // Move all platforms down
      for (const platform of s.platforms) {
        platform.y += scrollAmount;
        s.score += 1;
      }
      
      // Move base
      s.base.y += scrollAmount;
    }

    // Check platform collisions
    for (const platform of s.platforms) {
      // Draw platform
      ctx.fillStyle = platform.type === 2 ? "#8bbfdf" : platform.type === 3 ? "#d1c27a" : "#7bbf6a";
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

      // Collision check
      if (
        player.vy > 0 &&
        player.x < platform.x + platform.width &&
        player.x + player.width > platform.x &&
        player.y + player.height > platform.y &&
        player.y + player.height < platform.y + platform.height
      ) {
        player.vy = -12; // Jump
        s.score += 10;
      }

      // Recycle platforms that go off screen
      if (platform.y > s.height) {
        platform.x = Math.random() * (s.width - platform.width);
        platform.y = -20;
        platform.type = Math.floor(Math.random() * 3) + 1;
      }
    }

    // Draw player
    if (spriteRef.current && spriteRef.current.complete) {
      const scale = 1.90; // 45% bigger
      const scaledWidth = player.width * scale;
      const scaledHeight = player.height * scale;
      const offsetX = (player.width - scaledWidth) / 2;
      const offsetY = (player.height - scaledHeight) / 2;  

      ctx.drawImage(
        spriteRef.current, 
        player.x + offsetX, 
        player.y + offsetY, 
        scaledWidth, 
        scaledHeight
      );
    } else {
      ctx.fillStyle = "#333";
      ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    // Draw base
    ctx.fillStyle = "#444";
    ctx.fillRect(s.base.x, s.base.y, s.base.width, s.base.height);

    // Draw score
    ctx.fillStyle = "#000";
    ctx.font = "18px sans-serif";
    ctx.fillText(`Score: ${s.score}`, 10, 24);

    // Check game over
    if (player.y > s.height) {
      player.isDead = true;
      setIsRunning(false);
      setScore(s.score);
      setGameOver(true);
      cancelAnimation();
      if (onGameOver) onGameOver(s.score);
      return;
    }

    // Continue loop
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [onGameOver]);

  // Start game
  const startGame = () => {
    if (isRunning) return;
    resetState();
    setIsRunning(true);
    setGameOver(false);
    animationRef.current = requestAnimationFrame(gameLoop);
  };

  // Control handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!stateRef.current) return;
      
      if (e.key === "ArrowLeft") {
        stateRef.current.player.isMovingLeft = true;
        stateRef.current.player.dir = 'left';
      } else if (e.key === "ArrowRight") {
        stateRef.current.player.isMovingRight = true;
        stateRef.current.player.dir = 'right';
      } else if (e.key === " " && !isRunning) {
        startGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!stateRef.current) return;
      
      if (e.key === "ArrowLeft") {
        stateRef.current.player.isMovingLeft = false;
      } else if (e.key === "ArrowRight") {
        stateRef.current.player.isMovingRight = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isRunning]);

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

  return (
    <div style={{ 
      maxWidth: width, 
      margin: "24px auto", 
      position: "relative",
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      {/* Back Button - Always visible */}
      <div style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        zIndex: 1000,
        pointerEvents: "none"
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: "10px 20px",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "2px solid #4CAF50",
            borderRadius: "25px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
            color: "#333",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            pointerEvents: "auto",
            transition: "all 0.2s ease",
            fontFamily: "inherit"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#4CAF50";
            e.currentTarget.style.color = "white";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
            e.currentTarget.style.color = "#333";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span style={{ fontSize: "20px" }}>←</span>
          Back to Menu
        </button>
      </div>

      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          style={{
            background: "transparent",
            display: "block",
            width: "100%",
            border: "2px solid #ccc",
            borderRadius: "8px",
            touchAction: "none",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
          }}
        />

        {/* Game Start/Game Over Overlay */}
        {!isRunning && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: gameOver ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.7)",
              borderRadius: "8px",
              transition: "background 0.3s ease"
            }}
          >
            <div style={{ 
              textAlign: "center", 
              color: "white", 
              padding: "30px", 
              background: gameOver ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.8)",
              borderRadius: "16px",
              maxWidth: "400px",
              width: "90%"
            }}>
              {gameOver ? (
                <>
                  <h2 style={{ 
                    marginBottom: "10px", 
                    fontSize: "36px",
                    color: "#FF6B6B"
                  }}>
                    Game Over!
                  </h2>
                  <p style={{ 
                    fontSize: "18px", 
                    marginBottom: "8px",
                    color: "#E0E0E0"
                  }}>
                    Your score:
                  </p>
                  <p style={{ 
                    fontSize: "48px", 
                    margin: "10px 0 30px 0",
                    color: "#4CAF50",
                    fontWeight: "bold"
                  }}>
                    {score}
                  </p>
                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column",
                    gap: "12px"
                  }}>
                    <button
                      onClick={startGame}
                      style={{
                        padding: "15px 30px",
                        fontSize: "18px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#45a049";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#4CAF50";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      Play Again
                    </button>
                    
                    <button
                      onClick={() => navigate('/')}
                      style={{
                        padding: "15px 30px",
                        fontSize: "18px",
                        backgroundColor: "#666",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#555";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#666";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <span style={{ fontSize: "20px" }}>←</span>
                      Back to Menu
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 style={{ 
                    marginBottom: "16px", 
                    fontSize: "32px",
                    color: "#4CAF50"
                  }}>
                    Doodle Jump
                  </h2>
                  <p style={{ 
                    fontSize: "16px", 
                    marginBottom: "8px",
                    color: "#E0E0E0"
                  }}>
                    Use arrow keys or touch to move
                  </p>
                  <p style={{ 
                    fontSize: "14px", 
                    marginBottom: "24px",
                    color: "#AAA"
                  }}>
                    Swipe and hold left/right half of screen
                  </p>
                  <button
                    onClick={startGame}
                    style={{
                      padding: "15px 40px",
                      fontSize: "18px",
                      backgroundColor: "#2196F3",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#1976D2";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#2196F3";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    Start Game
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Touch controls overlay (only visible when game is running) */}
        {isRunning && (
          <>
            <div
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                height: "150px",
                width: "50%",
                touchAction: "none",
                // Optional: Add visual hint
                // background: "rgba(255,0,0,0.1)"
              }}
              onPointerDown={() => handlePointerStart('left')}
              onPointerUp={handlePointerEnd}
              onPointerLeave={handlePointerEnd}
            />
            <div
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                height: "150px",
                width: "50%",
                touchAction: "none",
                // Optional: Add visual hint
                // background: "rgba(0,0,255,0.1)"
              }}
              onPointerDown={() => handlePointerStart('right')}
              onPointerUp={handlePointerEnd}
              onPointerLeave={handlePointerEnd}
            />
          </>
        )}
      </div>

      {/* Score display during game */}
      {isRunning && (
        <div style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "10px 20px",
          borderRadius: "25px",
          fontSize: "18px",
          fontWeight: "bold",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span style={{ color: "#FFD700" }}>★</span>
          Score: <span style={{ color: "#4CAF50", marginLeft: "5px" }}>{stateRef.current?.score || 0}</span>
        </div>
      )}

      {/* Instructions footer */}
      <div style={{ 
        textAlign: "center", 
        marginTop: "16px", 
        fontSize: "14px", 
        color: "#666",
        padding: "0 16px"
      }}>
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          justifyContent: "center", 
          gap: "20px",
          marginBottom: "8px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ 
              width: "12px", 
              height: "12px", 
              backgroundColor: "#7bbf6a", 
              borderRadius: "2px" 
            }}></div>
            <span>Platforms</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ 
              width: "12px", 
              height: "12px", 
              backgroundColor: "#FF6666", 
              borderRadius: "2px" 
            }}></div>
            <span>Springs</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "18px" }}>← →</span>
            <span>Arrow Keys / Touch</span>
          </div>
        </div>
        <p style={{ margin: "4px 0", fontSize: "12px", color: "#888" }}>
          Don't fall off the bottom! Collect points by jumping on platforms.
        </p>
      </div>
    </div>
  );
}