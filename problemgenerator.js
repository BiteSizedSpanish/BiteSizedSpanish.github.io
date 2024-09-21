import { nonZero, randVariableTerm, randVariable, randInclusive, sign } from "./randutils.js";

class Term {
    constructor(factor, variables) {
        this.factor = factor;
        this.variables = variables.split("").sort().join("");
    }

    static one = new Term(1, '');

    static generateSimple(baseFactor = Term.one) {
        return new Term(nonZero(-3, 3) * baseFactor.factor, randVariableTerm(1, 2) + baseFactor.variables);
    }

    static generate(baseFactor = Term.one) {
        return new Term(nonZero(-3, 3) * baseFactor.factor, randVariableTerm(2, 3) + baseFactor.variables);
    }

    static gcd(a, b) {
        if (b == 0)
            return a;
        return Term.gcd(b, a % b);
    }

    renderAsFactor(firstFactor = false) {
        if (this.factor < 0 && !firstFactor)
            return `(${this.render()})`;
        return this.render();
    }

    render(asOperand = false) {
        if (this.factor == 0)
            return '';
        if (this.variables.length == 0) {
            if (asOperand)
                return this.factor < 0 ? `- ${-this.factor}` : `+ ${this.factor}`;
            return `${this.factor}`;
        }

        let result = `${this.factor}`;
        if (this.factor == 1)
            result = '';
        if (this.factor == -1)
            result = '-';

        if (asOperand) {
            if (result.startsWith('-'))
                result = '- ' + result.substring(1);
            else
                result = '+ ' + result;
        }

        let prevVar = this.variables[0];
        let count = 0;
        for (let curVar of this.variables) {
            if (prevVar == curVar) {
                count++;
            } else {
                result += ` ${prevVar}`;
                if (count > 1)
                    result += `^${count}`;
                count = 1;
            }
            prevVar = curVar;
        }
        result += ` ${prevVar}`;
        if (count > 1)
            result += `^${count}`;

        return result;
    }

    add(term) {
        if (term.variables != this.variables)
            return null;
        return new Term(this.factor + term.factor, this.variables);
    }

    multiply(term) {
        return new Term(this.factor * term.factor, this.variables + term.variables);
    }

    divide(term) {
        const result = new Term(this.factor / term.factor, this.variables);
        for (let curVar of term.variables) {
            if (!result.variables.includes(curVar))
                return null;
            result.variables = result.variables.replace(curVar, '');
        }
        return result;
    }

