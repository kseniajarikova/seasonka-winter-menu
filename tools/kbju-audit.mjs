const foods = {
  quinoaDry: [368, 14.1, 6.1, 64.2],
  chickenThigh: [144, 18.6, 7.9, 0],
  egg: [72, 6.3, 4.8, 0.4, "piece"],
  greekYogurt: [73, 9.0, 2.0, 4.0],
  mandarin: [53, 0.8, 0.3, 13.3],
  berries: [50, 1.0, 0.4, 11.5],
  persimmon: [70, 0.6, 0.2, 18.6],
  bulgurDry: [342, 12.3, 1.3, 75.9],
  beet: [43, 1.6, 0.2, 10.0],
  lettuce: [15, 1.4, 0.2, 2.9],
  pumpkin: [26, 1.0, 0.1, 6.5],
  edamame: [121, 11.9, 5.2, 8.9],
  gochujang: [200, 5.0, 2.0, 44.0],
  cottageCheese2: [103, 18.0, 2.0, 3.3],
  wholewheatFlour: [340, 13.2, 2.5, 72.0],
  eggNoodlesDry: [360, 13.0, 3.0, 70.0],
  trout: [148, 20.5, 6.5, 0],
  greenBeans: [31, 1.8, 0.2, 7.0],
  kefir: [53, 3.0, 2.5, 4.0],
  chia: [486, 16.5, 30.7, 42.0],
  muesli: [360, 10.0, 6.0, 65.0],
  shrimp: [85, 20.1, 0.5, 0],
  riceNoodlesDry: [364, 3.4, 0.6, 83.0],
  bokChoy: [13, 1.5, 0.2, 2.2],
  porkLoin: [143, 21.0, 6.0, 0],
  saltedTrout: [160, 21.0, 8.0, 0],
  hardCheese: [350, 25.0, 27.0, 2.0],
  cornFlour: [361, 6.9, 3.9, 76.8],
  tuna: [116, 25.5, 0.8, 0],
  beefStew: [170, 21.0, 9.0, 0],
  celeryRoot: [42, 1.5, 0.3, 9.2],
  prunes: [240, 2.2, 0.4, 64.0],
  turnip: [28, 0.9, 0.1, 6.4],
  sweetPotato: [86, 1.6, 0.1, 20.1],
  tomato: [18, 0.9, 0.2, 3.9],
  feta: [265, 14.2, 21.5, 3.9],
  wholegrainBread: [247, 13.0, 4.2, 41.0],
  ryeBread: [259, 8.5, 3.3, 48.0],
  oliveOil: [884, 0, 100, 0],
  vegetableOil: [884, 0, 100, 0],
  sesameOil: [884, 0, 100, 0],
  apple: [52, 0.3, 0.2, 13.8],
  pear: [57, 0.4, 0.1, 15.2],
  avocado: [160, 2.0, 14.7, 8.5],
  turkeyBreast: [114, 23.7, 1.5, 0],
  turkeyMince: [170, 22.0, 9.0, 0],
  chickenBreast: [120, 22.5, 2.6, 0],
  porkTenderloin: [120, 21.2, 3.5, 0],
  leanBeefMince: [137, 21.4, 5.0, 0],
  cod: [82, 18.0, 0.7, 0],
  hake: [86, 18.5, 1.5, 0],
  smokedSalmon: [117, 18.3, 4.3, 0],
  tofuFirm: [144, 17.3, 8.7, 2.8],
  wholewheatPastaDry: [348, 14.6, 2.5, 64.8],
  brownRiceDry: [370, 7.5, 2.7, 77.0],
  pearlBarleyDry: [352, 9.9, 1.2, 77.7],
  buckwheatDry: [343, 13.3, 3.4, 71.5],
  cornmealDry: [370, 7.1, 1.8, 79.4],
  milletDry: [378, 11.0, 4.2, 72.9],
  oats: [379, 13.2, 6.5, 67.7],
  oatFlour: [379, 13.2, 6.5, 67.7],
  wholegrainBreadcrumbs: [350, 13.0, 5.0, 66.0],
  whiteBeans: [114, 7.3, 0.5, 20.3],
  potato: [77, 2.0, 0.1, 17.0],
  parsnip: [75, 1.2, 0.3, 18.0],
  broccoli: [34, 2.8, 0.4, 6.6],
  cauliflower: [25, 1.9, 0.3, 5.0],
  spinach: [23, 2.9, 0.4, 3.6],
  carrot: [41, 0.9, 0.2, 9.6],
  bellPepper: [31, 1.0, 0.3, 6.0],
  cucumber: [15, 0.7, 0.1, 3.6],
  napaCabbage: [16, 1.2, 0.2, 3.2],
  daikon: [18, 0.6, 0.1, 4.1],
  onion: [40, 1.1, 0.1, 9.3],
  garlic: [149, 6.4, 0.5, 33.1],
  mushrooms: [22, 3.1, 0.3, 3.3],
  sesame: [573, 17.7, 49.7, 23.5],
  pumpkinSeeds: [559, 30.0, 49.0, 10.7],
  walnuts: [654, 15.2, 65.2, 13.7],
  skyr: [63, 11.0, 0.2, 4.0],
  naturalYogurt: [61, 3.5, 3.3, 4.7],
  sourCream: [206, 2.8, 20.0, 3.2],
  creamCheese: [250, 6.0, 24.0, 4.0],
  milk: [52, 3.0, 2.5, 4.7],
  parmesan: [431, 38.0, 29.0, 4.1],
  tomatoPaste: [82, 4.3, 0.5, 18.9],
  honey: [304, 0, 0, 82.4],
  kimchi: [15, 1.1, 0.5, 2.4],
};

