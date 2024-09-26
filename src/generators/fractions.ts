import { randInclusive, sign } from "../randutils.js";
import { Term, TermSum, SimpleFraction } from "../algebra.js";
import { GeneratorResult } from "./problemgenerators.js";

export function generateReduceFractionSimpleDenominator(): GeneratorResult {
    const result: GeneratorResult = {
        prompt: `Simplify`,
        steps: [],
        explanation: `(ax) / (bx) = a / b`,
        problem: '',
        solution: '',
    };

    let commonTerm = Term.generateNonTrivial();

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


export function generateAddFractionCommonDenominator(): GeneratorResult {
    const result: GeneratorResult = {
        prompt: `Add Fraction`,
        steps: [],
        explanation: `a / x ± b / x = (a±b) / x`,
        problem: '',
        solution: '',
    };

    let denominator = Term.generateNonTrivial();
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

export function generateAddFraction(): GeneratorResult {
    const result: GeneratorResult = {
        prompt: `Add Fraction`,
        steps: [],
        explanation: `a / x + b / y = (ay + bx) / (xy)`,
        problem: '',
        solution: '',
    };

    let fraction1 = SimpleFraction.one;
    let fraction2 = SimpleFraction.one;

    while (fraction1.denominator.isOne() && fraction2.denominator.isOne()) {
        fraction1 = new SimpleFraction(
            TermSum.generate(randInclusive(1, 2), Term.generateSimple, true),
            Term.generateSimple());
        fraction2 = new SimpleFraction(
            TermSum.generate(randInclusive(1, 2), Term.generateSimple, true),
            Term.generateSimple());
    }

    result.problem = `${fraction1.render()} ${sign(0)} ${fraction2.render()}`;

    const expansion1 = fraction1.denominator.lcm(fraction2.denominator).divide(fraction1.denominator)!;
    const expansion2 = fraction1.denominator.lcm(fraction2.denominator).divide(fraction2.denominator)!;

    if (expansion1.isOne())
        result.steps.push(
            `<hidden>(${fraction1.numerator.renderAsFactor(true)})` +
            ` / (${fraction1.denominator.renderAsFactor(true)})` +
            ` ${sign(0)}` +
            ` (${fraction2.numerator.renderAsFactor(true)} * ${expansion2.renderAsFactor()})` +
            ` / (${fraction2.denominator.renderAsFactor(true)} * ${expansion2.renderAsFactor()})`);
    else if (expansion2.isOne())
        result.steps.push(
            `<hidden>(${fraction1.numerator.renderAsFactor(true)} * ${expansion1.renderAsFactor()})` +
            ` / (${fraction1.denominator.renderAsFactor(true)} * ${expansion1.renderAsFactor()})` +
            ` ${sign(0)}` +
            ` (${fraction2.numerator.renderAsFactor(true)})` +
            ` / (${fraction2.denominator.renderAsFactor(true)})`);
    else
        result.steps.push(
            `<hidden>(${fraction1.numerator.renderAsFactor(true)} * ${expansion1.renderAsFactor()})` +
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



export function generateSeparateFraction(): GeneratorResult {
    const result: GeneratorResult = {
        prompt: `Separate Fraction`,
        steps: [],
        explanation: `(a ± b) / x = a / x ± b / x`,
        problem: '',
        solution: '',
    };

    let fraction = new SimpleFraction(
        TermSum.generate(randInclusive(2, 4), Term.generate, true),
        Term.generateSimpleNonTrivial());

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

export function generateMultiplyFraction(): GeneratorResult {
    const result: GeneratorResult = {
        prompt: `Multiply Fraction`,
        steps: [],
        explanation: `a / x * b / y = (ab) / (xy)`,
        problem: '',
        solution: '',
    }

    let fraction1 = SimpleFraction.one;
    let fraction2 = SimpleFraction.one;

    while (fraction1.denominator.isOne() && fraction2.denominator.isOne()) {
        fraction1 = new SimpleFraction(
            TermSum.generate(randInclusive(1, 2), Term.generateSimple),
            Term.generateSimple());
        fraction2 = new SimpleFraction(
            TermSum.generate(randInclusive(1, 2), Term.generateSimple),
            Term.generateSimple());
    }

    result.problem = `${fraction1.render()} * ${fraction2.render()}`;

    let simplifySteps: string[] = [];
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

    result.steps.push(`<hidden>(${fraction1.numerator.renderAsFactor(true)} * ${fraction2.numerator.renderAsFactor()}) / (${fraction1.denominator.renderAsFactor(true)} * ${fraction2.denominator.renderAsFactor()})`);
    product = product.simplifyNumerator(result.steps);
    product = product.reduce(result.steps);

    result.solution = `${product.render()}`;

    return result;
}