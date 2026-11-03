// Mapa del tesoro de Hoyales (dibujado a mano en SVG, no está a escala ni falta que hace).

function label(x, y, text, w) {
  return `
    <g class="map-label" transform="translate(${x} ${y})">
      <path d="M${-w / 2 - 6} -10 H${w / 2 + 6} l-5 10 l5 10 H${-w / 2 - 6} l5 -10 Z" fill="#7a1f3d"/>
      <text x="0" y="5" text-anchor="middle">${text}</text>
    </g>`;
}

const MAP_SVG = `
<svg class="map" viewBox="0 0 360 540" role="img" aria-label="Mapa del tesoro de Hoyales de Roa">
  <defs>
    <radialGradient id="pergamino" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="#f8ebc9"/>
      <stop offset="70%" stop-color="#efd9a6"/>
      <stop offset="100%" stop-color="#c99a58"/>
    </radialGradient>
    <pattern id="rayado" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
      <line x1="0" y1="0" x2="0" y2="6" stroke="#9c7a43" stroke-width="1" opacity=".35"/>
    </pattern>
  </defs>

  <!-- pergamino -->
  <path d="M8 14 Q60 4 120 12 T240 8 T352 16 Q358 90 350 170 T354 330 T348 460 Q352 500 346 530 Q260 538 180 530 T14 532 Q4 450 10 360 T6 190 Q2 90 8 14 Z"
        fill="url(#pergamino)" stroke="#8a6431" stroke-width="2"/>

  <!-- título -->
  <g transform="translate(22 28)">
    <rect width="150" height="50" rx="6" fill="#fbf1d6" stroke="#8a6431" stroke-width="1.5"/>
    <text x="75" y="22" text-anchor="middle" class="map-title">Hoyales de Roa</text>
    <text x="75" y="40" text-anchor="middle" class="map-subtitle">mapa del tesoro · 1:¿?</text>
  </g>

  <!-- cerro de arriba -->
  <path d="M120 200 C 170 150, 200 70, 262 62 C 310 58, 336 110, 350 150 L 350 230 C 300 225, 230 222, 120 200 Z" fill="#d6be86"/>
  <path d="M120 200 C 170 150, 200 70, 262 62 C 310 58, 336 110, 350 150 L 350 230 C 300 225, 230 222, 120 200 Z" fill="url(#rayado)"/>

  <!-- río Riaza -->
  <path d="M232 540 C 260 500, 300 505, 318 470 C 334 440, 352 440, 356 420" stroke="#5d8fbf" stroke-width="12" fill="none" stroke-linecap="round" opacity=".75"/>
  <path d="M244 528 q8 -6 16 0 M288 494 q8 -6 16 0 M322 456 q8 -6 16 0" stroke="#e8f1fa" stroke-width="1.5" fill="none"/>
  <text x="300" y="530" class="map-note" transform="rotate(-28 300 530)">río Riaza</text>
  <text x="250" y="418" class="map-note small">aquí hay dragones</text>
  <text x="262" y="432" class="map-note small">(y lechazo)</text>

  <!-- viñas -->
  <g stroke="#6b7a2f" stroke-width="1.6" stroke-linecap="round">
    ${[0, 1, 2, 3].map(r => `<line x1="186" y1="${446 + r * 14}" x2="240" y2="${440 + r * 14}" stroke-dasharray="1 7"/>`).join("")}
  </g>
  <text x="213" y="506" text-anchor="middle" class="map-note small">viñas</text>

  <!-- arbolitos -->
  <g fill="#7f9a4a" stroke="#56702c" stroke-width="1">
    <circle cx="30" cy="140" r="9"/><circle cx="46" cy="152" r="7"/><circle cx="196" cy="236" r="7"/>
    <circle cx="20" cy="400" r="8"/><circle cx="130" cy="420" r="6"/><circle cx="335" cy="290" r="7"/>
  </g>

  <!-- rosa de los vientos -->
  <g transform="translate(316 362)">
    <circle r="22" fill="#fbf1d6" stroke="#8a6431"/>
    <path d="M0 -20 L5 0 L0 20 L-5 0 Z" fill="#7a1f3d"/>
    <path d="M-20 0 L0 -5 L20 0 L0 5 Z" fill="#8a6431"/>
    <text y="-25" text-anchor="middle" class="map-note small">N</text>
  </g>

  <!-- camino del tesoro -->
  <path d="M78 455 C 60 410, 40 340, 76 292 C 110 260, 150 330, 182 352 C 214 372, 250 330, 268 290 C 284 250, 336 200, 332 150"
        class="map-path"/>

  <!-- X -->
  <g transform="translate(330 140)">
    <path class="map-x" d="M-9 -9 L9 9 M9 -9 L-9 9" stroke="#b3202e" stroke-width="5" stroke-linecap="round"/>
  </g>

  <!-- ===== SITIOS ===== -->

  <!-- Iglesia de la Virgen de Arriba -->
  <g class="spot" data-place="iglesia" tabindex="0" role="button" aria-label="Iglesia de la Virgen de Arriba">
    <circle cx="262" cy="96" r="58" class="spot-ring"/>
    <!-- ermita -->
    <rect x="252" y="82" width="58" height="40" fill="#e9d6ae" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M248 84 L281 64 L314 84 Z" fill="#b5543a" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M287 82 V46 h16 V82" fill="#e9d6ae" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M291 58 a4 4 0 0 1 8 0 v8 h-8 Z" fill="#4a3320"/>
    <path d="M295 30 V44 M290 35 H300" stroke="#6e4d24" stroke-width="2"/>
    <path d="M273 122 V104 a8 8 0 0 1 16 0 V122" fill="#6e4d24"/>
    <!-- la Virgen de Arriba -->
    <use href="#virgen" x="198" y="34" width="56" height="84"/>
    ${label(262, 166, "Iglesia de Arriba", 108)}
  </g>

  <!-- Bodegas -->
  <g class="spot" data-place="bodegas" tabindex="0" role="button" aria-label="Las bodegas">
    <circle cx="282" cy="250" r="50" class="spot-ring"/>
    <!-- torreón -->
    <path d="M300 214 V184 l4 -3 l4 3 l4 -3 l4 3 V214 Z" fill="#c9b48a" stroke="#6e4d24" stroke-width="1.2"/>
    <path d="M312 190 v-6 l4 -3" stroke="#6e4d24" fill="none"/>
    <!-- cueva de bodegas -->
    <path d="M232 268 C 238 222, 326 214, 336 268 Z" fill="#a98a52" stroke="#6e4d24" stroke-width="1.5"/>
    <g fill="#4a3320">
      <path d="M248 268 v-14 a7 7 0 0 1 14 0 v14 Z"/>
      <path d="M276 268 v-17 a8 8 0 0 1 16 0 v17 Z"/>
      <path d="M306 268 v-13 a6 6 0 0 1 12 0 v13 Z"/>
    </g>
    <!-- zarceras -->
    <g fill="#e9d6ae" stroke="#6e4d24">
      <rect x="258" y="226" width="8" height="10"/><rect x="292" y="222" width="8" height="10"/>
    </g>
    <text x="246" y="246" class="emoji-sm">🍷</text>
    ${label(284, 290, "Las bodegas", 76)}
  </g>

  <!-- Salón de usos múltiples -->
  <g class="spot" data-place="salon" tabindex="0" role="button" aria-label="Salón de usos múltiples">
    <circle cx="78" cy="236" r="52" class="spot-ring"/>
    <rect x="30" y="220" width="96" height="40" fill="#f2e3c2" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M26 222 L78 200 L130 222 Z" fill="#8f6aa8" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M70 260 v-20 h16 v20" fill="#6e4d24"/>
    <rect x="40" y="232" width="18" height="12" fill="#bfe0f2" stroke="#6e4d24"/>
    <rect x="98" y="232" width="18" height="12" fill="#bfe0f2" stroke="#6e4d24"/>
    <!-- banderines -->
    <path d="M28 214 Q78 232 128 214" stroke="#6e4d24" fill="none" stroke-width=".8"/>
    <g>
      <path d="M38 218 l4 7 l4 -6 Z" fill="#c0392b"/><path d="M52 222 l4 7 l4 -6 Z" fill="#f2c14e"/>
      <path d="M66 224 l4 7 l4 -6 Z" fill="#2e86c1"/><path d="M82 224 l4 7 l4 -6 Z" fill="#27ae60"/>
      <path d="M96 222 l4 7 l4 -6 Z" fill="#c0392b"/><path d="M110 218 l4 7 l4 -6 Z" fill="#f2c14e"/>
    </g>
    <text x="70" y="196" class="emoji-sm">🪩</text>
    ${label(78, 280, "Salón de usos múltiples", 140)}
  </g>

  <!-- Bar de la plaza -->
  <g class="spot" data-place="bar" tabindex="0" role="button" aria-label="Bar de la plaza">
    <circle cx="180" cy="356" r="52" class="spot-ring"/>
    <rect x="128" y="330" width="104" height="58" rx="4" fill="none" stroke="#8a6431" stroke-dasharray="4 4"/>
    <text x="180" y="400" text-anchor="middle" class="map-note small">plaza</text>
    <rect x="150" y="320" width="60" height="36" fill="#f2e3c2" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M146 322 h68 l-4 10 h-60 Z" fill="#c0392b"/>
    <path d="M154 322 l-2 10 M166 322 l-1 10 M178 322 v10 M190 322 l1 10 M202 322 l2 10" stroke="#fff" stroke-width="3"/>
    <path d="M174 356 v-14 h12 v14" fill="#6e4d24"/>
    <text x="153" y="352" class="emoji-xs">🍺</text>
    <circle cx="140" cy="372" r="6" fill="#a98a52"/><circle cx="220" cy="372" r="6" fill="#a98a52"/>
    ${label(180, 418, "Bar de la plaza", 96)}
  </g>

  <!-- Casa (entrada del pueblo) -->
  <g class="spot" data-place="casa" tabindex="0" role="button" aria-label="La casa">
    <circle cx="78" cy="470" r="50" class="spot-ring"/>
    <rect x="52" y="462" width="52" height="36" fill="#f2e3c2" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M46 464 L78 438 L110 464 Z" fill="#b5543a" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M72 498 v-18 h12 v18" fill="#6e4d24"/>
    <rect x="58" y="470" width="10" height="9" fill="#bfe0f2" stroke="#6e4d24"/>
    <text x="96" y="440" class="map-note">z</text><text x="104" y="430" class="map-note">Z</text><text x="114" y="418" class="map-note big">Z</text>
    <!-- señal -->
    <path d="M138 516 v-30" stroke="#6e4d24" stroke-width="2"/>
    <rect x="118" y="478" width="58" height="16" rx="2" fill="#fbf1d6" stroke="#6e4d24"/>
    <text x="147" y="490" text-anchor="middle" class="map-sign">ENTRADA</text>
    ${label(78, 522, "La casa", 54)}
  </g>
</svg>`;
