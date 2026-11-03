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
// virgins: Vírgenes buenas · decoys: "Vírgenes de Abajo" (del revés, no se tocan) · fruits: cosas que estorban
// bob: "swap" (suben y bajan turnándose) o true (suben y bajan cada una a su ritmo)
// move: todo se mueve · drift: las Vírgenes se desplazan · rain: llueve fruta por encima · dark: a oscuras con linterna
// extras: además de fruta salen cosas del pueblo · size: "big" | "small"
const LEVELS = [
  {
    emoji: "🎢", name: "Sube y baja",
    text: "Las dos Vírgenes suben y bajan sin parar. Toca la que esté ARRIBA justo en ese momento.",
    short: "Toca la que esté ARRIBA",
    virgins: 2, fruits: 14, bob: "swap", size: "big"
  },
  {
    emoji: "🙃", name: "La impostora",
    text: "Entre la fruta está la Virgen… y tres Vírgenes de Abajo (están del revés). Toca la buena.",
    short: "Toca la buena (no la del revés)",
    virgins: 1, decoys: 3, fruits: 40
  },
  {
    emoji: "🌧️", name: "Lluvia de fruta",
    text: "Llueve fruta (y alguna cosa más). Toca la Virgen de ARRIBA sin darle a nada más. Ojo, que hay una impostora.",
    short: "Toca la de ARRIBA",
    virgins: 2, decoys: 1, fruits: 55, rain: true, drift: true, extras: true
  },
  {
    emoji: "🔦", name: "Se ha ido la luz",
    text: "Apagón en la ermita. Arrastra el dedo para alumbrar y toca la Virgen de más ARRIBA.",
    short: "A oscuras: la de más ARRIBA",
    virgins: 3, decoys: 1, fruits: 60, dark: true, extras: true
  },
  {
    emoji: "👑", name: "La gran final",
    text: "Todo se mueve, hay dos impostoras y las Vírgenes suben y bajan. Toca la de ARRIBA DEL TODO.",
    short: "La de ARRIBA DEL TODO",
    virgins: 4, decoys: 2, fruits: 70, move: true, bob: true, size: "small", extras: true
  }
];

const FRUITS = ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍒", "🍑", "🍍", "🥝", "🥭", "🍈", "🫐", "🍏"];
const EXTRAS = ["🍷", "🥖", "🧀", "🐑", "🥚", "🍄", "🌰", "🍺", "🔔", "🕯️"];

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
    desc: "Pasada la plaza. Aquí está el concierto y la fiesta. Usos múltiples, pero este finde solo uno: bailar."
  },
  bodegas: {
    name: "Las bodegas",
    emoji: "🍷",
    what: "Para el vino",
    desc: "Subiendo, por encima de la iglesia, metidas en el cerro con sus zarceras asomando. Ribera del Duero de la buena."
  },
  bar: {
    name: "Bar de la plaza",
    emoji: "🍻",
    what: "Para beber",
    desc: "En la plaza, viniendo desde la entrada del pueblo. Punto de encuentro oficial antes, durante y después de todo."
  },
  castillo: {
    name: "El castillo",
    emoji: "🏰",
    what: "Para las vistas",
    desc: "Arriba del todo, por encima de las bodegas. Del castillo queda medio torreón, y desde ahí se ve toda la vega. X marca el tesoro."
  },
  iglesia: {
    name: "Iglesia de la Virgen de Arriba",
    emoji: "🙏",
    what: "Para rezar",
    desc: "Subiendo desde la plaza. Aquí está ella, la Virgen de Arriba, como tiene que ser."
  }
};

// Invitados del finde (para el sorteo y la lista de cosas).
const GUESTS = ["Adriana", "Carlos", "Cris", "Álvaro", "Diego"];

// La Virgen también entra en el sorteo.
const VIRGEN = "La Virgen";

// Antes de salir: aviso destacado arriba del planning.
const COMPRA = {
  titulo: "Adriana hace la compra",
  texto: "Mandadle lo que queráis para el finde: comida, preferencias y el alcohol. Llevaremos botellón para no ir de copas, que es más caro (aunque quien quiera también puede ir de copas).",
  whatsapp: "¡Hola! Para la compra del finde de la Virgen de Arriba quiero:\n- \n- \nY de beber: "
};

// Planning del finde.
// hora, emoji, que, nota (opcional), donde (clave de PLACES para abrir su ficha),
// lugar + mapa (texto y búsqueda de Google Maps para sitios fuera del mapa),
// porConfirmar: true si aún no es seguro.
const PLANNING = [
  {
    dia: "Jueves",
    lema: "Llegada",
    items: [
      { hora: "19:00", emoji: "🚗", que: "Salimos hacia Hoyales", lugar: "Casa de Adriana (Madrid)" },
      { hora: "21:00", emoji: "🏡", que: "Llegamos al pueblo", donde: "casa" },
      { hora: "Noche", emoji: "🍻", que: "Tomamos algo en la plaza", donde: "bar" },
      { hora: "Pronto", emoji: "😴", que: "A casa temprano", nota: "Que el viernes se trabaja", donde: "casa" }
    ]
  },
  {
    dia: "Viernes",
    lema: "Concierto y fiesta",
    items: [
      { hora: "Hasta 15:00", emoji: "💻", que: "Se trabaja" },
      { hora: "15:00", emoji: "🍷", que: "Tomamos algo en Barbecho", lugar: "Anguix", mapa: "Barbecho Anguix Burgos" },
      { hora: "Después", emoji: "🛋️", que: "Vuelta a Hoyales y descanso", donde: "casa" },
      { hora: "Tarde", emoji: "🍻", que: "Salimos a tomar algo", donde: "bar" },
      { hora: "Cena", emoji: "🍳", que: "Cenamos algo en casa", donde: "casa" },
      { hora: "Noche", emoji: "🎸", que: "Concierto de un grupo", donde: "salon" },
      { hora: "01:00", emoji: "🪩", que: "¡Fiesta!", donde: "salon" }
    ]
  },
  {
    dia: "Sábado",
    lema: "Día grande",
    items: [
      { hora: "Mañana", emoji: "🚶", que: "Mañana libre", nota: "Paseo por el pueblo o lo que os apetezca. Si no fuimos el viernes, se puede ir a Barbecho… según cómo estén los cuerpos." },
      { hora: "Tarde", emoji: "🙏", que: "Procesión con la Virgen de Arriba", donde: "iglesia", porConfirmar: true },
      { hora: "Después", emoji: "🎺", que: "Orquesta" },
      { hora: "Cena", emoji: "🍳", que: "Cena todos juntos con los amigos de Adriana", nota: "Huevos rotos, en principio" },
      { hora: "Noche", emoji: "🪩", que: "Fiesta: orquesta y luego DJ", donde: "salon" }
    ]
  },
  {
    dia: "Domingo",
    lema: "Despedida",
    items: [
      { hora: "Mediodía", emoji: "🍸", que: "Vermú" },
      { hora: "Comida", emoji: "🍲", que: "Comida familiar" },
      { hora: "Tarde", emoji: "🚗", que: "Vuelta a Madrid" }
    ]
  }
];

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
