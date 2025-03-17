import { getSelectedCategories } from './generators/problemgenerators.js';

////////  randomness courtesy of bryc https://stackoverflow.com/a/47593316 /////////
function cyrb128(str: string) {
  let h1 = 1779033703,
    h2 = 3144134277,
    h3 = 1013904242,
    h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  (h1 ^= h2 ^ h3 ^ h4), (h2 ^= h1), (h3 ^= h1), (h4 ^= h1);
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

function sfc32(a: number, b: number, c: number, d: number) {
  return function () {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    let t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

export function randomStr(length: number, randomness: () => number) {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

  // Loop to generate characters for the specified length
  for (let i = 0; i < length; i++) {
    const randomInd = Math.floor(randomness() * characters.length);
    result += characters.charAt(randomInd);
  }
  return result;
}

////////////////////////////////////////////////////////////////////////////////

export function shuffledArray(len: number) {
  let array: number[] = [];

  for (let i = 0; i < len; i++) {
    array.push(i);
  }
  for (var i = array.length - 1; i >= 0; i--) {
    var j = randInt(i + 1);
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}
let rand = sfc32(0, 0, 0, 0);
let shuffled: number[][] = [];

let problemId: string = '';

export function generateProblemId() {
  problemId = randomStr(8, Math.random) + ':' + getSelectedCategories();
}

export function getProblemId() {
  return problemId;
}

export function initRandom() {
  generateProblemId();
  var sfcSeed = cyrb128(problemId);
  rand = sfc32(sfcSeed[0], sfcSeed[1], sfcSeed[2], sfcSeed[3]);

  shuffled = [];
  for (let i = 0; i < 100; i++) {
    shuffled.push(shuffledArray(i));
  }
}
addEventListener('popstate', () => {
  window.location.reload();
});

export function pickRandomUnique<T>(array: T[], seed: number): T {
  return array[shuffled[array.length][seed]];
}

export function pickRandom<T>(array: T[], seed: number): T {
  return array[shuffled[99][seed] % array.length];
}

export function sign(seed: number | null = null) {
  return pickRandom(['+', '-'], seed ?? randInt(2));
}

export function operation(seed: number | null = null) {
  return pickRandom(['+', '-', '*', '/'], seed ?? randInt(4));
}

export function randVariable(seed: number | null = null) {
  if (problemId.startsWith('x_')) {
    return 'x';
  }
  return pickRandomUnique(['a', 'b', 'c', 'x', 'y', 'z'], seed ?? randInt(6));
}

export function randVariableTerm(
  maxSize: number,
  varRange: number | null = null,
) {
  let size = randInclusive(0, maxSize);
  let group = '';
  for (let i = 0; i < size; i++) {
    group += randVariable(randInt(varRange ?? maxSize));
  }
  return group;
}

export function randInclusive(min: number, max: number) {
  if (max == null) {
    max = min;
    min = 0;
  }
  return randInt(max - min + 1) + min;
}

export function nonZero(min: number, max: number, exclude: number[] = []) {
  while (true) {
    let result = randInclusive(min, max);
    if (randInt(3) == 0)
      // slightly prefer positives
      result = Math.abs(result);
    if (result != 0 && !exclude.includes(result)) {
      return result;
    }
  }
}

export function randInt(max: number) {
  return Math.floor(rand() * max);
}
