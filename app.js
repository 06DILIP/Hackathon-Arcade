/* =====================================================
   JAVASCRIPT: how the site behaves.
   DOM = the page as JavaScript sees it. We use these DOM tools:
     document.getElementById()      find one element
     document.querySelectorAll()    find many elements
     document.createElement()       make a new element
     element.appendChild()          put an element inside another
     element.textContent = ...      change text
     element.style.left = ...       change CSS from JavaScript
     element.hidden = true          hide an element
     element.addEventListener()     react to a click

   Parts: 1 Data   2 Helpers   3 Screens   4 Home page
          5 Neon Catch   6 Decision Machine   7 Start
   ===================================================== */


/* ---------- 1. DATA ---------- */

// The 8 project cards. The card for Dilip opens the Decision Machine.
var projects = [
  { name: 'Azmat',     game: 'catch' },
  { name: 'Karthik',   game: 'catch' },
  { name: 'Dhina',     game: 'catch' },
  { name: 'Arokiaraj', game: 'catch' },
  { name: 'Naveen',    game: 'catch' },
  { name: 'Dilip',     game: 'decision' },
  { name: 'Arun',      game: 'catch' },
  { name: 'Gokul',     game: 'catch' }
];

// The 7 habits the Decision Machine counts, with a plain-English meaning.
var habits = {
  'Risk':                'Acting without knowing how it will turn out.',
  'Speed':               'Choosing to move quickly instead of waiting.',
  'Planning':            'Preparing and making a path before you commit.',
  'Consistency':         'Sticking with what already works for you.',
  'Exploration':         'Being curious about new and unfamiliar options.',
  'Information-seeking': 'Gathering facts and context before deciding.',
  'Adaptability':        'Changing course when the situation changes.'
};
var habitNames = Object.keys(habits);   // ['Risk', 'Speed', ...]

// Result title and sentence for each top habit.
var profiles = {
  'Risk':                { name: 'Risk Taker',    line: 'You were comfortable acting before everything was certain.' },
  'Speed':               { name: 'Fast Mover',    line: 'You liked to keep moving and decide quickly.' },
  'Planning':            { name: 'Planner',       line: 'You prepared and made a clear path before committing.' },
  'Consistency':         { name: 'Steady Keeper', line: 'You trusted approaches that already work.' },
  'Exploration':         { name: 'Explorer',      line: 'You were curious about unfamiliar options.' },
  'Information-seeking': { name: 'Researcher',    line: 'You looked for facts and context before choosing.' },
  'Adaptability':        { name: 'Adapter',       line: 'You kept room to change your plan as things changed.' }
};

// A short comment shown after each answer.
var feedbackText = {
  'Risk':                'You were willing to act without full certainty.',
  'Speed':               'You moved quickly when a choice was available.',
  'Planning':            'You paused to make a plan first.',
  'Consistency':         'You kept to something dependable.',
  'Exploration':         'You were curious about something new.',
  'Information-seeking': 'You looked for more information first.',
  'Adaptability':        'You left room to change course.'
};

// A small suggestion for each top habit.
var tips = {
  'Risk':                'Before your next big leap, name one thing that could go wrong and one way to soften it.',
  'Speed':               'Speed is a strength. For choices that are hard to undo, try a two-minute pause first.',
  'Planning':            'Your plans are solid. Try leaving one small step open so surprises are easier to absorb.',
  'Consistency':         'Reliable habits are valuable. Try testing one new method this week on something low-stakes.',
  'Exploration':         'Curiosity opens doors. Pick one of your discoveries and follow it all the way through.',
  'Information-seeking': 'Good research helps. Set a time limit so searching does not turn into waiting.',
  'Adaptability':        'Flexibility is your edge. Write down your goal first so changes still point somewhere.'
};


/* ---------- 2. HELPERS (small tools used everywhere) ---------- */

