interface BeeAllyProps {
  x: number;
  y: number;
  className?: string;
  scale?: number;
}

export function BeeAlly({ x, y, className = "", scale = 1 }: BeeAllyProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className={className}>
        <ellipse cx="0" cy="2" rx="32" ry="17" fill="#16cafa" opacity=".18" />
        <image
          href="/bee-it-ally.png"
          x="-30"
          y="-24"
          width="60"
          height="50"
          preserveAspectRatio="xMidYMid meet"
          className="bee-logo-sprite"
        />
      </g>
    </g>
  );
}

function InfectedGrunt() {
  return (
    <g>
      <path d="M-11 10l-7 30 8 4 10-21 10 21 8-4-7-32" fill="#466e83" stroke="#142a45" strokeWidth="3" strokeLinejoin="round" />
      <path d="M-12 2l-15 12 4 6 15-8m17-8 14 14-5 5L5 14" fill="#6094a1" stroke="#19344c" strokeWidth="3" strokeLinecap="round" />
      <path d="M-13-13Q-12-29 0-28Q14-27 13-11L9 9H-10z" fill="#4caaa8" stroke="#17344c" strokeWidth="3" />
      <path d="M-12-16q5-16 18-10l8 9-12-4-7 8z" fill="#5bc8b6" />
      <circle cx="-5" cy="-10" r="2.6" fill="#ffed7a" /><circle cx="6" cy="-9" r="2.6" fill="#ffed7a" />
      <path d="M-5 0q5-4 10 1M-4 7v10m9-10v10" stroke="#233949" strokeWidth="2" fill="none" />
      <path d="M-9 15l7 4m11-4-7 5" stroke="#a9fff0" strokeWidth="2" opacity=".75" />
    </g>
  );
}

function ToxicStalker() {
  return (
    <g>
      <path d="M-15 5l-10 28 9 5 13-19 6 22 10-1 1-34" fill="#436b58" stroke="#182c3c" strokeWidth="3" strokeLinejoin="round" />
      <path d="M-11 2l-20 4 1 8 18 1m19-12 17 10-3 7L4 13" fill="#679c74" stroke="#183b45" strokeWidth="3" strokeLinecap="round" />
      <path d="M-15-17Q-14-34 1-32Q17-30 13-11L8 8H-11z" fill="#76be76" stroke="#183b45" strokeWidth="3" />
      <path d="M-15-17l-8-12 14 5m14-6 10-9-2 21" fill="#99e46a" stroke="#294b43" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="-6" cy="-12" r="3.5" fill="#ffec55" /><circle cx="7" cy="-11" r="3.5" fill="#ffec55" />
      <path d="M-8 1l5 3 7-4" fill="none" stroke="#25433b" strokeWidth="3" />
      <circle cx="-24" cy="-31" r="5" fill="#b5ff4c" opacity=".85" /><circle cx="24" cy="-26" r="4" fill="#8cff68" opacity=".72" />
      <path d="M-5 9l5 7 5-8" fill="#572d67" stroke="#c07ce1" strokeWidth="2" />
    </g>
  );
}

function GalaxyHunter() {
  return (
    <g>
      <path d="M-5-3L-27 8l8 8 19-7m9-11 23-9-2 13-21 9" fill="#67a9bd" stroke="#18374f" strokeWidth="3" strokeLinejoin="round" />
      <path d="M-12-18Q-6-34 9-27Q23-17 14 1L8 15H-9z" fill="#378e96" stroke="#17354a" strokeWidth="3" />
      <path d="M-8-23Q-33-44-29-28L-15-8m30-14Q35-42 32-23L15-7" fill="#a8eff2" fillOpacity=".78" stroke="#4a99b2" strokeWidth="2" />
      <path d="M-10-13l-8-10m27 8 8-10" stroke="#a9fff0" strokeWidth="3" />
      <path d="M-7-11h5m8-1h5" stroke="#ffec72" strokeWidth="4" strokeLinecap="round" />
      <path d="M-7-1Q0 5 9-2M-7 8l-3 33 8 2 7-27 7 26 8-3-7-34" fill="#477987" stroke="#152b45" strokeWidth="3" strokeLinejoin="round" />
      <path d="M-3 5v12m11-13v12" stroke="#f8bd43" strokeWidth="3" />
    </g>
  );
}

