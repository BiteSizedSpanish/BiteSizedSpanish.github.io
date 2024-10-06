import { nonZero, randInt } from '../randutils.js';
import { Term, TermSum } from '../algebra.js';
import { GeneratorResult } from './problemgenerators.js';

export function generateDeriveTermSum(): GeneratorResult {
  const v = 'x';
  let sum = TermSum.generate(
    randInt(3) + 1,
    () => new Term(nonZero(-3, 3), v.repeat(randInt(5))),
    true,
  );

  return {
    prompt: `Derive`,
    problem: `d/(d${v}) ${sum.renderAsFactor()}`,
    solution: `${sum.derive(v).render()}`,
    explanation: `x^a = a*x^(a-1)`,
    steps: [],
  };
}

export function generateDeriveCommonFunctions(): GeneratorResult {
const v = 'x';
  const options = [
    {
      problem: `sin(${v})`,
      solution: `cos(${v})`,
      explanation: `d/dx sin(x) = cos(x)`,
    },
    {
      problem: `cos(${v})`,
      solution: `-sin(${v})`,
      explanation: `d/dx cos(x) = -sin(x)`,
    },
    {
      problem: `e^${v}`,
      solution: `e^${v}`,
      explanation: `d/dx e^x = e^x`,
    },
    {
      problem: `ln(${v})`,
      solution: `1/${v}`,
      explanation: `d/dx ln(x) = 1/x`,
    },
  ];

  const option = options[randInt(options.length)];

  return {
    prompt: `Derive`,
    problem: `d/(d${v}) ${option.problem}`,
    solution: `${option.solution}`,
    explanation: `${option.explanation}`,
    steps: [],
  };
}
