import type { EngineState, Unit, City, Phase, UnitType } from './entities';
import type { ResourceType } from './resources';
import type { CapitalDef } from './capitals';
import { UNIT_STATS, CITY_BUILD_COST, POP_GROWTH_THRESHOLD, FOOD_PER_POP } from './entities';

let nextUnitId = 1;
let nextCityId = 1;

export function resetIds(): void {
  nextUnitId = 1;
  nextCityId = 1;
}

function uid(): number { return nextUnitId++; }
function cid(): number { return nextCityId++; }

function rand(): number {
  return 0.8 + Math.random() * 0.4;
}

export function createEngineState(
  factionOrder: string[],
  ownership: Record<string, string>,
  playerFaction: string,
  resources: Record<string, ResourceType[]>,
  capitals: Record<string, CapitalDef>,
  adjacency: Record<string, string[]>,
): EngineState {
  resetIds();

  const cities: City[] = [];
  const units: Unit[] = [];

  for (const factionId of factionOrder) {
    const cap = capitals[factionId];
    if (!cap) continue;

    cities.push({
      id: cid(),
      regionId: cap.regionId,
      name: cap.cityName,
      owner: factionId,
      isCapital: true,
      population: 2,
      foodStock: 0,
      productionStock: 0,
      buildItem: null,
      buildProgress: 0,
    });

    const stats = UNIT_STATS.army;
    units.push({
      id: uid(),
      type: 'army',
      regionId: cap.regionId,
      owner: factionId,
      hp: stats.maxHp,
      maxHp: stats.maxHp,
      attack: stats.attack,
      defense: stats.defense,
      movesLeft: stats.maxMoves,
      maxMoves: stats.maxMoves,
    });
  }

  return {
    ownership: { ...ownership },
    units,
    cities,
    adjacency,
    resources,
    capitals,
    factionOrder,
    turn: 1,
    phase: 'production',
    currentFaction: factionOrder[0],
    playerFaction,
    selectedUnitId: null,
    showMovement: null,
    log: [`Turn 1 — ${factionOrder.length} factions vie for control of Europe.`],
  };
}

export function selectUnit(state: EngineState, unitId: number): EngineState {
  const unit = state.units.find((u) => u.id === unitId);
  if (!unit || unit.owner !== state.playerFaction) return state;
  if (unit.movesLeft <= 0) return state;
  if (state.phase !== 'player_move') return state;

  const movementOptions = getMoveTargets(state, unit);

  return {
    ...state,
    selectedUnitId: unitId,
    showMovement: movementOptions,
  };
}

export function deselectUnit(state: EngineState): EngineState {
  return { ...state, selectedUnitId: null, showMovement: null };
}

