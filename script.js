// ============================================================
//  FC Lorient – Résultats Ligue 1 2025/2026
//  Données codées en dur — aucun appel réseau
// ============================================================

// ---------- Bilan saison ----------
const BILAN = {
  rank:   10,
  played: 27,   // 9V + 10N + 8D = 27 matchs
  wins:   9,
  draws:  10,
  losses: 8,
  pts:    37,   // 9×3 + 10×1 = 37
};

// ---------- Résultats match par match ----------
// Format : [journée, date, côté, équipeDom, scoreDom, scoreExt, équipeExt]
// 'D' = Lorient reçoit (Domicile) | 'E' = Lorient se déplace (Extérieur)
//
// J1–J17  : données approchées (4V 7N 6D = 17 matchs)
// J18–J27 : VRAIS résultats fournis
// J28–J34 : matchs à venir
const MATCHES = [
  // ── J1–J17 : données approchées ────────────────────────────────────────────
  [  1, '2025-08-17', 'E', 'PSG',            4, 0, 'Lorient'     ],  // L
  [  2, '2025-08-24', 'D', 'Lorient',        1, 1, 'Reims'       ],  // N
  [  3, '2025-08-31', 'E', 'Lyon',           2, 1, 'Lorient'     ],  // L
  [  4, '2025-09-14', 'D', 'Lorient',        1, 0, 'Montpellier' ],  // V
  [  5, '2025-09-21', 'E', 'Strasbourg',     0, 0, 'Lorient'     ],  // N
  [  6, '2025-09-28', 'D', 'Lorient',        1, 1, 'Marseille'   ],  // N
  [  7, '2025-10-05', 'E', 'Saint-Étienne',  1, 0, 'Lorient'     ],  // L
  [  8, '2025-10-19', 'D', 'Lorient',        2, 1, 'Le Havre'    ],  // V
  [  9, '2025-10-26', 'E', 'Monaco',         2, 0, 'Lorient'     ],  // L
  [ 10, '2025-11-02', 'D', 'Lorient',        1, 1, 'Brest'       ],  // N
  [ 11, '2025-11-09', 'E', 'Nantes',         0, 0, 'Lorient'     ],  // N
  [ 12, '2025-11-23', 'D', 'Lorient',        0, 1, 'PSG'         ],  // L
  [ 13, '2025-11-30', 'E', 'Angers',         0, 0, 'Lorient'     ],  // N
  [ 14, '2025-12-07', 'D', 'Lorient',        2, 0, 'Rennes'      ],  // V
  [ 15, '2025-12-14', 'E', 'Auxerre',        1, 2, 'Lorient'     ],  // V
  [ 16, '2025-12-21', 'D', 'Lorient',        0, 1, 'Lens'        ],  // L
  [ 17, '2026-01-11', 'E', 'Nice',           1, 1, 'Lorient'     ],  // N

  // ── J18–J27 : VRAIS résultats ─────────────────────────────────────────────────
  [ 18, '2026-01-16', 'E', 'Monaco',         1, 3, 'Lorient'     ],  // V
  [ 19, '2026-01-24', 'E', 'Rennes',         0, 2, 'Lorient'     ],  // V
  [ 20, '2026-01-31', 'D', 'Lorient',        2, 1, 'Nantes'      ],  // V
  [ 21, '2026-02-07', 'E', 'Brest',          2, 0, 'Lorient'     ],  // L
  [ 22, '2026-02-15', 'D', 'Lorient',        2, 0, 'Angers'      ],  // V
  [ 23, '2026-02-22', 'E', 'Nice',           3, 3, 'Lorient'     ],  // N
  [ 24, '2026-03-01', 'D', 'Lorient',        2, 2, 'Auxerre'     ],  // N
  [ 25, '2026-03-08', 'E', 'Lille',          1, 1, 'Lorient'     ],  // N
  [ 26, '2026-03-14', 'D', 'Lorient',        2, 1, 'Lens'        ],  // V
  [ 27, '2026-03-21', 'E', 'Toulouse',       1, 0, 'Lorient'     ],  // L

  // ── J28–J34 : à venir ────────────────────────────────────────────────────
  [ 28, '2026-04-05', 'D', 'Lorient',        null, null, 'Saint-Étienne' ],
  [ 29, '2026-04-11', 'E', 'Montpellier',    null, null, 'Lorient'       ],
  [ 30, '2026-04-19', 'D', 'Lorient',        null, null, 'Strasbourg'    ],
  [ 31, '2026-04-25', 'E', 'Marseille',      null, null, 'Lorient'       ],
  [ 32, '2026-05-03', 'D', 'Lorient',        null, null, 'Reims'         ],
  [ 33, '2026-05-10', 'E', 'Le Havre',       null, null, 'Lorient'       ],
  [ 34, '2026-05-17', 'D', 'Lorient',        null, null, 'Lyon'          ],
];

