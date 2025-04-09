import { getRandomCommonVerb, getRandomVerb } from '../verbs.js';
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
  let verb: any = getRandomCommonVerb(tense, mood);
  if (!(Cookies.get('filter') ?? '').includes('w')) {
    verb = getRandomVerb(tense, mood);
  }


  let forms = [form_1s, form_2s, form_3s, form_1p, form_2p, form_3p];
  if (!(Cookies.get('filter') ?? '').includes('v')) {
    forms = [form_1s, form_2s, form_3s, form_1p, form_3p];
  }

  let form_i = Math.floor(Math.random() * forms.length);
  let form = forms[form_i];
  // some verb moods do not contain all forms (e.g. imperativo)
  while (!verb[form]) {
    form = forms[++form_i % forms.length];
    if (form_i > 100)
      throw new Error('No valid forms found for verb');
  }

  return {
    tense: `${verb['tense']}`,
    form: `(${formNames[form][Math.floor(Math.random() * formNames[form].length)]})`,
    verb: `${verb['infinitive']}`,
    conjugation: `${verb[form]}`,
    english: `${verb['infinitive_english'].split(';')[0]}`,
    allForms: {
      form_1s: verb[form_1s],
      form_2s: verb[form_2s],
      form_3s: verb[form_3s],
      form_1p: verb[form_1p],
      form_2p: verb[form_2p],
      form_3p: verb[form_3p],
    },
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
  return generateVerb('Imperativo afirmativo', 'Imperativo Afirmativo');
}

export function generateImperativoNegativo(): GeneratorResult {
  return generateVerb('Imperativo negativo', 'Imperativo Negativo');
}
