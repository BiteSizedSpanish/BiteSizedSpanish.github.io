import { cookiesSetSafe } from '../stats.js';
import Cookies from 'js-cookie';
import {
  generateCondicional,
  generateCondicionalPerfecto,
  generateFuturo,
  generateFuturoPerfecto,
  generateImperativoAfirmativo,
  generateImperfecto,
  generatePluscuamperfecto,
  generatePresente,
  generatePresentePerfecto,
  generatePreterito,
  generatePreteritoAnterior,
} from './verbgenerator.js';

export type GeneratorResult = {
  tense: string;
  form: string;
  verb: string;
  conjugation: string;
  english: string;
  allForms: any;
};

export const generatorConfig = {
  a: { generators: [generatePresente], name: 'Presente' },
  b: { generators: [generateFuturo], name: 'Futuro' },
  c: { generators: [generateImperfecto], name: 'Imperfecto' },
  d: { generators: [generatePreterito], name: 'Pretérito' },
  e: { generators: [generateCondicional], name: 'Condicional' },
  f: { generators: [generatePresentePerfecto], name: 'Presente perfecto' },
  g: { generators: [generateFuturoPerfecto], name: 'Futuro perfecto' },
  h: { generators: [generatePluscuamperfecto], name: 'Pluscuamperfecto' },
  i: { generators: [generatePreteritoAnterior], name: 'Pretérito anterior' },
  j: {
    generators: [generateCondicionalPerfecto],
    name: 'Condicional perfecto',
  },
  k: {
    generators: [generateImperativoAfirmativo],
    name: 'Imperativo afirmativo',
  },
  v: { generators: [], name: 'Include vosotros' },
};

export function generators() {
  const filter: (keyof typeof generatorConfig)[] =
    getSelectedCategories().split('') as (keyof typeof generatorConfig)[];

  const g = [];
  for (let key of filter) {
    if (generatorConfig[key]) {
      g.push(...Object.values(generatorConfig[key].generators));
    }
  }
  return g;
}

function initFilter() {
  const url = new URL(window.location.href);
  if (url.searchParams.get('filter')) {
    setSelectedCategories(url.searchParams.get('filter')!);
  }
  url.searchParams.set('filter', getSelectedCategories());
  window.history.replaceState(getSelectedCategories(), '', url.toString());
}
initFilter();

export function getSelectedCategories() {
  let filter = new Set();
  for (let key of (
    Cookies.get('filter') ?? 'abcv'
  ).split('')) {
    if (Object.keys(generatorConfig).includes(key)) filter.add(key);
  }
  return [...filter].sort().join('');
}

export function setSelectedCategories(categories: string) {
  cookiesSetSafe('filter', categories, { sameSite: 'strict', expires: 10000 });
  const url = new URL(window.location.href);
  url.searchParams.set('filter', getSelectedCategories());
  window.history.replaceState(getSelectedCategories(), '', url.toString());
}
