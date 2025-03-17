import { getProblemId, initRandom, randInt } from './randutils.js';
import {
  generators,
  getSelectedCategories,
  setSelectedCategories,
  generatorConfig,
} from './generators/problemgenerators.js';
import { getStats, recordPlayed } from './stats.js';
import Cookies from 'js-cookie';
import { loadVerbs } from './verbs.js';

declare global {
  interface Window {
    newProblem: (wasCorrect: boolean) => void;
    showAllSteps: () => void;
    initTrainer: () => void;
    saveSettings: () => void;
    MathJax: any;
    acceptCookies: () => void;
    rejectCookies: () => void;
  }
}

async function renderRandom() {
  initRandom();

  if (generators().length == 0) {
    document.getElementById('verb')!.innerHTML = 'No categories selected';
    return;
  }

  let { tense, form, verb, conjugation, english, table } =
    generators()[randInt(generators().length)]();

  document.getElementById('verb')!.innerHTML = verb;
  document.getElementById('tense')!.innerHTML = tense;
  document.getElementById('form')!.innerHTML = form;
  document.getElementById('conjugation')!.innerHTML = conjugation;
  document.getElementById('english')!.innerHTML = english;

  document.getElementById('table_verb')!.innerHTML = verb;
  document.getElementById('table_1s')!.innerHTML = table[0];
  document.getElementById('table_2s')!.innerHTML = table[1];
  document.getElementById('table_3s')!.innerHTML = table[2];
  document.getElementById('table_1p')!.innerHTML = table[3];
  document.getElementById('table_2p')!.innerHTML = table[4];
  document.getElementById('table_3p')!.innerHTML = table[5];

  document.getElementById('problemId')!.innerHTML =
    `Problem ID: ${getProblemId()}`;
  document
    .getElementById('ghIssueLink')!
    .setAttribute(
      'href',
      `https://github.com/BiteSizedMath/BiteSizedMath.github.io/issues/new?title=${encodeURIComponent(`Problem ID: ${getProblemId()}`)}`,
    );
  document
    .getElementById('mailToLink')!
    .setAttribute(
      'href',
      `mailto:bergmannmatthias1+bitesizedmath@gmail.com?subject=${encodeURIComponent(`Problem ID: ${getProblemId()}`)}`,
    );
}

window.newProblem = (wasCorrect: boolean) => {
  document.getElementById('verb')!.innerHTML = '';
  document.getElementById('tense')!.innerHTML = '';
  document.getElementById('form')!.innerHTML = '';
  document.getElementById('conjugation')!.innerHTML = '';
  document.getElementById('conjugation')!.classList.add('hidden');
  document.getElementById('next')!.classList.remove('hidden');
  document.getElementById('feedback')!.classList.add('hidden');
  document.getElementById('forms_table')!.classList.add('hidden');
  recordPlayed(wasCorrect);
  refreshStats();
  renderRandom();
};

window.showAllSteps = () => {
  document.getElementById('conjugation')!.classList.remove('hidden');
  document.getElementById('next')!.classList.add('hidden');
  document.getElementById('feedback')!.classList.remove('hidden');
  document.getElementById('forms_table')!.classList.remove('hidden');
};

window.initTrainer = async () => {
  initSettings();
  refreshStats();
  await loadVerbs();
  renderRandom();
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