function HiveQueen() {
  return (
    <g>
      <path d="M-22-36Q-66-56-61-10Q-60 7-42 2M22-36Q66-57 61-10Q60 7 42 2M-26-10Q-70-22-68 20Q-65 35-43 24M26-10Q70-22 68 20Q65 35 43 24" fill="none" stroke="#402b6a" strokeWidth="10" strokeLinecap="round" />
      <path d="M-22-38Q-62-55-60-14M22-38Q62-55 60-14M-28-12Q-66-19-65 20M28-12Q66-19 65 20" fill="none" stroke="#a83cff" strokeWidth="3" strokeLinecap="round" />
      <path d="M-35-38l-22-27 30 13m49 14 22-27-30 13" fill="#443267" stroke="#19233e" strokeWidth="4" strokeLinejoin="round" />
      <path d="M-40-31Q-32-57 0-59Q32-57 40-31L33 12Q22 29 0 31Q-22 29-33 12z" fill="#42326d" stroke="#111e3a" strokeWidth="5" />
      <path d="M-31-33Q0-54 31-33L22-19 0-26-22-17z" fill="#8f45bb" stroke="#b777ec" strokeWidth="3" />
      <path d="M-34-9Q-24-25-12-13L-17 7Q-30 13-36 3zM34-9Q24-25 12-13L17 7Q30 13 36 3z" fill="#436d70" stroke="#93fbdb" strokeWidth="3" />
      <path d="M-28-2l10-6m46 6L18-8" stroke="#eaff86" strokeWidth="5" strokeLinecap="round" />
      <path d="M-14 9Q0 2 14 9L19 33 0 48-19 33z" fill="#426a71" stroke="#172746" strokeWidth="4" />
      <path d="M0-25l-10 22 11 5 10-7z" fill="#72fff0" stroke="#e2ffff" strokeWidth="2" />
      <path d="M-8 20L-28 48-17 56 0 39 17 56 28 48 8 20" fill="#46306c" stroke="#172541" strokeWidth="4" />
      <circle cx="0" cy="-43" r="5" fill="#b8fff0" />
    </g>
  );
}

