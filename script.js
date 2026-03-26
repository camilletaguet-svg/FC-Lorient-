// ============================================================
//  FC Lorient – Résultats Ligue 1
//  API : football-data.org (gratuite, clé requise)
//  Team ID Lorient  : 518
//  Competition      : FL1 (Ligue 1)
//  Season           : 2025
// ============================================================

const TEAM_ID   = 518;
const COMP_CODE = 'FL1';
const SEASON    = 2025;
const BASE_URL  = 'https://api.football-data.org/v4';

const LS_KEY = 'fclorient_api_key';

// ---------- DOM ----------
const apiBox      = document.getElementById('api-box');
const apiInput    = document.getElementById('api-key-input');
const apiBtn      = document.getElementById('api-key-btn');
const loader      = document.getElementById('loader');
const errorMsg    = document.getElementById('error-msg');
const resultsSection = document.getElementById('results-section');
const resultsBody = document.getElementById('results-body');
const demoSection = document.getElementById('demo-section');
const demoBtn     = document.getElementById('demo-btn');
const filterBtns  = document.querySelectorAll('.filter-btn');

// Stats
const elPlayed = document.getElementById('played');
const elWins   = document.getElementById('wins');
const elDraws  = document.getElementById('draws');
const elLosses = document.getElementById('losses');
const elGF     = document.getElementById('gf');
const elGA     = document.getElementById('ga');
const elPts    = document.getElementById('pts');
const elRank   = document.getElementById('rank');

// ---------- Init ----------
(function init() {
  const saved = localStorage.getItem(LS_KEY);
  if (saved) {
    apiInput.value = saved;
    fetchData(saved);
  }
})();

// ---------- Events ----------
apiBtn.addEventListener('click', () => {
  const key = apiInput.value.trim();
  if (!key) { showError('Veuillez entrer votre clé API.'); return; }
  localStorage.setItem(LS_KEY, key);
  fetchData(key);
});

apiInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') apiBtn.click();
});

demoBtn.addEventListener('click', () => renderAll(DEMO_DATA));

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  });
});

// ---------- Fetch ----------
async function fetchData(apiKey) {
  showLoader();
  clearError();

  try {
    // Récupère les matchs
    const matchesUrl = `${BASE_URL}/teams/${TEAM_ID}/matches?season=${SEASON}&competitions=${COMP_CODE}`;
    const matchesRes = await fetch(matchesUrl, { headers: { 'X-Auth-Token': apiKey } });

    if (!matchesRes.ok) {
      if (matchesRes.status === 401 || matchesRes.status === 403) {
        throw new Error('Clé API invalide ou accès refusé. Vérifiez votre clé sur football-data.org.');
      }
      if (matchesRes.status === 429) {
        throw new Error('Trop de requêtes. Attendez une minute puis réessayez (limite API gratuite).');
      }
      throw new Error(`Erreur API : ${matchesRes.status} ${matchesRes.statusText}`);
    }

    const matchesData = await matchesRes.json();

    // Récupère le classement (facultatif, ignoré si erreur)
    let rank = null;
    try {
      const standingsUrl = `${BASE_URL}/competitions/${COMP_CODE}/standings?season=${SEASON}`;
      const standRes = await fetch(standingsUrl, { headers: { 'X-Auth-Token': apiKey } });
      if (standRes.ok) {
        const standData = await standRes.json();
        const table = standData.standings?.find(s => s.type === 'TOTAL')?.table || [];
        const entry = table.find(t => t.team.id === TEAM_ID);
        if (entry) rank = entry.position;
      }
    } catch (_) { /* classement non critique */ }

    hideLoader();
    renderAll(matchesData.matches || [], rank);

  } catch (err) {
    hideLoader();
    showError(err.message || 'Une erreur inattendue s\'est produite.');
  }
}

// ---------- Render ----------
function renderAll(matches, rank = null) {
  demoSection.classList.add('hidden');
  resultsSection.classList.remove('hidden');

  const played = matches.filter(m => m.status === 'FINISHED');

  // Stats
  let wins = 0, draws = 0, losses = 0, gf = 0, ga = 0, pts = 0;

  played.forEach(m => {
    const r = getResult(m);
    if (r === 'W') { wins++;  pts += 3; }
    if (r === 'D') { draws++; pts += 1; }
    if (r === 'L')   losses++;

    const scores = getScores(m);
    gf += scores.lorient;
    ga += scores.opponent;
  });

  elPlayed.textContent = played.length;
  elWins.textContent   = wins;
  elDraws.textContent  = draws;
  elLosses.textContent = losses;
  elGF.textContent     = gf;
  elGA.textContent     = ga;
  elPts.textContent    = pts;
  elRank.textContent   = rank !== null ? rank + 'e' : '–';

  // Tri par date
  const sorted = [...matches].sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

  // Stocke pour filtrage
  window._allMatches = sorted;
  applyFilter('all');
}

