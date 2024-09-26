export function getStats() {
    const lastPlayed = parseInt(Cookies.get('lastPlayed') ?? Date.now());

    if (Date.now() - lastPlayed > 24 * 60 * 60 * 1000) {
        Cookies.set('solvedToday', 0,);
    }

    Cookies.set('lastPlayed', Date.now(), { sameSite: 'strict', expires: 1 });

    return {
        totalSolved: Cookies.get('totalSolved') ?? 0,
        totalSolvedCorrect: Cookies.get('totalSolvedCorrect') ?? 0,
        solvedToday: Cookies.get('solvedToday') ?? 0,
        solvedTodayCorrect: Cookies.get('solvedTodayCorrect') ?? 0,
    }
}

function cat() {
    if (new URLSearchParams(window.location.search).get('cat')) {
        Cookies.set('cat', parseInt(new URLSearchParams(window.location.search).get('cat')), { sameSite: 'strict', expires: 10000 });
    }
    const n = parseInt(Cookies.get('cat') ?? 0);
    if (n > 0 && parseInt(Cookies.get('solvedTodayCorrect') ?? 0) % n == 0) {
        window.location = "./cat.html"
    }
}

export function recordPlayed(wasCorrect) {
    Cookies.set('solvedToday', parseInt(Cookies.get('solvedToday') ?? 0) + 1, { sameSite: 'strict', expires: 1 });
    Cookies.set('totalSolved', parseInt(Cookies.get('totalSolved') ?? 0) + 1, { sameSite: 'strict', expires: 10000 });

    if (wasCorrect) {
        Cookies.set('solvedTodayCorrect', parseInt(Cookies.get('solvedTodayCorrect') ?? 0) + 1, { sameSite: 'strict', expires: 1 });
        Cookies.set('totalSolvedCorrect', parseInt(Cookies.get('totalSolvedCorrect') ?? 0) + 1, { sameSite: 'strict', expires: 10000 });    
    }

    if (new URLSearchParams(window.location.search).get('cat')) {

    }
    if (wasCorrect) {
        cat();
    }
}