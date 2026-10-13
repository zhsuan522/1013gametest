const lessons = [
  {
    title: '讓終端機說聲嗨',
    tag: '文字輸出',
    goal: '選出正確的程式碼，讓主控台顯示指定文字。',
    prompt: '選一行可以把「你好，Java！」輸出到主控台。',
    before: ['public class Main {', '  public static void main(String[] args) {'],
    after: ['  }', '}'],
    correct: 'println',
    hint: '看看文字有沒有用雙引號包住，並留意每一行 Java 指令結尾的分號。',
    target: '你好，Java！',
    choices: [
      { id: 'println', code: 'System.out.println("你好，Java！");' },
      { id: 'unquoted', code: 'System.out.println(你好，Java！);' },
      { id: 'missing-semicolon', code: 'System.out.println("你好，Java！")' },
    ],
    explain: {
      question: '你發現了什麼？為什麼這行程式能輸出文字？',
      options: [
        { id: 'quoted-text', label: '雙引號框住文字；println 會把引號內的內容輸出。', correct: true },
        { id: 'java-guess', label: 'Java 會自動把沒有引號的文字猜成要輸出的內容。' },
        { id: 'all-code', label: 'println 會把整行程式碼直接顯示在主控台。' },
      ],
    },
    transfer: {
      question: '如果要輸出「起飛！」，哪一行能沿用剛才的做法？',
      options: [
        { id: 'transfer-quoted', label: 'System.out.println("起飛！");', correct: true },
        { id: 'transfer-unquoted', label: 'System.out.println(起飛！);' },
      ],
    },
  },
  {
    title: '讀出能量數值',
    tag: '變數',
    goal: '讀取變數中儲存的值，讓機器人知道還有多少能量。',
    prompt: 'energy 已經存了 3。選一行輸出 energy 裡的數值。',
    before: ['public class Main {', '  public static void main(String[] args) {', '    int energy = 3;'],
    after: ['  }', '}'],
    correct: 'variable',
    hint: '變數名稱不加引號時，Java 會去讀取它存放的值；加上引號就會變成文字。',
    target: '3',
    choices: [
      { id: 'variable', code: 'System.out.println(energy);' },
      { id: 'literal', code: 'System.out.println("energy");' },
      { id: 'changed-value', code: 'System.out.println(energy + 1);' },
    ],
    explain: {
      question: '為什麼主控台顯示 3，而不是 energy 這個字？',
      options: [
        { id: 'variable-value', label: '沒有引號的 energy 是變數，Java 會讀出裡面存的值。', correct: true },
        { id: 'variable-name', label: 'Java 會把變數名稱翻譯成它的英文意思。' },
        { id: 'number-default', label: 'println 會把每個變數都自動改成數字 3。' },
      ],
    },
    transfer: {
      question: '若 score 存著目前分數，哪一行會輸出分數的值？',
      options: [
        { id: 'score-variable', label: 'System.out.println(score);', correct: true },
        { id: 'score-text', label: 'System.out.println("score");' },
      ],
    },
  },
  {
    title: '判斷能不能起飛',
    tag: '條件判斷',
    goal: '用條件決定程式要執行哪一段。',
    prompt: 'fuel 目前是 0。選出「燃料大於 0 才起飛」的判斷條件。',
    before: ['public class Main {', '  public static void main(String[] args) {', '    int fuel = 0;'],
    after: ['      System.out.println("起飛");', '    } else {', '      System.out.println("先補充燃料");', '    }', '  }', '}'],
    correct: 'greater-than',
    hint: '題目說「大於 0」；想想 0 和 0 的關係，再看 `>`、`>=`、`==` 各代表什麼。',
    target: '先補充燃料',
    choices: [
      { id: 'greater-than', code: 'if (fuel > 0) {' },
      { id: 'greater-equal', code: 'if (fuel >= 0) {' },
      { id: 'equal', code: 'if (fuel == 0) {' },
    ],
    explain: {
      question: 'fuel 是 0 時，為什麼程式會執行 else 區塊？',
      options: [
        { id: 'false-condition', label: '0 不大於 0，所以條件不成立，程式走到 else。', correct: true },
        { id: 'else-always', label: 'else 是每次執行都會跑的區塊。' },
        { id: 'zero-positive', label: '0 在 Java 裡會被當成大於 0。' },
      ],
    },
    transfer: {
      question: '如果 fuel 改成 5，條件 `fuel > 0` 會走哪一邊？',
      options: [
        { id: 'if-branch', label: 'if 區塊：執行「起飛」。', correct: true },
        { id: 'else-branch', label: 'else 區塊：執行「先補充燃料」。' },
      ],
    },
  },
];

