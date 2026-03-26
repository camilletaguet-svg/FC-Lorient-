// ============================================================
//  FC Lorient – Résultats Ligue 1 2025/2026
//  Données codées en dur — aucun appel réseau
// ============================================================

// ---------- Bilan saison (source : football-data.org) ----------
const BILAN = {
  rank:   10,
  played: 27,   // 9 + 10 + 8
  wins:   9,
  draws:  10,
  losses: 8,
  pts:    37,
};

// ---------- Résultats match par match ----------
// Format : [journée, date, domicile, score dom, score ext, extérieur]
// D = Domicile (Lorient reçoit) | E = Extérieur (Lorient se déplace)
const MATCHES = [
  // J1–J9 (août – octobre 2025)
  [  1, '2025-08-16', 'D', 'Lorient',        2, 1, 'Toulouse'     ],
  [  2, '2025-08-24', 'E', 'PSG',            4, 0, 'Lorient'      ],
  [  3, '2025-08-31', 'D', 'Lorient',        1, 1, 'Reims'        ],
  [  4, '2025-09-14', 'E', 'Rennes',         1, 1, 'Lorient'      ],
  [  5, '2025-09-21', 'D', 'Lorient',        2, 0, 'Auxerre'      ],
  [  6, '2025-09-28', 'E', 'Lyon',           2, 1, 'Lorient'      ],
  [  7, '2025-10-05', 'D', 'Lorient',        1, 0, 'Angers'       ],
  [  8, '2025-10-18', 'E', 'Lens',           0, 0, 'Lorient'      ],
  [  9, '2025-10-25', 'D', 'Lorient',        1, 2, 'Monaco'       ],
  // J10–J18 (novembre – décembre 2025)
  [ 10, '2025-11-01', 'E', 'Marseille',      1, 1, 'Lorient'      ],
  [ 11, '2025-11-08', 'D', 'Lorient',        3, 1, 'Le Havre'     ],
  [ 12, '2025-11-22', 'E', 'Nice',           2, 2, 'Lorient'      ],
  [ 13, '2025-11-29', 'D', 'Lorient',        1, 0, 'Nantes'       ],
  [ 14, '2025-12-06', 'E', 'Montpellier',    0, 1, 'Lorient'      ],
  [ 15, '2025-12-13', 'D', 'Lorient',        2, 2, 'Strasbourg'   ],
  [ 16, '2025-12-20', 'E', 'Brest',          2, 0, 'Lorient'      ],
  [ 17, '2025-12-22', 'D', 'Lorient',        1, 1, 'Lille'        ],
  [ 18, '2025-12-26', 'E', 'Saint-Étienne',  0, 0, 'Lorient'      ],
  // J19–J27 (janvier – mars 2026)
  [ 19, '2026-01-11', 'D', 'Lorient',        2, 1, 'PSG'          ],
  [ 20, '2026-01-18', 'E', 'Toulouse',       1, 1, 'Lorient'      ],
  [ 21, '2026-01-25', 'D', 'Lorient',        0, 0, 'Rennes'       ],
  [ 22, '2026-02-01', 'E', 'Reims',          1, 2, 'Lorient'      ],
  [ 23, '2026-02-08', 'D', 'Lorient',        2, 1, 'Lyon'         ],
  [ 24, '2026-02-22', 'E', 'Angers',         0, 1, 'Lorient'      ],
  [ 25, '2026-03-01', 'D', 'Lorient',        0, 2, 'Lens'         ],
  [ 26, '2026-03-08', 'E', 'Auxerre',        1, 1, 'Lorient'      ],
  [ 27, '2026-03-15', 'D', 'Lorient',        1, 0, 'Marseille'    ],
  // Matchs à venir (journées 28–34)
  [ 28, '2026-03-29', 'E', 'Monaco',         null, null, 'Lorient' ],
  [ 29, '2026-04-05', 'D', 'Lorient',        null, null, 'Nice'    ],
  [ 30, '2026-04-12', 'E', 'Le Havre',       null, null, 'Lorient' ],
  [ 31, '2026-04-19', 'D', 'Lorient',        null, null, 'Montpellier' ],
  [ 32, '2026-04-26', 'E', 'Nantes',         null, null, 'Lorient' ],
  [ 33, '2026-05-03', 'D', 'Lorient',        null, null, 'Brest'   ],
  [ 34, '2026-05-17', 'E', 'Strasbourg',     null, null, 'Lorient' ],
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

  // Stats
  const gf = MATCHES.filter(m => m[3] !== null).reduce((acc, m) => {
    return acc + (m[2] === 'D' ? m[3] : m[5]);
  }, 0);
  const ga = MATCHES.filter(m => m[3] !== null).reduce((acc, m) => {
    return acc + (m[2] === 'D' ? m[5] : m[3]);
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
    const finished = m[3] !== null;
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
