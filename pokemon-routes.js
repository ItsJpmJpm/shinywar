var ALL_ROUTES = [
    // Kanto
    "Ruta 1 (Kanto)","Ruta 2 (Kanto)","Ruta 3 (Kanto)","Ruta 4 (Kanto)","Ruta 5 (Kanto)",
    "Ruta 6 (Kanto)","Ruta 7 (Kanto)","Ruta 8 (Kanto)","Ruta 9 (Kanto)","Ruta 10 (Kanto)",
    "Ruta 11 (Kanto)","Ruta 12 (Kanto)","Ruta 13 (Kanto)","Ruta 14 (Kanto)","Ruta 15 (Kanto)",
    "Ruta 16 (Kanto)","Ruta 17 (Kanto)","Ruta 18 (Kanto)","Ruta 19 (Kanto)","Ruta 20 (Kanto)",
    "Ruta 21 (Kanto)","Ruta 22 (Kanto)","Ruta 23 (Kanto)","Ruta 24 (Kanto)","Ruta 25 (Kanto)",
    "Ruta 26 (Kanto)","Ruta 27 (Kanto)","Ruta 28 (Kanto)",
    "Bosque Verde","Monte Moon","Cueva Celeste","Túnel Rocoso","Central Energía",
    "Cueva Diglett","Central Térmica","Zona Safari (Kanto)","Mansión Pokémon",
    "Islas Espuma","Calle Victoria (Kanto)","Meseta Añil","Torre Pokémon",
    "Cueva Parda","Islas Sete",

    // Johto
    "Ruta 29 (Johto)","Ruta 30 (Johto)","Ruta 31 (Johto)","Ruta 32 (Johto)","Ruta 33 (Johto)",
    "Ruta 34 (Johto)","Ruta 35 (Johto)","Ruta 36 (Johto)","Ruta 37 (Johto)","Ruta 38 (Johto)",
    "Ruta 39 (Johto)","Ruta 40 (Johto)","Ruta 41 (Johto)","Ruta 42 (Johto)","Ruta 43 (Johto)",
    "Ruta 44 (Johto)","Ruta 45 (Johto)","Ruta 46 (Johto)","Ruta 47 (Johto)","Ruta 48 (Johto)",
    "Torre Bellsprout","Ruinas Alfa","Cueva Unión","Bosque Ilex","Pozo Slowpoke",
    "Torre Quemada","Torre Hojosa","Túnel Oscuro","Islas Remolino","Monte Mortal",
    "Camino Helado","Cueva Dragón","Calle Victoria (Johto)","Meseta Plata",
    "Cueva Plateada","Torre Batalla (Johto)","Cueva Parda (Johto)",

    // Hoenn
    "Ruta 101 (Hoenn)","Ruta 102 (Hoenn)","Ruta 103 (Hoenn)","Ruta 104 (Hoenn)","Ruta 105 (Hoenn)",
    "Ruta 106 (Hoenn)","Ruta 107 (Hoenn)","Ruta 108 (Hoenn)","Ruta 109 (Hoenn)","Ruta 110 (Hoenn)",
    "Ruta 111 (Hoenn)","Ruta 112 (Hoenn)","Ruta 113 (Hoenn)","Ruta 114 (Hoenn)","Ruta 115 (Hoenn)",
    "Ruta 116 (Hoenn)","Ruta 117 (Hoenn)","Ruta 118 (Hoenn)","Ruta 119 (Hoenn)","Ruta 120 (Hoenn)",
    "Ruta 121 (Hoenn)","Ruta 122 (Hoenn)","Ruta 123 (Hoenn)","Ruta 124 (Hoenn)","Ruta 125 (Hoenn)",
    "Ruta 126 (Hoenn)","Ruta 127 (Hoenn)","Ruta 128 (Hoenn)","Ruta 129 (Hoenn)","Ruta 130 (Hoenn)",
    "Ruta 131 (Hoenn)","Ruta 132 (Hoenn)","Ruta 133 (Hoenn)","Ruta 134 (Hoenn)",
    "Bosque Petalia","Túnel Rusturf","Cueva Granito","Camino Ígneo","Llanura Calcinada",
    "Cueva Meteoro","Monte Chimenea","Paso Angosto","Zona Safari (Hoenn)",
    "Cueva Raíces","Cueva Origen","Calle Victoria (Hoenn)","Pilar Celeste",
    "Monte Triz","Torre Espejismo","Cueva Terrena","Cueva Marina",
    "Cueva Costera","Escuela Batalla (Hoenn)",

    // Sinnoh
    "Ruta 201 (Sinnoh)","Ruta 202 (Sinnoh)","Ruta 203 (Sinnoh)","Ruta 204 (Sinnoh)","Ruta 205 (Sinnoh)",
    "Ruta 206 (Sinnoh)","Ruta 207 (Sinnoh)","Ruta 208 (Sinnoh)","Ruta 209 (Sinnoh)","Ruta 210 (Sinnoh)",
    "Ruta 211 (Sinnoh)","Ruta 212 (Sinnoh)","Ruta 213 (Sinnoh)","Ruta 214 (Sinnoh)","Ruta 215 (Sinnoh)",
    "Ruta 216 (Sinnoh)","Ruta 217 (Sinnoh)","Ruta 218 (Sinnoh)","Ruta 219 (Sinnoh)","Ruta 220 (Sinnoh)",
    "Ruta 221 (Sinnoh)","Ruta 222 (Sinnoh)","Ruta 223 (Sinnoh)","Ruta 224 (Sinnoh)","Ruta 225 (Sinnoh)",
    "Ruta 226 (Sinnoh)","Ruta 227 (Sinnoh)","Ruta 228 (Sinnoh)","Ruta 229 (Sinnoh)","Ruta 230 (Sinnoh)",
    "Mina Pirita","Central Eolia","Bosque Eterna","Monte Corona","Gran Pantano",
    "Isla Férrea","Lago Valor","Lago Veraz","Lago Agudeza","Calle Victoria (Sinnoh)",
    "Pilar Clave","Mundo Distorsión","Antigua Mansión","Torre Perdida",
    "Camino Brumoso","Cueva Recóndita","Jardín Trofeo",

    // Unova
    "Ruta 1 (Unova)","Ruta 2 (Unova)","Ruta 3 (Unova)","Ruta 4 (Unova)","Ruta 5 (Unova)",
    "Ruta 6 (Unova)","Ruta 7 (Unova)","Ruta 8 (Unova)","Ruta 9 (Unova)","Ruta 10 (Unova)",
    "Ruta 11 (Unova)","Ruta 12 (Unova)","Ruta 13 (Unova)","Ruta 14 (Unova)","Ruta 15 (Unova)",
    "Ruta 16 (Unova)","Ruta 17 (Unova)","Ruta 18 (Unova)","Ruta 19 (Unova)","Ruta 20 (Unova)",
    "Ruta 21 (Unova)","Ruta 22 (Unova)","Ruta 23 (Unova)",
    "Bosque Azulejo","Cueva Manantial","Castillo Relincho","Desierto Resort",
    "Monte Tuerca","Torre Dragón","Calle Victoria (Unova)","Abismo Gigante",
    "Cueva Electrorroca","Bosque Espejismo","Cueva Fría"
];

function suggestRoutes(query) {
    if (!query || query.length < 1) return [];
    var q = query.toLowerCase();
    return ALL_ROUTES.filter(function(r) { return r.toLowerCase().indexOf(q) !== -1; });
}
