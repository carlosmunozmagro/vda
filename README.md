# VDA · Virgen de Arriba

App para el fin de semana de la Virgen de Arriba en Hoyales de Roa.

## Qué tiene

1. **Juego de entrada**: preguntas sobre Hoyales de Roa.
2. **¡Rápido! Escoge a la Virgen de Arriba**: 5 pruebas contrarreloj
   (dos Vírgenes; una Virgen entre fruta; dos Vírgenes con más fruta;
   tres Vírgenes con más fruta todavía; y cuatro Vírgenes que se mueven).
3. **La app**:
   - 🗺️ **Mapa del tesoro** con la casa, el salón de usos múltiples, las bodegas,
     el bar de la plaza y la iglesia de la Virgen de Arriba. Toca cada sitio para ver para qué sirve.
   - 📅 **Planning** del finde, con el aviso de la compra arriba.
   - 🧺 **Qué traer**, con casillas para ir marcando.
   - 💶 **Cuentas** (tipo Tricount): gastos, repartos a partes iguales, por importes o por partes, saldos y quién paga a quién. Se comparten por enlace: al abrirlo se juntan con las de cada uno.
   - 🎲 **Sorteo**: elige a quién le toca (Adriana, Carlos, Cris, Álvaro, Diego… y la Virgen) y qué prueba o pregunta le cae.

## Cómo abrirla

Es una web estática, sin instalar nada: abre `index.html` en el navegador.

## Cómo cambiar el contenido

Todo el texto está en `data.js`: preguntas (`QUIZ`), pruebas (`LEVELS`), sitios del mapa (`PLACES`),
invitados (`GUESTS`), planning (`PLANNING`) y cosas que traer (`TRAER`).


## Cuentas en directo (opcional)

Si `FIREBASE_URL` (en `data.js`) tiene la dirección de una Realtime Database de Firebase, las cuentas
se guardan en línea y todos veis los mismos gastos al momento. Reglas de la base de datos:

```json
{ "rules": { "vda": { ".read": true, ".write": true } } }
```

Si se deja vacía, cada móvil guarda sus cuentas y se pasan por enlace.
