import { nonZero, randVariableTerm, randInt } from './randutils.js';

export class Term {
  variables: string;

  constructor(
    public factor: number,
    variables: string,
  ) {
    this.variables = variables.split('').sort().join('');
  }

  static one = new Term(1, '');
  static zero = new Term(0, '');

  static generateSingleValue(positive = false) {
    if (randInt(3) == 0)
      return new Term(positive ? nonZero(-3, 3) : nonZero(1, 3), '');
    else return new Term(1, randVariableTerm(1, 2));
  }

  static generateSimple(baseFactor = Term.one) {
    return new Term(
      nonZero(-3, 3) * baseFactor.factor,
      randVariableTerm(1, 2) + baseFactor.variables,
    );
  }

  static generate(baseFactor = Term.one) {
    return new Term(
      nonZero(-3, 3) * baseFactor.factor,
      randVariableTerm(2, 3) + baseFactor.variables,
    );
  }

  static generateNonTrivial() {
    while (true) {
      const term = Term.generate();
      if (!term.abs().isOne()) {
        return term;
      }
    }
  }

  static generateSimpleNonTrivial() {
    while (true) {
      const term = Term.generateSimple();
      if (!term.abs().isOne()) {
        return term;
      }
    }
  }

  static gcd(a: number, b: number): number {
    if (b == 0) {
      return a;
    }
    return Term.gcd(b, a % b);
  }

  renderAsBase() {
    if (
      (this.factor > 0 && this.variables.length == 0) ||
      (this.factor == 1 && this.variables.length <= 1)
    )
      return this.render();
    return `(${this.render()})`;
  }

  renderAsFactor(firstFactor = false) {
    if (this.factor < 0 && !firstFactor) {
      return `(${this.render()})`;
    }
    return this.render();
  }

  render(asOperand = false) {
    if (this.factor == 0) {
      return '';
    }
    if (this.variables.length == 0) {
      if (asOperand)
        return this.factor < 0 ? `- ${-this.factor}` : `+ ${this.factor}`;
      return `${this.factor}`;
    }

    let result = `${this.factor}`;
    if (this.factor == 1) result = '';
    if (this.factor == -1) result = '-';

    if (asOperand) {
      if (result.startsWith('-')) result = '- ' + result.substring(1);
      else result = '+ ' + result;
    }

    let prevVar = this.variables[0];
    let count = 0;
    for (let curVar of this.variables) {
      if (prevVar == curVar) {
        count++;
      } else {
        result += ` ${prevVar}`;
        if (count > 1) result += `^${count}`;
        count = 1;
      }
      prevVar = curVar;
    }
    result += ` ${prevVar}`;
    if (count > 1) result += `^${count}`;

    return result;
  }

  add(term: Term) {
    if (term.variables != this.variables) {
      return null;
    }
    return new Term(this.factor + term.factor, this.variables);
  }

  multiply(term: Term) {
    return new Term(this.factor * term.factor, this.variables + term.variables);
  }

  divide(term: Term) {
    const result = new Term(this.factor / term.factor, this.variables);
    for (let curVar of term.variables) {
      if (!result.variables.includes(curVar)) {
        return null;
      }
      result.variables = result.variables.replace(curVar, '');
    }
    return result;
  }

  abs() {
    return new Term(Math.abs(this.factor), this.variables);
  }

  negative() {
    return new Term(-this.factor, this.variables);
  }

  sign(s: string) {
    if (s == '-') {
      return this.negative();
    }
    return this;
  }

  derive(variable: string) {
    const power = this.variables.split('').filter((v) => v == variable).length;
    if (power == 0) {
      return Term.zero;
    }
    return new Term(
      this.factor * power,
      this.variables.replaceAll(variable, '') + variable.repeat(power - 1),
    );
  }

  lcm(term: Term) {
    return this.multiply(term).abs().divide(this.gcd(term))!;
  }

  gcd(term: Term) {
    const commonFactor = Term.gcd(Math.abs(this.factor), Math.abs(term.factor));
    let commonVariables = '';
    let othertermVariables = term.variables;

    for (let curVar of this.variables) {
      if (othertermVariables.includes(curVar)) {
        commonVariables += curVar;
        othertermVariables = othertermVariables.replace(curVar, '');
      }
    }
    return new Term(commonFactor, commonVariables);
  }

  isZero() {
    return this.factor == 0;
  }

  isOne() {
    return this.factor == 1 && this.variables.length == 0;
  }
}

export class TermSum {
  public terms: Term[];
  constructor(terms: Term[] = []) {
    this.terms = terms.filter((t) => t.factor != 0);
  }

  static generate(n: number, termGenerator: () => Term, uniqueTerms = false) {
    let result = new TermSum();
    while (result.terms.length < n) {
      result.push(termGenerator());
      if (uniqueTerms) result = result.simplify();
    }
    return result;
  }

  push(term: Term) {
    if (term.factor != 0) this.terms.push(term);
  }

  add(termSum: TermSum) {
    const result = new TermSum(this.terms);
    for (let term of termSum.terms) {
      result.push(term);
    }
    return result;
  }

