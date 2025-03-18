import Papa from 'papaparse';

let verbs: any = {};
let endings: any = {};

export async function loadVerbs(): Promise<unknown> {
  return Promise.all(
    [new Promise<void>((resolve) => {
      Papa.parse('/jehle_verb_database.csv', {
        download: true,
        header: true,
        complete: function (results: any) {
          for (let verb of results.data) {
            let mood = verb['mood'];
            if (Object.keys(verbs).indexOf(mood) === -1) {
              verbs[mood] = {};
            }
            let tense = verb['tense'];
            if (Object.keys(verbs[mood]).indexOf(tense) === -1) {
              verbs[mood][tense] = [];
            }
            verbs[mood][tense].push(verb);
          }
          resolve();
        },
      });
    }),
    new Promise<void>((resolve) => {
      Papa.parse('/regular_endings.csv', {
        download: true,
        header: true,
        complete: function (results: any) {
          for (let ending of results.data) {
            let tense = ending['tense'];
            if (Object.keys(endings).indexOf(tense) === -1) {
              endings[tense] = {};
            }
            let pronoun = ending['pronoun'];
            endings[tense][pronoun] = ending;
          }
          resolve();
        },
      });
    }),
    ]
  );
}

export function getVerbs() {
  return verbs;
}

export function regularConjugation(tense: string, verb: string, pronoun: string) {
  tense = tense.toLocaleLowerCase();
  verb = verb.toLocaleLowerCase();
  pronoun = pronoun.toLocaleLowerCase();

  let endings = getEndings(tense, verb);
  let stem = verb.endsWith('se') ? verb.slice(0, -4) : verb.slice(0, -2);

  return endings[pronoun].replace('-', stem);
}

export function getEndings(tense: string, verb: string): { [key: string]: string } {
  tense = tense.toLocaleLowerCase();
  verb = verb.toLocaleLowerCase();

  if (verb.endsWith('se')) {
    let type = verb.slice(-4, -2);

    return {
      'form_1s': 'me ' + endings[tense]['form_1s'][type],
      'form_2s': 'te ' + endings[tense]['form_2s'][type],
      'form_3s': 'se ' + endings[tense]['form_3s'][type],
      'form_1p': 'nos ' + endings[tense]['form_1p'][type],
      'form_2p': 'os ' + endings[tense]['form_2p'][type],
      'form_3p': 'se ' + endings[tense]['form_3p'][type],
      "type": "-" + type,
    }
  }
  else {
    let type = verb.slice(-2);

    return {
      'form_1s': endings[tense]['form_1s'][type],
      'form_2s': endings[tense]['form_2s'][type],
      'form_3s': endings[tense]['form_3s'][type],
      'form_1p': endings[tense]['form_1p'][type],
      'form_2p': endings[tense]['form_2p'][type],
      'form_3p': endings[tense]['form_3p'][type],
      "type": "-" + type,
    }

  }

}

export function getRandomVerb(tense: string, mood: string) {
  if (!verbs[mood] || !verbs[mood][tense]) {
    alert(`No verbs found for tense ${tense} and mood ${mood}`);
    return undefined;
  }
  return verbs[mood][tense][Math.floor(Math.random() * verbs[mood][tense].length)];
}
