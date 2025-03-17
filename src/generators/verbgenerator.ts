import { getRandomVerb } from '../verbs.js';
import { GeneratorResult } from './problemgenerators.js';
import Cookies from 'js-cookie';

const form_1s = 'form_1s';
const form_2s = 'form_2s';
const form_3s = 'form_3s';
const form_1p = 'form_1p';
const form_2p = 'form_2p';
const form_3p = 'form_3p';

const formNames: any = {
  form_1s: ['yo'],
  form_2s: ['tú'],
  form_3s: ['él', 'ella', 'usted'],
  form_1p: ['nosotros', 'nosotras'],
  form_2p: ['vosotros', 'vosotras'],
  form_3p: ['ellos', 'ellas', 'ustedes'],
};

function generateVerb(
  tense: string,
  mood: string = 'Indicativo',
): GeneratorResult {
  const verb: any = getRandomVerb(tense, mood);

  let forms = [form_1s, form_2s, form_3s, form_1p, form_2p, form_3p];
  if (!(Cookies.get('filter') ?? '').includes('v')) {
    forms = [form_1s, form_2s, form_3s, form_1p, form_3p];
  }

  const form: string = forms[Math.floor(Math.random() * forms.length)];

  return {
    tense: `${verb['tense']}`,
    form: `(${formNames[form][Math.floor(Math.random() * formNames[form].length)]})`,
    verb: `${verb['infinitive']}`,
    conjugation: `${verb[form]}`,
    english: `${verb['infinitive_english'].split(';')[0]}`,
    table: [
      verb[form_1s],
      verb[form_2s],
      verb[form_3s],
      verb[form_1p],
      verb[form_2p],
      verb[form_3p],
    ],
  };
}

export function generatePresente(): GeneratorResult {
  return generateVerb('Presente');
}
export function generateFuturo(): GeneratorResult {
  return generateVerb('Futuro');
}
export function generateImperfecto(): GeneratorResult {
  return generateVerb('Imperfecto');
}
export function generatePreterito(): GeneratorResult {
  return generateVerb('Pretérito');
}
export function generateCondicional(): GeneratorResult {
  return generateVerb('Condicional');
}
export function generatePresentePerfecto(): GeneratorResult {
  return generateVerb('Presente perfecto');
}
export function generateFuturoPerfecto(): GeneratorResult {
  return generateVerb('Futuro perfecto');
}
export function generatePluscuamperfecto(): GeneratorResult {
  return generateVerb('Pluscuamperfecto');
}
export function generatePreteritoAnterior(): GeneratorResult {
  return generateVerb('Pretérito anterior');
}
export function generateCondicionalPerfecto(): GeneratorResult {
  return generateVerb('Condicional perfecto');
}

export function generateImperativoAfirmativo(): GeneratorResult {
  let result = generateVerb('Presente', 'Imperativo Afirmativo');
  result.tense = 'Imperativo afirmativo';
  return result;
}
