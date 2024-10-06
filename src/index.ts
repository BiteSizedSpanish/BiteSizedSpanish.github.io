import { initRandom, randInt } from './randutils.js';
import {
  generators,
  getSelectedCategories,
  setSelectedCategories,
  generatorConfig,
  onlyUseX,
  setOnlyUseX,
} from './generators/problemgenerators.js';
import { getStats, recordPlayed } from './stats.js';
import Cookies from 'js-cookie';

declare global {
  interface Window {
    newProblem: (wasCorrect: boolean) => void;
    showNextStep: () => void;
    showAllSteps: () => void;
    initTrainer: () => void;
    saveSettings: () => void;
    MathJax: any;
    acceptCookies: () => void;
    rejectCookies: () => void;
  }
}

let step = 0;

function filterDuplicateSteps(
  steps: string[],
  problem: string,
  solution: string,
) {
  problem = problem.trim().replaceAll(' ', '');
  solution = solution.trim().replaceAll(' ', '');
  let filtered = [];
  let prevStepTrimmed = null;
  for (let step of steps) {
    const trimmedStep = step.replace('<hidden>', '').trim().replaceAll(' ', '');
    if (trimmedStep === problem || trimmedStep === solution) continue;
    if (prevStepTrimmed === trimmedStep) continue;
    prevStepTrimmed = trimmedStep;
    filtered.push(step);
  }
  return filtered;
}

async function renderRandom(seed: string | null = null) {
  initRandom(seed);

  if (generators().length == 0) {
    document.getElementById('prompt')!.innerHTML = 'No categories selected';
    document.getElementById('problem')!.innerHTML = '';
    return;
  }

  let { prompt, problem, solution, steps, explanation, isTeX } =
    generators()[randInt(generators().length)]();
  if (solution === '') solution = '0';

  let separator = '`';
  if (isTeX) {
    separator = '$$';
  }

  document.getElementById('prompt')!.innerHTML = prompt;
  document.getElementById('problem')!.innerHTML =
    separator + problem + ' = ' + separator;
  document.getElementById('solution')!.innerHTML =
    separator + solution + separator;
  document.getElementById('explanation')!.innerHTML =
    separator + explanation + separator;

  document.getElementById('showNextStep')!.classList.add('hidden');
  if (steps) {
    steps = filterDuplicateSteps(steps, problem, solution);
    for (let step of steps) {
      if (step.includes('<hidden>')) {
        const content = `<div class="p-2 md:p-4">${separator}${step.replace(
          '<hidden>',
          '',
        )} = ${separator}</div>`;
        const lastChild = document.getElementById('steps')!.lastElementChild;
        if (lastChild && lastChild.tagName === 'DETAILS')
          lastChild.innerHTML += content;
        else
          document.getElementById('steps')!.innerHTML +=
            `<details class="hidden"><summary class="text-sm text-gray-500 cursor-pointer select-none">show intermediate step</summary>${content}</details>`;
      } else {
        document.getElementById('steps')!.innerHTML +=
          `<div class="hidden">${separator}${step} = ${separator}</div>`;
        document.getElementById('showNextStep')!.classList.remove('hidden');
      }
    }
  }

  await window.MathJax.typesetPromise();
}

window.newProblem = (wasCorrect: boolean) => {
  step = 0;
  document.getElementById('steps')!.innerHTML = '';
  (<HTMLInputElement>document.getElementById('notes')!).value = '';
  document.getElementById('solution')!.classList.add('hidden');
  document.getElementById('next')!.classList.remove('hidden');
  document.getElementById('feedback')!.classList.add('hidden');
  recordPlayed(wasCorrect);
  refreshStats();
  renderRandom();
};

window.showNextStep = () => {
  if (step > document.getElementById('steps')!.childElementCount) return;
  step++;

  if (step > document.getElementById('steps')!.childElementCount) {
    document.getElementById('solution')!.classList.remove('hidden');
    document.getElementById('next')!.classList.add('hidden');
    document.getElementById('feedback')!.classList.remove('hidden');
  } else {
    document
      .getElementById('steps')!
      .children[step - 1].classList.remove('hidden');
    if (
      document.getElementById('steps')!.children[step - 1].tagName === 'DETAILS'
    )
      window.showNextStep();
  }
};

window.showAllSteps = () => {
  while (step <= document.getElementById('steps')!.childElementCount)
    window.showNextStep();
};

window.initTrainer = () => {
  initSettings();
  refreshStats();
  renderRandom(new URLSearchParams(window.location.search).get('p'));
};

function initSettings() {
  document.getElementById('settings')!.children[1].innerHTML = Object.keys(
    generatorConfig,
  )
    .map(
      (c) =>
        `<div><input type="checkbox" id="setting-cb-${c}" name="${c}" ${getSelectedCategories().includes(c) ? 'checked' : ''} class="accent-black">` +
        `<label for="setting-cb-${c}">&nbsp;${generatorConfig[c as keyof typeof generatorConfig].name}</label></div>`,
    )
    .join('');

  if (onlyUseX()) {
    (<HTMLInputElement>document.getElementById('setting-var-x')!).checked =
      true;
  }
}

function refreshStats() {
  const stats = getStats();
  document.getElementById('stats')!.innerHTML = `
        Played: ${stats.totalSolvedCorrect} / ${stats.totalSolved}<br>
        Today: ${stats.solvedTodayCorrect} / ${stats.solvedToday}`;
}

window.saveSettings = () => {
  const selectedCategories = Array.from(
    document.getElementById('settings')!.children[1].children,
  )
    .filter(
      (c) =>
        (<HTMLInputElement>c.firstElementChild!).type === 'checkbox' &&
        (<HTMLInputElement>c.firstElementChild!).checked,
    )
    .map((c) => (<HTMLInputElement>c.firstElementChild!).name);
  setSelectedCategories(selectedCategories.join(''));
  setOnlyUseX(
    (<HTMLInputElement>document.getElementById('setting-var-x')!).checked,
  );

  window.location.reload();
};

if (Cookies.get('cookiesEnabled') !== 'true') {
  document.getElementById('cookieBanner')!.classList.remove('hidden');
}

window.rejectCookies = () => {
  document.getElementById('cookieBanner')!.classList.add('hidden');
};

window.acceptCookies = () => {
  Cookies.set('cookiesEnabled', 'true', { sameSite: 'strict', expires: 10000 });
  document.getElementById('cookieBanner')!.classList.add('hidden');
};
