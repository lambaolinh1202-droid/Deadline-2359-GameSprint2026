import { useCallback, useEffect, useMemo, useState } from "react";

export type UpgradeId =
  | "attack"
  | "speed"
  | "crit"
  | "energyTower"
  | "critTower";

export type GameEventKind =
  | "shot"
  | "damage"
  | "crit"
  | "kill"
  | "coin"
  | "boss-hit";

export interface GameEvent {
  id: number;
  kind: GameEventKind;
  value?: number;
  target?: number;
  createdAt: number;
}

interface EnemyState {
  name: string;
  hp: number;
  maxHp: number;
  isBoss: boolean;
}

interface HeroState {
  attack: number;
  attackLevel: number;
  attackCost: number;
  speed: number;
  speedLevel: number;
  speedCost: number;
  crit: number;
  critLevel: number;
  critCost: number;
  dps: number;
}

interface TowerState {
  energyLevel: number;
  energyCost: number;
  critLevel: number;
  critCost: number;
  energyBuilt: boolean;
  critBuilt: boolean;
  energyBuff: number;
  critBuff: number;
}

interface AllyState {
  count: number;
  cost: number;
  dps: number;
}

export interface GameSnapshot {
  coins: number;
  stage: number;
  wave: number;
  kills: number;
  hero: HeroState;
  towers: TowerState;
  allies: AllyState;
  enemy: EnemyState;
  bossSecondsLeft: number | null;
  result: "victory" | "defeat" | null;
  offlineCoins: number;
  totalPower: number;
}

interface PersistedGame {
  coins: number;
  stage: number;
  wave: number;
  kills: number;
  attackLevel: number;
  speedLevel: number;
  critLevel: number;
  energyLevel: number;
  critTowerLevel: number;
  energyBuilt: boolean;
  critBuilt: boolean;
  allyCount: number;
  enemy: EnemyState;
  bossSecondsLeft: number | null;
  attackElapsed: number;
  lastSavedAt: number;
}

interface EngineState extends PersistedGame {
  events: GameEvent[];
  result: "victory" | "defeat" | null;
  offlineCoins: number;
}

const SAVE_KEY = "deadline-2359-save-v1";
const BOSS_DURATION = 30;
const OFFLINE_LIMIT_SECONDS = 8 * 60 * 60;
const OFFLINE_COIN_CAP = 25_000;
let eventSequence = 0;

function normalEnemy(stage: number, wave: number): EnemyState {
  const hp = Math.round(360 + (wave - 1) * 115 + (stage - 1) * 210);
  const names = ["Thây ma vũ trụ", "Lính nhiễm độc", "Thợ săn thiên hà"];

  return {
    name: names[(wave + stage - 2) % names.length],
    hp,
    maxHp: hp,
    isBoss: false,
  };
}

function heroAttack(level: number): number {
  return 250 + Math.max(0, level - 15) * 15;
}

function heroSpeed(level: number): number {
  return Math.max(0.42, 1.2 - Math.max(0, level - 12) * 0.055);
}

function heroCrit(level: number): number {
  return Math.min(0.75, 0.15 + Math.max(0, level - 8) * 0.01);
}

function energyBuff(level: number, built: boolean): number {
  return built ? 0.1 + level * 0.01 : 0;
}

function critTowerBuff(level: number, built: boolean): number {
  return built ? level * 0.005 : 0;
}

function teamDps(game: Pick<
  PersistedGame,
  | "attackLevel"
  | "speedLevel"
  | "critLevel"
  | "energyLevel"
  | "critTowerLevel"
  | "energyBuilt"
  | "critBuilt"
  | "allyCount"
>): number {
  const attack =
    heroAttack(game.attackLevel) *
    (1 + energyBuff(game.energyLevel, game.energyBuilt));
  const crit =
    heroCrit(game.critLevel) +
    critTowerBuff(game.critTowerLevel, game.critBuilt);

  return attack / heroSpeed(game.speedLevel) * (1 + crit * 0.75) +
    game.allyCount * 42;
}