const g = (food, grams) => [food, grams];
const pc = (food, pieces) => [food, pieces, "piece"];

const week1 = [
  {
    day: "Понедельник",
    meals: {
      breakfast: [g("oats", 50), g("greekYogurt", 200), g("mandarin", 150), g("walnuts", 5)],
      lunch: [g("bulgurDry", 110), g("chickenBreast", 100), g("whiteBeans", 120), g("beet", 120), g("cucumber", 100), g("lettuce", 50), g("feta", 15), g("oliveOil", 10)],
      dinner: [g("chickenBreast", 250), g("brownRiceDry", 70), g("pumpkin", 150), g("broccoli", 150), g("napaCabbage", 80), g("edamame", 50), g("gochujang", 10), g("garlic", 4), g("sesameOil", 4), g("sesame", 4)],
    },
  },
  {
    day: "Вторник",
    meals: {
      breakfast: [g("greekYogurt", 150), g("oats", 30), g("berries", 100), g("persimmon", 100), g("pumpkinSeeds", 5)],
      lunch: [g("chickenBreast", 250), g("brownRiceDry", 115), g("pumpkin", 150), g("broccoli", 150), g("edamame", 50), g("napaCabbage", 80), g("gochujang", 10), g("garlic", 4), g("sesameOil", 4), g("sesame", 4), g("oliveOil", 4)],
      dinner: [g("cod", 250), g("whiteBeans", 100), g("brownRiceDry", 70), g("spinach", 50), g("onion", 50), g("garlic", 3), g("oliveOil", 5), g("sesameOil", 2)],
    },
  },
  {
    day: "Среда",
    meals: {
      breakfast: [g("milletDry", 60), g("pumpkin", 100), g("skyr", 300), g("apple", 100)],
      lunch: [g("cod", 250), g("whiteBeans", 100), g("potato", 330), g("spinach", 50), g("onion", 50), g("garlic", 3), g("oliveOil", 15), g("sesameOil", 2)],
      dinner: [g("porkTenderloin", 160), g("quinoaDry", 65), g("edamame", 50), g("napaCabbage", 150), g("cucumber", 100), g("carrot", 50), g("pear", 40), g("sesameOil", 5), g("sesame", 5.5), g("oliveOil", 1.25)],
    },
  },
  {
    day: "Четверг",
    meals: {
      breakfast: [pc("egg", 2), g("cottageCheese2", 100), g("spinach", 50), g("wholegrainBread", 120), g("apple", 80)],
      lunch: [g("porkTenderloin", 160), g("quinoaDry", 65), g("edamame", 50), g("napaCabbage", 150), g("cucumber", 100), g("carrot", 50), g("pear", 40), g("sesameOil", 5), g("sesame", 5.5), g("oliveOil", 1.25)],
      dinner: [g("chickenBreast", 125), g("tofuFirm", 20), g("brownRiceDry", 100), pc("egg", 1), g("napaCabbage", 100), g("spinach", 60), g("carrot", 50), g("mushrooms", 60), g("edamame", 30), g("gochujang", 10), g("sesame", 1), g("oliveOil", 2.5), g("daikon", 50)],
    },
  },
  {
    day: "Пятница",
    meals: {
      breakfast: [g("buckwheatDry", 45), g("chickenBreast", 70), pc("egg", 1), g("mushrooms", 100), g("spinach", 30), g("wholegrainBread", 50), g("creamCheese", 15), g("oliveOil", 1)],
      lunch: [g("chickenBreast", 125), g("brownRiceDry", 100), g("tofuFirm", 20), g("napaCabbage", 100), g("spinach", 60), g("carrot", 50), g("mushrooms", 60), g("edamame", 30), g("daikon", 50), pc("egg", 1), g("gochujang", 10), g("sesame", 1), g("oliveOil", 1.5)],
      dinner: [g("eggNoodlesDry", 90), g("chickenBreast", 100), g("tofuFirm", 50), g("edamame", 30), g("napaCabbage", 130), g("mushrooms", 155), g("carrot", 40), g("kimchi", 50), g("sesameOil", 2.5), g("oliveOil", 1), g("sesame", 1)],
    },
  },
  {
    day: "Суббота",
    meals: {
      breakfast: [g("cottageCheese2", 150), pc("egg", 1), g("wholewheatFlour", 25), g("oats", 40), g("greekYogurt", 100), g("berries", 150), g("vegetableOil", 4)],
      lunch: [g("eggNoodlesDry", 90), g("chickenBreast", 100), g("tofuFirm", 50), g("edamame", 30), g("napaCabbage", 130), g("mushrooms", 155), g("carrot", 40), g("kimchi", 50), g("sesameOil", 2.5), g("oliveOil", 1), g("sesame", 1)],
      dinner: [g("trout", 100), g("pearlBarleyDry", 110), g("greenBeans", 200), g("creamCheese", 10), g("cucumber", 100), g("sesameOil", 1), g("sesame", 1), g("oliveOil", 0.5)],
    },
  },
  {
    day: "Воскресенье",
    meals: {
      breakfast: [g("oats", 70), g("skyr", 250), g("kefir", 100), g("pear", 50), g("chia", 5), g("walnuts", 10)],
      lunch: [g("trout", 100), g("pearlBarleyDry", 110), g("greenBeans", 200), g("creamCheese", 10), g("cucumber", 100), g("sesameOil", 1), g("sesame", 1), g("oliveOil", 0.5)],
      dinner: [g("turkeyBreast", 200), g("wholewheatPastaDry", 110), g("whiteBeans", 50), g("tomato", 150), g("spinach", 50), g("onion", 25), g("garlic", 3), g("oliveOil", 5), g("parmesan", 10)],
    },
  },
];

