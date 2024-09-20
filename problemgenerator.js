import { nonZero, randVariableGroup, randVariable, randInclusive } from "./randutils.js";

class Group {
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

    add(group) {
        if (group.variables != this.variables)
            return null;
        return new Group(this.factor + group.factor, this.variables);
    }

    multiply(group) {
        return new Group(this.factor * group.factor, this.variables + group.variables);
    }

    divide(group) {
        const result = new Group(this.factor / group.factor, this.variables);
        for (let curVar of group.variables) {
            if (!result.variables.includes(curVar))
                return null;
            result.variables = result.variables.replace(curVar, '');
        }
        return result;
    }

    gcd(group) {
        const commonFactor = gcd(Math.abs(this.factor), Math.abs(group.factor));
        let commonVariables = '';
        let otherGroupVariables = group.variables;

        for (let curVar of this.variables) {
            if (otherGroupVariables.includes(curVar)) {
                commonVariables += curVar;
                otherGroupVariables = otherGroupVariables.replace(curVar, '');
            }
        }
        return new Group(commonFactor, commonVariables);
    }
}

export function generateCombineSum() {
    let a = new Group(nonZero(-10, 10), randVariable(0));
    let b = new Group(nonZero(-10, 10), randVariable(0));
    return {
        prompt: `Simplify`,
        problem: `${a.render()} ${b.render(true)} = ?`,
        solution: `${a.add(b).render()}`
    };
}

export function generateCombineSumN(groupCount, maxGroupSize) {
    let groups = [];
    for (let i = 0; i < groupCount; i++) {
        groups.push(new Group(nonZero(-10, 10), randVariableGroup(maxGroupSize)));
    }

    return {
        prompt: `Simplify`,
        problem: renderAdditiveGroups(groups) + ' = ',
        solution: renderAdditiveGroups(simplify(groups)),
    };
}

function simplify(groups) {
    const result = [];
    for (let i = 0; i < groups.length; i++) {
        let found = false;
        for (let j = 0; j < result.length; j++) {
            const addResult = result[j].add(groups[i]);
            if (addResult) {
                result[j] = addResult;
                found = true;
                break;
            }
        }
        if (!found)
            result.push(groups[i]);
    }
    return result
}

function renderAdditiveGroups(groups) {
    let asOperand = false;
    let result = '';
    for (let group of groups) {
        result += ` ${group.render(asOperand)}`;
        if (result.trim().length > 0)
            asOperand = true;
    }
    return result;
}

function gcd(a, b) {
    if (b == 0)
        return a;
    return gcd(b, a % b);
}

export function generateFactorOut() {
    let commonFactor = randInclusive(1, 5);
    let commonVars = randVariableGroup(2);

    let groups = [];
    for (let i = 0; i < 3; i++) {
        const f = nonZero(-3, 3 );
        groups.push(new Group(f * commonFactor, randVariableGroup(2, 3) + commonVars));
    }
    groups = simplify(groups);

    let commonGroup = groups[0];
    commonGroup.factor = Math.abs(commonGroup.factor);
    for (let group of groups) {
        commonGroup = commonGroup.gcd(group);
    }

    return {
        prompt: `Factor out the common factor`,
        problem: renderAdditiveGroups(groups),
        solution: `${commonGroup.render()}(${renderAdditiveGroups(simplify(groups.map(g => g.divide(commonGroup))))})`
    };
}