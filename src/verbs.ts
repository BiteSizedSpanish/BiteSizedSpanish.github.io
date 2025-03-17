import Papa from 'papaparse';

let verbs: any = {};

export async function loadVerbs(): Promise<void> {
  return new Promise((resolve) => {
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
  });
}

export function getVerbs() {
  return verbs;
}

export function getRandomVerb(tense: string, mood: string) {
  if (!verbs[mood] || !verbs[mood][tense]) {
    alert(`No verbs found for tense ${tense} and mood ${mood}`);
    return undefined;
  }
  return verbs[mood][tense][Math.floor(Math.random() * verbs[mood][tense].length)];
}
