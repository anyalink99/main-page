// Poker Timer — Simplified Interactive Demo

(function() {
  const structure = [
    { type:'level', sb:100, bb:100, dur:1200 },
    { type:'level', sb:100, bb:200, dur:1200 },
    { type:'level', sb:200, bb:400, dur:1200 },
    { type:'break', dur:300 },
    { type:'level', sb:300, bb:600, dur:1200 },
    { type:'level', sb:400, bb:800, dur:1200 },
    { type:'level', sb:500, bb:1000, dur:1200 },
    { type:'break', dur:300 },
    { type:'level', sb:600, bb:1200, dur:1200 },
    { type:'level', sb:800, bb:1600, dur:1200 },
    { type:'level', sb:1000, bb:2000, dur:1200 },
  ];

  const TICKS = 48;
  const COLOR_TEXT = '#f0f0f0';
  const COLOR_MUTED = '#666';
  const COLOR_GREEN = '#22c55e';
  const ANIM_DUR = 380;
  const ANIM_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';

  let segIndex = 0;
  let remaining = structure[0].dur;
  let running = false;
  let intervalId = null;
  let isAnimating = false;

  // DOM refs
  const clockEl = document.getElementById('clock');
  const currentBlindsEl = document.getElementById('currentBlinds');
  const nextBlindsEl = document.getElementById('nextBlinds');
  const progressBarEl = document.getElementById('progressBar');
  const playBtn = document.getElementById('playBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const levelDurEl = document.getElementById('levelDuration');
  const currentLevelEl = document.getElementById('currentLevel');
  const nextBreakEl = document.getElementById('nextBreak');
  const iconPlay = playBtn.querySelector('.icon-play');
  const iconPause = playBtn.querySelector('.icon-pause');
  const blindsRow = document.querySelector('.blinds-row');

  function fmt(n) { return String(n).padStart(2, '0'); }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return fmt(m) + ':' + fmt(s);
  }

  function formatBlinds(sb, bb) {
    const f = n => n >= 1000 ? (n/1000) + 'K' : n;
    return f(sb) + ' / ' + f(bb);
  }

  function getLevelNumber(idx) {
    let n = 0;
    for (let i = 0; i <= idx; i++) {
      if (structure[i].type === 'level') n++;
    }
    return n;
  }

  function getTotalLevels() {
    return structure.filter(s => s.type === 'level').length;
  }

  function findNextBreak(fromIdx) {
    for (let i = fromIdx + 1; i < structure.length; i++) {
      if (structure[i].type === 'break') {
        return getLevelNumber(i - 1);
      }
    }
    return null;
  }

  function findNextLevel(fromIdx) {
    for (let i = fromIdx + 1; i < structure.length; i++) {
      if (structure[i].type === 'level') return i;
    }
    return null;
  }

  // --- Centralized display state computation ---
  function captureDisplayState(idx) {
    const seg = structure[idx];
    const isBreak = seg.type === 'break';

    let currentText, currentColor;
    if (isBreak) {
      currentText = 'BREAK';
      currentColor = COLOR_GREEN;
    } else {
      currentText = formatBlinds(seg.sb, seg.bb);
      currentColor = COLOR_TEXT;
    }

    let nextText;
    const nextLvl = findNextLevel(idx);
    if (nextLvl !== null) {
      nextText = formatBlinds(structure[nextLvl].sb, structure[nextLvl].bb);
    } else {
      nextText = '\u2014';
    }

    return { currentText, currentColor, nextText, isBreak };
  }

  // Build progress ticks
  function buildTicks() {
    progressBarEl.innerHTML = '';
    for (let i = 0; i < TICKS; i++) {
      const tick = document.createElement('div');
      tick.className = 'tick';
      tick.addEventListener('click', () => scrubTo(i));
      progressBarEl.appendChild(tick);
    }
  }

  function scrubTo(tickIndex) {
    const seg = structure[segIndex];
    const fraction = (tickIndex + 1) / TICKS;
    remaining = Math.max(1, Math.round(seg.dur * (1 - fraction)));
    render();
  }

  // --- Apply display state to real DOM (no animation) ---
  function applyBlindsState(state) {
    currentBlindsEl.textContent = state.currentText;
    nextBlindsEl.textContent = state.nextText;
    currentBlindsEl.parentElement.classList.toggle('is-break', state.isBreak);
  }

  // --- Create an overlay panel (absolutely positioned span) ---
  // Inserted inside .blind-group (position:relative) so it shares the exact
  // centering context as the real .blind-value. Uses the same CSS class for
  // identical font rendering. translateX is used to move between groups.
  function createPanel(text, color, refEl, targetGroup) {
    const group = targetGroup || refEl.closest('.blind-group');
    const panel = document.createElement('span');
    panel.className = 'blind-value';
    panel.textContent = text;
    panel.style.position = 'absolute';
    panel.style.left = '0';
    panel.style.right = '0';
    panel.style.bottom = '0';
    panel.style.color = color;
    panel.style.pointerEvents = 'none';
    panel.style.whiteSpace = 'nowrap';
    group.appendChild(panel);
    return panel;
  }

  // --- Blinds animation ---
  function animateBlinds(oldIdx, newIdx, direction) {
    if (isAnimating) return;
    isAnimating = true;

    const oldState = captureDisplayState(oldIdx);
    const newState = captureDisplayState(newIdx);

    // Decide mode: conveyor or crossfade
    let useConveyor;
    if (direction === 'forward') {
      useConveyor = (oldState.nextText === newState.currentText);
    } else {
      useConveyor = (oldState.currentText === newState.nextText);
    }

    // Measure positions using group rects (fixed width, no content-dependent shift)
    const currentGroupRect = currentBlindsEl.closest('.blind-group').getBoundingClientRect();
    const nextGroupRect = nextBlindsEl.closest('.blind-group').getBoundingClientRect();
    const shift = nextGroupRect.left - currentGroupRect.left;

    // Hide real values and create panels at OLD positions
    currentBlindsEl.style.visibility = 'hidden';
    nextBlindsEl.style.visibility = 'hidden';

    const panels = [];

    if (useConveyor && direction === 'forward') {
      const panelA = createPanel(oldState.currentText, oldState.currentColor, currentBlindsEl);
      const panelB = createPanel(oldState.nextText, COLOR_MUTED, nextBlindsEl);
      const panelC = createPanel(newState.nextText, COLOR_MUTED, nextBlindsEl);
      panels.push(panelA, panelB, panelC);

      // Apply new state NOW (hidden) so layout settles immediately
      applyBlindsState(newState);

      panelA.animate([
        { transform: 'translateX(0)', opacity: 1 },
        { transform: 'translateX(' + (-shift) + 'px)', opacity: 0 }
      ], { duration: ANIM_DUR, easing: ANIM_EASE, fill: 'forwards' });

      panelB.animate([
        { transform: 'translateX(0)', color: COLOR_MUTED },
        { transform: 'translateX(' + (-shift) + 'px)', color: newState.currentColor }
      ], { duration: ANIM_DUR, easing: ANIM_EASE, fill: 'forwards' });

      panelC.animate([
        { transform: 'translateX(' + shift + 'px)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 }
      ], { duration: ANIM_DUR, easing: ANIM_EASE, fill: 'forwards' });

    } else if (useConveyor && direction === 'backward') {
      const panelA = createPanel(oldState.currentText, oldState.currentColor, currentBlindsEl);
      const panelB = createPanel(oldState.nextText, COLOR_MUTED, nextBlindsEl);
      const panelC = createPanel(newState.currentText, newState.currentColor, currentBlindsEl);
      panels.push(panelA, panelB, panelC);

      applyBlindsState(newState);

      panelA.animate([
        { transform: 'translateX(0)', color: oldState.currentColor },
        { transform: 'translateX(' + shift + 'px)', color: COLOR_MUTED }
      ], { duration: ANIM_DUR, easing: ANIM_EASE, fill: 'forwards' });

      panelB.animate([
        { transform: 'translateX(0)', opacity: 1 },
        { transform: 'translateX(' + shift + 'px)', opacity: 0 }
      ], { duration: ANIM_DUR, easing: ANIM_EASE, fill: 'forwards' });

      panelC.animate([
        { transform: 'translateX(' + (-shift) + 'px)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 }
      ], { duration: ANIM_DUR, easing: ANIM_EASE, fill: 'forwards' });

    } else {
      // Crossfade: only current slot changes, next stays
      const dir = direction === 'forward' ? -1 : 1;
      const outPanel = createPanel(oldState.currentText, oldState.currentColor, currentBlindsEl);
      const inPanel = createPanel(newState.currentText, newState.currentColor, currentBlindsEl);
      panels.push(outPanel, inPanel);

      // Also handle next if it changed
      if (oldState.nextText !== newState.nextText) {
        const outNext = createPanel(oldState.nextText, COLOR_MUTED, nextBlindsEl);
        const inNext = createPanel(newState.nextText, COLOR_MUTED, nextBlindsEl);
        panels.push(outNext, inNext);

        // Apply new state now
        applyBlindsState(newState);

        outNext.animate([
          { transform: 'translateX(0)', opacity: 1 },
          { transform: 'translateX(' + (dir * 40) + 'px)', opacity: 0 }
        ], { duration: ANIM_DUR, easing: ANIM_EASE, fill: 'forwards' });

        inNext.animate([
          { transform: 'translateX(' + (-dir * 40) + 'px)', opacity: 0 },
          { transform: 'translateX(0)', opacity: 1 }
        ], { duration: ANIM_DUR, easing: ANIM_EASE, fill: 'forwards' });
      } else {
        applyBlindsState(newState);
        nextBlindsEl.style.visibility = 'visible';
      }

      outPanel.animate([
        { transform: 'translateX(0)', opacity: 1 },
        { transform: 'translateX(' + (dir * 40) + 'px)', opacity: 0 }
      ], { duration: ANIM_DUR, easing: ANIM_EASE, fill: 'forwards' });

      inPanel.animate([
        { transform: 'translateX(' + (-dir * 40) + 'px)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 }
      ], { duration: ANIM_DUR, easing: ANIM_EASE, fill: 'forwards' });
    }

    // Cleanup: just remove panels and reveal real elements (already updated)
    setTimeout(() => {
      panels.forEach(p => p.remove());
      currentBlindsEl.style.visibility = 'visible';
      nextBlindsEl.style.visibility = 'visible';
      isAnimating = false;
    }, ANIM_DUR + 20);
  }

  function render() {
    const seg = structure[segIndex];
    const isBreak = seg.type === 'break';

    // Clock
    clockEl.textContent = formatTime(remaining);
    clockEl.classList.toggle('paused', !running);
    clockEl.classList.toggle('warning', !isBreak && remaining <= 60 && remaining > 10);
    clockEl.classList.toggle('danger', !isBreak && remaining <= 10);
    clockEl.classList.toggle('is-break', isBreak);

    // Blinds (skip if mid-animation — panels are handling display)
    if (!isAnimating) {
      applyBlindsState(captureDisplayState(segIndex));
    }

    // Progress
    const elapsed = seg.dur - remaining;
    const filledCount = Math.round((elapsed / seg.dur) * TICKS);
    const ticks = progressBarEl.querySelectorAll('.tick');
    ticks.forEach((t, i) => {
      t.classList.toggle('filled', i < filledCount);
      t.classList.toggle('break-tick', isBreak);
    });

    // Play/pause icon
    iconPlay.style.display = running ? 'none' : '';
    iconPause.style.display = running ? '' : 'none';

    // Footer
    levelDurEl.textContent = (seg.dur / 60) + ' min';
    if (!isBreak) {
      currentLevelEl.textContent = getLevelNumber(segIndex) + ' / ' + getTotalLevels();
    } else {
      currentLevelEl.textContent = 'Break';
    }
    const nb = findNextBreak(segIndex);
    nextBreakEl.textContent = nb !== null ? 'After Level ' + nb : 'None';
  }

  function tick() {
    if (!running) return;
    remaining--;
    if (remaining <= 0) {
      if (segIndex < structure.length - 1) {
        const oldIdx = segIndex;
        segIndex++;
        remaining = structure[segIndex].dur;
        animateBlinds(oldIdx, segIndex, 'forward');
      } else {
        running = false;
      }
    }
    render();
  }

  function togglePlay() {
    running = !running;
    if (running && !intervalId) {
      intervalId = setInterval(tick, 1000);
    }
    if (!running && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    render();
  }

  function goNext() {
    if (isAnimating) return;
    if (segIndex < structure.length - 1) {
      const oldIdx = segIndex;
      segIndex++;
      remaining = structure[segIndex].dur;
      animateBlinds(oldIdx, segIndex, 'forward');
      render();
    }
  }

  function goPrev() {
    if (isAnimating) return;
    if (segIndex > 0) {
      const oldIdx = segIndex;
      segIndex--;
      remaining = structure[segIndex].dur;
      animateBlinds(oldIdx, segIndex, 'backward');
      render();
    }
  }

  // Init
  buildTicks();
  render();

  playBtn.addEventListener('click', togglePlay);
  nextBtn.addEventListener('click', goNext);
  prevBtn.addEventListener('click', goPrev);

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    if (e.code === 'ArrowRight') goNext();
    if (e.code === 'ArrowLeft') goPrev();
  });

  // Pro modal
  const proModal = document.getElementById('proModal');
  const proBadge = document.getElementById('proBadge');
  const proClose = document.getElementById('proModalClose');

  proBadge.addEventListener('click', () => proModal.classList.add('open'));
  proClose.addEventListener('click', () => proModal.classList.remove('open'));
  proModal.addEventListener('click', e => {
    if (e.target === proModal) proModal.classList.remove('open');
  });
  document.addEventListener('keydown', e => {
    if (e.code === 'Escape') proModal.classList.remove('open');
  });
})();
