import { nonZero, randInt, sign } from '../randutils.js';
import { Matrix, Term } from '../algebra.js';
import { GeneratorResult } from './problemgenerators.js';

export function matrixScale(): GeneratorResult {
  const scalar = Term.generateSimpleNonTrivial();
  const w = randInt(2) + 1;
  const h = 2;
  const matrix = Matrix.generate(w, h, Term.generateSimple);

  return {
    prompt: `Simplify`,
    problem: `${scalar.renderAsFactor(true)} \\cdot ${matrix.renderTeX()}`,
    solution: `${matrix.scale(scalar).renderTeX()}`,
    explanation: `a \\cdot \\begin{pmatrix}x \\\\ y \\end{pmatrix} = \\begin{pmatrix}ax \\\\ ay \\end{pmatrix}`,
    steps: [],
    isTeX: true,
  };
}

export function dotProduct(): GeneratorResult {
  const w = 1;
  const h = randInt(2) + 2;
  const v1 = Matrix.generate(w, h, Term.generateSimple);
  const v2 = Matrix.generate(w, h, Term.generateSimple);

  return {
    prompt: `Simplify`,
    problem: `${v1.renderTeX()} \\cdot ${v2.renderTeX()}`,
    solution: `${v1.dot(v2)!.simplify().render()}`,
    explanation: `\\begin{pmatrix}a \\\\ b \\end{pmatrix} \\cdot \\begin{pmatrix}x \\\\ y \\end{pmatrix} = ab + xy`,
    steps: [`${v1.dot(v2)!.render()}`],
    isTeX: true,
  };
}

export function crossProduct(): GeneratorResult {
  const v1 = Matrix.generate(1, 3, Term.generateSimple);
  const v2 = Matrix.generate(1, 3, Term.generateSimple);

  return {
    prompt: `Simplify`,
    problem: `${v1.renderTeX()} \\times ${v2.renderTeX()}`,
    solution: `${v1.cross(v2)!.simplify().renderTeX()}`,
    explanation: `\\begin{pmatrix}a \\\\ b \\\\ c \\end{pmatrix} \\times \\begin{pmatrix}x \\\\ y \\\\ z \\end{pmatrix} = \\begin{pmatrix}bz - cy \\\\ cx - az \\\\ ay - bx \\end{pmatrix}`,
    steps: [`${v1.cross(v2)!.renderTeX()}`],
    isTeX: true,
  };
}

export function matrixAdd(): GeneratorResult {
  const w = randInt(2) + 1;
  const h = 2;

  const matrixA = Matrix.generate(w, h, Term.generateSimple);
  const matrixB = Matrix.generate(w, h, Term.generateSimple);

  const s = sign(0);

  console.log(s);

  return {
    prompt: `Add Matrices`,
    problem: `${matrixA.renderTeX()} ${s} ${matrixB.renderTeX()}`,
    solution: `${matrixA
      .add(matrixB.scale(Term.one.sign(s)))!
      .simplify()
      .renderTeX()}`,
    explanation: `\\begin{pmatrix} a \\\\ b \\end{pmatrix} + \\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix}a+x \\\\ b+y \\end{pmatrix}`,
    steps: [],
    isTeX: true,
  };
}

export function matrixMultiply(): GeneratorResult {
  const dim = randInt(2) + 2;

  const matrixA = Matrix.generate(
    dim,
    randInt(2) + 1,
    () => new Term(nonZero(-3, 3), ''),
  );
  const matrixB = Matrix.generate(
    randInt(2) + 1,
    dim,
    () => new Term(nonZero(-3, 3), ''),
  );

  return {
    prompt: `Multiply Matrices`,
    problem: `${matrixA.renderTeX()}${matrixB.renderTeX()}`,
    solution: `${matrixA.multiply(matrixB)!.simplify().renderTeX()}`,
    explanation:
      '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}\\begin{pmatrix} x & y \\\\ z & w \\end{pmatrix} = ' +
      '\\begin{pmatrix} ax + bz & ay + bw \\\\ cx + dz & cy + dw \\end{pmatrix}',
    steps: [`${matrixA.multiply(matrixB)!.renderTeX()}`],
    isTeX: true,
  };
}