const storageKey = 'java-task-learning-room-v1';
const safeReadProgress = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return {
      completed: Math.max(0, Math.min(lessons.length, Number(saved.completed) || 0)),
      current: Math.max(0, Math.min(lessons.length, Number(saved.current) || 0)),
      notes: Array.isArray(saved.notes) ? saved.notes.slice(0, lessons.length) : [],
    };
  } catch {
    return { completed: 0, current: 0, notes: [] };
  }
};

const stored = safeReadProgress();
const state = {
  completed: stored.completed,
  current: stored.current,
  notes: stored.notes,
  selected: null,
  firstChoice: null,
  attempts: 0,
  result: null,
  explanation: null,
  transfer: null,
};

const el = {
  completedCount: document.querySelector('#completed-count'),
  progress: document.querySelector('#mission-progress'),
  lessonView: document.querySelector('#lesson-view'),
  lessonKicker: document.querySelector('#lesson-kicker'),
  lessonTitle: document.querySelector('#lesson-title'),
  lessonGoal: document.querySelector('#lesson-goal'),
  lessonPrompt: document.querySelector('#lesson-prompt'),
  codeEditor: document.querySelector('#code-editor'),
  choices: document.querySelector('#code-choices'),
  runButton: document.querySelector('#run-button'),
  feedback: document.querySelector('#run-feedback'),
  console: document.querySelector('#console-output'),
  consoleState: document.querySelector('#console-state'),
  output: document.querySelector('#output-text'),
  reflection: document.querySelector('#reflection-panel'),
  reflectionStage: document.querySelector('#reflection-stage'),
  prediction: document.querySelector('#prediction-comparison'),
  reflectionContent: document.querySelector('#reflection-content'),
  noteLabel: document.querySelector('#note-label'),
  note: document.querySelector('#reflection-note'),
  continueButton: document.querySelector('#continue-button'),
  completion: document.querySelector('#completion-view'),
  recap: document.querySelector('#recap-list'),
  restartButton: document.querySelector('#restart-button'),
  phaserWorld: document.querySelector('#phaser-world'),
  phaserFallback: document.querySelector('#phaser-fallback'),
};

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({
      completed: state.completed,
      current: state.current,
      notes: state.notes,
    }));
  } catch {
    // The lesson remains usable when local storage is unavailable.
  }
}

function resetLessonState() {
  state.selected = null;
  state.firstChoice = null;
  state.attempts = 0;
  state.result = null;
  state.explanation = null;
  state.transfer = null;
}

function renderProgress() {
  el.completedCount.textContent = `已完成 ${state.completed} / ${lessons.length}`;
  el.progress.innerHTML = lessons.map((lesson, index) => {
    const done = index < state.completed;
    const active = index === state.current;
    const locked = index > state.completed;
    const label = `${String(index + 1).padStart(2, '0')} ${lesson.tag}`;
    return `<li class="mission-step${done ? ' done' : ''}${active ? ' active' : ''}">
      <button class="mission-button" type="button" data-mission="${index}" ${locked ? 'disabled' : ''} ${active ? 'aria-current="step"' : ''} aria-label="${done ? '重看' : locked ? '尚未解鎖' : '前往'}任務 ${index + 1}：${escapeHTML(lesson.tag)}">
        <span class="mission-number" aria-hidden="true">${done ? '✓' : String(index + 1).padStart(2, '0')}</span>
        <span class="mission-name">${escapeHTML(lesson.tag)}</span>
      </button>
    </li>`;
  }).join('');
  el.progress.querySelectorAll('[data-mission]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = Number(button.dataset.mission);
      if (next === state.current) return;
      state.current = next;
      resetLessonState();
      persist();
      render();
      setPhaserLesson();
    });
  });
}

