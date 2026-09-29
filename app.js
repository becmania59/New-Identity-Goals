const STORAGE_KEY = 'become-identity-program-v1';
const PHASE_DAYS_DEFAULT = 21;

const defaultPhases = [
  {
    name: 'Recalibrate',
    intent: 'Build evidence that you are someone who follows through.',
    days: 21,
    habits: [
      { title: 'Move before work', detail: '10 minutes minimum', tag: '10 min' },
      { title: 'Reset the dressing room', detail: 'Return things to their homes', tag: '5 min' },
      { title: 'Career-capital move', detail: 'One deliberate action toward your next-level role', tag: '10 min' },
      { title: 'Prepare tomorrow', detail: 'Clothes, bag or workspace ready', tag: '2 min' },
      { title: 'Keep one promise to yourself', detail: 'Choose something small and close the loop', tag: 'proof' }
    ]
  },
  {
    name: 'Build',
    intent: 'Increase the standard without losing consistency.',
    days: 21,
    habits: [
      { title: 'Move with intention', detail: 'Walk, gym or other purposeful movement', tag: '20 min' },
      { title: 'Close the room', detail: 'Tidy + put clean laundry away the same day', tag: '10 min' },
      { title: 'Career-capital move', detail: 'Build visibility, evidence, relationships or capability', tag: '20 min' },
      { title: 'Prepare tomorrow', detail: 'Reduce friction before the next day starts', tag: '5 min' },
      { title: 'Act like the next-level version', detail: 'Make one choice from that identity', tag: 'proof' }
    ]
  },
  {
    name: 'Expand',
    intent: 'Turn consistency into visible growth and opportunity.',
    days: 21,
    habits: [
      { title: 'Train or move', detail: 'Build physical capacity, not just activity', tag: '30 min' },
      { title: 'Maintain your environment', detail: 'Keep the dressing room and laundry cycle closed', tag: '10 min' },
      { title: 'High-value career move', detail: 'Create measurable value or move an opportunity forward', tag: '30 min' },
      { title: 'Increase visibility', detail: 'Contribute an idea, relationship or piece of leadership', tag: '1 action' },
      { title: 'Prepare tomorrow', detail: 'Make the desired behaviour the easy behaviour', tag: '5 min' }
    ]
  },
  {
    name: 'Embody',
    intent: 'Operate from the identity as your normal standard.',
    days: 21,
    habits: [
      { title: 'Protect movement', detail: 'Move or train as a normal part of your day', tag: '30+ min' },
      { title: 'Keep your environment ordered', detail: 'Close open loops before they accumulate', tag: '10 min' },
      { title: 'Create commercial value', detail: 'Advance work aligned with a $13k/month role', tag: '30 min' },
      { title: 'Lead visibly', detail: 'Make one senior-level contribution or decision', tag: '1 action' },
      { title: 'Close the day deliberately', detail: 'Review, reset and prepare tomorrow', tag: '10 min' }
    ]
  }
];

function localISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function freshState() {
  return {
    startDate: localISO(),
    autoAscend: true,
    identity: 'I run my life deliberately. I am organised, visible, physically active and commercially valuable. I follow through on small things because that is how I trust myself with bigger things.',
    careerGoal: 'Promotion / new role · $13k/month',
    phases: structuredClone(defaultPhases),
    days: {},
    reviews: []
  };
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!parsed) return freshState();
    const base = freshState();
    return { ...base, ...parsed, phases: parsed.phases?.length ? parsed.phases : base.phases, days: parsed.days || {}, reviews: parsed.reviews || [] };
  } catch {
    return freshState();
  }
}

