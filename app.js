const categoryNames = { course: '课程与人物', film: '宣传与生活', motion: '动画与 AIGC', mobile: '手机随手拍' };
const grid = document.querySelector('#work-grid');
const filters = [...document.querySelectorAll('.filter')];
const showMore = document.querySelector('#show-more');
const dialog = document.querySelector('#player-dialog');
const player = document.querySelector('#player');
const loading = document.querySelector('#video-loading');
const errorMessage = document.querySelector('#video-error');
let currentFilter = 'all';
let expanded = false;
let activeTrigger;

function renderWorks() {
  const matching = currentFilter === 'all' ? works : works.filter(work => work.category === currentFilter);
  const visible = currentFilter === 'all' && !expanded ? matching.slice(0, 6) : matching;
  grid.replaceChildren();
  visible.forEach(work => {
    const previewLabel = `${work.previewSeconds || 24} 秒预览`;
    const article = document.createElement('article');
    article.className = 'work-card';
    article.dataset.workId = String(work.id);
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `播放《${work.title}》${previewLabel}`);
    const image = document.createElement('div');
    image.className = 'work-image';
    const img = document.createElement('img');
    img.src = work.poster;
    img.alt = `${work.title}，真实作品画面`;
    img.loading = 'lazy';
    img.width = 960;
    img.height = 540;
    image.append(img);
    const play = document.createElement('span');
    play.className = 'play-mark';
    play.setAttribute('aria-hidden', 'true');
    play.innerHTML = '<span>▶</span>';
    image.append(play);
    const caption = document.createElement('div');
    caption.className = 'work-caption';
    const text = document.createElement('div');
    const heading = document.createElement('h3');
    heading.textContent = work.title;
    const description = document.createElement('p');
    description.textContent = previewLabel;
    text.append(heading, description);
    const arrow = document.createElement('span');
    arrow.className = 'work-arrow';
    arrow.textContent = '↗';
    arrow.setAttribute('aria-hidden', 'true');
    caption.append(text, arrow);
    button.append(image, caption);
    button.addEventListener('click', () => openWork(work, button));
    article.append(button);
    grid.append(article);
  });
  showMore.hidden = currentFilter !== 'all';
  showMore.innerHTML = expanded ? '收起作品 <span aria-hidden="true">−</span>' : `查看全部 ${works.length} 个作品 <span aria-hidden="true">＋</span>`;
  showMore.setAttribute('aria-expanded', String(expanded));
  document.querySelector('#work-count').textContent = `展示 ${visible.length} / ${works.length}`;
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) [...grid.querySelectorAll('.work-card')].forEach((card, index) => {
    card.animate([{ opacity: .3, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 360, delay: Math.min(index * 40, 200), easing: 'cubic-bezier(.2,.7,.2,1)' });
  });
}

filters.forEach(button => button.addEventListener('click', () => {
  currentFilter = button.dataset.filter;
  filters.forEach(filter => {
    const selected = filter === button;
    filter.classList.toggle('active', selected);
    filter.setAttribute('aria-pressed', String(selected));
  });
  renderWorks();
}));
showMore.addEventListener('click', () => {
  expanded = !expanded;
  renderWorks();
  if (!expanded) document.querySelector('#works').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
});

function openWork(work, trigger) {
  activeTrigger = trigger;
  document.querySelector('#player-title').textContent = work.title;
  document.querySelector('#player-category').textContent = categoryNames[work.category];
  document.querySelector('#full-work').href = work.full;
  document.querySelector('#preview-note').textContent = work.note || `${work.previewSeconds || 24} 秒作品节选，完整版请前往飞书查看。`;
  dialog.classList.toggle('is-portrait', work.category === 'mobile');
  loading.hidden = false;
  errorMessage.hidden = true;
  player.poster = work.poster;
  player.src = work.preview;
  dialog.showModal();
  document.body.classList.add('modal-open');
  document.querySelector('#close-player').focus();
  player.play().catch(() => { loading.hidden = true; });
}
function closePlayer() { dialog.close(); }
document.querySelector('#close-player').addEventListener('click', closePlayer);
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closePlayer(); } });
dialog.addEventListener('close', () => {
  player.pause();
  player.removeAttribute('src');
  player.load();
  document.body.classList.remove('modal-open');
  activeTrigger?.focus();
});
player.addEventListener('waiting', () => { if (dialog.open) loading.hidden = false; });
player.addEventListener('playing', () => { loading.hidden = true; });
player.addEventListener('canplay', () => { loading.hidden = true; });
player.addEventListener('error', () => { if (dialog.open) { loading.hidden = true; errorMessage.hidden = false; } });

const themeButton = document.querySelector('.theme-toggle');
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeButton.textContent = theme === 'dark' ? '浅色' : '深色';
  themeButton.setAttribute('aria-label', `切换到${theme === 'dark' ? '浅色' : '深色'}模式`);
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#141719' : '#f7f6f2';
}
try { const saved = localStorage.getItem('zx-theme-v2'); if (saved === 'light' || saved === 'dark') setTheme(saved); } catch {}
themeButton.addEventListener('click', () => { const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; setTheme(theme); try { localStorage.setItem('zx-theme-v2', theme); } catch {} });
async function copyContact(value, label) {
  const status = document.querySelector('#copy-status');
  try { await navigator.clipboard.writeText(value); status.textContent = `${label}已复制。`; }
  catch { status.textContent = `请手动复制${label}：${value}`; }
}
document.querySelector('#copy-email').addEventListener('click', () => copyContact('1198760420@qq.com', '邮箱'));
document.querySelector('#copy-phone').addEventListener('click', () => copyContact('18716157840', '电话号码'));
renderWorks();