// Quantities are per eaten portion. Dinner recipes in the book make two portions;
// this ledger divides their batch ingredients in half. Prep-only ingredients are
// counted in the meal where they are actually eaten, not on the prep day.
const week2 = [
  {
    day: "Понедельник",
    meals: {
      breakfast: [pc("egg", 2), g("tomato", 100), g("feta", 15), g("wholegrainBread", 130), g("oliveOil", 3), g("apple", 200)],
      lunch: [g("turkeyBreast", 200), g("wholewheatPastaDry", 110), g("whiteBeans", 50), g("tomato", 150), g("spinach", 50), g("onion", 25), g("garlic", 3), g("parmesan", 10), g("kimchi", 50)],
      dinner: [g("chickenThigh", 200), g("potato", 200), g("broccoli", 150), g("garlic", 3), g("sesame", 3), g("oliveOil", 3)],
    },
  },
  {
    day: "Вторник",
    meals: {
      breakfast: [g("skyr", 350), g("apple", 240), g("oats", 60), g("pumpkinSeeds", 8)],
      lunch: [g("chickenThigh", 200), g("broccoli", 150), g("garlic", 3), g("sesame", 3), g("oliveOil", 3), g("brownRiceDry", 100)],
      dinner: [g("leanBeefMince", 150), g("onion", 25), pc("egg", 0.5), g("wholegrainBreadcrumbs", 7.5), g("tomato", 100), g("sourCream", 20), g("potato", 300), g("cauliflower", 300), g("milk", 40), g("cucumber", 100), g("garlic", 1.5), g("sesameOil", 1.5), g("vegetableOil", 2.5)],
    },
  },
  {
    day: "Среда",
    meals: {
      breakfast: [g("skyr", 300), pc("egg", 1), g("oatFlour", 50), g("pear", 140), g("naturalYogurt", 50)],
      lunch: [g("leanBeefMince", 150), g("onion", 25), pc("egg", 0.5), g("wholegrainBreadcrumbs", 7.5), g("tomato", 100), g("sourCream", 20), g("cucumber", 100), g("garlic", 1.5), g("sesameOil", 1.5), g("vegetableOil", 2.5), g("pearlBarleyDry", 120)],
      dinner: [g("porkTenderloin", 225), g("buckwheatDry", 80), g("carrot", 125), g("naturalYogurt", 40), g("garlic", 2), g("daikon", 50)],
    },
  },
  {
    day: "Четверг",
    meals: {
      breakfast: [g("milletDry", 80), g("milk", 200), g("pear", 80), g("naturalYogurt", 100), g("skyr", 150)],
      lunch: [g("porkTenderloin", 225), g("buckwheatDry", 80), g("carrot", 125), g("naturalYogurt", 40), g("garlic", 2), g("daikon", 50)],
      dinner: [g("cod", 250), g("pearlBarleyDry", 85), g("cauliflower", 150), g("tomatoPaste", 5), g("honey", 4), g("cucumber", 100), g("sesame", 2.5), g("oliveOil", 10)],
    },
  },
  {
    day: "Пятница",
    meals: {
      breakfast: [g("wholegrainBread", 60), g("avocado", 25), pc("egg", 1), g("skyr", 250)],
      lunch: [g("cod", 250), g("pearlBarleyDry", 85), g("cauliflower", 150), g("tomatoPaste", 5), g("honey", 4), g("cucumber", 100), g("sesame", 2.5), g("oliveOil", 10)],
      dinner: [g("bellPepper", 175), g("turkeyMince", 200), g("brownRiceDry", 110), g("onion", 25), g("tomato", 100), g("garlic", 2), g("oliveOil", 4), g("napaCabbage", 100), g("cucumber", 50), g("sesame", 2)],
    },
  },
  {
    day: "Суббота",
    meals: {
      breakfast: [g("ryeBread", 60), g("smokedSalmon", 60), g("cucumber", 60), g("creamCheese", 25), g("skyr", 150), g("oats", 30), g("walnuts", 5)],
      lunch: [g("bellPepper", 175), g("turkeyMince", 200), g("brownRiceDry", 110), g("onion", 25), g("tomato", 100), g("garlic", 2), g("oliveOil", 4), g("napaCabbage", 100), g("sesame", 2)],
      dinner: [g("hake", 250), g("cornmealDry", 90), g("sourCream", 25), g("daikon", 50), g("oliveOil", 2.5)],
    },
  },
  {
    day: "Воскресенье",
    meals: {
      breakfast: [g("cornmealDry", 70), g("milk", 300), pc("egg", 1), g("skyr", 100), g("pear", 100), g("honey", 15)],
      lunch: [g("hake", 250), g("cornmealDry", 90), g("sourCream", 25), g("daikon", 50), g("oliveOil", 2.5)],
      dinner: [g("tofuFirm", 180), g("buckwheatDry", 100), g("mushrooms", 100), g("spinach", 100), g("onion", 30), g("garlic", 4), g("sesameOil", 1.5), g("sesame", 1.5), g("vegetableOil", 2.5)],
    },
  },
];

