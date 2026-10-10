import { useEffect, useState } from 'react';
import {
  Activity, Bolt, Clock3, Coins, Crosshair, Gem, Heart, HeartPulse,
  Medal, Pause, RadioTower, RotateCcw, Shield, Sparkles, Swords,
  Target, Zap,
} from 'lucide-react';
import { useIdleGame } from './useIdleGame';
import { BeeAlly, EnemySprite, GunTurret } from './BattleSprites';

type Tab = 'hero' | 'towers' | 'allies';

const ENEMY_ROUTE: Array<[number, number]> = [
  [850, 325], [875, 510], [820, 690], [640, 770], [390, 770],
  [195, 700], [145, 520], [175, 335], [355, 235], [670, 235],
];

function enemyPositionAt(time: number): [number, number] {
  const progress = (time % 15_000) / 15_000 * ENEMY_ROUTE.length;
  const segment = Math.floor(progress);
  const rawT = progress - segment;
  const t = rawT * rawT * (3 - 2 * rawT);
  const from = ENEMY_ROUTE[segment];
  const to = ENEMY_ROUTE[(segment + 1) % ENEMY_ROUTE.length];
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
}

function lightningPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  time: number,
  seed: number,
): string {
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.max(1, Math.hypot(dx, dy));
  const normalX = -dy / length;
  const normalY = dx / length;
  const flicker = time / 65 + seed;
  const bends = [0.25, 0.48, 0.72, 0.88].map((point, index) => {
    const offset = Math.sin(flicker + index * 2.1) * 48;
    return `${startX + dx * point + normalX * offset} ${startY + dy * point + normalY * offset}`;
  });
  return `M ${startX} ${startY} L ${bends.join(' L ')} L ${endX} ${endY}`;
}

function lightningForks(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  time: number,
  seed: number,
): string[] {
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.max(1, Math.hypot(dx, dy));
  const normalX = -dy / length;
  const normalY = dx / length;

  return [0.28, 0.5, 0.72].map((point, index) => {
    const flicker = Math.sin(time / 72 + seed + index * 2.7);
    const branchX = startX + dx * point + normalX * flicker * 20;
    const branchY = startY + dy * point + normalY * flicker * 20;
    const direction = index === 0 ? 1 : -1;
    const endBranchX = branchX + normalX * direction * (58 + flicker * 14);
    const endBranchY = branchY + normalY * direction * (58 + flicker * 14);
    return `M ${branchX} ${branchY} L ${endBranchX} ${endBranchY}`;
  });
}

function flowingPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  time: number,
  amplitude: number,
): string {
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.max(1, Math.hypot(dx, dy));
  const normalX = -dy / length;
  const normalY = dx / length;
  const bends = [0.18, 0.36, 0.54, 0.72, 0.88].map((point, index) => {
    const offset = Math.sin(time / 115 + index * 1.8) * amplitude;
    return `${startX + dx * point + normalX * offset} ${startY + dy * point + normalY * offset}`;
  });
  return `M ${startX} ${startY} Q ${bends[0]} ${bends[1]} Q ${bends[2]} ${bends[3]} Q ${bends[4]} ${endX} ${endY}`;
}

