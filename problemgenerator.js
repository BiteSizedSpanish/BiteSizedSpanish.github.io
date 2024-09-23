import { nonZero, randVariableTerm, randVariable, randInclusive, sign } from "./randutils.js";
import { Term, TermSum, SimpleFraction, Power } from "./algebra.js";

export function generateCombineSum() {
    let a = new Term(nonZero(-3, 3), randVariable(0));
    let b = new Term(nonZero(-3, 3), randVariable(0));
    return {
        prompt: `Simplify Sum (1)`,
        problem: `${a.render()} ${b.render(true)}`,
        solution: `${a.add(b).render()}`,
        explanation: `2x + 3x = (2+3)x = 5x`
    };
}

export function generateCombineSumN() {
    let terms = TermSum.generate(4, Term.generateSimple);

    return {
        prompt: `Simplify Sum (2)`,
        problem: terms.render(),
        solution: terms.simplify().render(),
        explanation: `2x + 3x + 5y - 2y = (2+3)x + (5-2)y = 5x + 3y`
    };
}

export function generateFactorOut() {
    const result = {
        prompt: `Factor out the common factor`,
        steps: [],
        explanation: `ax ± bx = (a±b)x`,
    };

    let commonTerm = Term.generate();
    let terms = TermSum.generate(randInclusive(2, 3), () => Term.generate(commonTerm), true);

    result.problem = `${terms.render()}`;
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
        problem: `${fraction.render()}`,
        solution: `${fraction.reduce().render()}`,
        explanation: `(ax) / (bx) = a / b`
    };
}


export function generateReduceFractionSimpleDenominator() {
    const result = {
        prompt: `Simplify (2)`,
        steps: [],
        explanation: `(ax) / (bx) = a / b`,
    };

    let commonTerm = Term.generate();

    let numerator = TermSum.generate(
        randInclusive(1, 3),
        () => Term.generate(commonTerm));
    let denominator = Term.generate(commonTerm);

    let fraction = new SimpleFraction(numerator, denominator);
    result.problem = `${fraction.render()}`;

    if (fraction.numerator.canSimplify()) {
        fraction = fraction.simplifyNumerator();
        result.steps.push(`${fraction.render()}`)
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
        problem: `${sum.renderFactoredOut()}`,
        solution: `${sum.render()}`,
        explanation: `(a±b)x = ax ± bx`
    };
}

export function generateExpandTermSumProduct() {
    const result = {
        prompt: `Expand (2)`,
        steps: [],
        explanation: `(a+b)(c+d) = ac + ad + bc + bd`,
    }

    let sum1 = TermSum.generate(2, Term.generateSimple, true);
    let sum2 = TermSum.generate(2, Term.generateSimple, true);

    result.problem = `(${sum1.render()}) * (${sum2.render()})`;

    result.solution = `${sum1.multiply(sum2).simplify(result.steps).render()}`;

    return result;
}

