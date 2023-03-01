import { VectorCriteriaConvolution } from "./vectorConvolution.js";

/*
1) Вводимо значення матриці вже в числовому вигляді.
2) Там, де тип критерія min, дописуємо мінуси перед значеннями
щоб звести до одного типу.
3) Вводимо вагові коєфіцієнти для кожного критерію
4) Вводимо інтервал, до якого будуть зводитись значення критеріїв.
*/

// Оцінки альтернатив за критеріями
const MATRIX = [
  ["Альтернативи", "YouTube", "Instagram", "Facebook", "Snapchat"],
  ["Популярність", 10, 5, 10, 1], // max
  ["Вартість", -5000, -500, -1500, -2000], // min
  ["Профіт", 40000, 10000, 20000, 15000], // max
  ["Простота", 1, 10, 10, 5], // max
  ["Тривалість відео", 100, 15, 30, 60], // max
  ["Служба підтримки", 1, 0, 0, 1], // max
];

// Коєфіцієнти вагомості
const W = [
  ["Популярність", 80],
  ["Вартість", 40],
  ["Профіт", 100],
  ["Простота", 10],
  ["Тривалість відео", 50],
  ["Служба підтримки", 20],
];

// Інтервал до якого нормалізууються значення
const INTERVAL = [1, 2];

// Розв'язання задачі методом згортання векторного критерію
const vc = new VectorCriteriaConvolution(MATRIX, W, INTERVAL);

vc.solve();