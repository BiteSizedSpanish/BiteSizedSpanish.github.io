import { nonZero, randVariableGroup, randVariable } from "./randutils.js";

class Group {
    constructor(factor, v) {
        this.factor = factor;
        this.v = v.split("").sort().join("");
    }

    render(asOperand = false) {
        if (this.factor == 0)
            return '';
        if (this.v.length == 0)
        {
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

        let curv = this.v[0];
        let count = 0;
        for (let i = 0; i < this.v.length; i++) {
            if (curv == this.v[i]) {
                count++;
            } else {
                result += ` ${curv}`;
                if (count > 1)
                    result += `^${count}`;
                count = 1;
            }
            curv = this.v[i];
        }
        result += ` ${curv}`;
        if (count > 1)
            result += `^${count}`;

        return result;
    }

    add(group) {
        if (group.v != this.v)
            return null;
        return new Group(this.factor + group.factor, this.v);
    }

    multiply(group) {
        return new Group(this.factor * group.factor, this.v + group.v);
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

export function generateCombineSumN(n, var_n) {
    let groups = [];
    for(let i = 0; i < n; i++) {
        groups.push(new Group(nonZero(-10, 10), randVariableGroup(var_n)));
    }

    console.log(groups);

    let problem = groups[0].render();
    for(let i = 1; i < groups.length; i++) {
        problem += ` ${groups[i].render(true)}`;
    }

    groups = simplify(groups);
    let solution = groups[0].render();
    for(let i = 1; i < groups.length; i++) {
        solution += ` ${groups[i].render(true)}`;
    }

    return {
        prompt: `Simplify`,
        problem: problem + ' = ',
        solution,
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