function createBoss(stage: number, dps: number): EnemyState {
  const hp = Math.round(Math.max(5_500, dps * 25) * (1 + (stage - 1) * 0.42));
  const names = ["Ong Chúa Tổ Ong", "Rồng Lửa Ngân Hà", "Chiến Hạm Băng Giá", "Thủy Quái Vực Sâu"];

  return {
    name: `${names[(stage - 1) % names.length]} · Màn ${stage}`,
    hp,
    maxHp: hp,
    isBoss: true,
  };
}

function createInitialState(): EngineState {
  const game: PersistedGame = {
    coins: 1_500,
    stage: 1,
    wave: 1,
    kills: 0,
    attackLevel: 15,
    speedLevel: 12,
    critLevel: 8,
    energyLevel: 10,
    critTowerLevel: 8,
    energyBuilt: true,
    critBuilt: false,
    allyCount: 2,
    enemy: normalEnemy(1, 1),
    bossSecondsLeft: null,
    attackElapsed: 0,
    lastSavedAt: Date.now(),
  };

  return {
    ...game,
    events: [],
    result: null,
    offlineCoins: 0,
  };
}

function getOfflineReward(game: PersistedGame, now: number): number {
  const elapsedSeconds = Math.min(
    OFFLINE_LIMIT_SECONDS,
    Math.max(0, Math.floor((now - game.lastSavedAt) / 1_000)),
  );

  if (elapsedSeconds < 15) return 0;

  const payoutPerKill = 55 + Math.max(0, game.stage - 1) * 20;
  const killsPerSecond = teamDps(game) / (650 + game.stage * 150);
  const coinsPerSecond = Math.max(0.6, killsPerSecond * payoutPerKill * 0.12);

  return Math.min(OFFLINE_COIN_CAP, Math.floor(elapsedSeconds * coinsPerSecond));
}

function readSavedGame(): EngineState {
  if (typeof window === "undefined") return createInitialState();

  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return createInitialState();

    const saved = JSON.parse(raw) as Partial<PersistedGame>;
    if (
      typeof saved.coins !== "number" ||
      typeof saved.stage !== "number" ||
      typeof saved.attackLevel !== "number" ||
      typeof saved.lastSavedAt !== "number"
    ) {
      return createInitialState();
    }

    const now = Date.now();
    const state: PersistedGame = {
      ...createInitialState(),
      ...saved,
      lastSavedAt: now,
    };

    // An offline boss fight should never silently time out while the player is away.
    if (state.enemy?.isBoss) {
      state.wave = 4;
      state.enemy = normalEnemy(state.stage, 4);
      state.bossSecondsLeft = null;
      state.attackElapsed = 0;
    }

    const offlineCoins = getOfflineReward({ ...state, lastSavedAt: saved.lastSavedAt }, now);
    state.coins += offlineCoins;

    return {
      ...state,
      events: [],
      result: null,
      offlineCoins,
    };
  } catch {
    return createInitialState();
  }
}

function viewOf(state: EngineState): GameSnapshot {
  const heroAttackValue = heroAttack(state.attackLevel);
  const energyBuffValue = energyBuff(state.energyLevel, state.energyBuilt);
  const towerCritBuff = critTowerBuff(state.critTowerLevel, state.critBuilt);
  const baseCrit = heroCrit(state.critLevel);
  const combinedCrit = Math.min(0.9, baseCrit + towerCritBuff);
  const allyDamage = state.allyCount * 42;
  const heroDps =
    (heroAttackValue * (1 + energyBuffValue) * (1 + combinedCrit * 0.75)) /
    heroSpeed(state.speedLevel);

  return {
    coins: Math.floor(state.coins),
    stage: state.stage,
    wave: state.wave,
    kills: state.kills,
    hero: {
      attack: heroAttackValue,
      attackLevel: state.attackLevel,
      attackCost: Math.round(1_000 * 1.18 ** Math.max(0, state.attackLevel - 15)),
      speed: heroSpeed(state.speedLevel),
      speedLevel: state.speedLevel,
      speedCost: Math.round(1_200 * 1.2 ** Math.max(0, state.speedLevel - 12)),
      crit: Math.round(baseCrit * 100),
      critLevel: state.critLevel,
      critCost: Math.round(800 * 1.25 ** Math.max(0, state.critLevel - 8)),
      dps: Math.round(heroDps),
    },
    towers: {
      energyLevel: state.energyLevel,
      energyCost: state.energyBuilt
        ? Math.round(10_000 * 1.22 ** Math.max(0, state.energyLevel - 10))
        : 3_000,
      critLevel: state.critTowerLevel,
      critCost: state.critBuilt
        ? Math.round(5_000 * 1.22 ** Math.max(0, state.critTowerLevel - 8))
        : 5_000,
      energyBuilt: state.energyBuilt,
      critBuilt: state.critBuilt,
      energyBuff: energyBuffValue,
      critBuff: towerCritBuff,
    },
    allies: {
      count: state.allyCount,
      cost: Math.round(500 * 1.35 ** Math.max(0, state.allyCount - 2)),
      dps: allyDamage,
    },
    enemy: { ...state.enemy, hp: Math.max(0, state.enemy.hp) },
    bossSecondsLeft:
      state.bossSecondsLeft === null ? null : Math.max(0, state.bossSecondsLeft),
    result: state.result,
    offlineCoins: state.offlineCoins,
    totalPower: Math.round(teamDps(state)),
  };
}