let state = loadState();
const $ = (id) => document.getElementById(id);

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function parseLocalDate(iso) {
  const [y,m,d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

function dayDiff(aISO, bISO) {
  const a = parseLocalDate(aISO);
  const b = parseLocalDate(bISO);
  return Math.max(0, Math.floor((b - a) / 86400000));
}

function programPosition(dateISO = localISO()) {
  const elapsed = dayDiff(state.startDate, dateISO);
  let remaining = elapsed;
  for (let i = 0; i < state.phases.length; i++) {
    const length = Number(state.phases[i].days) || PHASE_DAYS_DEFAULT;
    if (remaining < length || (!state.autoAscend && i === 0)) {
      return { phaseIndex: i, dayInPhase: Math.min(remaining + 1, length), elapsed, phaseDays: length };
    }
    remaining -= length;
  }
  const i = state.phases.length - 1;
  const length = Number(state.phases[i].days) || PHASE_DAYS_DEFAULT;
  return { phaseIndex: i, dayInPhase: length, elapsed, phaseDays: length };
}

function getDayRecord(dateISO = localISO()) {
  if (!state.days[dateISO]) state.days[dateISO] = { habits: [], evidence: '' };
  return state.days[dateISO];
}

function completionFor(dateISO) {
  const record = state.days[dateISO];
  if (!record) return 0;
  const pos = programPosition(dateISO);
  const total = state.phases[pos.phaseIndex]?.habits?.length || 5;
  const done = (record.habits || []).filter(Boolean).length;
  return total ? Math.min(1, done / total) : 0;
}

function render() {
  const today = localISO();
  const pos = programPosition(today);
  const phase = state.phases[pos.phaseIndex];
  const record = getDayRecord(today);

  $('phaseBadge').textContent = `Phase ${pos.phaseIndex + 1}`;
  $('phaseName').textContent = phase.name;
  $('phaseIntent').textContent = phase.intent;
  $('dayNumber').textContent = `Day ${pos.dayInPhase}`;
  $('phaseLength').textContent = `of ${pos.phaseDays}`;
  const circumference = 2 * Math.PI * 48;
  const pct = Math.min(1, pos.dayInPhase / pos.phaseDays);
  $('ringProgress').style.strokeDasharray = circumference;
  $('ringProgress').style.strokeDashoffset = circumference * (1 - pct);

  $('identityText').textContent = state.identity;
  $('careerGoal').textContent = state.careerGoal;
  $('todayDate').textContent = parseLocalDate(today).toLocaleDateString(undefined, { weekday:'short', day:'numeric', month:'short' });
  $('startDateInput').value = state.startDate;
  $('autoAscendInput').checked = state.autoAscend;

  const list = $('habitList');
  list.innerHTML = '';
  phase.habits.forEach((habit, index) => {
    const done = !!record.habits[index];
    const row = document.createElement('div');
    row.className = `habit${done ? ' done' : ''}`;
    row.innerHTML = `
      <button class="check" type="button" data-habit="${index}" aria-label="${done ? 'Mark incomplete' : 'Mark complete'}">${done ? '✓' : ''}</button>
      <div><div class="habit-title"></div><div class="habit-sub"></div></div>
      <div class="habit-tag"></div>`;
    row.querySelector('.habit-title').textContent = habit.title;
    row.querySelector('.habit-sub').textContent = habit.detail;
    row.querySelector('.habit-tag').textContent = habit.tag;
    list.appendChild(row);
  });

  const doneCount = phase.habits.reduce((n, _, i) => n + (record.habits[i] ? 1 : 0), 0);
  const comp = phase.habits.length ? doneCount / phase.habits.length : 0;
  $('completionFill').style.width = `${Math.round(comp * 100)}%`;
  $('completionText').textContent = `${doneCount} of ${phase.habits.length} complete${comp >= .8 ? ' · day won' : ''}`;
  $('evidenceInput').value = record.evidence || '';

  renderStats();
  renderPhases(pos.phaseIndex);
  renderLastReview();
}

function renderStats() {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(localISO(d));
  }
  const scores = dates.map(completionFor);
  const avg = scores.reduce((a,b) => a+b,0) / scores.length;
  $('consistencyStat').textContent = `${Math.round(avg * 100)}%`;
  const allRecords = Object.keys(state.days);
  $('daysWonStat').textContent = allRecords.filter(d => completionFor(d) >= .8).length;
  $('evidenceStat').textContent = allRecords.filter(d => (state.days[d]?.evidence || '').trim()).length;

  const wrap = $('weekDots');
  wrap.innerHTML = '';
  dates.forEach((date, i) => {
    const score = scores[i];
    const el = document.createElement('div');
    el.className = `day-dot ${score >= .8 ? 'good' : score > 0 ? 'mid' : ''}`;
    el.innerHTML = `<div class="dot">${score ? Math.round(score*100)+'%' : '—'}</div><label>${parseLocalDate(date).toLocaleDateString(undefined,{weekday:'narrow'})}</label>`;
    wrap.appendChild(el);
  });
}

function renderPhases(currentIndex) {
  const wrap = $('phaseTimeline');
  wrap.innerHTML = '';
  state.phases.forEach((phase, i) => {
    const el = document.createElement('div');
    el.className = `phase-item ${i === currentIndex ? 'current' : i < currentIndex ? 'past' : ''}`;
    el.innerHTML = `<div class="phase-index">${i < currentIndex ? '✓' : i+1}</div><div><strong></strong><p></p></div><div class="phase-weeks"></div>`;
    el.querySelector('strong').textContent = phase.name;
    el.querySelector('p').textContent = phase.intent;
    el.querySelector('.phase-weeks').textContent = `${Math.round((phase.days || 21)/7)} weeks`;
    wrap.appendChild(el);
  });
}

function renderLastReview() {
  const box = $('lastReviewSummary');
  const last = state.reviews[state.reviews.length - 1];
  if (!last) { box.classList.add('hidden'); return; }
  box.classList.remove('hidden');
  const move = last.answers?.[4] || 'No career move recorded.';
  box.textContent = `Last review · ${parseLocalDate(last.date).toLocaleDateString(undefined,{day:'numeric',month:'short'})} — Next career move: ${move}`;
}

document.addEventListener('click', (e) => {
  const button = e.target.closest('[data-habit]');
  if (!button) return;
  const index = Number(button.dataset.habit);
  const record = getDayRecord();
  record.habits[index] = !record.habits[index];
  saveState(); render();
});

$('saveEvidenceBtn').addEventListener('click', () => {
  getDayRecord().evidence = $('evidenceInput').value.trim();
  saveState(); renderStats();
  $('saveStatus').textContent = 'Saved as evidence.';
  setTimeout(() => $('saveStatus').textContent = '', 1800);
});

$('editIdentityBtn').addEventListener('click', () => {
  $('identityEdit').value = state.identity;
  $('careerGoalEdit').value = state.careerGoal;
  $('identityDialog').showModal();
});

$('saveIdentityBtn').addEventListener('click', (e) => {
  e.preventDefault();
  state.identity = $('identityEdit').value.trim() || state.identity;
  state.careerGoal = $('careerGoalEdit').value.trim() || state.careerGoal;
  saveState(); $('identityDialog').close(); render();
});

$('openReviewBtn').addEventListener('click', () => {
  ['review1','review2','review3','review4','review5','review6'].forEach(id => $(id).value = '');
  $('reviewDialog').showModal();
});

$('saveReviewBtn').addEventListener('click', (e) => {
  e.preventDefault();
  const answers = ['review1','review2','review3','review4','review5','review6'].map(id => $(id).value.trim());
  state.reviews.push({ date: localISO(), answers });
  saveState(); $('reviewDialog').close(); renderLastReview();
});

$('saveSettingsBtn').addEventListener('click', () => {
  state.startDate = $('startDateInput').value || state.startDate;
  state.autoAscend = $('autoAscendInput').checked;
  saveState(); render();
});

function buildPhaseEditor() {
  const wrap = $('phaseEditor');
  wrap.innerHTML = '';
  const currentPhaseIndex = programPosition().phaseIndex;
  state.phases.forEach((phase, pIndex) => {
    const card = document.createElement('div');
    card.className = `phase-edit-card${pIndex === currentPhaseIndex ? ' current-edit' : ''}`;
    card.dataset.phaseCard = pIndex;
    card.innerHTML = `<div class="phase-edit-grid"><label>Name<input data-phase-name="${pIndex}" type="text"></label><label>Days<input data-phase-days="${pIndex}" type="text" inputmode="numeric"></label></div><label>Intent<input data-phase-intent="${pIndex}" type="text"></label><div class="activity-edit-header"><strong>Daily activities</strong><span class="muted small">Activity · what counts · tag</span></div><div data-habits="${pIndex}"></div>`;
    card.querySelector(`[data-phase-name="${pIndex}"]`).value = phase.name;
    card.querySelector(`[data-phase-days="${pIndex}"]`).value = phase.days;
    card.querySelector(`[data-phase-intent="${pIndex}"]`).value = phase.intent;
    const habitsWrap = card.querySelector(`[data-habits="${pIndex}"]`);
    phase.habits.forEach((habit, hIndex) => {
      const row = document.createElement('div');
      row.className = 'habit-edit-row';
      row.innerHTML = `<input data-h-title="${pIndex}-${hIndex}" type="text" aria-label="Activity title" placeholder="Activity"><input data-h-detail="${pIndex}-${hIndex}" type="text" aria-label="What counts as completion" placeholder="What counts as complete"><input data-h-tag="${pIndex}-${hIndex}" type="text" aria-label="Activity tag" placeholder="Tag">`;
      row.children[0].value = habit.title;
      row.children[1].value = habit.detail;
      row.children[2].value = habit.tag;
      habitsWrap.appendChild(row);
    });
    wrap.appendChild(card);
  });
}

function openPhaseEditor(focusCurrent = false) {
  buildPhaseEditor();
  $('phasesDialog').showModal();
  if (focusCurrent) {
    const phaseIndex = programPosition().phaseIndex;
    requestAnimationFrame(() => {
      const card = document.querySelector(`[data-phase-card="${phaseIndex}"]`);
      card?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  }
}

$('editPhasesBtn').addEventListener('click', () => openPhaseEditor(false));
$('editActivitiesBtn').addEventListener('click', () => openPhaseEditor(true));
$('savePhasesBtn').addEventListener('click', (e) => {
  e.preventDefault();
  state.phases = state.phases.map((phase, pIndex) => ({
    ...phase,
    name: document.querySelector(`[data-phase-name="${pIndex}"]`).value.trim() || phase.name,
    days: Math.max(7, Number(document.querySelector(`[data-phase-days="${pIndex}"]`).value) || 21),
    intent: document.querySelector(`[data-phase-intent="${pIndex}"]`).value.trim() || phase.intent,
    habits: phase.habits.map((habit, hIndex) => ({
      title: document.querySelector(`[data-h-title="${pIndex}-${hIndex}"]`).value.trim() || habit.title,
      detail: document.querySelector(`[data-h-detail="${pIndex}-${hIndex}"]`).value.trim() || habit.detail,
      tag: document.querySelector(`[data-h-tag="${pIndex}-${hIndex}"]`).value.trim() || habit.tag
    }))
  }));
  saveState(); $('phasesDialog').close(); render();
});

$('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `become-backup-${localISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

$('resetBtn').addEventListener('click', () => {
  if (!confirm('Reset all habits, evidence and reviews? This cannot be undone unless you exported a backup.')) return;
  state = freshState(); saveState(); render();
});

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; $('installBtn').classList.remove('hidden'); });
$('installBtn').addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  $('installBtn').classList.add('hidden');
});

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
render();