  subtract(termSum: TermSum) {
    const result = new TermSum(this.terms);
    for (let term of termSum.terms) {
      result.push(new Term(-term.factor, term.variables));
    }
    return result;
  }

  renderAsFactor(firstFactor = false) {
    if (this.isZero()) {
      return '0';
    }
    if (this.terms.length == 1) {
      return this.terms[0].renderAsFactor(firstFactor);
    }
    return `(${this.render()})`;
  }

  render() {
    if (this.isZero()) {
      return '0';
    }
    let asOperand = false;
    let result = '';
    for (let term of this.terms) {
      result += ` ${term.render(asOperand)}`;
      asOperand = true;
    }
    return result;
  }

  renderFactoredOut(commonTerm: Term | null = null) {
    if (!commonTerm) commonTerm = this.gcd();

    if (commonTerm.isOne() || this.terms.length <= 1) {
      return this.render();
    }

    return `${commonTerm.render()}(${this.divide(commonTerm)?.render()})`;
  }

  canSimplify() {
    return this.terms.length > this.simplify().terms.length;
  }

  simplify(steps: string[] = []) {
    const result: Term[] = [];
    for (let term of this.terms) {
      let found = false;
      for (let j = 0; j < result.length; j++) {
        const addResult = result[j].add(term);
        if (addResult) {
          result[j] = addResult;
          found = true;
          break;
        }
      }
      if (!found) result.push(term);
    }
    if (result.length < this.terms.length) {
      steps.push(`${this.render()}`);
      steps.push(`${new TermSum(result).render()}`);
    }
    return new TermSum(result);
  }

  canFactorOut() {
    return !this.gcd().isOne() && this.terms.length > 1;
  }

  gcd() {
    if (this.terms.length == 0) {
      return new Term(1, '');
    }
    let commonterm = new Term(
      Math.abs(this.terms[0].factor),
      this.terms[0].variables,
    );
    for (let term of this.terms) {
      commonterm = commonterm.gcd(term);
    }
    return commonterm;
  }

  divide(divisor: Term) {
    const result = new TermSum();
    for (let term of this.terms) {
      const divideResult = term.divide(divisor);
      if (!divideResult) {
        return null;
      }
      result.push(divideResult);
    }
    return result;
  }

  multiply(termSum: TermSum) {
    const result = new TermSum();
    for (let term1 of this.terms) {
      for (let term2 of termSum.terms) {
        result.push(term1.multiply(term2));
      }
    }
    return result;
  }

  multiplyTerm(term: Term) {
    const result = new TermSum();
    for (let term1 of this.terms) {
      result.push(term1.multiply(term));
    }
    return result;
  }

  derive(variable: string) {
    const result = new TermSum();
    for (let term of this.terms) {
      result.push(term.derive(variable));
    }
    return result;
  }

  isZero() {
    return this.terms.length == 0;
  }

  negative() {
    const result = new TermSum();
    for (let term of this.terms) {
      result.push(term.negative());
    }
    return result;
  }
}

export class SimpleFraction {
  static one = new SimpleFraction(
    new TermSum([new Term(1, '')]),
    new Term(1, ''),
  );

  constructor(
    public numerator: TermSum,
    public denominator: Term,
    public sign: string = '',
  ) {}

  render() {
    if (this.isZero()) {
      return '0';
    }
    if (this.denominator.isOne()) {
      if (
        this.numerator.terms.length == 1 &&
        this.numerator.terms[0].factor > 0
      )
        return this.sign + this.numerator.render();
      else return `${this.sign}(${this.numerator.render()})`;
    }

    return `${this.sign}(${this.numerator.render()}) / (${this.denominator.render()})`;
  }

  renderFactoredOut({ negative } = { negative: false }) {
    let factorOut = this.numerator.gcd();
    if (negative) factorOut = factorOut.negative();
    return `${this.sign}(${this.numerator.renderFactoredOut(factorOut)}) / (${this.denominator.render()})`;
  }

  simplifyNumerator(steps: string[] = []) {
    const result = new SimpleFraction(
      this.numerator.simplify(),
      this.denominator,
      this.sign,
    );
    if (this.numerator.canSimplify()) {
      steps.push(`${this.render()}`);
      steps.push(`${result.render()}`);
    }
    return result;
  }

  canReduce() {
    return !this.numerator.gcd().gcd(this.denominator).isOne();
  }

  reduce(steps: string[] = []) {
    let num = new TermSum(
      this.numerator.terms.map((t) => new Term(t.factor, t.variables)),
    );
    let den = new Term(this.denominator.factor, this.denominator.variables);

    let sign = this.sign;
    if (num.terms.length == 1) {
      if (sign == '-') sign = num.terms[0].factor * den.factor < 0 ? '+' : '-';
      else sign = num.terms[0].factor * den.factor < 0 ? '-' : this.sign;
      num.terms[0].factor = Math.abs(num.terms[0].factor);
      den.factor = Math.abs(den.factor);
    }

    if (!this.canReduce()) {
      return new SimpleFraction(num, den, sign);
    }
    const commonterm = num.gcd().gcd(den);
    const negate = den.divide(commonterm)!.negative().isOne();
    if (!commonterm.isOne()) {
      steps.push(`${this.render()}`);
      steps.push(`<hidden>${this.renderFactoredOut({ negative: negate })}`);
    }
    num = num.divide(commonterm)!;
    den = den.divide(commonterm)!;

    if (negate) {
      num = num.negative();
      den = Term.one;
    }

    const result = new SimpleFraction(num, den, sign);

    if (result.numerator.canFactorOut()) {
      steps.push(`<hidden>${result.renderFactoredOut()}`);
      steps.push(`${result.render()}`);
    }

    return result;
  }

