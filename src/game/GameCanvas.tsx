import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { getScenario, type Century, type Faction } from '../content/scenarios';
import { loadRegionsFromGeoJson } from './geojsonLoader';
import { renderMap } from './mapRenderer';
import { cities } from './cities';
import europeGeoJson from '../content/europe.geojson?raw';

const MAP_WIDTH = 1120;
const MAP_HEIGHT = 800;

type GameCanvasProps = {
  century: Century;
  ownership: Record<string, string>;
  factions: Faction[];
  playerFactionId: string;
  onCapture: (regionId: string) => void;
  updateKey: number;
};

function pointInPolygon(px: number, py: number, points: { x: number; y: number }[]): boolean {
  let inside = false;
  const n = points.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = points[i].x;
    const yi = points[i].y;
    const xj = points[j].x;
    const yj = points[j].y;
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function projectLon(lon: number): number {
  return ((lon + 10) / 50) * MAP_WIDTH;
}

function projectLat(lat: number): number {
  return ((65 - lat) / 35) * MAP_HEIGHT;
}

function SceneBoot(
  this: Phaser.Scene,
  props: { century: Century; ownership: Record<string, string>; factions: Faction[]; playerFactionId: string; onCapture: (regionId: string) => void },
) {
  const { century, ownership, factions, onCapture } = props;
  const scenario = getScenario(century);
  const regions = loadRegionsFromGeoJson(europeGeoJson, MAP_WIDTH, MAP_HEIGHT);

  const ownershipColors: Record<string, number> = {};
  const factionMap = new Map(factions.map((f) => [f.id, f]));

  for (const [regionId, factionId] of Object.entries(ownership)) {
    const faction = factionMap.get(factionId);
    if (faction) ownershipColors[regionId] = faction.color;
  }

  renderMap(this, regions, ownershipColors, century, scenario.title);

  cities
    .filter((c) => ownership[c.regionId] !== undefined || c.regionId === 'africa')
    .forEach((city) => {
      const cx = Math.round(projectLon(city.lon));
      const cy = Math.round(projectLat(city.lat));
      const mark = this.add.graphics();
      mark.fillStyle(0xf8f2e8, 1);
      mark.fillCircle(cx, cy, 5);
      mark.lineStyle(2, 0x2d2924, 1);
      mark.strokeCircle(cx, cy, 5);
      this.add.text(cx + 9, cy - 6, city.name, {
        color: '#2d2924',
        fontFamily: 'Georgia',
        fontSize: '11px',
        fontStyle: 'bold',
        stroke: '#f8f2e8',
        strokeThickness: 3,
      });
    });

  this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    const clicked = regions.find((region) => pointInPolygon(pointer.x, pointer.y, region.points));
    if (!clicked) return;

    const currentOwner = ownership[clicked.id];
    if (currentOwner !== undefined && currentOwner !== props.playerFactionId) {
      onCapture(clicked.id);
    }
  });
}

export function GameCanvas({ century, ownership, factions, playerFactionId, onCapture, updateKey }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const props = { century, ownership, factions, playerFactionId, onCapture };

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: MAP_WIDTH,
      height: MAP_HEIGHT,
      backgroundColor: '#d8e0dc',
      scene: {
        create() {
          SceneBoot.call(this, props);
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });

    return () => game.destroy(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateKey]);

  return <div className="game-canvas" ref={containerRef} />;
}