function addEvent(
  state: EngineState,
  kind: GameEventKind,
  value?: number,
  target?: number,
): void {
  state.events.push({
    id: ++eventSequence,
    kind,
    ...(value === undefined ? {} : { value }),
    ...(target === undefined ? {} : { target }),
    createdAt: Date.now(),
  });
  if (state.events.length > 18) state.events.splice(0, state.events.length - 18);
}

function nextNormalWave(state: EngineState): void {
  const nextWave = state.wave + 1;
  state.wave = nextWave;

  if (nextWave === 5) {
    state.enemy = createBoss(state.stage, teamDps(state));
    state.bossSecondsLeft = BOSS_DURATION;
  } else {
    state.enemy = normalEnemy(state.stage, nextWave);
    state.bossSecondsLeft = null;
  }
}

function defeatBoss(state: EngineState): void {
  state.result = "defeat";
  state.bossSecondsLeft = 0;
  state.coins = Math.floor(state.coins * 0.85);
}

function advance(state: EngineState, dt: number): EngineState {
  if (state.result) return state;

  const now = Date.now();
  state.events = state.events.filter((event) => now - event.createdAt < 1_300);

  if (state.enemy.isBoss) {
    state.bossSecondsLeft = Math.max(0, (state.bossSecondsLeft ?? BOSS_DURATION) - dt);
    if (state.bossSecondsLeft <= 0) {
      defeatBoss(state);
      return state;
    }
  }

  const energy = energyBuff(state.energyLevel, state.energyBuilt);
  const critChance = Math.min(
    0.9,
    heroCrit(state.critLevel) + critTowerBuff(state.critTowerLevel, state.critBuilt),
  );
  const speed = heroSpeed(state.speedLevel);
  const alliesDamage = state.allyCount * 42 * dt;
  let damage = alliesDamage;
  state.attackElapsed += dt;

  while (state.attackElapsed >= speed) {
    state.attackElapsed -= speed;
    const isCrit = Math.random() < critChance;
    const shotDamage =
      heroAttack(state.attackLevel) *
      (1 + energy) *
      (isCrit ? 2 : 1);
    damage += shotDamage;
    addEvent(state, "shot", shotDamage);
    addEvent(state, isCrit ? "crit" : "damage", Math.round(shotDamage));
    if (state.enemy.isBoss) addEvent(state, "boss-hit", Math.round(shotDamage));
  }

  state.enemy.hp -= damage;
  if (state.enemy.hp > 0) return state;

  if (state.enemy.isBoss) {
    const reward = 500 + state.stage * 350;
    state.coins += reward;
    state.kills += 1;
    state.stage += 1;
    state.wave = 1;
    state.enemy = normalEnemy(state.stage, state.wave);
    state.bossSecondsLeft = null;
    state.result = "victory";
    addEvent(state, "kill", 1);
    addEvent(state, "coin", reward);
    return state;
  }

  const reward = 55 + state.stage * 18 + state.wave * 7;
  state.kills += 1;
  state.coins += reward;
  addEvent(state, "kill", 1);
  addEvent(state, "coin", reward);
  nextNormalWave(state);
  return state;
}

function persist(state: EngineState): void {
  if (typeof window === "undefined") return;

  const {
    events: _events,
    result: _result,
    offlineCoins: _offlineCoins,
    ...saved
  } = state;
  try {
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ ...saved, lastSavedAt: Date.now() }),
    );
  } catch {
    // The game remains playable when storage is unavailable or full.
  }
}