export function generateAddFractionCommonDenominator() {
    const result = {
        prompt: `Add Fraction (1)`,
        steps: [],
        explanation: `a / x ± b / x = (a±b) / x`,
    };

    let denominator = Term.generate();
    let numerator1 = TermSum.generate(randInclusive(1, 2), Term.generateSimple, true);
    let numerator2 = TermSum.generate(randInclusive(1, 2), Term.generateSimple, true);

    let fraction1 = new SimpleFraction(numerator1, denominator);
    let fraction2 = new SimpleFraction(numerator2, denominator);

    result.problem = `${fraction1.render()} ${sign(0)} ${fraction2.render()}`;
    let sum =
        sign(0) === '+'
            ? new SimpleFraction(numerator1.add(numerator2), denominator)
            : new SimpleFraction(numerator1.subtract(numerator2), denominator);

    if (sum.numerator.canSimplify()) {
        result.steps.push(`${sum.render()}`)
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
        explanation: `a / x + b / y = (ay + bx) / (xy)`,
    };

    let fraction1 = new SimpleFraction(
        TermSum.generate(randInclusive(1, 2), Term.generateSimple, true),
        Term.generateSimple());
    let fraction2 = new SimpleFraction(
        TermSum.generate(randInclusive(1, 2), Term.generateSimple, true),
        Term.generateSimple());

    result.problem = `${fraction1.render()} ${sign(0)} ${fraction2.render()}`;

    const expansion1 = fraction1.denominator.lcm(fraction2.denominator).divide(fraction1.denominator);
    const expansion2 = fraction1.denominator.lcm(fraction2.denominator).divide(fraction2.denominator);

    if (expansion1.isOne())
        result.steps.push(
            `(${fraction1.numerator.renderAsFactor(true)})` +
            ` / (${fraction1.denominator.renderAsFactor(true)})` +
            ` ${sign(0)}` +
            ` (${fraction2.numerator.renderAsFactor(true)} * ${expansion2.renderAsFactor()})` +
            ` / (${fraction2.denominator.renderAsFactor(true)} * ${expansion2.renderAsFactor()})`);
    else if (expansion2.isOne())
        result.steps.push(
            `(${fraction1.numerator.renderAsFactor(true)} * ${expansion1.renderAsFactor()})` +
            ` / (${fraction1.denominator.renderAsFactor(true)} * ${expansion1.renderAsFactor()})` +
            ` ${sign(0)}` +
            ` (${fraction2.numerator.renderAsFactor(true)})` +
            ` / (${fraction2.denominator.renderAsFactor(true)})`);
    else
        result.steps.push(
            `(${fraction1.numerator.renderAsFactor(true)} * ${expansion1.renderAsFactor()})` +
            ` / (${fraction1.denominator.renderAsFactor(true)} * ${expansion1.renderAsFactor()})` +
            ` ${sign(0)}` +
            ` (${fraction2.numerator.renderAsFactor(true)} * ${expansion2.renderAsFactor()})` +
            ` / (${fraction2.denominator.renderAsFactor(true)} * ${expansion2.renderAsFactor()})`);

    let denominator = fraction1.denominator.multiply(expansion1);
    let numerator1 = fraction1.numerator.multiplyTerm(expansion1);
    let numerator2 = fraction2.numerator.multiplyTerm(expansion2);  
    fraction1 = new SimpleFraction(numerator1, denominator).simplifyNumerator(result.steps);
    fraction2 = new SimpleFraction(numerator2, denominator).simplifyNumerator(result.steps);
    result.steps.push(`${fraction1.render()} ${sign(0)} ${fraction2.render()}`);

    let sum = sign(0) === '+'
        ? new SimpleFraction(fraction1.numerator.add(fraction2.numerator), denominator).simplifyNumerator(result.steps)
        : new SimpleFraction(fraction1.numerator.subtract(fraction2.numerator), denominator).simplifyNumerator(result.steps);

    sum = sum.reduce(result.steps);

    result.solution = `${sum.render()}`;

    return result;
}

export function generateSeparateFraction() {
    const result = {
        prompt: `Separate Fraction`,
        steps: [],
        explanation: `(a ± b) / x = a / x ± b / x`,
    };

    let fraction = new SimpleFraction(
        TermSum.generate(randInclusive(2, 4), Term.generate, true),
        Term.generateSimple());

    result.problem = `${fraction.render()}`;

    let separatedFractions = fraction.numerator.terms.map(term => {
        return new SimpleFraction(new TermSum([new Term(Math.abs(term.factor), term.variables)]), fraction.denominator, term.factor < 0 ? '-' : '+');
    })
    if (separatedFractions[0].sign == '+')
        separatedFractions[0].sign = '';

    result.steps.push(separatedFractions.map(f => f.render()).join(' '));
    result.solution = separatedFractions.map(f => f.reduce().render()).join(' ');
    return result;
}

