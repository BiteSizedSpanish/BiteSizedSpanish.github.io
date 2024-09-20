import { nonZero, randVariableTerm, randVariable, randInclusive } from "./randutils.js";

class Term {
    constructor(factor, variables) {
        this.factor = factor;
        this.variables = variables.split("").sort().join("");
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
        const commonFactor = gcd(Math.abs(this.factor), Math.abs(term.factor));
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

    simplify() {
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

    simplifyNumerator() {
        return new SimpleFraction(this.numerator.simplify(), this.denominator, this.sign);
    }

    canReduce() {
        return !this.numerator.gcd().gcd(this.denominator).isOne();
    }

    reduce() {
        const commonterm = this.numerator.gcd().gcd(this.denominator);

        const num = this.numerator.divide(commonterm);
        const den = this.denominator.divide(commonterm);

        let sign = ''
        if (num.terms.length == 1) {
            sign = num.terms[0].factor * den.factor < 0 ? '-' : '';
            num.terms[0].factor = Math.abs(num.terms[0].factor);
            den.factor = Math.abs(den.factor);
        }

        return new SimpleFraction(num, den, sign);
    }
}

export function generateCombineSum() {
    let a = new Term(nonZero(-10, 10), randVariable(0));
    let b = new Term(nonZero(-10, 10), randVariable(0));
    return {
        prompt: `Simplify Sum (1)`,
        problem: `${a.render()} ${b.render(true)} = ?`,
        solution: `${a.add(b).render()}`
    };
}

export function generateCombineSumN(termCount, maxtermSize) {
    let terms = TermSum.generate(termCount, () => new Term(nonZero(-10, 10), randVariableTerm(maxtermSize)));

    return {
        prompt: `Simplify Sum (2)`,
        problem: terms.render() + ' = ',
        solution: terms.simplify().render(),
    };
}

function gcd(a, b) {
    if (b == 0)
        return a;
    return gcd(b, a % b);
}

export function generateFactorOut() {
    let commonFactor = randInclusive(1, 5);
    let commonVars = randVariableTerm(2);

    let terms = TermSum.generate(randInclusive(2, 4),
        () => new Term(nonZero(-3, 3) * commonFactor, randVariableTerm(2, 3) + commonVars));

    const problem = terms.render() + ' = ';
    let steps = [];
    if (terms.canSimplify() && terms.canFactorOut()) {
        terms = terms.simplify();
        steps.push(`${terms.render()} = `)
    }

    return {
        prompt: `Factor out the common factor`,
        problem,
        solution: terms.renderFactoredOut(),
        steps,
    };
}

export function generateReduceSimpleFraction() {
    let commonFactor = randInclusive(1, 5);
    let commonVars = randVariableTerm(2);

    let numerator = new TermSum([new Term(nonZero(-3, 3) * commonFactor, randVariableTerm(2, 3) + commonVars)]);
    let denominator = new Term(nonZero(-3, 3) * commonFactor, randVariableTerm(2, 3) + commonVars);

    let fraction = new SimpleFraction(numerator, denominator);

    return {
        prompt: `Simplify (1)`,
        problem: `${fraction.render()} = ?`,
        solution: `${fraction.reduce().render()}`
    };
}


export function generateReduceFractionSimpleDenominator() {
    let commonFactor = randInclusive(1, 5);
    let commonVars = randVariableTerm(2);

    let numerator = TermSum.generate(
        randInclusive(1, 3),
        () => new Term(nonZero(-3, 3) * commonFactor, randVariableTerm(2, 3) + commonVars));
    let denominator = new Term(nonZero(-3, 3) * commonFactor, randVariableTerm(2, 3) + commonVars);

    let fraction = new SimpleFraction(numerator, denominator);
    const problem = `${fraction.render()} = `;

    let steps = [];
    if (fraction.numerator.canSimplify()) {
        fraction = fraction.simplifyNumerator();
        steps.push(`${fraction.render()} = `)
    }

    if (fraction.canReduce()) {
        if (fraction.numerator.canFactorOut())
            steps.push(`${fraction.renderFactoredOut()} = `)
        fraction = fraction.reduce();
        if (fraction.numerator.canFactorOut()) {
            steps.push(`${fraction.renderFactoredOut()} = `)
        }
    }

    return {
        prompt: `Simplify (2)`,
        problem,
        solution: `${fraction.render()}`,
        steps,
    };
}