export function useIdleGame() {
  const [state, setState] = useState<EngineState>(readSavedGame);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setState((current) => {
        const next = advance({ ...current, events: [...current.events] }, 0.25);
        persist(next);
        return next;
      });
    }, 250);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (state.offlineCoins <= 0) return;
    const timeout = window.setTimeout(() => {
      setState((current) => ({ ...current, offlineCoins: 0 }));
    }, 8_000);
    return () => window.clearTimeout(timeout);
  }, [state.offlineCoins]);

  const game = useMemo(() => viewOf(state), [state]);

  const upgrade = useCallback((id: UpgradeId) => {
    setState((current) => {
      const next = { ...current, events: [...current.events] };
      const view = viewOf(current);

      if (id === "attack" && current.coins >= view.hero.attackCost) {
        next.coins -= view.hero.attackCost;
        next.attackLevel += 1;
      } else if (id === "speed" && current.coins >= view.hero.speedCost) {
        next.coins -= view.hero.speedCost;
        next.speedLevel += 1;
      } else if (id === "crit" && current.coins >= view.hero.critCost) {
        next.coins -= view.hero.critCost;
        next.critLevel += 1;
      } else if (
        id === "energyTower" &&
        current.energyBuilt &&
        current.coins >= view.towers.energyCost
      ) {
        next.coins -= view.towers.energyCost;
        next.energyLevel += 1;
      } else if (
        id === "critTower" &&
        current.critBuilt &&
        current.coins >= view.towers.critCost
      ) {
        next.coins -= view.towers.critCost;
        next.critTowerLevel += 1;
      }

      persist(next);
      return next;
    });
  }, []);

  const summonAlly = useCallback(() => {
    setState((current) => {
      const cost = Math.round(500 * 1.35 ** Math.max(0, current.allyCount - 2));
      if (current.coins < cost) return current;
      const next = {
        ...current,
        coins: current.coins - cost,
        allyCount: current.allyCount + 1,
        events: [...current.events],
      };
      persist(next);
      return next;
    });
  }, []);

  const buildTower = useCallback((type: "energy" | "crit") => {
    setState((current) => {
      const cost = type === "energy" ? 3_000 : 5_000;
      if (
        current.coins < cost ||
        (type === "energy" && current.energyBuilt) ||
        (type === "crit" && current.critBuilt)
      ) {
        return current;
      }

      const next = {
        ...current,
        coins: current.coins - cost,
        energyBuilt: type === "energy" ? true : current.energyBuilt,
        critBuilt: type === "crit" ? true : current.critBuilt,
        events: [...current.events],
      };
      if (type === "energy" && next.energyLevel < 10) next.energyLevel = 10;
      if (type === "crit" && next.critTowerLevel < 8) next.critTowerLevel = 8;
      persist(next);
      return next;
    });
  }, []);

  const retryBoss = useCallback(() => {
    setState((current) => {
      const next = { ...current, events: [...current.events] };
      next.result = null;
      next.wave = 5;
      next.enemy = createBoss(next.stage, teamDps(next));
      next.bossSecondsLeft = BOSS_DURATION;
      next.attackElapsed = 0;
      persist(next);
      return next;
    });
  }, []);

  const returnToBase = useCallback(() => {
    setState((current) => {
      const next = { ...current, events: [...current.events] };
      if (current.result === "defeat") {
        next.wave = 1;
        next.enemy = normalEnemy(next.stage, next.wave);
      }
      next.result = null;
      next.bossSecondsLeft = null;
      next.attackElapsed = 0;
      persist(next);
      return next;
    });
  }, []);

  const startBoss = useCallback(() => {
    setState((current) => {
      const next = { ...current, events: [...current.events] };
      next.wave = 5;
      next.result = null;
      next.enemy = createBoss(next.stage, teamDps(next));
      next.bossSecondsLeft = BOSS_DURATION;
      next.attackElapsed = 0;
      persist(next);
      return next;
    });
  }, []);

  return {
    game,
    events: state.events,
    upgrade,
    summonAlly,
    buildTower,
    retryBoss,
    returnToBase,
    startBoss,
  };
}