function applyFilter(filter) {
  const matches = window._allMatches || [];
  const filtered = matches.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return m.status !== 'FINISHED';
    return getResult(m) === filter && m.status === 'FINISHED';
  });
  renderTable(filtered);
}

function renderTable(matches) {
  resultsBody.innerHTML = '';

  if (matches.length === 0) {
    resultsBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;padding:32px">Aucun match trouvé.</td></tr>';
    return;
  }

  matches.forEach(m => {
    const isHome      = m.homeTeam.id === TEAM_ID;
    const homeTeam    = m.homeTeam.shortName || m.homeTeam.name;
    const awayTeam    = m.awayTeam.shortName || m.awayTeam.name;
    const lorientHome = isHome;

    const scores = getScores(m);
    const result = getResult(m);
    const finished = m.status === 'FINISHED';

    const dateStr = formatDate(m.utcDate);
    const jday    = m.matchday ?? '–';

    let scoreCellHTML;
    if (finished) {
      const homeScore = isHome ? scores.lorient : scores.opponent;
      const awayScore = isHome ? scores.opponent : scores.lorient;
      scoreCellHTML = `<div class="score-box">
        <span>${homeScore}</span>
        <span class="score-sep">–</span>
        <span>${awayScore}</span>
      </div>`;
    } else {
      const d = new Date(m.utcDate);
      const timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      scoreCellHTML = `<span style="color:#999;font-size:.82rem">${timeStr}</span>`;
    }

    const badgeClass = finished ? `badge-${result}` : 'badge-N';
    const badgeText  = finished
      ? (result === 'W' ? 'Victoire' : result === 'D' ? 'Nul' : 'Défaite')
      : (m.status === 'POSTPONED' ? 'Reporté' : 'À venir');

    const homeCls = lorientHome ? 'team-col team-name lorient' : 'team-col team-name';
    const awayCls = lorientHome ? 'team-col team-name' : 'team-col team-name lorient';

    const tr = document.createElement('tr');
    tr.dataset.result = result;
    tr.dataset.status = m.status;
    tr.innerHTML = `
      <td class="jornada">${jday}</td>
      <td>${dateStr}</td>
      <td class="${homeCls}">${homeTeam}</td>
      <td class="score-col">${scoreCellHTML}</td>
      <td class="${awayCls}">${awayTeam}</td>
      <td><span class="badge ${badgeClass}">${badgeText}</span></td>
    `;
    resultsBody.appendChild(tr);
  });
}

// ---------- Helpers ----------
function getScores(m) {
  const isHome = m.homeTeam.id === TEAM_ID;
  const hs = m.score?.fullTime?.home ?? 0;
  const as = m.score?.fullTime?.away ?? 0;
  return {
    lorient:  isHome ? hs : as,
    opponent: isHome ? as : hs
  };
}

function getResult(m) {
  if (m.status !== 'FINISHED') return 'N';
  const isHome = m.homeTeam.id === TEAM_ID;
  const winner = m.score?.winner;
  if (winner === 'DRAW') return 'D';
  if ((winner === 'HOME_TEAM' && isHome) || (winner === 'AWAY_TEAM' && !isHome)) return 'W';
  return 'L';
}

