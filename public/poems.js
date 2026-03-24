/*  
    Loads poem IDs from poems/poem_index.json, then fetches each .md file,
    parses the frontmatter and body, and renders them.
*/

let poems = [];
let currentId = null;

/* ── Frontmatter parser ── */
function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: text.trim() };

  const meta = Object.fromEntries(
    match[1].split('\n').filter(Boolean).map(line => {
      const [key, ...rest] = line.split(': ');
      let value = rest.join(': ').trim();
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim());
      }
      return [key.trim(), value];
    })
  );

  return { meta, body: match[2].trim() };
}

/* ── Bootstrap: load poem_index, then fetch each .md file ── */
document.addEventListener('DOMContentLoaded', () => {
    fetch('poems/poem_index.json')
    .then(res => {
        if (!res.ok) throw new Error('Could not load poems/poem_index.json');
        return res.json();
    })
    .then(ids => Promise.all(
        ids.map(id =>
        fetch(`poems/${id}.md`)
            .then(r => r.text())
            .then(text => {
            const { meta, body } = parseFrontmatter(text);
            /* stanzas: split on blank lines */
            const stanzas = body.split(/\n\n+/).map(s => s.split('\n'));
            return { id, ...meta, stanzas };
            })
        )
    ))
    .then(data => {
        poems = data;
        buildSidebar();
    })
    .catch(err => {
        document.getElementById('empty-state').textContent =
        'Failed to load poems. ' + err.message;
    });
});

/* ── Build sidebar list ── */
function buildSidebar() {
  const list = document.getElementById('poem-list');
  const mainView = document.getElementById('main')
  list.innerHTML = '';

  poems.forEach(poem => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.dataset.id = poem.id;
    btn.innerHTML = `${poem.title}`;
    btn.addEventListener('click', () => showPoem(poem.id));
    btn.addEventListener('click', function () {
        mainView.scrollIntoView({ behavior: "smooth" });
    });
    li.appendChild(btn);
    list.appendChild(li);
  });
}

/* ── Show a poem by its id string ── */
function showPoem(id) {
  const poem = poems.find(p => p.id === id);
  if (!poem) return false;

  currentId = id;

  document.querySelectorAll('.poem-list button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.id === id);
  });

  const main = document.getElementById('main');
  const old = document.getElementById('poem-view');
  if (old) old.remove();

  document.getElementById('empty-state').style.display = 'none';

  const view = document.createElement('article');
  view.id = 'poem-view';
  view.className = 'poem-view';
  view.innerHTML = `
    <header class="poem-header" style="text-align: ${poem.alignment}">
      <h1 class="poem-title-display">${poem.title}</h1>
    </header>

    <div class="stanzas">
      ${poem.stanzas.map(stanza => `
        <div class="stanza" style="text-align: ${poem.alignment}">
          ${stanza.map(line => `<div class="poem-line">${line || '&nbsp;'}</div>`).join('')}
        </div>
      `).join('')}
    </div>
  `;

  main.appendChild(view);
  requestAnimationFrame(() => view.classList.add('visible'));
  return true;
}

/* ── Called by the "Go" button ── */
function grabById() {
  const input = document.getElementById('id-input');
  const error = document.getElementById('grab-error');
  const id = input.value.trim().toLowerCase();

  error.style.display = 'none';
  if (!id) return;

  const found = showPoem(id);
  if (!found) {
    error.style.display = 'block';
  } else {
    input.value = '';
  }
}
