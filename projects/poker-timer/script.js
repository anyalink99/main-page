// Poker Timer — Simplified Interactive Demo

(function() {
  // Structure: 9 levels + 2 breaks (like the original default first half)
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
  let segIndex = 0;
  let remaining = structure[0].dur; // seconds left
  let running = false;
  let intervalId = null;

  // DOM refs
  const clockEl = document.getElementById('clock');
  const currentBlindsEl = document.getElementById('currentBlinds');
  const nextBlindsEl = document.getElementById('nextBlinds');
  const levelLabelEl = document.getElementById('levelLabel');
  const progressBarEl = document.getElementById('progressBar');
  const playBtn = document.getElementById('playBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const levelDurEl = document.getElementById('levelDuration');
  const currentLevelEl = document.getElementById('currentLevel');
  const nextBreakEl = document.getElementById('nextBreak');
  const iconPlay = playBtn.querySelector('.icon-play');
  const iconPause = playBtn.querySelector('.icon-pause');

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

  function render() {
    const seg = structure[segIndex];
    const isBreak = seg.type === 'break';

    // Clock
    clockEl.textContent = formatTime(remaining);
    clockEl.classList.toggle('paused', !running);
    clockEl.classList.toggle('warning', !isBreak && remaining <= 60 && remaining > 10);
    clockEl.classList.toggle('danger', !isBreak && remaining <= 10);
    clockEl.classList.toggle('is-break', isBreak);

    // Blinds
    if (isBreak) {
      levelLabelEl.textContent = 'Break';
      levelLabelEl.style.color = '#22c55e';
      currentBlindsEl.textContent = 'BREAK';
      currentBlindsEl.parentElement.classList.add('is-break');

      const nextLvl = findNextLevel(segIndex);
      if (nextLvl !== null) {
        nextBlindsEl.textContent = formatBlinds(structure[nextLvl].sb, structure[nextLvl].bb);
      }
    } else {
      const lvlNum = getLevelNumber(segIndex);
      levelLabelEl.textContent = 'Level ' + lvlNum;
      levelLabelEl.style.color = '';
      currentBlindsEl.textContent = formatBlinds(seg.sb, seg.bb);
      currentBlindsEl.parentElement.classList.remove('is-break');

      const nextLvl = findNextLevel(segIndex);
      if (nextLvl !== null) {
        const ns = structure[nextLvl];
        nextBlindsEl.textContent = ns.type === 'break' ? 'BREAK' : formatBlinds(ns.sb, ns.bb);
      } else {
        nextBlindsEl.textContent = '—';
      }
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
      // Auto-advance to next segment
      if (segIndex < structure.length - 1) {
        segIndex++;
        remaining = structure[segIndex].dur;
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
    if (segIndex < structure.length - 1) {
      segIndex++;
      remaining = structure[segIndex].dur;
      render();
    }
  }

  function goPrev() {
    if (segIndex > 0) {
      segIndex--;
      remaining = structure[segIndex].dur;
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
})();