export function moveUnit(state: EngineState, targetRegionId: string): EngineState {
  if (state.phase !== 'player_move') return state;
  const unitIdx = state.units.findIndex((u) => u.id === state.selectedUnitId);
  if (unitIdx === -1) return state;

  const unit = state.units[unitIdx];
  if (unit.owner !== state.playerFaction) return state;
  if (unit.movesLeft <= 0) return state;

  const adj = state.adjacency[unit.regionId];
  if (!adj || !adj.includes(targetRegionId)) return state;

  let newState = { ...state, units: [...state.units] };
  newState.units = [...newState.units];
  const u = { ...newState.units[unitIdx], movesLeft: unit.movesLeft - 1 };
  newState.units[unitIdx] = u;
  newState.log = [...newState.log];

  const targetOwner = state.ownership[targetRegionId];

  if (targetOwner === undefined || targetOwner === unit.owner) {
    if (targetOwner === undefined) {
      newState.ownership = { ...newState.ownership, [targetRegionId]: unit.owner };
      newState.log.push(`${unit.owner} claims ${targetRegionId}.`);
    }
    u.regionId = targetRegionId;
  } else {
    const defenders = state.units.filter(
      (du) => du.regionId === targetRegionId && du.owner === targetOwner,
    );
    const city = state.cities.find(
      (c) => c.regionId === targetRegionId && c.owner === targetOwner,
    );
    const cityDefBonus = city ? 2 : 0;

    if (defenders.length > 0) {
      const defender = defenders[0];
      const dIdx = newState.units.findIndex((du) => du.id === defender.id);
      const result = resolveCombat(u, defender, cityDefBonus);

      newState.log.push(
        `${unit.owner} attacks ${defender.owner} in ${targetRegionId}.` +
          ` Attacker HP: ${result.attackerHp}, Defender HP: ${result.defenderHp}.`,
      );

      if (result.attackerHp <= 0) {
        newState.units = newState.units.filter((du) => du.id !== u.id);
      } else {
        u.hp = result.attackerHp;
        u.regionId = targetRegionId;
      }

      if (dIdx !== -1) {
        if (result.defenderHp <= 0) {
          newState.units.splice(dIdx, 1);
        } else {
          const du = { ...newState.units[dIdx], hp: result.defenderHp };
          newState.units[dIdx] = du;
        }
      }
    } else {
      u.regionId = targetRegionId;
      newState.log.push(`${unit.owner} marches into ${targetRegionId}.`);
    }

    const remaining = newState.units.filter(
      (du) => du.regionId === targetRegionId && du.owner === targetOwner,
    );

    if (remaining.length === 0) {
      const attackerUnitsInRegion = newState.units.filter(
        (au) => au.regionId === targetRegionId && au.owner === unit.owner,
      );
      if (attackerUnitsInRegion.length > 0) {
        newState.ownership = {
          ...newState.ownership,
          [targetRegionId]: unit.owner,
        };
        newState.log.push(`${unit.owner} seizes ${targetRegionId}.`);

        const capturedCity = newState.cities.find(
          (c) => c.regionId === targetRegionId && c.owner === targetOwner,
        );
        if (capturedCity) {
          const isCapital = capturedCity.isCapital;
          newState.cities = newState.cities.map((c) =>
            c.id === capturedCity.id ? { ...c, owner: unit.owner } : c,
          );
          newState.log.push(
            `${unit.owner} captures ${capturedCity.name}${isCapital ? ' — the capital!' : ''}.`,
          );

          if (isCapital) {
            newState = absorbFaction(newState, targetOwner, unit.owner);
          }
        }
      }
    }
  }

  if (u.movesLeft === undefined || u.movesLeft <= 0) {
    newState.selectedUnitId = null;
    newState.showMovement = null;
  } else {
    newState.selectedUnitId = u.id;
    newState.showMovement = getMoveTargets(newState, u);
  }

  return newState;
}

function resolveCombat(
  attacker: { attack: number; defense: number; hp: number },
  defender: { attack: number; defense: number; hp: number },
  cityDefBonus: number,
): { attackerHp: number; defenderHp: number } {
  const attackRoll = rand() * attacker.attack;
  const defendRoll = rand() * (defender.defense + cityDefBonus);

  if (attackRoll > defendRoll) {
    return { attackerHp: attacker.hp, defenderHp: Math.max(0, defender.hp - (attackRoll - defendRoll)) };
  }
  return { attackerHp: Math.max(0, attacker.hp - (defendRoll - attackRoll)), defenderHp: defender.hp };
}

function absorbFaction(state: EngineState, defeatedFaction: string, victorFaction: string): EngineState {
  const newOwnership = { ...state.ownership };
  for (const [region, owner] of Object.entries(newOwnership)) {
    if (owner === defeatedFaction) {
      newOwnership[region] = victorFaction;
    }
  }

  const newUnits = state.units
    .filter((u) => u.owner !== defeatedFaction)
    .map((u) => ({ ...u }));

  const newCities = state.cities.map((c) => {
    if (c.owner === defeatedFaction) {
      return { ...c, owner: victorFaction, isCapital: false };
    }
    return c;
  });

  const log = [...state.log, `${defeatedFaction} has fallen to ${victorFaction}.`];

  return {
    ...state,
    ownership: newOwnership,
    units: newUnits,
    cities: newCities,
    log,
  };
}

function getMoveTargets(state: EngineState, unit: Unit): string[] {
  const adj = state.adjacency[unit.regionId] || [];
  const targets: string[] = [];

  for (const regionId of adj) {
    const owner = state.ownership[regionId];
    if (owner === undefined || owner !== unit.owner) {
      targets.push(regionId);
    } else {
      targets.push(regionId);
    }
  }

  return targets;
}

