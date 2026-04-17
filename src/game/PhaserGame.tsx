import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MainScene } from './MainScene';

interface PhaserGameProps {
  onGameOver?: (data: { score: number; level: number }) => void;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ onGameOver }) => {
  const gameContainer = useRef<HTMLDivElement>(null);
  const gameInstance = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameContainer.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: '100%',
      height: '100%',
      parent: gameContainer.current,
      backgroundColor: '#0a0a0b',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 800 },
          debug: false
        }
      },
      scene: [MainScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      render: {
        antialias: true,
        pixelArt: false,
        roundPixels: true
      }
    };

    const game = new Phaser.Game(config);
    gameInstance.current = game;

    // Listen for events from Phaser
    game.events.on('GAME_OVER', (data: any) => {
      if (onGameOver) onGameOver(data);
    });

    return () => {
      if (gameInstance.current) {
        gameInstance.current.destroy(true);
        gameInstance.current = null;
      }
    };
  }, [onGameOver]);

  return (
    <div 
      ref={gameContainer} 
      className="fixed inset-0 z-0 bg-black"
    />
  );
};