export function generateMultiplyFraction() {
    const result = {
        prompt: `Multiply Fraction (2)`,
        steps: [],
        explanation: `a / x * b / y = (ab) / (xy)`,
    }

    let fraction1 = new SimpleFraction(
        TermSum.generate(randInclusive(1, 2), Term.generateSimple),
        Term.generateSimple());
    let fraction2 = new SimpleFraction(
        TermSum.generate(randInclusive(1, 2), Term.generateSimple),
        Term.generateSimple());

    result.problem = `${fraction1.render()} * ${fraction2.render()}`;

    let simplifySteps = [];
    fraction1 = fraction1.simplifyNumerator(simplifySteps);
    result.steps.push(...simplifySteps.map(s => `${s} * ${fraction2.render()}`))
    simplifySteps = [];
    fraction2 = fraction2.simplifyNumerator(simplifySteps);
    result.steps.push(...simplifySteps.map(s => `${fraction1.render()} * ${s}`))

    if (fraction1.isZero() || fraction2.isZero()) {
        result.solution = `0`;
        return result;
    }

    let product = new SimpleFraction(fraction1.numerator.multiply(fraction2.numerator), fraction1.denominator.multiply(fraction2.denominator))

    result.steps.push(`(${fraction1.numerator.renderAsFactor(true)} * ${fraction2.numerator.renderAsFactor()}) / (${fraction1.denominator.renderAsFactor(true)} * ${fraction2.denominator.renderAsFactor()})`);
    product = product.simplifyNumerator(result.steps);
    product = product.reduce(result.steps);

    result.solution = `${product.render()}`;

    return result;
}

export function generateExponentAddition() {
    const result = {
        prompt: `Simplify`,
        steps: [],
        explanation: '`different exponents cannot be added together`',
    };

    const term1 = new Term(nonZero(-5, 5), randVariable(0).repeat(randInclusive(2, 4)));
    const term2 = new Term(nonZero(-5, 5), randVariable(0).repeat(randInclusive(2, 4)));

    const sum = new TermSum([term1, term2]);
    result.problem = sum.render();
    result.solution = sum.simplify().render();
    return result;
}

export function generateExponentMultiplication() {
    const result = {
        prompt: `Simplify`,
        steps: [],
        explanation: `a^x * a^y = a^(x+y)`,
    };

    const term1 = new Term(nonZero(-3, 3), randVariable(0).repeat(randInclusive(2, 4)));
    const term2 = new Term(nonZero(-3, 3), randVariable(0).repeat(randInclusive(2, 4)));

    result.problem = `${term1.renderAsFactor(true)} * ${term2.renderAsFactor()}`;
    result.solution = term1.multiply(term2).render();
    return result;
}

export function generateExponentExponentiation() {
    const result = {
        prompt: `Simplify`,
        steps: [],
        explanation: `(a^x)^y = a^(x*y)`,
    };

    const term1 = Term.generateSingleValue();
    const term2 = new Term(nonZero(-3, 3), randVariable(1));
    const term3 = new Term(nonZero(-3, 3), randVariable(2));

    const power = new Power(term1, term2);

    result.problem = `(${power.render()})^(${term3.render()})`;
    result.solution = power.exponentiate(term3).simplify().render();
    return result;
}

export function generateMultiplicationExponentiation() {
    const result = {
        prompt: `Write without brackets`,
        steps: [],
        explanation: `(a*b)^x = a^x * b^x`,
    };

    const term1 = new Term(1, randVariable(0));
    const term2 = new Term(1, randVariable(1));
    const exponent = Term.generateSingleValue();

    result.problem = `(${term1.renderAsFactor(true)} * ${term2.renderAsFactor()})^(${exponent.render()})`;

    if (exponent.isOne()) {
        result.solution = `${term1.renderAsFactor(true)} * ${term2.renderAsFactor()}`;
        return result;
    }

    result.solution = `${term1.renderAsBase()}^(${exponent.render()}) * ${term2.renderAsBase()}^(${exponent.render()})`;
    return result;
}

export function generateBinomial() {
    const result = {
        prompt: `Expand`,
        steps: [],
        explanation: `(a±b)^2 = a^2 ± 2ab + b^2`,
    };

    const t1 = new Term(nonZero(-3, 3), randVariableTerm(1, 3));
    const t2 = new Term(nonZero(-3, 3), randVariableTerm(1, 3));

    const terms = new TermSum([t1, t2]);
    result.problem = `(${terms.render()})^(2)`;

    if (terms.canSimplify()) {
        if (terms.simplify().isZero()) {
            result.solution = `0`;
            return result;
        }
        result.steps.push(`${terms.simplify().terms[0].renderAsBase()}^(2)`);
        result.solution = `${new Power(terms.simplify().terms[0], new Term(2, '')).simplify().render()}`;
        return result;
    }

    const sum = new TermSum([
        t1.multiply(t1),
        t1.multiply(t2).multiply(new Term(2, '')),
        t2.multiply(t2),
    ]);

    result.solution = `${sum.render()}`;
    return result;
}