export function advancePhase(state: EngineState): EngineState {
  switch (state.phase) {
    case 'production':
      return processProduction(state);
    case 'player_move':
      return { ...state, phase: 'ai_move', selectedUnitId: null, showMovement: null };
    case 'ai_move':
      return runAiTurn(state);
    case 'cleanup':
      return processCleanup(state);
    default:
      return state;
  }
}

function processProduction(state: EngineState): EngineState {
  const newCities = state.cities.map((city) => {
    if (city.owner !== state.currentFaction) return city;

    const regionResources = state.resources[city.regionId] || [];
    const foodBonus = regionResources.filter((r) => r === 'food').length;
    const prodBonus = regionResources.filter((r) => r === 'production').length;

    let foodStock = city.foodStock + FOOD_PER_POP + foodBonus;
    let population = city.population;
    while (foodStock >= POP_GROWTH_THRESHOLD) {
      foodStock -= POP_GROWTH_THRESHOLD;
      population++;
    }

    let productionStock = city.productionStock + city.population + prodBonus;
    let buildItem = city.buildItem;
    let buildProgress = city.buildProgress;

    if (buildItem) {
      buildProgress += 1;
      if (buildProgress >= CITY_BUILD_COST[buildItem]) {
        buildItem = null;
        buildProgress = 0;
      }
    }

    return { ...city, population, foodStock, productionStock, buildItem, buildProgress };
  });

  return {
    ...state,
    cities: newCities,
    phase: state.currentFaction === state.playerFaction ? 'player_move' : 'ai_move',
  };
}

export function runAiTurn(state: EngineState): EngineState {
  let s = { ...state, log: [...state.log] };
  const aiFaction = s.currentFaction;

  for (let i = 0; i < s.units.length; i++) {
    const unit = s.units[i];
    if (unit.owner !== aiFaction) continue;
    if (unit.movesLeft <= 0) continue;

    const adj = s.adjacency[unit.regionId] || [];
    const enemyNeighbors = adj.filter((rid) => {
      const owner = s.ownership[rid];
      return owner !== undefined && owner !== aiFaction;
    });

    if (enemyNeighbors.length > 0) {
      const target = enemyNeighbors[Math.floor(Math.random() * enemyNeighbors.length)];
      const uIdx = s.units.findIndex((u) => u.id === unit.id);
      if (uIdx === -1) continue;
      s.selectedUnitId = unit.id;
      s = moveUnitAi(s, uIdx, target, aiFaction);
      continue;
    }

    const expendable = adj.filter((rid) => {
      const owner = s.ownership[rid];
      return owner === undefined || owner === aiFaction;
    });
    if (expendable.length > 0) {
      const otherFactions = [...new Set(Object.values(s.ownership).filter((o) => o !== aiFaction && o !== undefined))];
      if (otherFactions.length > 0) {
        const targetFaction = otherFactions[0];
        const nearest = findNearestEnemy(s, unit.regionId, targetFaction, new Set([unit.regionId]));
        if (nearest && expendable.includes(nearest)) {
          const uIdx = s.units.findIndex((u) => u.id === unit.id);
          if (uIdx === -1) continue;
          s.selectedUnitId = unit.id;
          s = moveUnitAi(s, uIdx, nearest, aiFaction);
        }
      }
    }
  }

  return { ...s, phase: 'cleanup', selectedUnitId: null, showMovement: null };
}

