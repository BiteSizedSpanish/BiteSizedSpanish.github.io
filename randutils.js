export function shuffledArray(len) {
    let array = [];

    for (let i = 0; i < len; i++) {
        array.push(i);
    }
    for (var i = array.length - 1; i >= 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
let shuffled = [];

export function initRandom() {
    shuffled = [];
    for (let i = 0; i < 100; i++) {
        shuffled.push(shuffledArray(i));
    }
}

initRandom();

export function pickRandomUnique(array, seed) {
    return array[shuffled[array.length][seed]];
}

export function pickRandom(array, seed) {
    return array[shuffled[99][seed] % array.length];
}

export function sign(seed = null) {
    return pickRandom(['+', '-'], seed ?? randInclusive(2));
}

export function operation(seed = null) {
    return pickRandom(['+', '-', '*', '/'], seed ?? randInclusive(4));
}

export function randVariable(seed = null) {
    return pickRandomUnique(['a', 'b', 'c', 'x', 'y', 'z'], seed ?? randInclusive(6));
}

export function randVariableGroup(maxSize) {
    let size = randInclusive(1, maxSize);
    let group = '';
    for (let i = 0; i < size; i++) {
        group += randVariable(randInclusive(maxSize - 1));
    }
    return group;
}

export function nonZero(min, max) {
    while (true) {
        let result = Math.floor(Math.random() * (max - min + 1)) + min;
        if (result != 0)
            return result;
    }
}

export function randInclusive(min, max = null) {
    if (max == null) {
        max = min;
        min = 0;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}