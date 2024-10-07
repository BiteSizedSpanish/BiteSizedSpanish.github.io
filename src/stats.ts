import Cookies from 'js-cookie';

export function cookiesSetSafe(key: string, value: string, options: any) {
  if (Cookies.get('cookiesEnabled') === 'true')
    Cookies.set(key, value, options);
}

export function getStats() {
  const lastPlayed = parseInt(Cookies.get('lastPlayed') ?? `${Date.now()}`);

  if (Date.now() - lastPlayed > 24 * 60 * 60 * 1000) {
    cookiesSetSafe('solvedToday', '0', { sameSite: 'strict', expires: 1 });
  }

  cookiesSetSafe('lastPlayed', `${Date.now()}`, {
    sameSite: 'strict',
    expires: 1,
  });

  return {
    totalSolved: Cookies.get('totalSolved') ?? 0,
    totalSolvedCorrect: Cookies.get('totalSolvedCorrect') ?? 0,
    solvedToday: Cookies.get('solvedToday') ?? 0,
    solvedTodayCorrect: Cookies.get('solvedTodayCorrect') ?? 0,
  };
}

function cat() {
  const urlValue = new URLSearchParams(window.location.search).get('cat');
  if (urlValue) {
    cookiesSetSafe('cat', urlValue, { sameSite: 'strict', expires: 10000 });
  }
  const n = parseInt(Cookies.get('cat') ?? '0');
  if (n > 0 && parseInt(Cookies.get('solvedTodayCorrect') ?? '0') % n == 0 && parseInt(Cookies.get('solvedTodayCorrect') ?? '0') > 0) {
    window.location.href = './cat.html';
  }
}

export function recordPlayed(wasCorrect: boolean) {
  cookiesSetSafe(
    'solvedToday',
    `${parseInt(Cookies.get('solvedToday') ?? '0') + 1}`,
    { sameSite: 'strict', expires: 1 },
  );
  cookiesSetSafe(
    'totalSolved',
    `${parseInt(Cookies.get('totalSolved') ?? '0') + 1}`,
    { sameSite: 'strict', expires: 10000 },
  );

  if (wasCorrect) {
    cookiesSetSafe(
      'solvedTodayCorrect',
      `${parseInt(Cookies.get('solvedTodayCorrect') ?? '0') + 1}`,
      { sameSite: 'strict', expires: 1 },
    );
    cookiesSetSafe(
      'totalSolvedCorrect',
      `${parseInt(Cookies.get('totalSolvedCorrect') ?? '0') + 1}`,
      { sameSite: 'strict', expires: 10000 },
    );
  }

  if (wasCorrect) {
    cat();
  }
}