function currentLesson() {
  return lessons[state.current];
}

function renderCode(lesson) {
  const picked = lesson.choices.find((choice) => choice.id === state.selected);
  const slot = picked ? picked.code : '// 選擇一行程式碼';
  const lines = [
    ...lesson.before.map((text) => ({ text, active: false, placeholder: false })),
    { text: `    ${slot}`, active: true, placeholder: !picked },
    ...lesson.after.map((text) => ({ text, active: false, placeholder: false })),
  ];
  el.codeEditor.innerHTML = lines.map((line, index) => `<div class="code-line${line.active ? ' active-line' : ''}${line.placeholder ? ' placeholder-line' : ''}"><span class="line-number">${index + 1}</span><code class="code-text">${escapeHTML(line.text)}</code></div>`).join('');
}

function renderChoices(lesson) {
  el.choices.innerHTML = lesson.choices.map((choice, index) => `<label class="code-choice${state.selected === choice.id ? ' selected' : ''}">
    <input type="radio" name="code-choice" value="${escapeHTML(choice.id)}" ${state.selected === choice.id ? 'checked' : ''} ${state.result === 'success' ? 'disabled' : ''}>
    <span class="choice-letter" aria-hidden="true">${String.fromCharCode(65 + index)}</span><code>${escapeHTML(choice.code)}</code>
  </label>`).join('');
  el.choices.querySelectorAll('input[name="code-choice"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      state.selected = radio.value;
      render();
      el.choices.querySelector(`input[value="${CSS.escape(state.selected)}"]`)?.focus();
    });
  });
}

function renderReflection(lesson) {
  const successful = state.result === 'success';
  el.reflection.hidden = !successful;
  if (!successful) return;

  const firstChoice = lesson.choices.find((choice) => choice.id === state.firstChoice);
  const firstWasRight = state.firstChoice === lesson.correct;
  const corrected = !firstWasRight;
  el.prediction.innerHTML = `<span class="comparison-label">先前選擇</span><span class="comparison-chip">${escapeHTML(firstChoice?.code || '尚未選擇')}</span><span aria-hidden="true">→</span><span class="comparison-label">執行結果</span><span class="comparison-chip">${escapeHTML(lesson.target)}</span><span class="comparison-result">${corrected ? '修正後成功；修正也是學習的一部分。' : '預測和結果一致。'}</span>`;

  const explanationOption = lesson.explain.options.find((option) => option.id === state.explanation);
  const explanationDone = explanationOption?.correct === true;
  const transferVisible = explanationDone;
  const transferOption = lesson.transfer.options.find((option) => option.id === state.transfer);
  const transferDone = explanationDone && transferOption?.correct === true;
  el.reflectionStage.textContent = transferDone ? '第 4 步，共 4 步' : explanationDone ? '第 4 步，共 4 步' : '第 3 步，共 4 步';

  const questionCard = (index, group, selected, selectedOption) => `<div class="reflection-question">
    <h3><span class="question-index">${index}</span>${escapeHTML(group.question)}</h3>
    <div class="reflection-choices" role="radiogroup" aria-label="${escapeHTML(group.question)}">
      ${group.options.map((option) => `<label class="reflection-choice${selected === option.id ? ' selected' : ''}"><input type="radio" name="reflection-${index}" data-reflection="${index}" value="${escapeHTML(option.id)}" ${selected === option.id ? 'checked' : ''}><span>${escapeHTML(option.label)}</span></label>`).join('')}
    </div>
    ${selectedOption ? `<p class="reflection-answer-feedback ${selectedOption.correct ? 'right' : 'retry'}" role="status">${selectedOption.correct ? (index === 'A' ? '對，這個解釋和剛才看到的結果一致。' : '很好，你已把同一個觀念用在新的例子裡。') : (index === 'A' ? '再看一眼程式中標示的那一行，找出引號、變數或比較符號的作用，再試一次。' : '把新情境的內容代回程式想一遍，再試一次。')}</p>` : ''}
  </div>`;

  el.reflectionContent.innerHTML = questionCard('A', lesson.explain, state.explanation, explanationOption)
    + (transferVisible ? questionCard('B', lesson.transfer, state.transfer, transferOption) : '');

  el.reflectionContent.querySelectorAll('input[data-reflection]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const group = radio.dataset.reflection;
      if (group === 'A') {
        state.explanation = radio.value;
        state.transfer = null;
      } else {
        state.transfer = radio.value;
      }
      renderReflection(lesson);
      const next = el.reflectionContent.querySelector(`[data-reflection="${group}"][value="${CSS.escape(radio.value)}"]`);
      next?.focus();
    });
  });

  el.noteLabel.hidden = !transferDone;
  el.note.value = state.notes[state.current] || '';
  el.continueButton.disabled = !transferDone;
  el.continueButton.textContent = state.current === lessons.length - 1 ? '完成學習路線' : '完成反思，前往下一關';
}