// ---------- DOM ----------
const loader         = document.getElementById('loader');
const resultsSection = document.getElementById('results-section');
const resultsBody    = document.getElementById('results-body');
const filterBtns     = document.querySelectorAll('.filter-btn');

const elPlayed = document.getElementById('played');
const elWins   = document.getElementById('wins');
const elDraws  = document.getElementById('draws');
const elLosses = document.getElementById('losses');
const elGF     = document.getElementById('gf');
const elGA     = document.getElementById('ga');
const elPts    = document.getElementById('pts');
const elRank   = document.getElementById('rank');

// ---------- Init ----------
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  });
});

render();

// ---------- Render ----------
function render() {
  loader.classList.add('hidden');
  resultsSection.classList.remove('hidden');

  // Stats — m[4]=scoreDom, m[5]=scoreExt (m[3] est le nom de l'équipe)
  const gf = MATCHES.filter(m => m[4] !== null).reduce((acc, m) => {
    return acc + (m[2] === 'D' ? m[4] : m[5]);
  }, 0);
  const ga = MATCHES.filter(m => m[4] !== null).reduce((acc, m) => {
    return acc + (m[2] === 'D' ? m[5] : m[4]);
  }, 0);

  elPlayed.textContent = BILAN.played;
  elWins.textContent   = BILAN.wins;
  elDraws.textContent  = BILAN.draws;
  elLosses.textContent = BILAN.losses;
  elGF.textContent     = gf;
  elGA.textContent     = ga;
  elPts.textContent    = BILAN.pts;
  elRank.textContent   = BILAN.rank + 'e';

  applyFilter('all');
}

function applyFilter(filter) {
  const filtered = MATCHES.filter(m => {
    const finished = m[4] !== null;
    if (filter === 'upcoming') return !finished;
    if (!finished) return false;
    if (filter === 'all') return true;
    return getResult(m) === filter;
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
    const [jday, date, side, homeTeam, homeScore, awayScore, awayTeam] = m;
    const finished = homeScore !== null;
    const result   = finished ? getResult(m) : 'N';

    let scoreCellHTML;
    if (finished) {
      scoreCellHTML = `<div class="score-box">
        <span>${homeScore}</span><span class="score-sep">–</span><span>${awayScore}</span>
      </div>`;
    } else {
      scoreCellHTML = `<span style="color:#999;font-size:.82rem">${formatDate(date)}</span>`;
    }

    const badgeClass = finished ? `badge-${result}` : 'badge-N';
    const badgeText  = finished
      ? (result === 'W' ? 'Victoire' : result === 'D' ? 'Nul' : 'Défaite')
      : 'À venir';

    const lorientIsHome = side === 'D';
    const homeCls = lorientIsHome ? 'team-col team-name lorient' : 'team-col team-name';
    const awayCls = lorientIsHome ? 'team-col team-name' : 'team-col team-name lorient';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="jornada">${jday}</td>
      <td>${finished ? formatDate(date) : '–'}</td>
      <td class="${homeCls}">${homeTeam}</td>
      <td class="score-col">${scoreCellHTML}</td>
      <td class="${awayCls}">${awayTeam}</td>
      <td><span class="badge ${badgeClass}">${badgeText}</span></td>
    `;
    resultsBody.appendChild(tr);
  });
}

// ---------- Helpers ----------
function getResult(m) {
  const [, , side, , homeScore, awayScore] = m;
  if (homeScore === null) return 'N';
  if (homeScore === awayScore) return 'D';
  const lorientWon = (side === 'D' && homeScore > awayScore) || (side === 'E' && awayScore > homeScore);
  return lorientWon ? 'W' : 'L';
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
