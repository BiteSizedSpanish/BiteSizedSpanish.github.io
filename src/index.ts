import { getProblemId, initRandom, randInt } from './randutils.js';
import {
  generators,
  getSelectedCategories,
  setSelectedCategories,
  generatorConfig,
  genericSettings,
} from './generators/problemgenerators.js';
import { getStats, recordPlayed } from './stats.js';
import Cookies from 'js-cookie';
import { getEndings, loadVerbs, regularConjugation } from './verbs.js';

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
    document.querySelector('[data-generated="verb"]')!.innerHTML =
      'No categories selected';
    return;
  }

  let generated = generators()[randInt(generators().length)]();

  document.querySelectorAll('[data-generated]').forEach((el) => {
    el.innerHTML = (generated as any)[el.getAttribute('data-generated')!];
  });

  document.querySelectorAll('[data-form]').forEach((el) => {
    let form = generated.allForms[el.getAttribute('data-form')!];
    el.innerHTML = form;
    if (
      form !==
      regularConjugation(
        generated.tense,
        generated.verb,
        el.getAttribute('data-form')!,
      )
    ) {
      el.classList.add('text-red-300');
    } else {
      el.classList.remove('text-red-300');
    }
  });

  document.querySelectorAll('[data-form-ending]').forEach((el) => {
    el.innerHTML = getEndings(generated.tense, generated.verb)[
      el.getAttribute('data-form-ending')!
    ];
  });

  document.getElementById('problemId')!.innerHTML =
    `Problem ID: ${getProblemId()}`;
  document
    .getElementById('ghIssueLink')!
    .setAttribute(
      'href',
      `https://github.com/BiteSizedSpanish/BiteSizedSpanish.github.io/issues/new?title=${encodeURIComponent(`Problem ID: ${getProblemId()}`)}`,
    );
  document
    .getElementById('mailToLink')!
    .setAttribute(
      'href',
      `mailto:bergmannmatthias1+bitesizedspanish@gmail.com?subject=${encodeURIComponent(`Problem ID: ${getProblemId()}`)}`,
    );
}

window.newProblem = (wasCorrect: boolean) => {
  document.querySelectorAll('[data-is-solution]').forEach((el) => {
    el.classList.add('hidden');
  });

  document.getElementById('next')!.classList.remove('hidden');
  recordPlayed(wasCorrect);
  refreshStats();
  renderRandom();
};

window.showAllSteps = () => {
  document.getElementById('next')!.classList.add('hidden');
  document.querySelectorAll('[data-is-solution]').forEach((el) => {
    el.classList.remove('hidden');
  });
};

window.initTrainer = async () => {
  initSettings();
  refreshStats();
  await loadVerbs();
  renderRandom();
};

function initSettings() {
  document.getElementById('settings')!.children[1].innerHTML =
    Object.keys(genericSettings)
      .map(
        (c) =>
          `<div><input type="checkbox" id="setting-cb-${c}" name="${c}" ${getSelectedCategories().includes(c) ? 'checked' : ''} class="accent-black">` +
          `<label for="setting-cb-${c}">&nbsp;${genericSettings[c as keyof typeof genericSettings].name}</label></div>`,
      )
      .join('') +
    '<hr>' +
    Object.keys(generatorConfig)
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
        c.firstElementChild &&
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