function moveUnitAi(state: EngineState, unitIdx: number, targetRegionId: string, aiFaction: string): EngineState {
  const unit = state.units[unitIdx];
  if (!unit || unit.movesLeft <= 0) return state;

  let s = { ...state, units: [...state.units] };
  s.units = [...s.units];
  const u = { ...s.units[unitIdx], movesLeft: unit.movesLeft - 1 };
  s.units[unitIdx] = u;
  s.log = [...s.log];

  const targetOwner = s.ownership[targetRegionId];

  if (targetOwner === undefined || targetOwner === aiFaction) {
    if (targetOwner === undefined) {
      s.ownership = { ...s.ownership, [targetRegionId]: aiFaction };
      s.log.push(`${aiFaction} claims ${targetRegionId}.`);
    }
    u.regionId = targetRegionId;
  } else {
    const defenders = s.units.filter(
      (du) => du.regionId === targetRegionId && du.owner === targetOwner,
    );
    const city = s.cities.find(
      (c) => c.regionId === targetRegionId && c.owner === targetOwner,
    );
    const cityDefBonus = city ? 2 : 0;

    if (defenders.length > 0) {
      const defender = defenders[0];
      const dIdx = s.units.findIndex((du) => du.id === defender.id);
      const result = resolveCombat(u, defender, cityDefBonus);

      s.log.push(
        `${aiFaction} attacks ${defender.owner} in ${targetRegionId}.` +
          ` Attacker HP: ${result.attackerHp}, Defender HP: ${result.defenderHp}.`,
      );

      if (result.attackerHp <= 0) {
        s.units = s.units.filter((du) => du.id !== u.id);
      } else {
        u.hp = result.attackerHp;
        u.regionId = targetRegionId;
      }

      if (dIdx !== -1) {
        if (result.defenderHp <= 0) {
          s.units.splice(dIdx, 1);
        } else {
          s.units[dIdx] = { ...s.units[dIdx], hp: result.defenderHp };
        }
      }
    } else {
      u.regionId = targetRegionId;
      s.log.push(`${aiFaction} marches into ${targetRegionId}.`);
    }

    const remaining = s.units.filter(
      (du) => du.regionId === targetRegionId && du.owner === targetOwner,
    );

    if (remaining.length === 0) {
      const attackerUnitsInRegion = s.units.filter(
        (au) => au.regionId === targetRegionId && au.owner === aiFaction,
      );
      if (attackerUnitsInRegion.length > 0) {
        s.ownership = { ...s.ownership, [targetRegionId]: aiFaction };
        s.log.push(`${aiFaction} seizes ${targetRegionId}.`);

        const capturedCity = s.cities.find(
          (c) => c.regionId === targetRegionId && c.owner === targetOwner,
        );
        if (capturedCity) {
          const isCapital = capturedCity.isCapital;
          s.cities = s.cities.map((c) =>
            c.id === capturedCity.id ? { ...c, owner: aiFaction } : c,
          );
          s.log.push(
            `${aiFaction} captures ${capturedCity.name}${isCapital ? ' — the capital!' : ''}.`,
          );

          if (isCapital) {
            s = absorbFaction(s, targetOwner, aiFaction);
          }
        }
      }
    }
  }

  if (u.movesLeft === undefined || u.movesLeft <= 0) {
    s.selectedUnitId = null;
    s.showMovement = null;
  }

  return s;
}

function findNearestEnemy(
  state: EngineState,
  fromRegion: string,
  enemyFaction: string,
  visited: Set<string>,
): string | null {
  const adj = state.adjacency[fromRegion] || [];
  for (const rid of adj) {
    if (visited.has(rid)) continue;
    visited.add(rid);
    const owner = state.ownership[rid];
    if (owner === enemyFaction) return rid;
  }
  return null;
}

function processCleanup(state: EngineState): EngineState {
  const currentIdx = state.factionOrder.indexOf(state.currentFaction);
  const nextIdx = (currentIdx + 1) % state.factionOrder.length;
  const nextFaction = state.factionOrder[nextIdx];
  const nextTurn = nextIdx === 0 ? state.turn + 1 : state.turn;

  const newUnits = state.units.map((u) => ({
    ...u,
    movesLeft: u.maxMoves,
  }));

  const newLog = [...state.log];
  if (nextFaction === state.factionOrder[0]) {
    newLog.push(`--- Turn ${nextTurn} begins ---`);
  }

  return {
    ...state,
    units: newUnits,
    turn: nextTurn,
    currentFaction: nextFaction,
    phase: 'production',
    log: newLog,
  };
}

export function setCityBuild(
  state: EngineState,
  cityId: number,
  buildItem: UnitType | null,
): EngineState {
  return {
    ...state,
    cities: state.cities.map((c) =>
      c.id === cityId && c.owner === state.playerFaction ? { ...c, buildItem, buildProgress: 0 } : c,
    ),
  };
}

export function checkVictory(state: EngineState, playerFaction: string): boolean {
  const liveFactions = new Set(
    state.cities.filter((c) => c.isCapital).map((c) => c.owner),
  );
  return liveFactions.size === 1 && liveFactions.has(playerFaction);
}
