/*  
    Loads text IDs from texts/text_index.json, then fetches each .md file,
    parses the frontmatter and body, and renders them.
*/

let poemTexts = [];
let shortTexts = [];
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

/* ── Bootstrap: load text_index, then fetch each .md file ── */
document.addEventListener('DOMContentLoaded', () => {
  for (const textType of ['poem', 'short']) {
    fetch(`texts/${textType}_index.json`)
    .then(res => {
        if (!res.ok) throw new Error(`Could not load texts/${textType}_index.json`);
        return res.json();
    })
    .then(ids => Promise.all(
        ids.map(id =>
        fetch(`texts/${id}.md`)
            .then(r => r.text())
            .then(text => {
            const { meta, body } = parseFrontmatter(text);
            /* paragraphs: split on blank lines */
            const paragraphs = body.split(/\n\n+/).map(s => s.split('\n'));
            return { id, ...meta, paragraphs };
            })
        )
    ))
    .then(data => {
        if (textType === 'poem') {
            poemTexts = data;
        } else {
            shortTexts = data;
        }
        buildSidebar(textType);
    })
    .catch(err => {
        document.getElementById('empty-state').textContent =
        'Failed to load texts. ' + err.message;
    });
  }
});

/* ── Build sidebar list ── */
function buildSidebar(textType) {
  const list = document.getElementById(`${textType}-list`);
  const mainView = document.getElementById('main')
  list.innerHTML = '';

  const textList = textType === 'poem' ? poemTexts : shortTexts;
  textList.forEach(text => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.dataset.id = text.id;
    btn.innerHTML = `${text.title}`;
    btn.addEventListener('click', () => showText(text.id, textType));
    btn.addEventListener('click', function () {
        mainView.scrollIntoView({ behavior: "smooth" });
    });
    li.appendChild(btn);
    list.appendChild(li);
  });
}

/* ── Show a text by its id string ── */
function showText(id, textType) {
  const textList = textType === 'poem' ? poemTexts : shortTexts;
  const text = textList.find(p => p.id === id);
  if (!text) return false;

  currentId = id;

  document.querySelectorAll(`.${textType}-list button`).forEach(btn => {
    btn.classList.toggle('active', btn.dataset.id === id);
  });

  const main = document.getElementById('main');
  const old = document.getElementById(`text-view`);
  if (old) old.remove();

  document.getElementById('empty-state').style.display = 'none';

  const view = document.createElement('article');
  view.id = `text-view`;
  view.className = `text-view`;
  view.innerHTML = `
    <header class="${textType}-header" style="text-align: ${text.alignment}">
      <h1 class="${textType}-title-display">${text.title}</h1>
    </header>

    <div class="paragraphs">
      ${text.paragraphs.map(paragraph => `
        <div class="paragraph" style="text-align: ${text.alignment}">
          ${paragraph.map(line => `<div class="${textType}-line">${line || '&nbsp;'}</div>`).join('')}
        </div>
      `).join('')}
    </div>
  `;

  main.appendChild(view);
  requestAnimationFrame(() => view.classList.add('visible'));
  return true;
}
