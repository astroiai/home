/*
 * Publicaciones: lee js/publications-data.json (generado por GitHub Actions).
 * Para actualizar manualmente: ejecutar el workflow desde GitHub → Actions.
 */

const ADS_ORCIDS = [
  '0000-0002-8686-8737',  // Franz Bauer
  '0000-0002-3690-105X',  // Julio A. Carballo-Bello
  '0000-0001-7853-4094',  // Alexandre Gallenne
  '0000-0003-0006-0188',  // Giuliano Pignata
  '0000-0002-0149-1302',  // Bárbara Rojas-Ayala
  '0000-0001-7568-6412',  // Ezequiel Treister
];

const ADS_SEARCH_URL =
  'https://scixplorer.org/search/q=' +
  ADS_ORCIDS.map(o => `orcid%3A${o}`).join('+OR+') +
  '&sort=date%20desc%2C%20bibcode%20desc';

const JOURNAL_ABBR = {
  'The Astrophysical Journal':                     'ApJ',
  'The Astrophysical Journal Letters':             'ApJL',
  'The Astrophysical Journal Supplement Series':   'ApJS',
  'Monthly Notices of the Royal Astronomical Society': 'MNRAS',
  'Astronomy and Astrophysics':                    'A&A',
  'Astronomy & Astrophysics':                      'A&A',
  'Nature':                                        'Nature',
  'Nature Astronomy':                              'Nat.Astron.',
  'Science':                                       'Science',
  'The Astronomical Journal':                      'AJ',
  'arXiv e-prints':                                'arXiv',
};

function journalTag(pub) {
  for (const [full, abbr] of Object.entries(JOURNAL_ABBR)) {
    if (pub && pub.includes(full)) return abbr;
  }
  return pub ? pub.slice(0, 10) : '—';
}

function authorList(authors) {
  if (!authors || authors.length === 0) return '';
  if (authors.length <= 3) return authors.join('; ');
  return authors.slice(0, 3).join('; ') + ' et al.';
}

function buildEntry(paper) {
  const bibcode  = paper.bibcode || '';
  const arxivId  = (paper.identifier || []).find(id => id.startsWith('arXiv:'));
  const doi      = (paper.doi || [])[0] || null;
  const adsUrl   = bibcode ? `https://scixplorer.org/abs/${encodeURIComponent(bibcode)}` : '#';
  const arxivUrl = arxivId ? `https://arxiv.org/abs/${arxivId.replace('arXiv:', '')}` : null;
  const doiUrl   = doi ? `https://doi.org/${doi}` : null;

  const tag = journalTag(paper.pub);
  const ref = [paper.pub, paper.volume, paper.page ? paper.page[0] : '', `(${paper.year})`]
    .filter(Boolean).join(', ');

  return `
    <div class="pub-entry">
      <div class="pub-journal">${tag}</div>
      <div class="pub-body">
        <p class="pub-title">${paper.title ? paper.title[0] : 'Sin título'}</p>
        <p class="pub-authors">${authorList(paper.author)}</p>
        <p class="pub-ref">${ref}</p>
        <div class="pub-links">
          <a href="${adsUrl}" class="pub-link" target="_blank" rel="noopener">ADS</a>
          ${arxivUrl ? `<a href="${arxivUrl}" class="pub-link" target="_blank" rel="noopener">arXiv</a>` : ''}
          ${doiUrl   ? `<a href="${doiUrl}"   class="pub-link" target="_blank" rel="noopener">DOI</a>`   : ''}
        </div>
      </div>
    </div>`;
}

async function loadPublications() {
  const container = document.getElementById('pub-dynamic');
  if (!container) return;

  container.innerHTML = `
    <div class="pub-loading">
      <div class="pub-loading-spinner"></div>
      <p>Cargando publicaciones…</p>
    </div>`;

  try {
    const resp = await fetch('js/publications-data.json');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    const seen = new Set();
    const papers = (data.response?.docs || []).filter(p => {
      if (seen.has(p.bibcode)) return false;
      seen.add(p.bibcode);
      return true;
    });

    if (papers.length === 0) {
      container.innerHTML = `<p class="pub-ads-link">No se encontraron publicaciones.</p>`;
      return;
    }

    const byYear = {};
    papers.forEach(p => { (byYear[p.year] = byYear[p.year] || []).push(p); });

    let html = '';
    Object.keys(byYear).sort((a, b) => b - a).forEach(year => {
      html += `<div class="pub-year-group" data-year="${year}">
        <h2 class="pub-year">${year}</h2>
        ${byYear[year].map(buildEntry).join('')}
      </div>`;
    });

    html += `<div class="pub-ads-link">
      <p>Mostrando las ${papers.length} publicaciones más recientes del grupo.</p>
      <a href="${ADS_SEARCH_URL}" target="_blank" rel="noopener" class="btn btn-outline">
        Ver lista completa en NASA/ADS →
      </a>
    </div>`;

    container.innerHTML = html;

  } catch (err) {
    console.error('Error cargando publicaciones:', err);
    container.innerHTML = `
      <div class="pub-ads-link">
        <p>No se pudo cargar la lista de publicaciones.</p>
        <a href="${ADS_SEARCH_URL}" target="_blank" rel="noopener" class="btn btn-outline">
          Ver publicaciones en NASA/ADS →
        </a>
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', loadPublications);