  isZero() {
    return this.numerator.isZero();
  }
}

export class Power {
  constructor(
    public base: Term,
    public exponent: Term,
  ) {}

  exponentiate(exponent: Term) {
    return new Power(this.base, this.exponent.multiply(exponent));
  }

  simplify() {
    if (this.base.isOne() || this.exponent.isZero())
      return new Power(new Term(1, ''), new Term(0, ''));
    if (this.base.isZero()) {
      return new Power(new Term(0, ''), new Term(1, ''));
    }

    return new Power(this.base, this.exponent);
  }

  moveToFactorBase() {
    if (this.base.variables.length > 0 || this.exponent.factor == 1)
      return new Power(this.base, this.exponent);

    const base = new Term(Math.pow(this.base.factor, this.exponent.factor), '');
    const exponent = new Term(1, this.exponent.variables);

    return new Power(base, exponent);
  }

  render() {
    if (this.base.isOne() && this.exponent.isZero()) {
      return '1';
    }
    if (this.exponent.isOne()) {
      return `${this.base.render()}`;
    }
    return `${this.base.renderAsBase()}^(${this.exponent.render()})`;
  }
}

export class Matrix {
  public rows: TermSum[][];
  constructor(rows_: (TermSum | Term)[][]) {
    this.rows = rows_.map((row) =>
      row.map((term) => {
        if (term instanceof Term) {
          return new TermSum([term]);
        }
        return term;
      }),
    );
  }

  static generate(w: number, h: number, termGenerator: () => TermSum | Term) {
    const rows = [];
    for (let i = 0; i < h; i++) {
      rows.push(new Array(w).fill(0).map(() => termGenerator()));
    }
    return new Matrix(rows);
  }

  width() {
    return this.rows[0].length;
  }

  height() {
    return this.rows.length;
  }

  isVector() {
    return this.width() == 1;
  }

  scale(scalar: Term) {
    return new Matrix(
      this.rows.map((row) => row.map((term) => term.multiplyTerm(scalar))),
    );
  }

  add(matrix: Matrix) {
    if (this.width() != matrix.width() || this.height() != matrix.height()) {
      console.error('matrix addition for invalid matrices', this, matrix);
      return null;
    }

    return new Matrix(
      this.rows.map((row, i) =>
        row.map((term, j) => term.add(matrix.rows[i][j])),
      ),
    );
  }

  dot(matrix: Matrix) {
    if (
      !this.isVector() ||
      !matrix.isVector() ||
      this.height() != matrix.height()
    ) {
      console.error('dot product for invalid vectors', this, matrix);
      return null;
    }

    return this.rows.reduce(
      (acc, row, i) => acc.add(row[0].multiply(matrix.rows[i][0])),
      new TermSum(),
    );
  }

  cross(matrix: Matrix) {
    if (
      !this.isVector() ||
      !matrix.isVector() ||
      this.height() != 3 ||
      matrix.height() != 3
    ) {
      console.error('cross product for invalid vectors', this, matrix);
      return null;
    }

    const a = this.rows[0][0];
    const b = this.rows[1][0];
    const c = this.rows[2][0];
    const x = matrix.rows[0][0];
    const y = matrix.rows[1][0];
    const z = matrix.rows[2][0];

    return new Matrix([
      [b.multiply(z).add(c.multiply(y).negative())],
      [c.multiply(x).add(a.multiply(z).negative())],
      [a.multiply(y).add(b.multiply(x).negative())],
    ]);
  }

  multiply(matrix: Matrix) {
    if (this.width() != matrix.height()) {
      console.error('matrix multiplication for invalid matrices', this, matrix);
      return null;
    }

    const result = Matrix.generate(matrix.width(), this.height(), () => new TermSum([]));

    for (let i = 0; i < this.height(); i++) {
      for (let j = 0; j < matrix.width(); j++) {
        for (let k = 0; k < this.width(); k++) {
          result.rows[i][j] = result.rows[i][j].add(
            this.rows[i][k].multiply(matrix.rows[k][j]),
          );
        }
      }
    }

    return result;
  }

  simplify() {
    return new Matrix(
      this.rows.map((row) => row.map((term) => term.simplify())),
    );
  }

  renderTeX() {
    if (this.rows.length === 1 && this.rows[0].length === 1) {
      return this.rows[0][0].render();
    }
    return (
      '\\begin{pmatrix}' +
      this.rows
        .map((row) => {
          return row
            .map((term) => {
              return term.render();
            })
            .join(' & ');
        })
        .join(' \\\\ ') +
      '\\end{pmatrix}'
    );
  }
}
