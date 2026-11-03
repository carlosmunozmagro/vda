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
   - 📅 **Planning** del finde, con la **lista de la compra compartida** arriba.
   - 🧺 **Qué traer**, con casillas para ir marcando.
   - 🎲 **Sorteo**: elige a quién le toca (Adriana, Carlos, Cris, Álvaro, Diego… y la Virgen) y qué prueba o pregunta le cae.

## Cómo abrirla

Es una web estática, sin instalar nada: abre `index.html` en el navegador.

## Cómo cambiar el contenido

Todo el texto está en `data.js`: preguntas (`QUIZ`), pruebas (`LEVELS`), sitios del mapa (`PLACES`),
invitados (`GUESTS`), planning (`PLANNING`) y cosas que traer (`TRAER`).

## Lista de la compra compartida

Para que todos vean lo que apunta cada uno, la lista usa una base de datos gratuita de Firebase
(Realtime Database). Su URL va en `COMPRA_DB`, dentro de `data.js`. Si está vacía, la lista funciona
pero cada uno solo ve lo suyo.

Reglas de la base de datos (pestaña *Reglas*):

```json
{
  "rules": {
    "vda": { ".read": true, ".write": true }
  }
}
```