function formatDate(utcStr) {
  const d = new Date(utcStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ---------- UI helpers ----------
function showLoader()  { loader.classList.remove('hidden'); }
function hideLoader()  { loader.classList.add('hidden'); }
function showError(msg) {
  errorMsg.textContent = '⚠ ' + msg;
  errorMsg.classList.remove('hidden');
}
function clearError() { errorMsg.classList.add('hidden'); }

// ---------- Données de démonstration ----------
// Saison 2023-24 (dernière saison du FC Lorient en Ligue 1)
const DEMO_DATA = [
  mkMatch(1, '2023-08-13', 538, 'PSG',      518, 'Lorient',    0, 0, 'DRAW'),
  mkMatch(2, '2023-08-20', 518, 'Lorient',  521, 'Rennes',     2, 1, 'HOME_TEAM'),
  mkMatch(3, '2023-08-27', 532, 'Lille',    518, 'Lorient',    3, 1, 'HOME_TEAM'),
  mkMatch(4, '2023-09-03', 518, 'Lorient',  527, 'Nice',       1, 1, 'DRAW'),
  mkMatch(5, '2023-09-17', 524, 'Lyon',     518, 'Lorient',    2, 0, 'HOME_TEAM'),
  mkMatch(6, '2023-09-24', 518, 'Lorient',  526, 'Monaco',     2, 3, 'AWAY_TEAM'),
  mkMatch(7, '2023-10-01', 523, 'Lens',     518, 'Lorient',    1, 0, 'HOME_TEAM'),
  mkMatch(8, '2023-10-08', 518, 'Lorient',  1030,'Clermont',   2, 0, 'HOME_TEAM'),
  mkMatch(9, '2023-10-22', 516, 'Marseille',518, 'Lorient',    1, 1, 'DRAW'),
  mkMatch(10,'2023-10-29', 518, 'Lorient',  529, 'Strasbourg', 2, 1, 'HOME_TEAM'),
  mkMatch(11,'2023-11-05', 519, 'Nantes',   518, 'Lorient',    0, 0, 'DRAW'),
  mkMatch(12,'2023-11-12', 518, 'Lorient',  531, 'Toulouse',   1, 2, 'AWAY_TEAM'),
  mkMatch(13,'2023-11-26', 543, 'Metz',     518, 'Lorient',    1, 1, 'DRAW'),
  mkMatch(14,'2023-12-03', 518, 'Lorient',  522, 'Reims',      0, 1, 'AWAY_TEAM'),
  mkMatch(15,'2023-12-10', 536, 'Montpellier',518,'Lorient',   2, 0, 'HOME_TEAM'),
  mkMatch(16,'2023-12-17', 518, 'Lorient',  538, 'PSG',        1, 2, 'AWAY_TEAM'),
  mkMatch(17,'2023-12-20', 521, 'Rennes',   518, 'Lorient',    1, 0, 'HOME_TEAM'),
  mkMatch(18,'2023-12-23', 518, 'Lorient',  532, 'Lille',      2, 2, 'DRAW'),
  mkMatch(19,'2024-01-14', 527, 'Nice',     518, 'Lorient',    3, 1, 'HOME_TEAM'),
  mkMatch(20,'2024-01-21', 518, 'Lorient',  524, 'Lyon',       1, 0, 'HOME_TEAM'),
  mkMatch(21,'2024-01-28', 526, 'Monaco',   518, 'Lorient',    2, 1, 'HOME_TEAM'),
  mkMatch(22,'2024-02-04', 518, 'Lorient',  523, 'Lens',       0, 0, 'DRAW'),
  mkMatch(23,'2024-02-11', 1030,'Clermont', 518, 'Lorient',    1, 2, 'AWAY_TEAM'),
  mkMatch(24,'2024-02-18', 518, 'Lorient',  516, 'Marseille',  1, 3, 'AWAY_TEAM'),
  mkMatch(25,'2024-02-25', 529, 'Strasbourg',518,'Lorient',    0, 1, 'AWAY_TEAM'),
  mkMatch(26,'2024-03-03', 518, 'Lorient',  519, 'Nantes',     2, 0, 'HOME_TEAM'),
  mkMatch(27,'2024-03-10', 531, 'Toulouse', 518, 'Lorient',    3, 0, 'HOME_TEAM'),
  mkMatch(28,'2024-03-17', 518, 'Lorient',  543, 'Metz',       1, 0, 'HOME_TEAM'),
  mkMatch(29,'2024-03-31', 522, 'Reims',    518, 'Lorient',    1, 1, 'DRAW'),
  mkMatch(30,'2024-04-07', 518, 'Lorient',  536, 'Montpellier',3, 1, 'HOME_TEAM'),
  mkMatch(31,'2024-04-14', 538, 'PSG',      518, 'Lorient',    4, 1, 'HOME_TEAM'),
  mkMatch(32,'2024-04-21', 518, 'Lorient',  521, 'Rennes',     0, 1, 'AWAY_TEAM'),
  mkMatch(33,'2024-04-28', 532, 'Lille',    518, 'Lorient',    2, 0, 'HOME_TEAM'),
  mkMatch(34,'2024-05-05', 518, 'Lorient',  527, 'Nice',       1, 1, 'DRAW'),
];

function mkMatch(day, date, homeId, homeName, awayId, awayName, hs, as, winner) {
  return {
    matchday: day,
    utcDate: date + 'T20:00:00Z',
    status: 'FINISHED',
    homeTeam: { id: homeId, name: homeName, shortName: homeName },
    awayTeam: { id: awayId, name: awayName, shortName: awayName },
    score: {
      fullTime: { home: hs, away: as },
      winner: winner
    }
  };
}