const week3 = [
  {
    day: "Понедельник",
    meals: {
      breakfast: [pc("egg", 2), g("tomato", 200), g("bellPepper", 80), g("onion", 40), g("wholegrainBread", 50), g("oliveOil", 2), g("skyr", 250), g("oats", 40), g("apple", 150)],
      lunch: [g("tofuFirm", 150), g("buckwheatDry", 100), g("mushrooms", 100), g("spinach", 100), g("onion", 30), g("garlic", 4), g("sesameOil", 2.5), g("sesame", 2.5), g("vegetableOil", 1), g("kimchi", 50)],
      dinner: [g("chickenBreast", 150), g("pearlBarleyDry", 80), g("mushrooms", 100), g("onion", 30), g("sourCream", 40), g("vegetableOil", 4), g("daikon", 50)],
    },
  },
  {
    day: "Вторник",
    meals: {
      breakfast: [g("greekYogurt", 350), g("persimmon", 230), g("muesli", 60), g("walnuts", 5)],
      lunch: [g("chickenBreast", 150), g("pearlBarleyDry", 80), g("mushrooms", 100), g("onion", 30), g("sourCream", 40), g("vegetableOil", 4), g("daikon", 50)],
      dinner: [g("turkeyMince", 150), g("buckwheatDry", 90), pc("egg", 0.5), g("onion", 20), g("oats", 10), g("carrot", 100), g("garlic", 1.5), g("vegetableOil", 4), g("sesame", 2)],
    },
  },
  {
    day: "Среда",
    meals: {
      breakfast: [g("milletDry", 80), g("pumpkin", 150), g("skyr", 400), g("apple", 150)],
      lunch: [g("turkeyMince", 150), g("buckwheatDry", 90), pc("egg", 0.5), g("onion", 20), g("oats", 10), g("carrot", 100), g("garlic", 1.5), g("vegetableOil", 4), g("sesame", 2)],
      dinner: [g("shrimp", 150), g("riceNoodlesDry", 90), g("bokChoy", 100), g("carrot", 40), g("garlic", 3), g("sesameOil", 2.5), g("vegetableOil", 2.5), g("napaCabbage", 100)],
    },
  },
  {
    day: "Четверг",
    meals: {
      breakfast: [g("wholegrainBread", 60), g("saltedTrout", 60), g("creamCheese", 25), g("cucumber", 60), g("skyr", 250), g("oats", 40), g("apple", 150)],
      lunch: [g("shrimp", 150), g("riceNoodlesDry", 90), g("bokChoy", 100), g("carrot", 40), g("garlic", 3), g("sesameOil", 2.5), g("vegetableOil", 2.5), g("napaCabbage", 100)],
      dinner: [g("porkLoin", 225), g("turnip", 200), g("carrot", 150), g("brownRiceDry", 60), g("onion", 75), g("oliveOil", 6), g("cucumber", 100), g("sesame", 2.5)],
    },
  },
  {
    day: "Пятница",
    meals: {
      breakfast: [g("chia", 15), g("naturalYogurt", 100), g("milk", 80), g("mandarin", 100), g("oats", 50), g("skyr", 250), g("apple", 150)],
      lunch: [g("porkLoin", 225), g("turnip", 200), g("carrot", 150), g("brownRiceDry", 60), g("onion", 75), g("oliveOil", 6), g("cucumber", 100), g("sesame", 2.5)],
      dinner: [g("potato", 200), g("leanBeefMince", 150), g("mushrooms", 100), g("onion", 40), g("naturalYogurt", 30), g("hardCheese", 10), g("oliveOil", 4), g("napaCabbage", 100), g("sesame", 2)],
    },
  },
  {
    day: "Суббота",
    meals: {
      breakfast: [g("cornFlour", 40), pc("egg", 1), g("milk", 60), g("naturalYogurt", 100), g("berries", 100), g("vegetableOil", 4), g("skyr", 300), g("oats", 50), g("apple", 150)],
      lunch: [g("potato", 200), g("leanBeefMince", 150), g("mushrooms", 100), g("onion", 40), g("naturalYogurt", 30), g("hardCheese", 10), g("oliveOil", 4), g("napaCabbage", 100), g("sesame", 2)],
      dinner: [g("cod", 150), g("brownRiceDry", 100), g("onion", 50), g("spinach", 100), g("garlic", 2.5), g("sesameOil", 2), g("sesame", 2), g("oliveOil", 4)],
    },
  },
  {
    day: "Воскресенье",
    meals: {
      breakfast: [g("wholegrainBread", 60), g("tuna", 80), pc("egg", 1), g("naturalYogurt", 25), g("cucumber", 60), g("skyr", 150), g("oats", 50), g("apple", 150)],
      lunch: [g("cod", 150), g("sweetPotato", 380), g("onion", 50), g("spinach", 100), g("garlic", 2.5), g("sesameOil", 2), g("sesame", 2), g("oliveOil", 4)],
      dinner: [g("beefStew", 160), g("turnip", 150), g("pearlBarleyDry", 80), g("carrot", 60), g("celeryRoot", 40), g("onion", 30), g("prunes", 20), g("oliveOil", 4), g("daikon", 50)],
    },
  },
];

