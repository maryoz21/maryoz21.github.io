// Speisekartendaten (Deutsch) - Café Sami's & Desayunos
// Übersetzt aus der ursprünglichen menu-data.js

const menuData = {
  cafes: [
    { nombre: "Bombón (Kaffee mit Kondensmilch)", precio: 1.70 },
    { nombre: "Espresso", precio: 1.30 },
    { nombre: "Cortado (Espresso mit einem Schuss Milch)", precio: 1.50 },
    { nombre: "Americano", precio: 1.70 },
    { nombre: "Carajillo (Kaffee mit Likör)", precio: 2.00 },
    { nombre: "Milchkaffee", precio: 1.70 },
    { nombre: "Groß", precio: 2.00 },
    { nombre: "Extra Groß", precio: 2.50 },
    { nombre: "Affogato mit Eis", precio: 4.00 },
    { nombre: "Cola-Cao (heiße Schokolade)", precio: 2.10 },
    { nombre: "Wiener Kaffee (Sahne & Kakao)", precio: 5.00 }
  ],

  te: [
    { nombre: "Grüner Tee mit Jasmin", precio: 2.00 },
    { nombre: "Pakistanischer Schwarztee", precio: 2.00 },
    { nombre: "Pu-Erh-Tee „Körper der Begierde“", precio: 2.00 },
    { nombre: "Waldbeeren", precio: 2.00 },
    { nombre: "Rooibos Copacabana", precio: 2.00 },
    { nombre: "Marokkanischer Minztee", precio: 2.00 },
    { nombre: "Schwarzer Tee Schokolade & Minze", precio: 2.00 },
    { nombre: "Rooibos Relax", precio: 2.00 },
    { nombre: "Schwarzer Tee Zimtträume", precio: 2.00 },
    { nombre: "Grüner Tee", precio: 2.00 },
    { nombre: "Japanischer Grüner Tee", precio: 2.00 },
    { nombre: "Digest", precio: 2.00 },
    { nombre: "Vanille-Rooibos", precio: 2.00 }
  ],

  bebidasFrias: [
    { nombre: "Coca-Cola", precio: 2.50 },
    { nombre: "Coca-Cola Zero", precio: 2.50 },
    { nombre: "Nestea", precio: 2.50 },
    { nombre: "Nestea Maracuja", precio: 2.50 },
    { nombre: "Aquarius Zitrone", precio: 2.50 },
    { nombre: "Aquarius Orange", precio: 2.50 },
    { nombre: "Fanta Zitrone", precio: 2.50 },
    { nombre: "Fanta Orange", precio: 2.50 }
  ],

  zumos: [
    { nombre: "Orange", precio: 3.00 },
    { nombre: "Ananas", precio: 1.80 },
    { nombre: "Pfirsich", precio: 1.80 }
  ],

  cappuccino: [
    { nombre: "Karamell", precio: 3.00 },
    { nombre: "Weiße Schokolade", precio: 3.00 },
    { nombre: "Vanille", precio: 3.00 },
    { nombre: "Milchcreme", precio: 2.20 }
  ],

  macchiatos: [
    { nombre: "Karamell", precio: 3.50 },
    { nombre: "Schokolade", precio: 3.50 },
    { nombre: "Weiße Schokolade", precio: 3.50 }
  ],

  tostadasBasicas: [
    { nombre: "Olivenöl", precio: 1.30 },
    { nombre: "Tomate", precio: 1.30 },
    { nombre: "Manchego-Käse", precio: 2.80 },
    { nombre: "Frischkäse", precio: 2.80 },
    { nombre: "Gekochter Schinken", precio: 1.90 },
    { nombre: "Putenschinken", precio: 1.90 },
    { nombre: "Butter", precio: 1.50 },
    { nombre: "Lachs", precio: 3.50 },
    { nombre: "Thunfisch", precio: 2.30 },
    { nombre: "Extra: Avocado", precio: 1.00 },
    { nombre: "Extra: Weitere Extras", precio: 0.50 }
  ],

  tostadasPanRustico: [
    { nombre: "Mediterran", descripcion: "Ziegenkäse, Honig und Walnüsse", precio: 6.00, imagen: "img/platos/tostada_mediterranea.jpg" },
    { nombre: "Serrano Grün", descripcion: "Tomate, Avocado und Serrano-Schinken", precio: 4.50 },
    { nombre: "Nordisch Deluxe", descripcion: "Lachs, Frischkäse und Rucola", precio: 5.00 },
    { nombre: "Rustikaler Geschmack", descripcion: "Tomate, Rührei und Serrano-Schinken", precio: 6.00 },
    { nombre: "Burrata & Beeren", descripcion: "Hauch von Pesto, Feldsalat, Burrata und rote Beeren", precio: 6.00, imagen: "img/platos/tostada_burrata_y_berries.jpg" },
    { nombre: "Süße Versuchung", descripcion: "Nutella, Erdbeeren, Banane und Haselnusscreme", precio: 7.00 },
    { nombre: "Die Saison", descripcion: "Frischkäse, Feigen oder Granatapfel (je nach Saison), Serrano-Schinken, Feta-Käse und Feldsalat", precio: 8.00 }
  ],

  brunchs: [
    { nombre: "Eggs Benedict", descripcion: "Brioche-Brot, Avocado, Bacon, pochiertes Ei und Sauce Hollandaise", precio: 11.00 },
    { nombre: "Amerikanisches Frühstück", descripcion: "Rustikaler Brot-Toast, Rührei, Bacon und Avocado", precio: 10.00, imagen: "img/platos/brunch_desayuno_americano.jpg" },
    { nombre: "Bagel Supreme", descripcion: "Bagel-Brot, Cheddar-Käse, Avocado, Pute, Rucola und Spiegel- oder Rührei", precio: 10.00, imagen: "img/platos/brunch_bagel_supreme.jpg" },
    { nombre: "Supreme Lachs", descripcion: "Bagel-Brot, Frischkäse, Feldsalat, Lachs, Avocado und Sprossen", precio: 12.00 },
    { nombre: "Der Zerzupfte", descripcion: "Burger-Brötchen, geschmorte Rinderbacke, Cheddar-Käse und Honig-Senf-Sauce", precio: 12.00 }
  ],

  crepesSalados: [
    { nombre: "Der Supreme", descripcion: "Avocado, Frischkäse und Lachs", precio: 9.00, imagen: "img/platos/crepe_salado_el_supremo.jpg" },
    { nombre: "Sami's Creps", descripcion: "Avocado, Hähnchen, Bacon, Honig-Senf", precio: 9.00 },
    { nombre: "Basic", descripcion: "Gekochter Schinken oder Pute, Käsescheiben, Honig (optional)", precio: 3.00 }
  ],

  tablasParaCompartir: [
    { nombre: "Sami's Freunde-Platte", descripcion: "Avocado, Lachs, Rührei, Käse, Serrano-Schinken, geriebene Tomate, Butter, Croissants, Pfannkuchen, Marmelade, Orangensaft, griechischer Joghurt und Brot", precio: 25.00 },
    { nombre: "Großer Serrano", descripcion: "Rustikaler Brot-Toast, Serrano-Schinken, Rührei mit einem Hauch Parmesan, verschiedene Käsesorten, iberische Wurstwaren und geriebene Tomate", precio: 15.00 },
    { nombre: "Super Mediterrane Platte", descripcion: "Käse (gereift, Manchego, Parmesan, halbgereift, Brie, Camembert und Trüffel), Wurstwaren (Serrano-Schinken, Salchichón, Lendenwurst, milder Chorizo), dazu rustikales Brot, Breadsticks, gemischte Nüsse und Oliven, süße Note von Trauben, Feigen und Saisonfrucht, extra 70%ige dunkle Schokolade", precio: 35.00 },
    { nombre: "Die Käseroute", descripcion: "Halbgereifter Käse, gereifter Ziegenkäse, Rosmarinkäse, Trüffelkäse, fruchtige Käsesorten, dazu Baguette, Cracker und Marmelade", precio: 18.00 },
    { nombre: "Die Schinkenauswahl", descripcion: "Auswahl an iberischem Schinken, Lendenwurst, Chorizo, Salchichón, dazu rustikales Brot und Breadsticks", precio: 15.00 }
  ],

  croissants: [
    { nombre: "Lotus Dream", descripcion: "Gefüllt mit Lotus-Creme, Banane, Sahne und Lotus-Keksen", precio: 5.00, imagen: "img/platos/croissant_lotus_dream.jpg" },
    { nombre: "Weiß & Grün", descripcion: "Pistazie und weiße Schokolade", precio: 5.00 },
    { nombre: "Sami's Paris", descripcion: "Konditorcreme und rote Beeren", precio: 5.00 },
    { nombre: "Gefüllte Croissants", descripcion: "Schokolade, weiße Schokolade, Kinder-Creme", precio: 1.50 }
  ],

  crepesDulces: [
    { nombre: "Die Königin", descripcion: "Nutella", precio: 3.50, imagen: "img/platos/crepe_la_reina.jpg" },
    { nombre: "Choco Berry Bliss", descripcion: "Nutella, Erdbeeren, Banane, Sahne und Haselnüsse", precio: 6.00 },
    { nombre: "Sweet Velvet", descripcion: "Frischkäse, rote Beeren und Honig", precio: 6.00, imagen: "img/platos/crepe_sweet_velvet.jpg" },
    { nombre: "Süßes Paradies", descripcion: "Rote Beeren, Kiwi, Orange und Nutella", precio: 6.00 },
    { nombre: "Extra: Kugel Eis", precio: 1.50 },
    { nombre: "Extra: Karamell", precio: 0.50 },
    { nombre: "Extra: Erdbeeren", precio: 0.50 },
    { nombre: "Extra: Weiße Schokolade", precio: 0.50 }
  ],

  tartas: [
    { nombre: "Red-Velvet-Kuchen", precio: 4.50, imagen: "img/platos/tarta_red_velvet.jpg" },
    { nombre: "Käsekuchen", precio: 4.50 },
    { nombre: "Pistazien-Käsekuchen", precio: 4.50 },
    { nombre: "Karottenkuchen", precio: 4.50 },
    { nombre: "Tiramisu", precio: 5.00 }
  ],

  galletasNewYork: [
    { nombre: "Lotus", precio: 3.50 },
    { nombre: "Red Velvet", precio: 3.50 },
    { nombre: "Schokolade", precio: 2.50, imagen: "img/platos/galleta_chocolate.jpg" },
    { nombre: "Weiße Schokolade", precio: 2.50 },
    { nombre: "Pistazie", precio: 3.50 },
    { nombre: "Oreo", precio: 3.50 }
  ]
};

// Kategorietitel (gleiche Reihenfolge wie menuData)
const categoryTitles = {
  cafes: "Kaffee",
  te: "Tee",
  bebidasFrias: "Kalte Getränke",
  zumos: "Säfte",
  cappuccino: "Cappuccino",
  macchiatos: "Macchiatos",
  tostadasBasicas: "Einfache Toasts",
  tostadasPanRustico: "Toasts mit rustikalem Brot",
  brunchs: "Brunch",
  crepesSalados: "Herzhafte Crêpes",
  tablasParaCompartir: "Platten zum Teilen",
  croissants: "Croissants",
  crepesDulces: "Süße Crêpes",
  tartas: "Kuchen",
  galletasNewYork: "New York Cookies"
};