function BattleScene({ game, events }: { game: ReturnType<typeof useIdleGame>['game']; events: ReturnType<typeof useIdleGame>['events'] }) {
  const [sceneTime, setSceneTime] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setSceneTime(Date.now()), 50);
    return () => window.clearInterval(timer);
  }, []);

  const hpPercent = Math.max(0, Math.min(100, (game.enemy.hp / Math.max(game.enemy.maxHp, 1)) * 100));
  const [enemyX, enemyY] = game.enemy.isBoss ? [790, 430] : enemyPositionAt(sceneTime);
  const targetY = enemyY - (game.enemy.isBoss ? 24 : 18);
  const allies = [
    { x: 360, y: 445 },
    { x: 665, y: 445 },
    { x: 390, y: 585 },
    { x: 632, y: 585 },
    { x: 460, y: 650 },
    { x: 565, y: 650 },
  ].slice(0, Math.min(game.allies.count, 6));
  const enemyVariant = game.enemy.isBoss
    ? (game.stage - 1) % 4
    : (game.wave + game.stage - 2) % 3;
  const enemySize = game.enemy.isBoss ? (enemyVariant === 2 ? 2.12 : 3) : 2.75;
  const healthLeft = Math.max(10, Math.min(714, enemyX - 150));
  const healthTop = Math.max(58, enemyY - (game.enemy.isBoss ? 275 : 150));
  const towerPositions: Array<{ x: number; y: number; scale: number; kind: string }> = [];
  if (game.towers.energyBuilt) towerPositions.push({ x: 512, y: 700, scale: 0.9, kind: 'energy' });
  if (game.towers.critBuilt) towerPositions.push({ x: 705, y: 680, scale: 0.7, kind: 'crit' });
  const bossElement = (['poison', 'fire', 'ice', 'water'] as const)[(game.stage - 1) % 4];
  const bossAttackActive = game.enemy.isBoss && sceneTime % 3_600 < 1_050;
  const bossAttack = bossElement === 'poison'
    ? lightningPath(enemyX - 10, enemyY - 65, 512, 660, sceneTime, 5)
    : flowingPath(enemyX - 10, enemyY - 65, 512, 660, sceneTime, bossElement === 'water' ? 32 : bossElement === 'fire' ? 20 : 10);

  return (
    <section className={`battle-board ${game.result === 'defeat' ? 'scene-defeat' : ''}`} aria-label="Chiến trường tự động">
      <div className="scene-topline">
        <span className="mission-label"><Activity size={12} /> {game.enemy.isBoss ? 'TRÙM ĐANG TẤN CÔNG' : 'HỆ THỐNG PHÒNG THỦ'}</span>
        <span className="wave-label" data-testid="text-wave">{game.enemy.isBoss ? `BOSS · MÀN ${game.stage}` : <>ĐỢT {game.wave} <span aria-hidden="true">/</span> VÔ TẬN</>}</span>
      </div>
      <div className="scene-illustration" aria-hidden="true" />
      <svg
        className="combat-layer"
        viewBox="0 0 1024 1024"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${game.enemy.isBoss ? 'Boss' : 'Quái'} ${game.enemy.name} còn ${Math.max(0, Math.ceil(game.enemy.hp)).toLocaleString('vi-VN')} máu; Ong Poly, ong đồng đội và tháp đang tấn công.`}
      >
        <defs>
          <filter id="combatGlow"><feGaussianBlur stdDeviation="7" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="goldGlow"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {[-1, 0, 1].map((offset) => {
          const beam = `M ${514 + offset * 13} ${428 + offset * 7} L ${enemyX + offset * 10} ${targetY + offset * 6}`;
          return (
            <g key={`hero-laser-${offset}`}>
              <path className="hero-beam" d={beam} filter="url(#combatGlow)" />
              <path className="hero-beam-core" d={beam} />
            </g>
          );
        })}
        {allies.map((ally, index) => (
          <g key={`ally-shot-${index}`}>
            <path className="ally-beam" d={lightningPath(ally.x, ally.y - 4, enemyX, targetY, sceneTime, index)} filter="url(#goldGlow)" />
            <path className="ally-beam-mid" d={lightningPath(ally.x, ally.y - 4, enemyX, targetY, sceneTime, index)} />
            <path className="ally-beam-core" d={lightningPath(ally.x, ally.y - 4, enemyX, targetY, sceneTime, index)} />
            {lightningForks(ally.x, ally.y - 4, enemyX, targetY, sceneTime, index).map((fork, forkIndex) => (
              <path key={`fork-${index}-${forkIndex}`} className="ally-beam-fork" d={fork} />
            ))}
          </g>
        ))}
        {towerPositions.flatMap((tower, towerIndex) => [-1, 0, 1].map((shot) => {
          const shotPath = `M ${tower.x + shot * 36} ${tower.y - 67} L ${enemyX + shot * 8} ${targetY + shot * 6}`;
          return (
            <g key={`turret-shot-${towerIndex}-${shot}`}>
              <path className="turret-shot-glow" d={shotPath} filter="url(#goldGlow)" />
              <path className="turret-shot-core" d={shotPath} />
            </g>
          );
        }))}
        {game.towers.energyBuilt && game.towers.energyLevel > 10 && (
          <path className="combat-beam tower-beam" d={`M 180 655 L ${enemyX} ${targetY}`} filter="url(#combatGlow)" />
        )}
        {game.towers.critBuilt && (
          <path className="combat-beam tower-beam tower-beam-crit" d={`M 824 225 L ${enemyX} ${targetY}`} filter="url(#combatGlow)" />
        )}
        {bossAttackActive && (
          <g className={`boss-attack-effect boss-element-${bossElement}`}>
            <path className="boss-attack-beam" d={bossAttack} filter="url(#combatGlow)" />
            <path className="boss-attack-core" d={bossAttack} />
            {[0.32, 0.62].map((point, index) => {
              const x = enemyX - 10 + (512 - enemyX + 10) * point;
              const y = enemyY - 65 + (660 - enemyY + 65) * point;
              return bossElement === 'ice' ? (
                <path key={`boss-shard-${index}`} className="boss-attack-particle" d={`M ${x} ${y - 11} L ${x + 7} ${y} L ${x} ${y + 11} L ${x - 7} ${y} Z`} />
              ) : (
                <circle key={`boss-particle-${index}`} className="boss-attack-particle" cx={x} cy={y} r={bossElement === 'fire' ? 7 : 9} />
              );
            })}
            <circle className="boss-impact" cx="512" cy="660" r="23" />
            <circle className="boss-impact-core" cx="512" cy="660" r="8" />
          </g>
        )}
        {towerPositions.map((tower) => (
          <GunTurret key={`gun-turret-${tower.kind}`} x={tower.x} y={tower.y} scale={tower.scale} />
        ))}
        <g className="moving-zombie" transform={`translate(${enemyX} ${enemyY}) scale(${enemySize})`} data-testid="scene-moving-zombie">
          <EnemySprite variant={enemyVariant} isBoss={game.enemy.isBoss} />
        </g>
        <g className="enemy-health-rack" transform={`translate(${healthLeft} ${healthTop})`} data-testid="health-above-zombie">
          <rect width="300" height="80" rx="14" fill="rgba(3,17,40,.92)" stroke={game.enemy.isBoss ? "#a866ff" : "#55dfff"} strokeWidth="3" />
          <text x="150" y="25" textAnchor="middle" className="floating-enemy-name">{game.enemy.name}</text>
          <rect x="15" y="38" width="270" height="13" rx="6" fill="#11213f" stroke="#8cecff" strokeWidth="2" />
          <rect x="18" y="41" width={264 * hpPercent / 100} height="7" rx="3" fill={game.enemy.isBoss ? "#ff6d77" : "#ffb948"} />
          <text x="150" y="71" textAnchor="middle" className="floating-enemy-hp">{Math.max(0, Math.ceil(game.enemy.hp)).toLocaleString('vi-VN')} / {game.enemy.maxHp.toLocaleString('vi-VN')} HP</text>
        </g>
        {allies.map((ally, index) => (
          <BeeAlly key={`ally-${index}`} x={ally.x} y={ally.y} scale={1.05} className={index % 2 ? 'ally-fly-b' : 'ally-fly-a'} />
        ))}
      </svg>
      {events.slice(-4).map((event, index) => (
        <div
          key={event.id}
          className={`combat-float ${event.kind === 'crit' ? 'crit' : event.kind === 'damage' ? 'damage' : ''}`}
          style={{ left: `${Math.max(8, Math.min(85, enemyX / 1024 * 100 - 12 + index * 4))}%`, top: `${Math.max(24, Math.min(86, enemyY / 1024 * 100 + 8 + index * 2))}%`, animationDelay: `${index * 70}ms` }}
        >
          {event.kind === 'crit' ? `BẠO KÍCH −${event.value ?? ''}` : event.kind === 'coin' ? `+${event.value ?? ''} xu` : event.kind === 'kill' ? 'HẠ GỤC!' : event.kind === 'boss-hit' ? `TRÙM −${event.value ?? ''}` : event.kind === 'damage' ? `−${event.value ?? ''}` : 'BẮN!'}
        </div>
      ))}
      <div className="scene-captions">
        <span className="battle-caption">VỆ BINH ONG · CẤP {game.hero.attackLevel}</span>
        <span className="timer-chip"><Clock3 size={13} /> {game.bossSecondsLeft !== null ? `CÒN ${Math.ceil(game.bossSecondsLeft)} GIÂY` : 'ĐẾN 23:59'}</span>
      </div>
    </section>
  );
}

function App() {
  const { game, events, upgrade, summonAlly, buildTower, retryBoss, returnToBase, startBoss } = useIdleGame();
  const [tab, setTab] = useState<Tab>('hero');
  const canAfford = (cost: number) => game.coins >= cost;
  const format = (amount: number) => amount.toLocaleString('vi-VN');

  const upgradeCard = (
    id: 'attack' | 'speed' | 'crit' | 'energyTower' | 'critTower',
    title: string,
    detail: string,
    level: number,
    cost: number,
    icon: typeof Swords,
  ) => {
    const Icon = icon;
    const affordable = canAfford(cost);
    return (
      <article className="upgrade-card" key={id}>
        <div className="upgrade-info">
          <div className="upgrade-title"><Icon size={16} strokeWidth={2.6} /> {title}</div>
          <div className="upgrade-detail"><span className="level-text">CẤP {level}</span> · {detail}</div>
        </div>
        <button data-testid={`button-upgrade-${id}`} className={`buy-button ${affordable ? 'gold' : ''}`} onClick={() => upgrade(id)} disabled={!affordable} aria-label={`Nâng cấp ${title}, giá ${format(cost)} xu`}>
          NÂNG CẤP <small>{format(cost)} xu</small>
        </button>
      </article>
    );
  };

  const towerCard = (kind: 'energy' | 'crit') => {
    const built = kind === 'energy' ? game.towers.energyBuilt : game.towers.critBuilt;
    const title = kind === 'energy' ? 'THÁP NĂNG LƯỢNG' : 'THÁP BẠO KÍCH';
    const cost = kind === 'energy' ? game.towers.energyCost : game.towers.critCost;
    const level = kind === 'energy' ? game.towers.energyLevel : game.towers.critLevel;
    const Icon = kind === 'energy' ? Gem : Target;
    const affordable = canAfford(cost);
    return (
      <article className="upgrade-card" key={kind}>
        <div className="upgrade-info">
          <div className="upgrade-title"><Icon size={16} strokeWidth={2.6} /> {title}</div>
          <div className="upgrade-detail"><span className="level-text">{built ? `CẤP ${level}` : 'CHƯA XÂY'}</span> · {kind === 'energy' ? 'Tăng sức mạnh tấn công' : 'Tăng cơ hội bạo kích'}</div>
        </div>
        <button data-testid={`button-tower-${kind}`} className={`buy-button ${affordable ? 'gold' : ''}`} onClick={() => built ? upgrade(kind === 'energy' ? 'energyTower' : 'critTower') : buildTower(kind)} disabled={!affordable}>
          {built ? 'NÂNG CẤP' : 'XÂY THÁP'}<small>{format(cost)} xu</small>
        </button>
      </article>
    );
  };

  return (
    <main className="game-root">
      <div className="game-shell">
        <div className="partner-logo-row">
          <img data-testid="partner-logos" src="/partner-logos.png" alt="Logo CNTT FPL HN, FPT Polytechnic và GDesign" />
        </div>
        <header className="topbar">
          <div className="brand">DEADLINE: 23:59<small>CHIẾN TUYẾN CUỐI CÙNG CỦA ONG</small></div>
          <div className="status-pills">
            <div className="status-pill" data-testid="status-coins"><Coins className="coin-icon" size={16} /><span>COIN</span><strong>{format(game.coins)}</strong></div>
            <div className="status-pill deadline" data-testid="status-stage"><Clock3 size={15} /><span>MÀN</span><strong>{game.stage}</strong></div>
          </div>
        </header>
        <BattleScene game={game} events={events} />
        <section className="dashboard" aria-label="Bảng điều khiển nâng cấp">
          <h1 className="dashboard-heading">TRUNG TÂM CHỈ HUY</h1>
          <nav className="dash-tabs" aria-label="Danh mục nâng cấp">
            <button data-testid="tab-hero" className={`dash-tab ${tab === 'hero' ? 'active' : ''}`} onClick={() => setTab('hero')}><Swords size={13} /> ANH HÙNG</button>
            <button data-testid="tab-towers" className={`dash-tab ${tab === 'towers' ? 'active' : ''}`} onClick={() => setTab('towers')}><RadioTower size={13} /> THÁP PHÒNG THỦ</button>
            <button data-testid="tab-allies" className={`dash-tab ${tab === 'allies' ? 'active' : ''}`} onClick={() => setTab('allies')}><Sparkles size={13} /> ĐỒNG MINH</button>
          </nav>
          <div className="upgrade-list" key={tab}>
            {tab === 'hero' && <>
              {upgradeCard('attack', 'SÁT THƯƠNG', `${game.hero.attack} ATK → ${game.hero.attack + 15} ATK`, game.hero.attackLevel, game.hero.attackCost, Swords)}
              {upgradeCard('speed', 'TỐC ĐỘ BẮN', `${game.hero.speed.toFixed(1)} giây / phát`, game.hero.speedLevel, game.hero.speedCost, Zap)}
              {upgradeCard('crit', 'TỈ LỆ BẠO KÍCH', `${game.hero.crit}% cơ hội gây sát thương lớn`, game.hero.critLevel, game.hero.critCost, Crosshair)}
              <article className="upgrade-card">
                <div className="upgrade-info"><div className="upgrade-title"><Medal size={16} /> THỬ THÁCH TRÙM</div><div className="upgrade-detail">Mở khóa phần thưởng của màn {game.stage}</div></div>
                <button data-testid="button-start-boss" className="buy-button green" onClick={startBoss} disabled={game.enemy.isBoss}><span>KHIÊU CHIẾN</span><small>NGAY BÂY GIỜ</small></button>
              </article>
            </>}
            {tab === 'towers' && <>
              {towerCard('energy')}
              {towerCard('crit')}
              <article className="upgrade-card tower-summary">
                <div className="upgrade-info"><div className="upgrade-title"><Shield size={16} /> LÁ CHẮN HÀNH TINH</div><div className="upgrade-detail">Trụ đang hoạt động: {Number(game.towers.energyBuilt) + Number(game.towers.critBuilt)} / 2</div></div>
                <span className="ally-count"><HeartPulse size={15} /> ỔN ĐỊNH</span>
              </article>
              <article className="upgrade-card tower-summary">
                <div className="upgrade-info"><div className="upgrade-title"><Bolt size={16} /> NĂNG LƯỢNG</div><div className="upgrade-detail">Mỗi nâng cấp gia cố hàng phòng thủ</div></div>
                <span className="ally-count">+SỨC MẠNH</span>
              </article>
            </>}
            {tab === 'allies' && <>
              <article className="upgrade-card ally-card">
                <div className="upgrade-info"><div className="upgrade-title"><Sparkles size={16} /> ONG ĐỒNG ĐỘI <span className="ally-count">×{game.allies.count}</span></div><div className="upgrade-detail">Tăng hỏa lực tự động trên chiến trường</div></div>
                <button data-testid="button-summon-ally" className="buy-button gold" onClick={summonAlly} disabled={!canAfford(game.allies.cost)}><span>TRIỆU HỒI</span><small>{format(game.allies.cost)} xu</small></button>
              </article>
              <article className="upgrade-card ally-tip">
                <div className="upgrade-info"><div className="upgrade-title"><Heart size={16} /> BIỆT ĐỘI TINH NHUỆ</div><div className="upgrade-detail">Đồng minh sẽ tự động yểm trợ trong trận chiến.</div></div>
              </article>
              <article className="upgrade-card">
                <div className="upgrade-info"><div className="upgrade-title"><Crosshair size={16} /> HỎA LỰC BIỆT ĐỘI</div><div className="upgrade-detail">Số chiến binh đang tham chiến</div></div>
                <span className="ally-count">{game.allies.count} ONG</span>
              </article>
              <article className="upgrade-card">
                <div className="upgrade-info"><div className="upgrade-title"><Pause size={16} /> NHỊP TRẬN</div><div className="upgrade-detail">Cuộc chiến tiếp diễn khi bạn chuẩn bị.</div></div>
                <span className="ally-count">TỰ ĐỘNG</span>
              </article>
            </>}
          </div>
          <footer className="dashboard-foot"><span>{game.offlineCoins > 0 ? `+${format(game.offlineCoins)} COIN VẮNG MẶT` : `HÀNH TINH CUỐI CÙNG · ${game.kills} KẺ ĐỊCH BỊ HẠ`}</span><span>23:59 ĐANG ĐẾM NGƯỢC</span></footer>
        </section>
      </div>
      {game.result && (
        <div className="modal-scrim" role="dialog" aria-modal="true" aria-labelledby="result-title">
          <section className={`result-modal ${game.result === 'defeat' ? 'defeat' : ''}`}>
            <div className="result-kicker">{game.result === 'victory' ? 'MỘT NHỊP THỞ CHO HÀNH TINH' : 'PHÒNG TUYẾN CUỐI CÙNG ĐÃ VỠ'}</div>
            <h2 className="result-title" id="result-title">{game.result === 'victory' ? 'CHIẾN THẮNG!' : 'THẤT THỦ'}</h2>
            <p className="result-copy">{game.result === 'victory' ? 'Bầy xác sống đã bị đẩy lùi. Nhưng ngoài kia, một đợt khác đang kéo đến.' : 'Căn cứ đã bị tràn ngập. Hãy chỉnh lại chiến thuật — hành tinh vẫn còn hy vọng.'}</p>
            <div className="result-stats">
              <div className="result-stat"><span>MÀN CUỐI</span><strong>{game.stage}</strong></div>
              <div className="result-stat"><span>KẺ ĐỊCH ĐÃ HẠ</span><strong>{game.kills}</strong></div>
              <div className="result-stat"><span>ĐỒNG XU CÒN LẠI</span><strong>{format(game.coins)}</strong></div>
              <div className="result-stat"><span>THỜI GIAN</span><strong>{game.bossSecondsLeft ?? '23:59'}</strong></div>
            </div>
            <div className="modal-actions">
              {game.result === 'defeat' ? <>
                <button data-testid="button-retry-boss" className="modal-action" onClick={retryBoss}><RotateCcw size={14} /> THỬ LẠI</button>
                <button data-testid="button-return-to-base" className="modal-action secondary" onClick={returnToBase}>VỀ CĂN CỨ</button>
              </> : <button data-testid="button-continue-after-victory" className="modal-action" onClick={returnToBase}>TIẾP TỤC PHÒNG THỦ</button>}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;