function sum(items) {
  return items.reduce(
    (total, [food, amount, unit]) => {
      const [kcal, protein, fat, carbs, foodUnit] = foods[food];
      const factor = (unit ?? foodUnit) === "piece" ? amount : amount / 100;
      total.kcal += kcal * factor;
      total.protein += protein * factor;
      total.fat += fat * factor;
      total.carbs += carbs * factor;
      return total;
    },
    { kcal: 0, protein: 0, fat: 0, carbs: 0 },
  );
}

const round = (value) => Math.round(value);
const fmt = (value) => value.toFixed(1);

function reportWeek(label, week) {
  console.log(`${label} — черновой независимый пересчёт`);
  console.log("День\tКкал\tБ\tЖ\tУ\tБ%\tЖ%\tУ%\tСтатус");
  for (const { day, meals } of week) {
    const parts = Object.values(meals).map(sum);
    const total = parts.reduce(
      (acc, part) => Object.fromEntries(Object.keys(acc).map((key) => [key, acc[key] + part[key]])),
      { kcal: 0, protein: 0, fat: 0, carbs: 0 },
    );
    const macroEnergy = total.protein * 4 + total.fat * 9 + total.carbs * 4;
    const proteinPct = (total.protein * 4 * 100) / macroEnergy;
    const fatPct = (total.fat * 9 * 100) / macroEnergy;
    const carbsPct = (total.carbs * 4 * 100) / macroEnergy;
    const kcalOk = total.kcal >= 1900 && total.kcal <= 2100;
    const macroOk = Math.abs(proteinPct - 30) <= 5 && Math.abs(fatPct - 20) <= 5 && Math.abs(carbsPct - 50) <= 5;
    const status = kcalOk && macroOk ? "OK" : [kcalOk ? null : "ккал", macroOk ? null : "БЖУ"].filter(Boolean).join("+");
    console.log(`${day}\t${round(total.kcal)}\t${round(total.protein)}\t${round(total.fat)}\t${round(total.carbs)}\t${fmt(proteinPct)}\t${fmt(fatPct)}\t${fmt(carbsPct)}\t${status}`);
    for (const [name, part] of Object.entries(Object.fromEntries(Object.entries(meals).map(([name, items]) => [name, sum(items)])))) {
      console.log(`  ${name}: ${round(part.kcal)} ккал; ${round(part.protein)}/${round(part.fat)}/${round(part.carbs)}`);
    }
  }
}

reportWeek("Неделя 1", week1);
console.log();
reportWeek("Неделя 2", week2);
console.log();
reportWeek("Неделя 3", week3);
