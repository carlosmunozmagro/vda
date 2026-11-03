// Contenido de la app. Para cambiar textos, preguntas, el planning o la lista
// de cosas que traer, basta con editar este archivo.

// Preguntas del juego inicial. "ok" es el índice de la respuesta correcta.
const QUIZ = [
  {
    q: "¿Cómo se llama a la gente de Hoyales de Roa?",
    a: ["Hoyaleños", "Hoyalenses", "Roanos", "Hoyaleros"],
    ok: 1,
    dato: "Hoyalenses. Apúntatelo para presumir en el bar."
  },
  {
    q: "¿Qué río riega la vega de Hoyales?",
    a: ["El Arlanza", "El Duratón", "El Riaza", "El Pisuerga"],
    ok: 2,
    dato: "El Riaza. Su vega es tan ancha que ya casi es vega del Duero."
  },
  {
    q: "¿En qué tierra de vino está el pueblo?",
    a: ["Rueda", "Ribera del Duero", "Toro", "La Rioja"],
    ok: 1,
    dato: "Ribera del Duero. Por eso hay bodegas por todas partes."
  },
  {
    q: "¿Qué queda hoy del castillo medieval?",
    a: ["Nada, ni una piedra", "El castillo entero con foso", "Medio torreón con solo tres paredes", "Una muralla de 2 km"],
    ok: 2,
    dato: "Medio torreón en lo más alto del pueblo. Y parte de sus piedras acabaron en la ermita de la Virgen de Arriba, en unas obras de 1713."
  },
  {
    q: "¿Qué dulce típico se come en la fiesta de la Virgen de Arriba?",
    a: ["Torrijas", "Tortos de uva", "Rosquillas de anís", "Huesos de santo"],
    ok: 1,
    dato: "Tortos de uva: de la vendimia a la fiesta de noviembre."
  },
  {
    q: "¿A qué santo está dedicada la iglesia parroquial (la de las fiestas del 24 de agosto)?",
    a: ["San Isidro", "Santiago", "San Roque", "San Bartolomé"],
    ok: 3,
    dato: "San Bartolomé. Una iglesia neoclásica de finales del siglo XVIII."
  },
  {
    q: "¿Cuántos habitantes tiene Hoyales, más o menos?",
    a: ["Unos 50", "Unos 200", "Unos 1.500", "Unos 10.000"],
    ok: 1,
    dato: "208 según el INE (2025). Este finde, unos cuantos más 😉"
  },
  {
    q: "Ves dos Vírgenes, una arriba y otra abajo. ¿Cuál eliges?",
    a: ["La de abajo", "La de arriba", "Las dos", "Depende del día"],
    ok: 1,
    dato: "La de arriba, siempre. Ahora vas a tener que demostrarlo…"
  }
];

// Las 5 pruebas de "escoge a la Virgen de Arriba".
const LEVELS = [
  { virgins: 2, fruits: 0,  layout: "arriba-abajo", text: "Toca a la Virgen de Arriba" },
  { virgins: 1, fruits: 16, text: "¡Encuentra a la Virgen entre la fruta!" },
  { virgins: 2, fruits: 34, text: "Toca la Virgen de ARRIBA" },
  { virgins: 3, fruits: 55, text: "Toca la de ARRIBA DEL TODO" },
  { virgins: 4, fruits: 60, move: true, text: "¡Se mueven! Toca la de más arriba" }
];

const FRUITS = ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍒", "🍑", "🍍", "🥝", "🥭", "🍈", "🫐", "🍏"];

// Sitios del mapa del tesoro.
const PLACES = {
  casa: {
    name: "La casa",
    emoji: "🏠",
    what: "Para dormir",
    desc: "A la entrada del pueblo. Aquí se duerme (o se intenta)."
  },
  salon: {
    name: "Salón de usos múltiples",
    emoji: "🪩",
    what: "Para la fiesta",
    desc: "Donde se monta la fiesta. Usos múltiples, pero hoy solo uno: bailar."
  },
  bodegas: {
    name: "Las bodegas",
    emoji: "🍷",
    what: "Para el vino",
    desc: "Bajo tierra, junto al castillo, con sus zarceras asomando. Ribera del Duero de la buena."
  },
  bar: {
    name: "Bar de la plaza",
    emoji: "🍻",
    what: "Para beber",
    desc: "En la plaza. Punto de encuentro oficial antes, durante y después de todo."
  },
  iglesia: {
    name: "Iglesia de la Virgen de Arriba",
    emoji: "🙏",
    what: "Para rezar",
    desc: "Arriba, como tiene que ser. Aquí está ella. X marca el tesoro."
  }
};

// Invitados del finde (para el sorteo y la lista de cosas).
const GUESTS = ["Adriana", "Carlos", "Cris", "Álvaro", "Diego"];

// La Virgen también entra en el sorteo.
const VIRGEN = "La Virgen";

// Planning del finde. Ejemplo de formato:
// { dia: "Viernes", items: [ { hora: "20:00", que: "Llegada", donde: "casa" } ] }
const PLANNING = [];

// Cosas que hay que traer.
// emoji, item, nota (opcional), quien (opcional, si no es para todos), opcional: true si no es imprescindible.
const TRAER = [
  { emoji: "🛁", item: "Toallas de cuerpo y de cara" },
  { emoji: "🧥", item: "Ropa de abrigo", nota: "Y mejor a capas" },
  { emoji: "🧦", item: "Pijama abrigadito" },
  { emoji: "☔", item: "Algo impermeable", nota: "El sábado dan lluvia", opcional: true },
  { emoji: "🍸", item: "El Beefeater", quien: "Adriana y Carlos" },
  { emoji: "🎉", item: "Ganas de pasárselo muy bien", nota: "Imprescindible" }
];

// Avisos al final de la lista.
const TRAER_NOTAS = [
  "🛒 El resto del alcohol lo compramos allí."
];
