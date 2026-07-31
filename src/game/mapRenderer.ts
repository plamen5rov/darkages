import Phaser from 'phaser';
import type { RegionPolygon } from './mapLoader';

const SEA_COLOR = 0xd8e0dc;
const SEA_WASH = 0xc5d1cd;
const BORDER_LINE = 0xe9e5da;
const WATER_LABEL_COLOR = '#f8f2e8';

export function renderMap(
  scene: Phaser.Scene,
  regions: RegionPolygon[],
  colors: Record<string, number>,
  century: number,
  title: string,
) {
  const graphics = scene.add.graphics();
  const width = scene.scale.width;
  const height = scene.scale.height;

  graphics.fillStyle(SEA_COLOR, 1);
  graphics.fillRect(0, 0, width, height);
  graphics.fillStyle(SEA_WASH, 0.5);
  graphics.fillEllipse(1100, 50, 280, 140);
  graphics.fillStyle(SEA_WASH, 0.35);
  graphics.fillEllipse(100, 900, 300, 120);

  regions.forEach((region) => {
    const pts = region.points.map((p) => new Phaser.Geom.Point(p.x, p.y));
    const color = colors[region.id] ?? 0x8f8b82;

    graphics.fillStyle(color, 1);
    graphics.fillPoints(pts, true);
    graphics.lineStyle(2, BORDER_LINE, 0.85);
    graphics.strokePoints(pts, true);
  });

  scene.add.text(24, 20, `EUROPE / ${century}TH CENTURY`, {
    color: WATER_LABEL_COLOR,
    fontFamily: 'Arial',
    fontSize: '12px',
    fontStyle: 'bold',
    letterSpacing: 2,
  });

  scene.add.text(26, height - 34, title.toUpperCase(), {
    color: '#2d2924',
    fontFamily: 'Georgia',
    fontSize: '17px',
    fontStyle: 'bold',
  });

  const labelPositions = computeLabelPositions(regions);
  labelPositions.forEach(({ x, y, name }) => {
    scene.add.text(x, y, name.toUpperCase(), {
      color: '#f8f2e8',
      fontFamily: 'Arial',
      fontSize: '9px',
      fontStyle: 'bold',
      letterSpacing: 1,
      stroke: '#2d2924',
      strokeThickness: 3,
    });
  });
}

function computeLabelPositions(
  regions: RegionPolygon[],
): { x: number; y: number; name: string }[] {
  return regions.map((region) => {
    let cx = 0;
    let cy = 0;
    region.points.forEach((p) => {
      cx += p.x;
      cy += p.y;
    });
    cx = Math.round(cx / region.points.length);
    cy = Math.round(cy / region.points.length);
    return { x: cx, y: cy, name: region.name };
  });
}