function renderOutput(lesson) {
  if (state.result === 'success') {
    el.console.classList.add('has-output');
    el.consoleState.textContent = '執行完成';
    el.output.textContent = lesson.target;
  } else if (state.result === 'error') {
    el.console.classList.remove('has-output');
    el.consoleState.textContent = '請再試一次';
    el.output.textContent = '程式沒有達成任務目標。調整選擇後再執行。';
  } else {
    el.console.classList.remove('has-output');
    el.consoleState.textContent = '尚未執行';
    el.output.textContent = '執行程式後，結果會顯示在這裡。';
  }
}

function setPhaserLesson() {
  window.dispatchEvent(new CustomEvent('java-learning:lesson', { detail: { index: state.current } }));
  window.dispatchEvent(new CustomEvent('java-learning:reset'));
}

function renderLesson() {
  const lesson = currentLesson();
  el.lessonKicker.textContent = `任務 ${String(state.current + 1).padStart(2, '0')} · ${lesson.tag}`;
  el.lessonTitle.textContent = lesson.title;
  el.lessonGoal.textContent = lesson.goal;
  el.lessonPrompt.textContent = lesson.prompt;
  renderCode(lesson);
  renderChoices(lesson);
  el.runButton.disabled = !state.selected || state.result === 'success';
  el.runButton.innerHTML = `<span class="play-icon" aria-hidden="true">▶</span> ${state.attempts ? '再次執行' : '執行程式'}`;
  el.feedback.className = 'run-feedback';
  if (state.result === 'error') {
    el.feedback.textContent = lesson.hint;
  } else if (state.result === 'success') {
    el.feedback.classList.add('success');
    el.feedback.textContent = '任務完成。先看主控台，再整理你的發現。';
  } else {
    el.feedback.textContent = '';
  }
  renderOutput(lesson);
  renderReflection(lesson);
  renderProgress();
}

function renderCompletion() {
  el.lessonView.hidden = true;
  el.completion.hidden = false;
  el.recap.innerHTML = lessons.map((lesson) => `<div class="recap-item"><span class="recap-check" aria-hidden="true">✓</span><span>${escapeHTML(lesson.tag)}<br><span style="font-weight:500;color:#82918b">${escapeHTML(lesson.title)}</span></span></div>`).join('');
  renderProgress();
}

function render() {
  if (state.current >= lessons.length) {
    renderCompletion();
    return;
  }
  el.completion.hidden = true;
  el.lessonView.hidden = false;
  renderLesson();
}