    gcd(term) {
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

class TermSum {
    constructor(terms = []) {
        this.terms = terms.filter(t => t.factor != 0);
    }

    static generate(n, termGenerator, uniqueTerms = false) {
        let result = new TermSum();
        while (result.terms.length < n) {
            result.push(termGenerator());
            if (uniqueTerms)
                result = result.simplify();
        }
        return result;
    }

    push(term) {
        if (term.factor != 0)
            this.terms.push(term);
    }

    add(termSum) {
        const result = new TermSum(this.terms);
        for (let term of termSum.terms) {
            result.push(term);
        }
        return result
    }

    subtract(termSum) {
        const result = new TermSum(this.terms);
        for (let term of termSum.terms) {
            result.push(new Term(-term.factor, term.variables));
        }
        return result
    }

    renderAsFactor(firstFactor = false) {
        if (this.terms.length == 1) {
            return this.terms[0].renderAsFactor(firstFactor);
        }
        return `(${this.render()})`;
    }

    render() {
        let asOperand = false;
        let result = '';
        for (let term of this.terms) {
            result += ` ${term.render(asOperand)}`;
            asOperand = true;
        }
        return result;
    }

    renderFactoredOut(commonTerm = null) {

        if (commonTerm == null)
            commonTerm = this.gcd();
        else
            commonTerm = commonTerm.gcd(this.gcd());

        if (commonTerm.isOne() || this.terms.length <= 1)
            return this.render();

        return `${commonTerm.render()}(${this.divide(commonTerm).render()})`;
    }

    canSimplify() {
        return this.terms.length > this.simplify().terms.length;
    }

    simplify(steps = []) {
        const result = [];
        for (let term of this.terms) {
            let found = false;
            for (let j = 0; j < result.length; j++) {
                if (result[j].add(term)) {
                    result[j] = result[j].add(term);
                    found = true;
                    break;
                }
            }
            if (!found)
                result.push(term);
        }
        if (result.length < this.terms.length) {
            steps.push(`${this.render()} = `)
            steps.push(`${new TermSum(result).render()} = `)
        }
        return new TermSum(result);
    }

    canFactorOut() {
        return !this.gcd().isOne() && this.terms.length > 1;
    }

    gcd() {
        if (this.terms.length == 0)
            return new Term(1, '');
        let commonterm = new Term(Math.abs(this.terms[0].factor), this.terms[0].variables);
        for (let term of this.terms) {
            commonterm = commonterm.gcd(term);
        }
        return commonterm;
    }

    divide(divisor) {
        const result = new TermSum();
        for (let term of this.terms) {
            result.push(term.divide(divisor));
        }
        return result;
    }

    multiply(termSum) {
        const result = new TermSum();
        for (let term1 of this.terms) {
            for (let term2 of termSum.terms) {
                result.push(term1.multiply(term2));
            }
        }
        return result;
    }

    multiplyTerm(term) {
        const result = new TermSum();
        for (let term1 of this.terms) {
            result.push(term1.multiply(term));
        }
        return result;
    }
}

class SimpleFraction {
    constructor(numerator, denominator, sign = '') {
        this.numerator = numerator;
        this.denominator = denominator;
        this.sign = sign;
    }

    render() {
        if (this.numerator.terms.length == 0)
            return '0';
        if (this.denominator.factor == 1 && this.denominator.variables.length == 0)
            return this.sign + this.numerator.render();

        return `${this.sign}(${this.numerator.render()}) / (${this.denominator.render()})`;
    }

    renderFactoredOut() {
        return `${this.sign}(${this.numerator.renderFactoredOut()}) / (${this.denominator.render()})`;
    }

    simplifyNumerator(steps = []) {
        return new SimpleFraction(this.numerator.simplify(steps), this.denominator, this.sign);
    }

    canReduce() {
        return !this.numerator.gcd().gcd(this.denominator).isOne();
    }

    reduce(steps = []) {
        if (!this.canReduce()) {
            return this;
        }
        const commonterm = this.numerator.gcd().gcd(this.denominator);
        if (!commonterm.isOne()) {
            steps.push(`${this.render()} = `)
            steps.push(`${this.renderFactoredOut()} = `)
        }

        const num = this.numerator.divide(commonterm);
        const den = this.denominator.divide(commonterm);

        let sign = ''
        if (num.terms.length == 1) {
            sign = num.terms[0].factor * den.factor < 0 ? '-' : '';
            num.terms[0].factor = Math.abs(num.terms[0].factor);
            den.factor = Math.abs(den.factor);
        }

        const result = new SimpleFraction(num, den, sign);

        if (result.numerator.canFactorOut()) {
            steps.push(`${result.renderFactoredOut()} = `)
            steps.push(`${result.render()} = `)
        }

        return result;
    }
}

export function generateCombineSum() {
    let a = new Term(nonZero(-3, 3), randVariable(0));
    let b = new Term(nonZero(-3, 3), randVariable(0));
    return {
        prompt: `Simplify Sum (1)`,
        problem: `${a.render()} ${b.render(true)} = ?`,
        solution: `${a.add(b).render()}`
    };
}

export function generateCombineSumN() {
    let terms = TermSum.generate(4, Term.generateSimple);

    return {
        prompt: `Simplify Sum (2)`,
        problem: terms.render() + ' = ',
        solution: terms.simplify().render(),
    };
}

export function generateFactorOut() {
    const result = {
        prompt: `Factor out the common factor`,
        steps: [],
    };

    let commonTerm = Term.generate();
    let terms = TermSum.generate(randInclusive(2, 3), () => Term.generate(commonTerm), true);

    result.problem = `${terms.render()} = `;
    terms = terms.simplify(result.steps);
    result.solution = terms.renderFactoredOut();

    return result;
}

export function generateReduceSimpleFraction() {
    let commonTerm = Term.generate();

    let numerator = new TermSum([Term.generate(commonTerm)]);
    let denominator = Term.generate(commonTerm);

    let fraction = new SimpleFraction(numerator, denominator);

    return {
        prompt: `Simplify (1)`,
        problem: `${fraction.render()} = ?`,
        solution: `${fraction.reduce().render()}`
    };
}


export function generateReduceFractionSimpleDenominator() {
    const result = {
        prompt: `Simplify (2)`,
        steps: [],
    };

    let commonTerm = Term.generate();

    let numerator = TermSum.generate(
        randInclusive(1, 3),
        () => Term.generate(commonTerm));
    let denominator = Term.generate(commonTerm);

    let fraction = new SimpleFraction(numerator, denominator);
    result.problem = `${fraction.render()} = `;

    if (fraction.numerator.canSimplify()) {
        fraction = fraction.simplifyNumerator();
        result.steps.push(`${fraction.render()} = `)
    }

    fraction = fraction.reduce(result.steps);

    result.solution = `${fraction.render()}`;

    return result;
}

export function generateExpandFactoredTermSum() {
    let commonTerm = Term.generate();
    let sum = TermSum.generate(randInclusive(2, 3), () => Term.generate(commonTerm), true);

    return {
        prompt: `Expand (1)`,
        problem: `${sum.renderFactoredOut()} = `,
        solution: `${sum.render()}`
    };
}

export function generateExpandTermSumProduct() {
    const result = {
        prompt: `Expand (2)`,
        steps: [],
    }

    let sum1 = TermSum.generate(2, Term.generateSimple, true);
    let sum2 = TermSum.generate(2, Term.generateSimple, true);

    result.problem = `(${sum1.render()}) * (${sum2.render()}) = `;

    result.solution = `${sum1.multiply(sum2).simplify(result.steps).render()}`;

    return result;
}

export function generateAddFractionSimple() {
    const result = {
        prompt: `Add Fraction (1)`,
        steps: [],
    };

    let denominator = Term.generate();
    let numerator1 = TermSum.generate(randInclusive(1, 2), Term.generateSimple, true);
    let numerator2 = TermSum.generate(randInclusive(1, 2), Term.generateSimple, true);

    let fraction1 = new SimpleFraction(numerator1, denominator);
    let fraction2 = new SimpleFraction(numerator2, denominator);

    result.problem = `${fraction1.render()} ${sign(0)} ${fraction2.render()} = `;
    let sum =
        sign(0) === '+'
            ? new SimpleFraction(numerator1.add(numerator2), denominator)
            : new SimpleFraction(numerator1.subtract(numerator2), denominator);

    if (sum.numerator.canSimplify()) {
        result.steps.push(`${sum.render()} = `)
        sum = sum.simplifyNumerator();
    }

    sum = sum.reduce(result.steps);

    result.solution = `${sum.render()}`;

    return result;
}

export function generateAddFraction() {
    const result = {
        prompt: `Add Fraction (2)`,
        steps: [],
    };

    let fraction1 = new SimpleFraction(
        TermSum.generate(randInclusive(1, 2), Term.generateSimple, true),
        Term.generateSimple());
    let fraction2 = new SimpleFraction(
        TermSum.generate(randInclusive(1, 2), Term.generateSimple, true),
        Term.generateSimple());

    result.problem = `${fraction1.render()} ${sign(0)} ${fraction2.render()} = `;

    result.steps.push(
        `(${fraction1.numerator.renderAsFactor(true)} * ${fraction2.denominator.renderAsFactor()})` +
        ` / (${fraction1.denominator.renderAsFactor(true)} * ${fraction2.denominator.renderAsFactor()})` +
        ` ${sign(0)}` +
        ` (${fraction2.numerator.renderAsFactor(true)} * ${fraction1.denominator.renderAsFactor()})` +
        ` / (${fraction1.denominator.renderAsFactor(true)} * ${fraction2.denominator.renderAsFactor()}) =`);

    let denominator = fraction1.denominator.multiply(fraction2.denominator);
    let numerator1 = fraction1.numerator.multiplyTerm(fraction2.denominator);
    let numerator2 = fraction2.numerator.multiplyTerm(fraction1.denominator);
    fraction1 = new SimpleFraction(numerator1, denominator).simplifyNumerator(result.steps);
    fraction2 = new SimpleFraction(numerator2, denominator).simplifyNumerator(result.steps);
    result.steps.push(`${fraction1.render()} ${sign(0)} ${fraction2.render()} = `);

    let sum = sign(0) === '+'
        ? new SimpleFraction(fraction1.numerator.add(fraction2.numerator), denominator).simplifyNumerator(result.steps)
        : new SimpleFraction(fraction1.numerator.subtract(fraction2.numerator), denominator).simplifyNumerator(result.steps);

    sum = sum.reduce(result.steps);

    result.solution = `${sum.render()}`;

    return result;
}