function GalaxyDragon() {
  return (
    <g>
      <path d="M-39 27Q-61 8-47-12Q-33-29-13-24Q2-51 28-37Q42-28 35-12Q58-14 61 4Q62 24 39 29L23 16Q8 35-13 27z" fill="#28647a" stroke="#132748" strokeWidth="5" />
      <path d="M-35-7Q-52-32-76-41Q-68-18-60 1L-43 14M29-15Q45-47 75-52Q64-25 55-4L38 12" fill="#328aa0" stroke="#b3f8ff" strokeWidth="3" />
      <path d="M-39 23Q-57 41-73 43Q-55 52-33 37M30 23Q49 40 67 38Q55 52 31 36" fill="#29718d" stroke="#102746" strokeWidth="4" />
      <path d="M-18-19Q-10-31 3-24L10-11-4-4-22-6z" fill="#66c4c4" stroke="#152946" strokeWidth="3" />
      <path d="M-13-15l8 2m21-10 14 4" stroke="#fff29a" strokeWidth="5" strokeLinecap="round" />
      <path d="M12 0l12 9-13 3" fill="#fa8354" stroke="#152946" strokeWidth="3" />
      <path d="M19-30l8-16 7 18m-44-1-8-16-7 18" fill="#3a8ba2" stroke="#122844" strokeWidth="3" />
      <path d="M-33 2l-9 13m25-16-7 17m33-18 7 17m12-22 8 14" stroke="#b3f8ff" strokeWidth="3" opacity=".86" />
      <path d="M21 2q18-2 23 4" fill="none" stroke="#ffb752" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

function WarMech() {
  return (
    <g>
      <path d="M-49 20l9-27 22-10h37l22 10 9 27-12 16h-75z" fill="#384d6c" stroke="#121f3b" strokeWidth="5" />
      <path d="M-38 17h76l-4 14h-68z" fill="#1b2d4e" stroke="#98c6de" strokeWidth="3" />
      <path d="M-24-22l10-19h28l10 19-4 28h-40z" fill="#637d99" stroke="#17233d" strokeWidth="4" />
      <path d="M-11-37l5-13h13l6 13" fill="#536c8b" stroke="#17233d" strokeWidth="4" />
      <rect x="-10" y="-31" width="20" height="11" rx="4" fill="#ffd764" stroke="#15233d" strokeWidth="3" />
      <path d="M-13-6l-53-15 2 12 50 23m26-20 53-15-2 12-50 23" fill="#829bb0" stroke="#15233d" strokeWidth="4" />
      <path d="M-62-24h24v12h-24zM38-24h24v12H38z" fill="#384966" stroke="#b5d3e4" strokeWidth="3" />
      <circle cx="-29" cy="20" r="5" fill="#57eaff" /><circle cx="29" cy="20" r="5" fill="#57eaff" />
      <path d="M-32-5h14m36 0h14" stroke="#ffd56a" strokeWidth="4" />
    </g>
  );
}

function OceanLeviathan() {
  return (
    <g>
      <path d="M-39-12Q-34-50 0-54Q34-50 39-12L27 26 0 45-27 26z" fill="#1d6384" stroke="#102846" strokeWidth="5" />
      <path d="M-32-22Q-60-53-72-32Q-77-18-57-4L-38 2M32-22Q60-53 72-32Q77-18 57-4L38 2" fill="none" stroke="#1a7094" strokeWidth="11" strokeLinecap="round" />
      <path d="M-26-36l-17-27 28 14m43 13 17-27-28 14" fill="#53b6c5" stroke="#16344f" strokeWidth="4" strokeLinejoin="round" />
      <path d="M-29-20Q0-45 29-20L20-7 0-13-20-7z" fill="#50b5b0" stroke="#b7fff0" strokeWidth="3" />
      <path d="M-23-1Q-14-15-5-4L-9 10Q-21 14-26 5zM23-1Q14-15 5-4L9 10Q21 14 26 5z" fill="#173d68" stroke="#83f9ff" strokeWidth="3" />
      <circle cx="-15" cy="1" r="4" fill="#ebffff" /><circle cx="15" cy="1" r="4" fill="#ebffff" />
      <path d="M-13 20Q0 10 13 20L9 31 0 36-9 31z" fill="#9af8ff" stroke="#173452" strokeWidth="3" />
      <path d="M-14 36Q-39 52-49 49M14 36Q39 52 49 49" fill="none" stroke="#52cada" strokeWidth="8" strokeLinecap="round" />
      <circle cx="-59" cy="-43" r="5" fill="#9af8ff" opacity=".85" /><circle cx="59" cy="-50" r="4" fill="#9af8ff" opacity=".7" />
    </g>
  );
}

export function EnemySprite({ variant, isBoss }: { variant: number; isBoss: boolean }) {
  const normalized = ((variant % (isBoss ? 4 : 3)) + (isBoss ? 4 : 3)) % (isBoss ? 4 : 3);

  return (
    <g className="enemy-float">
      {isBoss ? (
        normalized === 0 ? <HiveQueen /> : normalized === 1 ? <GalaxyDragon /> : normalized === 2 ? <WarMech /> : <OceanLeviathan />
      ) : (
        normalized === 0 ? <InfectedGrunt /> : normalized === 1 ? <ToxicStalker /> : <GalaxyHunter />
      )}
    </g>
  );
}

export function GunTurret({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} className="built-gun-turret">
      <ellipse cx="0" cy="10" rx="72" ry="28" fill="#052345" opacity=".65" />
      <path d="M-67 0L-47-27 0-38 47-27 67 0 47 22 0 31-47 22z" fill="#315e87" stroke="#102642" strokeWidth="5" />
      <path d="M-51-2L-37-20 0-28 37-20 51-2 36 14 0 21-36 14z" fill="#8faec2" stroke="#d9faff" strokeWidth="3" />
      <path d="M-36 0L-26-12 0-18 26-12 36 0 25 10 0 15-25 10z" fill="#253e62" stroke="#162847" strokeWidth="4" />
      <path d="M-24-26L-18-53 17-59 25-25 9-11-15-12z" fill="#5d7f9d" stroke="#142642" strokeWidth="4" />
      <path d="M-19-46L-13-66 0-70 12-64 17-44z" fill="#365473" stroke="#152744" strokeWidth="3" />
      <path d="M-13-56L-80-77-84-61-18-39zM13-56L80-77 84-61 18-39z" fill="#819bb1" stroke="#142642" strokeWidth="4" strokeLinejoin="round" />
      <path d="M-79-73L-109-82-110-63-82-59zM79-73L109-82 110-63 82-59z" fill="#213956" stroke="#a8cde1" strokeWidth="3" />
      <path d="M-54-2l-9 14m117-14 9 14" stroke="#ffca55" strokeWidth="5" />
      <path d="M-14-38L0-44 15-38" fill="none" stroke="#40eaff" strokeWidth="5" />
      <circle cx="0" cy="-3" r="8" fill="#69f4ff" stroke="#dfffff" strokeWidth="3" />
      <path d="M-4 27v11m8-11v11" stroke="#d2edff" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}
