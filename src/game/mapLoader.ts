export type RegionPolygon = {
  id: string;
  name: string;
  points: { x: number; y: number }[];
};

function parseTmxPoints(pointsStr: string): { x: number; y: number }[] {
  return pointsStr
    .trim()
    .split(/\s+/)
    .map((pair) => {
      const [x, y] = pair.split(',').map(Number);
      return { x, y };
    });
}

export function loadRegionsFromTmx(xml: string): RegionPolygon[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const objects = doc.querySelectorAll('objectgroup object');

  return Array.from(objects)
    .map((obj) => {
      const name = obj.getAttribute('name') ?? '';
      const polygonEl = obj.querySelector('polygon');
      if (!polygonEl) return null;

      const pointsStr = polygonEl.getAttribute('points');
      if (!pointsStr) return null;

      const props = Array.from(obj.querySelectorAll('property'));
      const regionId =
        props.find((p) => p.getAttribute('name') === 'regionId')
          ?.getAttribute('value') ?? name.toLowerCase();

      const points = parseTmxPoints(pointsStr);
      if (points.length < 3) return null;

      return { id: regionId, name, points };
    })
    .filter((r): r is RegionPolygon => r !== null);
}