// Shortcut: $('id') means document.getElementById('id')
function $(id) {
  return document.getElementById(id);
}

// Returns a shuffled copy of an array (Fisher-Yates shuffle).
function shuffle(list) {
  var copy = list.slice();
  for (var i = copy.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

// Show an error message on the page.
function showError(message) {
  $('error-box').textContent = message;
  $('error-box').hidden = false;
}

// Best score is saved in the browser (localStorage). try/catch keeps the
// site working even if the browser blocks storage.
function loadBest() {
  try { return Number(localStorage.getItem('catchBest')) || 0; }
  catch (error) { return 0; }
}
function saveBest(score) {
  try { localStorage.setItem('catchBest', String(score)); }
  catch (error) { /* ignore */ }
}



// Pixel art: each sprite is rows of letters, each letter is a colour in PAL.
var PAL = { r:'#e53b44', s:'#ffc999', k:'#2b1d3a', b:'#3a6fd8', n:'#8b5a2b', w:'#fff', y:'#ffd23f', g:'#2d8a7e', c:'#5ee7df', f:'#9a90b8' };
var SPR = {
  hero: ['...rrrr...','..rrrrrr..','..ssssss..','..skssks..','..ssssss..','..bbbbbb..','.sbbbbbbs.','..bbbbbb..','..bb..bb..','..nn..nn..','.nnn..nnn.'],
  tree: ['..gggg..','.gggggg.','gggggggg','.gggggg.','gggggggg','.gggggg.','...nn...','...nn...','...nn...'],
  cloud: ['...wwww.....','.wwwwwwww...','wwwwwwwwwww.','.wwwwwwwwww.'],
  sun: ['..yyyy..','.yyyyyy.','yyyyyyyy','yyyyyyyy','yyyyyyyy','yyyyyyyy','.yyyyyy.','..yyyy..'],
  flag: ['nffff.','nffff.','nfff..','n.....','n.....','n.....','n.....'],
  trophy: ['yyyyyyyyy','yyyyyyyyy','y.yyyyy.y','.yyyyyyy.','..yyyyy..','...yyy...','...yyy...','..yyyyy..','.nnnnnnn.'],
  target: ['..ccccc..','.cc...cc.','cc.ccc.cc','c.ccwcc.c','c.cwwwc.c','c.ccwcc.c','cc.ccc.cc','.cc...cc.','..ccccc..']
};
function sprite(name, scale, colors) {
  var map = SPR[name], out = '';
  for (var y = 0; y < map.length; y++) {
    for (var x = 0; x < map[y].length; x++) {
      var ch = map[y].charAt(x);
      if (ch === '.') { continue; }
      var fill = (colors && colors[ch]) || PAL[ch];
      out += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + fill + '"/>';
    }
  }
  return '<svg class="sprite" viewBox="0 0 ' + map[0].length + ' ' + map.length + '" shape-rendering="crispEdges" style="--c:' +
    map[0].length + ';--r:' + map.length + ';--s:' + scale + '">' + out + '</svg>';
}

// Where checkpoint flags stand in the play scene (percent from the left).
function flagX(i) { return 16 + i * 13; }

// Fill a .scene box with sky, hills, ground and the right characters.
function fillScene(el, kind) {
  var h = '<div class="sun">' + sprite('sun', 6) + '</div><div class="cloud">' + sprite('cloud', 6) +
    '</div><div class="cloud c2">' + sprite('cloud', 4) + '</div><div class="hills"></div><div class="ground"></div><div class="track">' +
    '<div style="left:5%">' + sprite('tree', 7) + '</div><div style="left:' + (kind === 'play' ? 49 : 85) + '%">' + sprite('tree', 6) + '</div>';
  if (kind === 'home') {
    h += '<div class="stroll"><div class="flip">' + sprite('hero', 6) + '</div></div>';
  } else if (kind === 'play') {
    for (var i = 0; i < QUESTIONS_PER_RUN; i++) { h += '<div class="flag" style="left:' + flagX(i) + '%">' + sprite('flag', 4) + '</div>'; }
    h += '<div style="left:94%;transform:translateX(-50%)">' + sprite('trophy', 5) + '</div><div id="walker" class="walker" style="left:10%">' + sprite('hero', 6) + '</div>';
  } else {
    h += '<div style="left:' + (kind === 'result' ? 38 : 45) + '%">' + sprite('hero', 6) + '</div>';
    if (kind === 'result') { h += '<div style="left:55%">' + sprite('trophy', 6) + '</div>'; }
  }
  el.innerHTML = h + '</div>';
}


/* ---------- 3. SCREENS ---------- */

var screenIds = [
  'screen-arcade', 'screen-catch-intro', 'screen-catch-play', 'screen-catch-result',
  'screen-decision-intro', 'screen-decision-play', 'screen-decision-result'
];

// Hide every screen, then show only the one we want.
function showScreen(id) {
  stopCatch();                                   // stop the game timers if running
  clearInterval(typeTimer);                      // stop the typing effect
  for (var i = 0; i < screenIds.length; i++) {
    $(screenIds[i]).hidden = (screenIds[i] !== id);
  }
  if (id === 'screen-catch-intro') { $('best-score').textContent = loadBest() || '--'; }
  window.scrollTo(0, 0);
}


/* ---------- 4. HOME PAGE ---------- */

// Build the 8 cards with the DOM. All cards use exactly the same layout.
function buildCards() {
  var box = $('cards');

  for (var i = 0; i < projects.length; i++) {
    var project = projects[i];
    var isDecision = (project.game === 'decision');

    // 1) Make the elements
    var card  = document.createElement('button');
    var title = document.createElement('h3');
    var kind  = document.createElement('p');
    var desc  = document.createElement('p');
    var go    = document.createElement('p');

    // 2) Fill them with text
    title.textContent = project.name;
    kind.textContent  = isDecision ? 'Human Decision Machine' : 'Neon Catch';
    desc.textContent  = isDecision
      ? 'Six everyday choices and a profile of your habits.'
      : 'A 20-second round of clicking a moving target.';
    go.textContent    = isDecision ? 'Start the experiment' : 'Play Neon Catch';

    // 3) Give them CSS classes
    card.className = isDecision ? 'card card-decision' : 'card';
    var icon = document.createElement('div');
    icon.className = 'icon';
    icon.innerHTML = sprite(isDecision ? 'hero' : 'target', 4);
    kind.className = 'kind';
    desc.className = 'desc';
    go.className   = 'go';

    // 4) Put the pieces inside the card, then the card inside the page
    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(kind);
    card.appendChild(desc);
    card.appendChild(go);
    box.appendChild(card);

    // 5) When the card is clicked, open the right game
    card.addEventListener('click', makeOpener(project.game));
  }
}

function makeOpener(game) {
  return function () {
    showScreen(game === 'decision' ? 'screen-decision-intro' : 'screen-catch-intro');
  };
}

// Any element with data-go="screen-id" opens that screen when clicked.
function wireNavigation() {
  var links = document.querySelectorAll('[data-go]');
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', makeGoer(links[i].dataset.go));
  }
}

function makeGoer(screenId) {
  return function () { showScreen(screenId); };
}


/* ---------- 5. NEON CATCH ---------- */

var CATCH_SECONDS = 20;      // round length
var TARGET_SIZE = 70;        // must match #target width in CSS
var JUMP_MS = 850;           // the target jumps every 0.85 seconds

var game = null;             // holds score, hits, misses, streak, time
var clockTimer = null;       // the 1-second countdown
var jumpTimer = null;        // the timer that moves the target

function startCatch() {
  showScreen('screen-catch-play');   // first switch screen (this also stops old timers)
  game = { score: 0, hits: 0, misses: 0, streak: 0, bestStreak: 0, time: CATCH_SECONDS, running: true };
  updateCatchNumbers();
  moveTarget();

  // Every 1000 ms: take 1 second off the clock.
  clockTimer = setInterval(function () {
    game.time = game.time - 1;
    updateCatchNumbers();
    if (game.time <= 0) {
      finishCatch();
    }
  }, 1000);
}

// Stop both timers (called whenever we leave the game).
function stopCatch() {
  clearInterval(clockTimer);
  clearTimeout(jumpTimer);
  clockTimer = null;
  jumpTimer = null;
  if (game) { game.running = false; }
}

// Write the current numbers into the page.
function updateCatchNumbers() {
  $('catch-time').textContent   = game.time;
  $('catch-score').textContent  = game.score;
  $('catch-hits').textContent   = game.hits;
  $('catch-misses').textContent = game.misses;
  $('catch-streak').textContent = game.streak;
  $('time-fill').style.width = (game.time / CATCH_SECONDS * 100) + '%';   // shrinking bar
}

// Put the target at a random spot inside the arena.
function moveTarget() {
  if (!game || !game.running) { return; }

  var arena = $('arena');
  var half = TARGET_SIZE / 2;
  var x = half + Math.random() * (arena.clientWidth  - TARGET_SIZE);
  var y = half + Math.random() * (arena.clientHeight - TARGET_SIZE);

  $('target').style.left = x + 'px';   // CSS changed from JavaScript
  $('target').style.top  = y + 'px';

  clearTimeout(jumpTimer);
  jumpTimer = setTimeout(moveTarget, JUMP_MS);   // jump again soon
}

// Clicking the target = a hit.
$('target').addEventListener('click', function (event) {
  event.stopPropagation();           // do not also count as a click on the arena
  if (!game || !game.running) { return; }
  game.hits = game.hits + 1;
  game.score = game.score + 10;
  game.streak = game.streak + 1;
  if (game.streak > game.bestStreak) { game.bestStreak = game.streak; }
  updateCatchNumbers();
  moveTarget();
});

// Clicking the empty arena = a miss.
$('arena').addEventListener('click', function (event) {
  if (!game || !game.running) { return; }
  game.misses = game.misses + 1;
  game.streak = 0;                   // a miss ends the streak
  updateCatchNumbers();

  // Show a small red dot where the click happened.
  var box = $('arena').getBoundingClientRect();
  var dot = document.createElement('div');
  dot.className = 'miss-dot';
  dot.style.left = (event.clientX - box.left) + 'px';
  dot.style.top  = (event.clientY - box.top) + 'px';
  $('arena').appendChild(dot);
  setTimeout(function () { dot.remove(); }, 400);
});

// The round is over: work out the results and show them.
function finishCatch() {
  var clicks = game.hits + game.misses;
  var accuracy = clicks > 0 ? Math.round((game.hits / clicks) * 100) : 0;

  // Pick a rating and a tip based on accuracy.
  var rating, tip;
  if (accuracy >= 80) {
    rating = 'High control';
    tip = 'Very steady. To push further, try to keep your streak going without any misses.';
  } else if (accuracy >= 55) {
    rating = 'Steady response';
    tip = 'Good rhythm. Slow down your clicks slightly, since each miss resets your streak.';
  } else {
    rating = 'Still warming up';
    tip = 'Keep your eyes near the middle of the box and click only when the circle has landed.';
  }

  // Check for a new personal best.
  var oldBest = loadBest();
  var isNewBest = game.score > oldBest;
  if (isNewBest) { saveBest(game.score); }
  var best = Math.max(oldBest, game.score);

  // Put everything into the result screen.
  $('res-score').textContent  = game.score;
  $('res-hits').textContent   = game.hits;
  $('res-misses').textContent = game.misses;
  $('res-streak').textContent = game.bestStreak;
  $('res-rating').textContent = rating;
  $('res-accuracy').textContent = 'Accuracy ' + accuracy + '% from ' + clicks + ' clicks.';
  $('res-accuracy-bar').style.width = accuracy + '%';
  $('res-tip').textContent  = tip;
  $('res-best').textContent = best + ' points' + (isNewBest ? ' (new personal best!)' : '.');
  $('catch-headline').textContent = isNewBest && oldBest > 0
    ? 'That is a new personal best. Nicely done.'
    : 'Your 20-second run is complete. This summary covers this round only.';

  showScreen('screen-catch-result');   // this also stops the timers
}


/* ---------- 6. HUMAN DECISION MACHINE ---------- */

var QUESTIONS_PER_RUN = 6;
var run = null;          // holds everything about the current run
var typeTimer = null;    // the typing effect
var playerName = '';

// Remember the player's name on this device.
function loadName() { try { return localStorage.getItem('playerName') || ''; } catch (e) { return ''; } }
function saveName(n) { try { localStorage.setItem('playerName', n); } catch (e) { /* ignore */ } }

// Keep the greeting and the top-bar badge in step with the name field.
function updateGreeting() {
  var n = $('player-name').value.trim().replace(/\s+/g, ' ');
  $('greet').textContent = n ? 'Nice to meet you, ' + n + '! Ready for six choices?' : 'Hello, traveler! What should I call you?';
  $('name-error').hidden = true;
}
function setBadge(n) {
  $('player-badge').textContent = 'Player: ' + n;
  $('player-badge').hidden = !n;
}

function startDecision() {
  // From the intro screen, take the name from the field. "Play again" reuses it.
  if (!$('screen-decision-intro').hidden) {
    var n = $('player-name').value.trim().replace(/\s+/g, ' ');
    if (!n) { $('name-error').hidden = false; $('player-name').focus(); return; }
    playerName = n;
    saveName(n);
  }
  if (!playerName) { showScreen('screen-decision-intro'); return; }
  setBadge(playerName);

  // Pick 6 random scenarios. Shuffle their options so the order gives no hint.
  var picked = shuffle(window.SCENARIOS).slice(0, QUESTIONS_PER_RUN);
  var questions = [];
  for (var i = 0; i < picked.length; i++) {
    questions.push({ title: picked[i].title, situation: picked[i].situation, options: shuffle(picked[i].actions) });
  }
  var totals = {}, counts = {};
  for (var h = 0; h < habitNames.length; h++) { totals[habitNames[h]] = 0; counts[habitNames[h]] = 0; }

  run = { name: playerName, questions: questions, current: 0, totals: totals, counts: counts, answers: [], locked: false, skip: null };
  showScreen('screen-decision-play');
  $('play-name').textContent = playerName;
  var flags = document.querySelectorAll('.flag');
  for (var f = 0; f < flags.length; f++) { flags[f].innerHTML = sprite('flag', 4); }
  placeHero(0);
  showQuestion();
}

// Move the hero to the flag for question i (or to the trophy when i is the end).
function placeHero(i) {
  var w = $('walker');
  w.style.left = (i < QUESTIONS_PER_RUN ? flagX(i) - 6 : 86) + '%';
}

// Type the situation out one letter at a time, like an old RPG text box.
var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function typeText(text) {
  var el = $('decision-situation'), i = 0;
  clearInterval(typeTimer);
  $('choices').hidden = true;
  $('dialog').classList.remove('done');
  function finish() {
    clearInterval(typeTimer);
    typeTimer = null;
    el.textContent = text;
    $('dialog').classList.add('done');
    $('choices').hidden = false;
  }
  run.skip = finish;
  if (reduceMotion) { finish(); return; }
  el.textContent = '';
  typeTimer = setInterval(function () {
    i++;
    el.textContent = text.slice(0, i);
    if (i >= text.length) { finish(); }
  }, 22);
}
$('dialog').addEventListener('click', function () {
  if (typeTimer && run && run.skip) { run.skip(); }
});

// Show the current question and build its 4 buttons.
function showQuestion() {
  var q = run.questions[run.current];
  run.locked = false;

  $('decision-progress').textContent = 'Quest ' + (run.current + 1) + ' of ' + QUESTIONS_PER_RUN;
  $('decision-title').textContent = q.title;
  $('decision-feedback').textContent = '';
  $('decision-fill').style.width = (run.current / QUESTIONS_PER_RUN * 100) + '%';
  $('walker').classList.remove('walking');

  var box = $('choices');
  box.innerHTML = '';
  var letters = ['A', 'B', 'C', 'D'];
  for (var i = 0; i < q.options.length; i++) {
    var button = document.createElement('button');
    var key = document.createElement('span');
    key.className = 'key';
    key.textContent = letters[i];
    button.className = 'choice';
    button.appendChild(key);
    button.appendChild(document.createTextNode(q.options[i][0]));
    button.addEventListener('click', makeChooser(i, button));
    box.appendChild(button);
  }
  typeText(q.situation);
}

function makeChooser(index, button) {
  return function () { choose(index, button); };
}

// Called when the player clicks an option.
function choose(index, button) {
  if (run.locked) { return; }
  run.locked = true;
  var token = run;                          // lets us ignore timers if the player leaves

  var q = run.questions[run.current];
  var label = q.options[index][0];
  var effects = q.options[index][1];

  var strongest = null;
  for (var habit in effects) {
    run.totals[habit] = run.totals[habit] + effects[habit];
    run.counts[habit] = run.counts[habit] + 1;
    if (strongest === null || effects[habit] > effects[strongest]) { strongest = habit; }
  }
  run.answers.push({ title: q.title, label: label, habit: strongest });

  // Personal comment: "Sam, you were curious about something new."
  var fb = feedbackText[strongest];
  $('decision-feedback').textContent = run.name + ', ' + fb.charAt(0).toLowerCase() + fb.slice(1);
  var all = document.querySelectorAll('.choice');
  for (var i = 0; i < all.length; i++) { all[i].disabled = true; }
  button.classList.add('picked');
  document.querySelectorAll('.flag')[run.current].innerHTML = sprite('flag', 4, { f: '#ffd23f' });

  // After 1.2 s the hero walks to the next flag, then the next question appears.
  setTimeout(function () {
    if (run !== token || $('screen-decision-play').hidden) { return; }
    run.current = run.current + 1;
    $('decision-fill').style.width = (run.current / QUESTIONS_PER_RUN * 100) + '%';
    $('walker').classList.add('walking');
    placeHero(run.current);
    setTimeout(function () {
      if (run !== token || $('screen-decision-play').hidden) { return; }
      if (run.current < QUESTIONS_PER_RUN) { showQuestion(); } else { showResult(); }
    }, reduceMotion ? 0 : 1000);
  }, 1200);
}

// Small helper: add one <li> to a list.
function addListItem(list, text) {
  var li = document.createElement('li');
  li.textContent = text;
  list.appendChild(li);
}

// Build the final result screen.
function showResult() {
  // Sort habits from the most points to the fewest.
  var ranked = habitNames.slice().sort(function (a, b) {
    return run.totals[b] - run.totals[a];
  });
  var top = ranked[0];
  var second = ranked[1];
  var last = ranked[ranked.length - 1];
  var highest = run.totals[top] || 1;

  // Title, sentence and tip
  $('result-name').textContent = run.name + ' the ' + profiles[top].name;
  $('result-player').textContent = 'Well played, ' + run.name + '!';
  $('journey-title').textContent = run.name + "'s choices, one by one";
  $('result-line').textContent = profiles[top].line;
  $('result-tip').textContent  = 'Next quest, ' + run.name + ': ' + tips[top];

  // Chips under the title
  var chips = $('result-chips');
  chips.innerHTML = '';
  var chipTexts = ['Top habit: ' + top, 'Second: ' + second, '6 of 6 choices recorded'];
  for (var c = 0; c < chipTexts.length; c++) {
    var chip = document.createElement('span');
    chip.className = (c === 0) ? 'chip gold' : 'chip';
    chip.textContent = chipTexts[c];
    chips.appendChild(chip);
  }

  // Bars: one row per habit. The width is set from JavaScript.
  var bars = $('bars');
  bars.innerHTML = '';
  for (var i = 0; i < habitNames.length; i++) {
    var name = habitNames[i];
    var isTop = (name === top || name === second) && run.totals[name] > 0;

    var row = document.createElement('div');
    row.className = isTop ? 'bar-row top' : 'bar-row';
    row.innerHTML = '<span></span><div class="bar"><div class="bar-fill"></div></div><b></b>';
    row.querySelector('span').textContent = name;
    row.querySelector('b').textContent = run.totals[name];
    row.querySelector('.bar-fill').style.width = (run.totals[name] / highest * 100) + '%';
    bars.appendChild(row);
  }

  // What stood out: three simple observations.
  var obs = $('observations');
  obs.innerHTML = '';
  addListItem(obs, run.name + ', your strongest habit was ' + top.toLowerCase() + ', with ' + run.totals[top] + ' points.');
  addListItem(obs, top + ' appeared in ' + run.counts[top] + ' of your 6 choices.');
  addListItem(obs, last + ' showed up least. A run with different scenarios may change that.');

  // List of the choices the player made.
  var journey = $('journey');
  journey.innerHTML = '';
  for (var j = 0; j < run.answers.length; j++) {
    var item = document.createElement('li');
    item.innerHTML = '<b></b>: <span></span> <small></small>';
    item.querySelector('b').textContent = run.answers[j].title;      // textContent is safe text
    item.querySelector('span').textContent = run.answers[j].label;
    item.querySelector('small').textContent = '(' + run.answers[j].habit + ')';
    journey.appendChild(item);
  }

  showScreen('screen-decision-result');
}

// Fill the grid of 7 habits on the Decision Machine intro page.
function buildHabitGrid() {
  var grid = $('habit-grid');
  for (var i = 0; i < habitNames.length; i++) {
    var box = document.createElement('div');
    var title = document.createElement('h3');
    var text = document.createElement('p');

    box.className = 'habit';
    title.textContent = habitNames[i];
    text.textContent = habits[habitNames[i]];

    box.appendChild(title);
    box.appendChild(text);
    grid.appendChild(box);
  }
}


/* ---------- 7. START ---------- */

$('btn-catch-start').addEventListener('click', startCatch);
$('btn-catch-again').addEventListener('click', startCatch);
$('btn-decision-start').addEventListener('click', startDecision);
$('btn-decision-again').addEventListener('click', startDecision);

var sceneBoxes = document.querySelectorAll('[data-scene]');
for (var s = 0; s < sceneBoxes.length; s++) { fillScene(sceneBoxes[s], sceneBoxes[s].dataset.scene); }

playerName = loadName();
$('player-name').value = playerName;
$('player-name').addEventListener('input', updateGreeting);
$('player-name').addEventListener('keydown', function (e) { if (e.key === 'Enter') { startDecision(); } });
if (playerName) { updateGreeting(); setBadge(playerName); }

buildCards();
buildHabitGrid();
wireNavigation();

// If scenarios.js did not load, tell the player exactly what is wrong.
if (!window.SCENARIOS || window.SCENARIOS.length < QUESTIONS_PER_RUN) {
  showError('scenarios.js was not found. Put scenarios.js in the same folder as index.html.');
} else {
  $('stat-scenarios').textContent  = window.SCENARIOS.length;
  $('intro-scenarios').textContent = window.SCENARIOS.length;
}
