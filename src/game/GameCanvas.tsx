import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

function PrototypeScene(this: Phaser.Scene) {
  const graphics = this.add.graphics();
  const width = this.scale.width;
  const height = this.scale.height;
  const colors = [0x8f473e, 0xb8794d, 0x607a68, 0x344e5c, 0xb6a26a];
  const columns = 5;
  const rows = 3;
  const cellWidth = width / columns;
  const cellHeight = height / rows;

  graphics.fillStyle(0xe8e0d2, 1);
  graphics.fillRect(0, 0, width, height);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = column * cellWidth + 2;
      const y = row * cellHeight + 2;
      const index = (row * columns + column) % colors.length;
      graphics.fillStyle(colors[index], 1);
      graphics.fillRoundedRect(x, y, cellWidth - 4, cellHeight - 4, 8);
      graphics.lineStyle(1, 0xeee7da, 0.7);
      graphics.strokeRoundedRect(x, y, cellWidth - 4, cellHeight - 4, 8);
    }
  }

  this.add.text(24, 20, 'EUROPE / PROTOTYPE MAP', {
    color: '#f8f2e8',
    fontFamily: 'Arial',
    fontSize: '12px',
    fontStyle: 'bold',
    letterSpacing: 2,
  });
}

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 900,
      height: 520,
      backgroundColor: '#e8e0d2',
      scene: { create: PrototypeScene },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });

    return () => game.destroy(true);
  }, []);

  return <div className="game-canvas" ref={containerRef} />;
}
