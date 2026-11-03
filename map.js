// Mapa del tesoro de Hoyales (dibujado a mano en SVG; no está a escala, pero el orden sí):
// entrada del pueblo (la casa) → plaza con el bar → pasada la plaza, el salón.
// Subiendo desde la plaza: la iglesia de la Virgen de Arriba → las bodegas → y arriba del todo, el castillo.

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

  <!-- el cerro: iglesia, bodegas y castillo arriba del todo -->
  <path d="M28 330 C 80 304, 118 226, 168 152 C 200 104, 222 54, 255 48 C 290 44, 322 84, 351 132 L 351 330 Z" fill="#d6be86"/>
  <path d="M28 330 C 80 304, 118 226, 168 152 C 200 104, 222 54, 255 48 C 290 44, 322 84, 351 132 L 351 330 Z" fill="url(#rayado)"/>

  <!-- título -->
  <g transform="translate(18 22)">
    <rect width="142" height="48" rx="6" fill="#fbf1d6" stroke="#8a6431" stroke-width="1.5"/>
    <text x="71" y="21" text-anchor="middle" class="map-title">Hoyales de Roa</text>
    <text x="71" y="38" text-anchor="middle" class="map-subtitle">mapa del tesoro · 1:¿?</text>
  </g>
  <text x="24" y="98" class="map-note small">aquí hay dragones</text>
  <text x="34" y="112" class="map-note small">(y lechazo)</text>

  <!-- río Riaza -->
  <path d="M232 540 C 260 500, 300 505, 318 470 C 334 440, 352 440, 356 420" stroke="#5d8fbf" stroke-width="12" fill="none" stroke-linecap="round" opacity=".75"/>
  <path d="M244 528 q8 -6 16 0 M288 494 q8 -6 16 0 M322 456 q8 -6 16 0" stroke="#e8f1fa" stroke-width="1.5" fill="none"/>
  <text x="300" y="530" class="map-note" transform="rotate(-28 300 530)">río Riaza</text>

  <!-- viñas -->
  <g stroke="#6b7a2f" stroke-width="1.6" stroke-linecap="round">
    ${[0, 1, 2, 3].map(r => `<line x1="118" y1="${470 + r * 12}" x2="196" y2="${464 + r * 12}" stroke-dasharray="1 7"/>`).join("")}
  </g>
  <text x="157" y="524" text-anchor="middle" class="map-note small">viñas</text>

  <!-- arbolitos -->
  <g fill="#7f9a4a" stroke="#56702c" stroke-width="1">
    <circle cx="36" cy="160" r="9"/><circle cx="52" cy="172" r="7"/><circle cx="96" cy="306" r="7"/>
    <circle cx="334" cy="236" r="7"/><circle cx="22" cy="372" r="8"/><circle cx="214" cy="470" r="6"/>
  </g>

  <!-- rosa de los vientos -->
  <g transform="translate(316 300)">
    <circle r="20" fill="#fbf1d6" stroke="#8a6431"/>
    <path d="M0 -18 L5 0 L0 18 L-5 0 Z" fill="#7a1f3d"/>
    <path d="M-18 0 L0 -5 L18 0 L0 5 Z" fill="#8a6431"/>
    <text y="-23" text-anchor="middle" class="map-note small">N</text>
  </g>

  <!-- camino del tesoro -->
  <path class="map-path" d="M70 452 C 100 420, 128 396, 160 372 C 196 384, 226 398, 262 398
                            M160 352 C 146 320, 204 304, 194 262
                            M196 214 C 232 190, 196 164, 214 146
                            M226 104 C 240 92, 250 80, 256 66"/>

  <!-- X: arriba del todo -->
  <g transform="translate(298 60)">
    <path class="map-x" d="M-9 -9 L9 9 M9 -9 L-9 9" stroke="#b3202e" stroke-width="5" stroke-linecap="round"/>
  </g>

  <!-- ===== SITIOS ===== -->

  <!-- Castillo (arriba del todo) -->
  <g class="spot" data-place="castillo" tabindex="0" role="button" aria-label="El castillo">
    <circle cx="255" cy="44" r="40" class="spot-ring"/>
    <path d="M238 60 V22 l4 -4 h4 v4 h4 v-4 h4 v4 h4 v-4 h4 l4 4 V60 Z" fill="#cdb78b" stroke="#6e4d24" stroke-width="1.4"/>
    <path d="M266 22 l6 6 V60" fill="#b39c6c" stroke="#6e4d24" stroke-width="1.2"/>
    <path d="M250 60 v-10 a5 5 0 0 1 10 0 v10" fill="#4a3320"/>
    <rect x="252" y="30" width="5" height="8" rx="2.5" fill="#4a3320"/>
    <path d="M240 46 l6 2 M262 40 l-4 4" stroke="#8a6f45" stroke-width="1"/>
    ${label(255, 76, "El castillo", 66)}
  </g>

  <!-- Bodegas (encima de la iglesia) -->
  <g class="spot" data-place="bodegas" tabindex="0" role="button" aria-label="Las bodegas">
    <circle cx="214" cy="132" r="44" class="spot-ring"/>
    <path d="M166 152 C 172 108, 258 100, 266 152 Z" fill="#a98a52" stroke="#6e4d24" stroke-width="1.5"/>
    <g fill="#4a3320">
      <path d="M180 152 v-13 a6 6 0 0 1 12 0 v13 Z"/>
      <path d="M206 152 v-16 a8 8 0 0 1 16 0 v16 Z"/>
      <path d="M236 152 v-12 a6 6 0 0 1 12 0 v12 Z"/>
    </g>
    <!-- zarceras -->
    <g fill="#e9d6ae" stroke="#6e4d24">
      <rect x="190" y="106" width="8" height="10"/><rect x="226" y="102" width="8" height="10"/>
    </g>
    <text x="244" y="122" class="emoji-sm">🍷</text>
    ${label(214, 170, "Las bodegas", 76)}
  </g>

  <!-- Iglesia de la Virgen de Arriba (subiendo desde la plaza) -->
  <g class="spot" data-place="iglesia" tabindex="0" role="button" aria-label="Iglesia de la Virgen de Arriba">
    <circle cx="176" cy="234" r="54" class="spot-ring"/>
    <rect x="168" y="222" width="56" height="40" fill="#e9d6ae" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M164 224 L196 204 L228 224 Z" fill="#b5543a" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M202 222 V188 h16 V222" fill="#e9d6ae" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M206 200 a4 4 0 0 1 8 0 v8 h-8 Z" fill="#4a3320"/>
    <path d="M210 174 V186 M205 179 H215" stroke="#6e4d24" stroke-width="2"/>
    <path d="M188 262 V246 a8 8 0 0 1 16 0 V262" fill="#6e4d24"/>
    <!-- la Virgen de Arriba -->
    <use href="#virgen" x="118" y="190" width="48" height="72"/>
    ${label(172, 284, "Iglesia de Arriba", 108)}
  </g>

  <!-- Bar de la plaza -->
  <g class="spot" data-place="bar" tabindex="0" role="button" aria-label="Bar de la plaza">
    <circle cx="158" cy="360" r="48" class="spot-ring"/>
    <rect x="98" y="334" width="118" height="58" rx="4" fill="none" stroke="#8a6431" stroke-dasharray="4 4"/>
    <text x="204" y="350" text-anchor="middle" class="map-note small">plaza</text>
    <rect x="130" y="324" width="60" height="34" fill="#f2e3c2" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M126 326 h68 l-4 10 h-60 Z" fill="#c0392b"/>
    <path d="M134 326 l-2 10 M146 326 l-1 10 M158 326 v10 M170 326 l1 10 M182 326 l2 10" stroke="#fff" stroke-width="3"/>
    <path d="M154 358 v-14 h12 v14" fill="#6e4d24"/>
    <text x="133" y="354" class="emoji-xs">🍺</text>
    <circle cx="118" cy="376" r="6" fill="#a98a52"/><circle cx="148" cy="380" r="6" fill="#a98a52"/>
    ${label(158, 410, "Bar de la plaza", 96)}
  </g>

  <!-- Salón de usos múltiples (pasada la plaza) -->
  <g class="spot" data-place="salon" tabindex="0" role="button" aria-label="Salón de usos múltiples">
    <circle cx="276" cy="398" r="50" class="spot-ring"/>
    <rect x="232" y="384" width="88" height="38" fill="#f2e3c2" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M228 386 L276 364 L324 386 Z" fill="#8f6aa8" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M268 422 v-18 h16 v18" fill="#6e4d24"/>
    <rect x="240" y="394" width="16" height="11" fill="#bfe0f2" stroke="#6e4d24"/>
    <rect x="296" y="394" width="16" height="11" fill="#bfe0f2" stroke="#6e4d24"/>
    <path d="M230 378 Q276 396 322 378" stroke="#6e4d24" fill="none" stroke-width=".8"/>
    <g>
      <path d="M238 382 l4 7 l4 -6 Z" fill="#c0392b"/><path d="M252 386 l4 7 l4 -6 Z" fill="#f2c14e"/>
      <path d="M266 388 l4 7 l4 -6 Z" fill="#2e86c1"/><path d="M280 388 l4 7 l4 -6 Z" fill="#27ae60"/>
      <path d="M294 386 l4 7 l4 -6 Z" fill="#c0392b"/><path d="M306 382 l4 7 l4 -6 Z" fill="#f2c14e"/>
    </g>
    <text x="268" y="360" class="emoji-sm">🪩</text>
    ${label(272, 442, "Salón de usos múltiples", 140)}
  </g>

  <!-- Casa (entrada del pueblo) -->
  <g class="spot" data-place="casa" tabindex="0" role="button" aria-label="La casa">
    <circle cx="62" cy="478" r="46" class="spot-ring"/>
    <rect x="36" y="470" width="52" height="36" fill="#f2e3c2" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M30 472 L62 446 L94 472 Z" fill="#b5543a" stroke="#6e4d24" stroke-width="1.5"/>
    <path d="M56 506 v-18 h12 v18" fill="#6e4d24"/>
    <rect x="42" y="478" width="10" height="9" fill="#bfe0f2" stroke="#6e4d24"/>
    <text x="90" y="472" class="emoji-sm">💤</text>
    <!-- señal -->
    <path d="M30 446 v-18" stroke="#6e4d24" stroke-width="2"/>
    <rect x="8" y="414" width="52" height="15" rx="2" fill="#fbf1d6" stroke="#6e4d24"/>
    <text x="34" y="425" text-anchor="middle" class="map-sign">ENTRADA</text>
    ${label(62, 526, "La casa", 54)}
  </g>
</svg>`;
