// Mapa del tesoro de Hoyales (dibujado a mano en SVG; no está a escala, pero el orden sí):
// abajo la casa → un poco más arriba la plaza (con el bar) → encima de la plaza, el salón de usos múltiples.
// Desde la plaza, subiendo por la derecha: la Virgen de Arriba (que también conecta con el salón)
// → más arriba por la derecha, las bodegas → y arriba del todo, el castillo.

function label(x, y, text, w) {
  return `
    <g class="map-label" transform="translate(${x} ${y})">
      <path d="M${-w / 2 - 6} -10 H${w / 2 + 6} l-5 10 l5 10 H${-w / 2 - 6} l5 -10 Z" fill="#7a1f3d"/>
      <text x="0" y="5" text-anchor="middle">${text}</text>
    </g>`;
}

const MAP_SVG = `
<svg class="map" viewBox="0 0 360 690" role="img" aria-label="Mapa del tesoro de Hoyales de Roa">
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
  <path d="M8 14 Q60 4 120 12 T240 8 T352 16 Q358 110 350 220 T354 420 T348 590 Q352 640 346 680 Q260 688 180 680 T14 682 Q4 580 10 460 T6 240 Q2 110 8 14 Z"
        fill="url(#pergamino)" stroke="#8a6431" stroke-width="2"/>

  <!-- el cerro de la derecha: Virgen de Arriba, bodegas y castillo -->
  <path d="M150 432 C 190 404, 200 330, 214 262 C 230 170, 246 72, 286 34 C 316 22, 344 50, 352 80 L 352 434 C 290 444, 210 444, 150 432 Z" fill="#d6be86"/>
  <path d="M150 432 C 190 404, 200 330, 214 262 C 230 170, 246 72, 286 34 C 316 22, 344 50, 352 80 L 352 434 C 290 444, 210 444, 150 432 Z" fill="url(#rayado)"/>

  <!-- título -->
  <g transform="translate(18 22)">
    <rect width="142" height="48" rx="6" fill="#fbf1d6" stroke="#8a6431" stroke-width="1.5"/>
    <text x="71" y="21" text-anchor="middle" class="map-title">Hoyales de Roa</text>
    <text x="71" y="38" text-anchor="middle" class="map-subtitle">mapa del tesoro · 1:¿?</text>
  </g>
  <text x="24" y="100" class="map-note small">aquí hay dragones</text>
  <text x="34" y="114" class="map-note small">(y lechazo)</text>

  <!-- rosa de los vientos -->
  <g transform="translate(72 196)">
    <circle r="22" fill="#fbf1d6" stroke="#8a6431"/>
    <path d="M0 -20 L5 0 L0 20 L-5 0 Z" fill="#7a1f3d"/>
    <path d="M-20 0 L0 -5 L20 0 L0 5 Z" fill="#8a6431"/>
    <text y="-26" text-anchor="middle" class="map-note small">N</text>
  </g>

  <!-- río Riaza -->
  <path d="M262 676 C 286 646, 320 654, 334 616 C 344 590, 352 584, 356 562" stroke="#5d8fbf" stroke-width="12" fill="none" stroke-linecap="round" opacity=".75"/>
  <path d="M276 664 q8 -6 16 0 M310 640 q8 -6 16 0 M338 596 q8 -6 16 0" stroke="#e8f1fa" stroke-width="1.5" fill="none"/>
  <text x="300" y="684" class="map-note" transform="rotate(-30 300 684)">río Riaza</text>

  <!-- viñas -->
  <g stroke="#6b7a2f" stroke-width="1.6" stroke-linecap="round">
    ${[0, 1, 2, 3].map(r => `<line x1="196" y1="${582 + r * 13}" x2="270" y2="${576 + r * 13}" stroke-dasharray="1 7"/>`).join("")}
  </g>
  <text x="232" y="650" text-anchor="middle" class="map-note small">viñas</text>

  <!-- arbolitos -->
  <g fill="#7f9a4a" stroke="#56702c" stroke-width="1">
    <circle cx="30" cy="252" r="9"/><circle cx="46" cy="264" r="7"/><circle cx="168" cy="236" r="7"/>
    <circle cx="28" cy="470" r="8"/><circle cx="44" cy="480" r="6"/><circle cx="300" cy="486" r="8"/>
    <circle cx="318" cy="498" r="6"/><circle cx="174" cy="140" r="6"/>
  </g>

  <!-- caminos -->
  <path class="map-path" d="M100 566 C 112 544, 128 528, 146 516
                            M134 446 C 120 420, 100 394, 96 372
                            M188 470 C 232 462, 250 436, 262 414
                            M150 320 C 176 312, 192 328, 206 338
                            M302 322 C 314 292, 282 274, 274 252
                            M284 172 C 292 152, 278 132, 280 116"/>

  <!-- X: arriba del todo -->
  <g transform="translate(326 60)">
    <path class="map-x" d="M-9 -9 L9 9 M9 -9 L-9 9" stroke="#b3202e" stroke-width="5" stroke-linecap="round"/>
  </g>

  <!-- ===== SITIOS ===== -->

  <!-- Castillo (arriba del todo) -->
  <g class="spot" data-place="castillo" tabindex="0" role="button" aria-label="El castillo">
    <circle cx="280" cy="68" r="44" class="spot-ring"/>
    <path d="M262 88 V48 l4 -4 h4 v4 h4 v-4 h4 v4 h4 v-4 h4 l4 4 V88 Z" fill="#cdb78b" stroke="#6e4d24" stroke-width="1.4"/>
    <path d="M290 48 l7 7 V88" fill="#b39c6c" stroke="#6e4d24" stroke-width="1.2"/>
    <path d="M274 88 v-11 a5 5 0 0 1 10 0 v11" fill="#4a3320"/>
    <rect x="276" y="56" width="5" height="9" rx="2.5" fill="#4a3320"/>
    <path d="M264 72 l6 2 M287 66 l-4 4" stroke="#8a6f45" stroke-width="1"/>
    ${label(280, 104, "El castillo", 66)}
  </g>

  <!-- Bodegas (subiendo por la derecha) -->
  <g class="spot" data-place="bodegas" tabindex="0" role="button" aria-label="Las bodegas">
    <circle cx="272" cy="204" r="48" class="spot-ring"/>
    <path d="M222 222 C 228 176, 316 168, 324 222 Z" fill="#a98a52" stroke="#6e4d24" stroke-width="1.5"/>
    <g fill="#4a3320">
      <path d="M236 222 v-13 a6 6 0 0 1 12 0 v13 Z"/>
      <path d="M264 222 v-17 a8 8 0 0 1 16 0 v17 Z"/>
      <path d="M294 222 v-12 a6 6 0 0 1 12 0 v12 Z"/>
    </g>
    <!-- zarceras -->
    <g fill="#e9d6ae" stroke="#6e4d24">
      <rect x="246" y="174" width="8" height="10"/><rect x="284" y="170" width="8" height="10"/>
    </g>
    <text x="302" y="192" class="emoji-sm">🍷</text>
    ${label(272, 242, "Las bodegas", 76)}
  </g>

  <!-- Virgen de Arriba (desde la plaza, subiendo por la derecha) -->
  <g class="spot" data-place="iglesia" tabindex="0" role="button" aria-label="Iglesia de la Virgen de Arriba">
    <circle cx="266" cy="346" r="56" class="spot-ring"/>
    <rect x="262" y="340" width="56" height="40" fill="#e9d6ae" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M258 342 L290 322 L322 342 Z" fill="#b5543a" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M296 340 V306 h16 V340" fill="#e9d6ae" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M300 318 a4 4 0 0 1 8 0 v8 h-8 Z" fill="#4a3320"/>
    <path d="M304 292 V304 M299 297 H309" stroke="#6e4d24" stroke-width="2"/>
    <path d="M282 380 V364 a8 8 0 0 1 16 0 V380" fill="#6e4d24"/>
    <!-- la Virgen de Arriba -->
    <use href="#virgen" x="208" y="306" width="50" height="75"/>
    ${label(266, 404, "Virgen de Arriba", 104)}
  </g>

  <!-- Salón de usos múltiples (encima de la plaza) -->
  <g class="spot" data-place="salon" tabindex="0" role="button" aria-label="Salón de usos múltiples">
    <circle cx="95" cy="318" r="56" class="spot-ring"/>
    <rect x="50" y="300" width="92" height="40" fill="#f2e3c2" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M46 302 L96 278 L146 302 Z" fill="#8f6aa8" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M88 340 v-19 h16 v19" fill="#6e4d24"/>
    <rect x="58" y="311" width="16" height="11" fill="#bfe0f2" stroke="#6e4d24"/>
    <rect x="118" y="311" width="16" height="11" fill="#bfe0f2" stroke="#6e4d24"/>
    <path d="M48 294 Q96 312 144 294" stroke="#6e4d24" fill="none" stroke-width=".8"/>
    <g>
      <path d="M56 298 l4 7 l4 -6 Z" fill="#c0392b"/><path d="M70 302 l4 7 l4 -6 Z" fill="#f2c14e"/>
      <path d="M85 304 l4 7 l4 -6 Z" fill="#2e86c1"/><path d="M100 304 l4 7 l4 -6 Z" fill="#27ae60"/>
      <path d="M115 302 l4 7 l4 -6 Z" fill="#c0392b"/><path d="M128 298 l4 7 l4 -6 Z" fill="#f2c14e"/>
    </g>
    <text x="87" y="274" class="emoji-sm">🪩</text>
    ${label(96, 360, "Salón de usos múltiples", 140)}
  </g>

  <!-- Bar de la plaza -->
  <g class="spot" data-place="bar" tabindex="0" role="button" aria-label="Bar de la plaza">
    <circle cx="155" cy="482" r="52" class="spot-ring"/>
    <rect x="92" y="454" width="124" height="62" rx="4" fill="none" stroke="#8a6431" stroke-dasharray="4 4"/>
    <text x="196" y="508" text-anchor="middle" class="map-note small">plaza</text>
    <rect x="125" y="444" width="60" height="36" fill="#f2e3c2" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M121 446 h68 l-4 10 h-60 Z" fill="#c0392b"/>
    <path d="M129 446 l-2 10 M141 446 l-1 10 M153 446 v10 M165 446 l1 10 M177 446 l2 10" stroke="#fff" stroke-width="3"/>
    <path d="M149 480 v-14 h12 v14" fill="#6e4d24"/>
    <text x="128" y="476" class="emoji-xs">🍺</text>
    <circle cx="112" cy="500" r="6" fill="#a98a52"/><circle cx="140" cy="504" r="6" fill="#a98a52"/>
    ${label(155, 536, "Bar de la plaza", 96)}
  </g>

  <!-- Casa (abajo, en la entrada del pueblo) -->
  <g class="spot" data-place="casa" tabindex="0" role="button" aria-label="La casa">
    <circle cx="90" cy="606" r="50" class="spot-ring"/>
    <rect x="64" y="594" width="52" height="36" fill="#f2e3c2" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M58 596 L90 570 L122 596 Z" fill="#b5543a" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M84 630 v-18 h12 v18" fill="#6e4d24"/>
    <rect x="70" y="602" width="10" height="9" fill="#bfe0f2" stroke="#6e4d24"/>
    <text x="120" y="596" class="emoji-sm">💤</text>
    <!-- señal -->
    <path d="M34 596 v-20" stroke="#6e4d24" stroke-width="2"/>
    <rect x="8" y="562" width="52" height="15" rx="2" fill="#fbf1d6" stroke="#6e4d24"/>
    <text x="34" y="573" text-anchor="middle" class="map-sign">ENTRADA</text>
    ${label(90, 652, "La casa", 54)}
  </g>
</svg>`;