el.runButton.addEventListener('click', () => {
  const lesson = currentLesson();
  if (!state.selected || state.result === 'success') return;
  if (state.firstChoice === null) state.firstChoice = state.selected;
  state.attempts += 1;
  const correct = state.selected === lesson.correct;
  state.result = correct ? 'success' : 'error';
  render();
  window.dispatchEvent(new CustomEvent('java-learning:run', { detail: { correct, index: state.current } }));
  if (correct) el.reflection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

el.note.addEventListener('input', () => {
  state.notes[state.current] = el.note.value;
  persist();
});

el.continueButton.addEventListener('click', () => {
  if (!state.transfer) return;
  state.notes[state.current] = el.note.value;
  state.completed = Math.max(state.completed, state.current + 1);
  state.current += 1;
  persist();
  resetLessonState();
  if (state.current >= lessons.length) {
    renderCompletion();
    window.dispatchEvent(new CustomEvent('java-learning:finish'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  render();
  setPhaserLesson();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

el.restartButton.addEventListener('click', () => {
  state.completed = 0;
  state.current = 0;
  state.notes = [];
  resetLessonState();
  persist();
  render();
  setPhaserLesson();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

function startPhaser() {
  if (typeof Phaser === 'undefined') {
    el.phaserWorld.hidden = true;
    el.phaserFallback.hidden = false;
    return;
  }

  class LearningScene extends Phaser.Scene {
    constructor() {
      super('LearningScene');
      this.lessonIndex = 0;
      this.runHandler = (event) => this.showResult(event.detail);
      this.lessonHandler = (event) => this.setLesson(event.detail.index);
      this.resetHandler = () => this.resetScene();
      this.finishHandler = () => this.showFinish();
    }

    create() {
      this.drawRoom();
      this.lessonLabel = this.add.text(25, 22, 'TASK 01 / JAVA BASICS', {
        fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#8fb2a7', letterSpacing: 1,
      });
      this.drawWorldObjects();
      window.addEventListener('java-learning:run', this.runHandler);
      window.addEventListener('java-learning:lesson', this.lessonHandler);
      window.addEventListener('java-learning:reset', this.resetHandler);
      window.addEventListener('java-learning:finish', this.finishHandler);
      this.events.once('shutdown', () => {
        window.removeEventListener('java-learning:run', this.runHandler);
        window.removeEventListener('java-learning:lesson', this.lessonHandler);
        window.removeEventListener('java-learning:reset', this.resetHandler);
        window.removeEventListener('java-learning:finish', this.finishHandler);
      });
    }

    drawRoom() {
      this.add.rectangle(320, 140, 640, 280, 0x142c33);
      const stars = [
        [65, 82, 2], [148, 57, 1], [219, 105, 1], [320, 61, 2],
        [408, 93, 1], [571, 65, 2], [602, 128, 1], [470, 47, 1],
      ];
      stars.forEach(([x, y, size], index) => {
        this.add.circle(x, y, size, index % 3 === 0 ? 0xf2c46d : 0x8fb2a7, 0.72);
      });
      const grid = this.add.graphics();
      grid.lineStyle(1, 0x315158, 0.35);
      for (let x = 28; x < 640; x += 32) grid.lineBetween(x, 136, x, 215);
      for (let y = 145; y < 216; y += 23) grid.lineBetween(22, y, 618, y);
      this.add.rectangle(320, 246, 640, 68, 0x193840);
      this.add.rectangle(320, 213, 510, 3, 0x3e7770);
      this.add.rectangle(504, 193, 92, 39, 0x20494d);
      this.add.rectangle(504, 212, 98, 2, 0x69b895, 0.7);
      this.gateGlow = this.add.circle(505, 163, 31, 0x204f50, 0.42);
      this.gate = this.add.circle(505, 163, 24, 0x193b43).setStrokeStyle(2, 0x80c6a7, 0.9);
      this.gateCheck = this.add.text(505, 163, '✓', {
        fontFamily: 'Manrope, sans-serif', fontSize: '24px', color: '#b8f2d4', fontStyle: '800',
      }).setOrigin(0.5).setAlpha(0);
      this.add.rectangle(45, 211, 20, 15, 0xe58e66, 0.85);
      this.add.circle(50, 205, 5, 0xf4c66f, 0.85);
    }

    drawWorldObjects() {
      const robotParts = [
        this.add.ellipse(0, 12, 48, 47, 0x60c9a6),
        this.add.circle(0, -16, 21, 0xf3c36d),
        this.add.circle(-7, -18, 2.5, 0x24444a),
        this.add.circle(7, -18, 2.5, 0x24444a),
        this.add.arc(0, -11, 7, 15, 200, 340, false, 0x7d5442).setStrokeStyle(1.5, 0x7d5442),
        this.add.rectangle(-12, 38, 7, 10, 0x65c9a7),
        this.add.rectangle(12, 38, 7, 10, 0x65c9a7),
        this.add.line(0, 0, 0, -38, 0, -48, 0xd5e8d6, 1.5),
        this.add.circle(0, -50, 3.5, 0xe88a66),
      ];
      this.robot = this.add.container(105, 181, robotParts);
      this.robot.setDepth(3);
      this.robotSway = this.tweens.add({ targets: this.robot, y: 178, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.add.text(78, 233, 'BYTE', { fontFamily: 'DM Mono, monospace', fontSize: '8px', color: '#91afa5' }).setOrigin(0.5);
      this.add.text(505, 233, 'CONSOLE', { fontFamily: 'DM Mono, monospace', fontSize: '8px', color: '#91afa5' }).setOrigin(0.5);
    }

    setLesson(index) {
      this.lessonIndex = index;
      if (this.lessonLabel) this.lessonLabel.setText(`TASK ${String(index + 1).padStart(2, '0')} / JAVA BASICS`);
    }

    resetScene() {
      if (!this.robot) return;
      this.tweens.killTweensOf(this.robot);
      this.robot.setPosition(105, 181).setAngle(0).setScale(1);
      this.robot.setAlpha(1);
      this.robotSway = this.tweens.add({ targets: this.robot, y: 178, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.gateCheck.setAlpha(0);
      this.gate.setStrokeStyle(2, 0x80c6a7, 0.9);
      this.gateGlow.setFillStyle(0x204f50, 0.42);
    }

    showResult({ correct }) {
      if (!this.robot) return;
      this.tweens.killTweensOf(this.robot);
      if (correct) {
        this.robotSway?.stop();
        this.tweens.add({ targets: this.robot, x: 505, y: 181, duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 160 : 850, ease: 'Sine.easeInOut', onComplete: () => {
          this.gateCheck.setAlpha(1).setScale(0.6);
          this.tweens.add({ targets: this.gateCheck, scale: 1, duration: 220, ease: 'Back.Out' });
          this.tweens.add({ targets: this.gateGlow, alpha: 0.9, scale: 1.18, yoyo: true, duration: 320, repeat: 1 });
        } });
      } else {
        this.tweens.add({ targets: this.robot, x: 126, y: 174, angle: 4, duration: 180, yoyo: true, ease: 'Sine.easeInOut', onComplete: () => this.robot.setAngle(0) });
      }
    }

    showFinish() {
      this.gateCheck.setAlpha(1);
      this.tweens.add({ targets: this.gateGlow, alpha: 0.95, scale: 1.3, yoyo: true, duration: 500, repeat: 1 });
    }
  }

  try {
    new Phaser.Game({
      type: Phaser.AUTO,
      width: 640,
      height: 280,
      parent: el.phaserWorld,
      backgroundColor: '#142c33',
      antialias: true,
      scene: LearningScene,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      render: { pixelArt: false, antialias: true },
    });
  } catch {
    el.phaserWorld.hidden = true;
    el.phaserFallback.hidden = false;
  }
}

render();
startPhaser();
