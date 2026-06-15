const $ = (selector) => document.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const arrows = { up: "↑", down: "↓", left: "←", right: "→", stay: "•", exercise: "E", rest: "R", collect: "C", move: "M" };

function typesetMath(root = document.body) {
  if (window.MathJax?.typesetPromise) {
    window.MathJax.typesetClear?.([root]);
    window.MathJax.typesetPromise([root]).catch((error) => console.warn("MathJax typesetting failed", error));
  }
}

const tutorialContent = {
  foundations: {
    title: "Reinforcement Learning Foundations",
    body: `
      <p>Reinforcement Learning studies sequential decision making. An <strong>agent</strong> observes a state, chooses an action, receives a reward, and lands in a next state. A trajectory is the resulting chain s0, a0, r1, s1, a1, r2, ...</p>
      <div class="concept-grid">
        <div class="concept"><strong>State</strong><br>The information used for decision making.</div>
        <div class="concept"><strong>Action</strong><br>A choice available to the agent.</div>
        <div class="concept"><strong>Reward</strong><br>The immediate numerical feedback.</div>
        <div class="concept"><strong>Policy</strong><br>A rule for selecting actions from states.</div>
      </div>`
  },
  interface: {
    title: "Agent-Environment Interface",
    body: `
      <p>At timestep \\(t\\), the policy chooses action \\(a_t\\) from state \\(s_t\\). The environment returns reward \\(r_{t+1}\\) and next state \\(s_{t+1}\\). The loop below shows why RL is not a one-shot prediction problem: each action changes what can happen later.</p>
      <div class="equation">\\[s_t \\rightarrow a_t \\rightarrow (r_{t+1}, s_{t+1})\\]</div>
      <figure class="interface-image" aria-label="Agent environment interface diagram">
        <img src="env.png" alt="Agent environment interaction diagram" />
      </figure>`
  },
  mdp: {
    title: "Markov Decision Processes",
    body: `
      <p>An MDP is the classical mathematical model for RL when the current state is enough to predict the next transition distribution.</p>
      <div class="equation">\\[\\text{MDP} = (\\mathcal{S}, \\mathcal{A}, P, R, \\gamma)\\]</div>
      <p><strong>Deterministic:</strong> each action has one next state. <strong>Stochastic:</strong> each action has a probability distribution over possible next states.</p>`
  },
  terminology: {
    title: "Return, Policy, State Value, and Action Value",
    body: `
      <p>The aim of reinforcement learning is to choose actions that optimize <strong>return</strong>, not merely immediate reward. A reward is local feedback; a return is the accumulated future reward the agent is trying to make large.</p>
      <div class="equation">\\[G_t = R_{t+1}+\\gamma R_{t+2}+\\gamma^2R_{t+3}+\\cdots = \\sum_{k=0}^{\\infty}\\gamma^kR_{t+k+1}\\]</div>
      <div class="concept-grid">
        <div class="concept"><strong>Policy \\(\\pi\\)</strong><br>A decision rule. It tells the agent which action to take in each state, either deterministically \\(a=\\pi(s)\\) or probabilistically \\(\\pi(a\\mid s)\\).</div>
        <div class="concept"><strong>State value \\(V^{\\pi}(s)\\)</strong><br>The expected return when the agent starts in state \\(s\\) and follows policy \\(\\pi\\).</div>
        <div class="concept"><strong>Action value \\(Q^{\\pi}(s,a)\\)</strong><br>The expected return after taking action \\(a\\) in state \\(s\\), then following policy \\(\\pi\\).</div>
        <div class="concept"><strong>Optimality</strong><br>RL searches for a policy \\(\\pi^*\\) whose values are as large as possible: \\(V^*(s)=\\max_{\\pi}V^{\\pi}(s)\\).</div>
      </div>
      <p>Bellman equations connect these terms by saying: value equals immediate reward plus discounted value of what comes next. Value iteration and policy iteration are practical ways to repeatedly apply that connection until a strong policy emerges.</p>`
  },
  bellman: {
    title: "Bellman Equations",
    body: `
      <p>Bellman equations decompose long-term return into immediate reward plus discounted future value.</p>
      <div class="equation">\\[V^{\\pi}(s)=\\sum_{a \\in \\mathcal{A}} \\pi(a\\mid s)\\sum_{s' \\in \\mathcal{S}} P(s'\\mid s,a)\\left[R(s,a,s')+\\gamma V^{\\pi}(s')\\right]\\]</div>
      <div class="equation">\\[V^*(s)=\\max_{a \\in \\mathcal{A}}\\sum_{s' \\in \\mathcal{S}} P(s'\\mid s,a)\\left[R(s,a,s')+\\gamma V^*(s')\\right]\\]</div>
      <p>The expectation sign becomes a probability-weighted sum in stochastic MDPs.</p>`
  },
  valueIteration: {
    title: "Value Iteration",
    body: `
      <p>Value iteration repeatedly applies the Bellman optimality backup until values stop changing much.</p>
      <div class="equation">\\[V_{k+1}(s)=\\max_{a} Q_k(s,a)\\]</div>
      <div class="equation">\\[Q_k(s,a)=\\sum_{s'}P(s'\\mid s,a)\\left[R(s,a,s')+\\gamma V_k(s')\\right]\\]</div>
      <div class="algorithm-box">
        <strong>Algorithm: Value Iteration</strong>
        <ol>
          <li>Initialize \\(V_0(s)=0\\) for every state.</li>
          <li>For each sweep \\(k\\), compute every action value \\(Q_k(s,a)\\).</li>
          <li>Write \\(V_{k+1}(s)=\\max_a Q_k(s,a)\\) into each state.</li>
          <li>Track \\(\\Delta=\\max_s |V_{k+1}(s)-V_k(s)|\\).</li>
          <li>Stop when \\(\\Delta < \\theta\\), then extract \\(\\pi^*(s)=\\arg\\max_a Q(s,a)\\).</li>
        </ol>
      </div>
      <p>The solver panels show every intermediate \\(Q(s,a)\\), the max action, and the convergence residual \\(\\Delta = \\max_s |V_{k+1}(s)-V_k(s)|\\).</p>`
  },
  policyIteration: {
    title: "Policy Iteration",
    body: `
      <p>Policy iteration alternates between evaluating the current policy and improving it greedily.</p>
      <div class="equation">\\[\\text{Evaluation:}\\quad V^{\\pi}(s) \\leftarrow \\sum_{s'}P(s'\\mid s,\\pi(s))\\left[R(s,\\pi(s),s')+\\gamma V^{\\pi}(s')\\right]\\]</div>
      <div class="equation">\\[\\text{Improvement:}\\quad \\pi_{\\text{new}}(s)=\\arg\\max_a Q^{\\pi}(s,a)\\]</div>
      <div class="algorithm-box">
        <strong>Algorithm: Policy Iteration</strong>
        <ol>
          <li>Start with any policy \\(\\pi_0\\).</li>
          <li><strong>Policy evaluation:</strong> repeatedly update \\(V^{\\pi}(s)\\) using the action chosen by the current policy.</li>
          <li><strong>Policy improvement:</strong> compute all \\(Q^{\\pi}(s,a)\\) and switch each state to the best action.</li>
          <li>If no action changes, the policy is stable and therefore optimal.</li>
          <li>If at least one action changes, evaluate the new policy and repeat.</li>
        </ol>
      </div>
      <p>The important learning moment is policy stability: when improvement changes no actions, the policy is optimal.</p>`
  },
  linearAlgebra: {
    title: "Linear Algebra Alternative",
    body: `
      <p>For a fixed policy, exact evaluation can be written as a linear system. Iterative evaluation approaches the same solution without explicitly inverting a matrix.</p>
      <div class="equation">\\[V = R_{\\pi}+\\gamma P_{\\pi}V\\]</div>
      <div class="equation">\\[V=(I-\\gamma P_{\\pi})^{-1}R_{\\pi}\\]</div>`
  },
  limits: {
    title: "Limitations of Classical MDPs",
    body: `
      <p>Classical tabular MDP solvers are clear and powerful, but they struggle when there are too many states, unknown dynamics, partial observability, or continuous action spaces. Modern RL methods learn from samples and often use function approximation.</p>`
  },
  further: {
    title: "Further RL Concepts",
    body: `
      <div class="concept-grid">
        <div class="concept"><strong>Model-based vs model-free</strong><br>Planning with known \\(P,R\\) versus learning from interaction. <a href="https://davidstarsilver.wordpress.com/teaching/" target="_blank" rel="noreferrer">David Silver lectures</a></div>
        <div class="concept"><strong>On-policy vs off-policy</strong><br>SARSA learns about the behavior policy; Q-learning learns a greedy target. <a href="http://incompleteideas.net/book/the-book-2nd.html" target="_blank" rel="noreferrer">Sutton and Barto book</a></div>
        <div class="concept"><strong>Monte Carlo</strong><br>Uses complete episode returns \\(G_t\\) and no bootstrapping. <a href="http://incompleteideas.net/book/the-book-2nd.html" target="_blank" rel="noreferrer">Ch. 5 reference</a></div>
        <div class="concept"><strong>Temporal Difference</strong><br>Bootstraps from \\(r + \\gamma V(s')\\). <a href="https://davidstarsilver.wordpress.com/teaching/" target="_blank" rel="noreferrer">Model-free prediction/control lectures</a></div>
        <div class="concept"><strong>SARSA and Q-learning</strong><br>Compare \\(Q(S,A)\\leftarrow Q(S,A)+\\alpha[R+\gamma Q(S',A')-Q(S,A)]\\) with \\(\\max_{a'}Q(S',a')\\). <a href="http://incompleteideas.net/book/the-book-2nd.html" target="_blank" rel="noreferrer">Algorithms in Sutton and Barto</a></div>
        <div class="concept"><strong>DQN</strong><br>Uses neural Q approximators, replay buffers, and target networks. <a href="https://davidstarsilver.wordpress.com/teaching/" target="_blank" rel="noreferrer">Value function approximation lecture</a></div>
        <div class="concept"><strong>MDP dynamic programming</strong><br>For extra worked equations on value and policy iteration, see <a href="https://inst.eecs.berkeley.edu/~cs188/textbook/mdp/value-iteration.html" target="_blank" rel="noreferrer">Berkeley CS188 Value Iteration</a>.</div>
      </div>`
  }
};

function parseList(value) {
  return value.split(",").map((x) => x.trim()).filter(Boolean);
}

function makeGridWorld({ stochastic = false, terminalReward = 10, stepReward = -1 } = {}) {
  const rows = 3;
  const cols = 4;
  const obstacles = new Set(["1,1"]);
  const terminal = "2,3";
  const states = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = `${r},${c}`;
      if (!obstacles.has(id)) states.push(id);
    }
  }
  const actions = ["up", "down", "left", "right"];
  const move = (state, action) => {
    if (state === terminal) return state;
    const [r, c] = state.split(",").map(Number);
    const next = { up: [r - 1, c], down: [r + 1, c], left: [r, c - 1], right: [r, c + 1] }[action];
    const id = `${next[0]},${next[1]}`;
    return next[0] < 0 || next[0] >= rows || next[1] < 0 || next[1] >= cols || obstacles.has(id) ? state : id;
  };
  const transitions = {};
  for (const s of states) {
    transitions[s] = {};
    for (const a of actions) {
      if (s === terminal) {
        transitions[s][a] = [{ next: s, probability: 1, reward: 0, label: "intended", actualAction: a }];
      } else if (stochastic) {
        const side = a === "up" || a === "down" ? ["left", "right"] : ["up", "down"];
        transitions[s][a] = [
          { next: move(s, a), probability: 0.8, reward: move(s, a) === terminal ? terminalReward : stepReward, label: "intended", actualAction: a },
          { next: move(s, side[0]), probability: 0.1, reward: move(s, side[0]) === terminal ? terminalReward : stepReward, label: "slip 1", actualAction: side[0] },
          { next: move(s, side[1]), probability: 0.1, reward: move(s, side[1]) === terminal ? terminalReward : stepReward, label: "slip 2", actualAction: side[1] }
        ];
      } else {
        const next = move(s, a);
        transitions[s][a] = [{ next, probability: 1, reward: next === terminal ? terminalReward : stepReward, label: "intended", actualAction: a }];
      }
    }
  }
  return {
    name: "Grid World",
    type: stochastic ? "Stochastic slippery grid" : "Deterministic shortest path grid",
    states,
    actions,
    transitions,
    terminalStates: [terminal],
    grid: { rows, cols, obstacles: [...obstacles], terminal },
    description: "Navigate around an obstacle to reach a terminal reward. Values become a heatmap and the policy becomes directional arrows."
  };
}

function makeRobot({ stochastic = false } = {}) {
  const states = ["high", "low"];
  const actions = ["search", "wait", "recharge"];
  const alpha = stochastic ? 0.8 : 1;
  const beta = stochastic ? 0.2 : 1;
  const rSearch = 4;
  const rWait = 1;
  const transitions = {
    high: {
      search: [
        { next: "high", probability: alpha, reward: rSearch },
        { next: "low", probability: 1 - alpha, reward: rSearch }
      ],
      wait: [{ next: "high", probability: 1, reward: rWait }]
    },
    low: {
      search: [
        { next: "high", probability: 1 - beta, reward: -3 },
        { next: "low", probability: beta, reward: rSearch }
      ],
      wait: [{ next: "low", probability: 1, reward: rWait }],
      recharge: [{ next: "high", probability: 1, reward: 0 }]
    }
  };
  return {
    name: "Sutton-Barto Recycling Robot",
    type: stochastic ? "Classic stochastic robot can collector" : "Deterministic limiting case of the robot MDP",
    states,
    actions,
    transitions,
    terminalStates: [],
    description: "A robot has high or low battery. Searching can find cans, waiting gives a smaller reward, and recharging from low returns the robot to high battery."
  };
}

function makeHealth({ stochastic = false, terminalReward = 10, stepReward = -1 } = {}) {
  const states = ["Healthy", "Sick", "Rested"];
  const actions = ["exercise", "rest"];
  const transitions = {
    Healthy: {
      exercise: stochastic
        ? [{ next: "Healthy", probability: 0.75, reward: 3 }, { next: "Sick", probability: 0.25, reward: stepReward }]
        : [{ next: "Healthy", probability: 1, reward: 3 }],
      rest: [{ next: "Rested", probability: 1, reward: 1 }]
    },
    Sick: {
      exercise: stochastic
        ? [{ next: "Healthy", probability: 0.35, reward: terminalReward / 2 }, { next: "Sick", probability: 0.65, reward: -3 }]
        : [{ next: "Sick", probability: 1, reward: -3 }],
      rest: stochastic
        ? [{ next: "Rested", probability: 0.7, reward: 2 }, { next: "Sick", probability: 0.3, reward: stepReward }]
        : [{ next: "Rested", probability: 1, reward: 2 }]
    },
    Rested: {
      exercise: [{ next: "Healthy", probability: 1, reward: terminalReward / 2 }],
      rest: [{ next: "Rested", probability: 1, reward: 1 }]
    }
  };
  return {
    name: "Health State MDP",
    type: stochastic ? "Probabilistic health outcomes" : "Deterministic wellness transitions",
    states,
    actions,
    transitions,
    terminalStates: [],
    description: "Exercise and rest change health states. In the stochastic version, good choices can still occasionally have bad outcomes."
  };
}

const environmentFactories = { grid: makeGridWorld, robot: makeRobot, health: makeHealth };
const solverSessions = {};
let graphSequence = 0;

function availableActions(mdp, state) {
  return Object.keys(mdp.transitions[state] || {});
}

function qValue(mdp, values, state, action, gamma) {
  return qCalculation(mdp, values, state, action, gamma).value;
}

function qCalculation(mdp, values, state, action, gamma) {
  const outcomes = mdp.transitions[state][action];
  const terms = outcomes.map((transition, index) => {
    const futureValue = values[transition.next];
    return {
      ...transition,
      futureValue,
      contribution: transition.probability * (transition.reward + gamma * futureValue),
      label: transition.label || (outcomes.length === 1 ? "intended" : `outcome ${index + 1}`)
    };
  });
  return {
    state,
    action,
    gamma,
    terms,
    value: terms.reduce((sum, term) => sum + term.contribution, 0)
  };
}

function valueIteration(mdp, gamma, theta, maxIterations = 60) {
  let values = Object.fromEntries(mdp.states.map((s) => [s, 0]));
  const trace = [];
  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    const old = { ...values };
    let delta = 0;
    const stateUpdates = [];
    for (const s of mdp.states) {
      const qs = availableActions(mdp, s).map((a) => qCalculation(mdp, old, s, a, gamma));
      const best = qs.reduce((a, b) => (b.value > a.value ? b : a), qs[0]);
      values[s] = best.value;
      delta = Math.max(delta, Math.abs(values[s] - old[s]));
      stateUpdates.push({ state: s, old: old[s], newValue: values[s], qs, best });
    }
    trace.push({ iteration, delta, stateUpdates, values: { ...values }, policy: extractPolicy(mdp, values, gamma) });
    if (delta < theta) break;
  }
  return { values, policy: extractPolicy(mdp, values, gamma), trace };
}

function policyIteration(mdp, gamma, theta, maxOuter = 25) {
  let policy = Object.fromEntries(mdp.states.map((s) => [s, availableActions(mdp, s)[0]]));
  let values = Object.fromEntries(mdp.states.map((s) => [s, 0]));
  const trace = [];
  for (let outer = 1; outer <= maxOuter; outer++) {
    const evaluation = [];
    for (let sweep = 1; sweep <= 80; sweep++) {
      const old = { ...values };
      let delta = 0;
      const updates = [];
      for (const s of mdp.states) {
        const action = policy[s];
        const calculation = qCalculation(mdp, old, s, action, gamma);
        values[s] = calculation.value;
        delta = Math.max(delta, Math.abs(values[s] - old[s]));
        updates.push({ state: s, action, old: old[s], newValue: values[s], calculation });
      }
      evaluation.push({ sweep, delta, updates });
      if (delta < theta) break;
    }
    let stable = true;
    const improvements = [];
    for (const s of mdp.states) {
      const oldAction = policy[s];
      const qs = availableActions(mdp, s).map((a) => qCalculation(mdp, values, s, a, gamma));
      const best = qs.reduce((a, b) => (b.value > a.value ? b : a), qs[0]);
      policy[s] = best.action;
      if (oldAction !== best.action) stable = false;
      improvements.push({ state: s, oldAction, newAction: best.action, qs, changed: oldAction !== best.action });
    }
    trace.push({ iteration: outer, evaluation, improvements, stable, policy: { ...policy }, values: { ...values } });
    if (stable) break;
  }
  return { values, policy, trace, policyTrace: true };
}

function extractPolicy(mdp, values, gamma) {
  const policy = {};
  for (const s of mdp.states) {
    const qs = availableActions(mdp, s).map((a) => qCalculation(mdp, values, s, a, gamma));
    policy[s] = qs.reduce((a, b) => (b.value > a.value ? b : a), qs[0]).action;
  }
  return policy;
}

function renderSummary(target, mdp) {
  const equation = mdp.algorithm === "policy"
    ? `\\[V^{\\pi}(s) \\leftarrow \\sum_{s'}P(s'\\mid s,\\pi(s))\\left[R(s,\\pi(s),s')+\\gamma V^{\\pi}(s')\\right],\\quad \\pi_{new}(s)=\\arg\\max_a Q^{\\pi}(s,a)\\]`
    : `\\[V_{k+1}(s)=\\max_a\\sum_{s'}P(s'\\mid s,a)\\left[R(s,a,s')+\\gamma V_k(s')\\right]\\]`;
  const detailLink = mdp.detailHref ? `<a class="details-link" href="${mdp.detailHref}" target="_blank" rel="noreferrer">Open full state-action-transition-reward table</a>` : "";
  target.innerHTML = `
    <div class="summary">
      <h2>${mdp.name}</h2>
      <p>${mdp.description}</p>
      <div class="concept-grid">
        <div class="mini-card"><strong>State space \\(\\mathcal{S}\\)</strong><br>${mdp.states.join(", ")}</div>
        <div class="mini-card"><strong>Action space \\(\\mathcal{A}\\)</strong><br>${mdp.actions.join(", ")}</div>
        <div class="mini-card"><strong>Transition model \\(P\\)</strong><br>${mdp.type}</div>
        <div class="mini-card"><strong>Reward model \\(R\\)</strong><br>Rewards are applied inside each Bellman backup.</div>
      </div>
      <div class="equation-panel"><strong>Equation being applied now</strong><div class="equation">${equation}</div></div>
      ${detailLink}
    </div>`;
  typesetMath(target);
}

function renderVisual(target, mdp, values, policy, activeStates = []) {
  if (mdp.grid) {
    const { rows, cols, obstacles, terminal } = mdp.grid;
    const vals = Object.values(values);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    let cells = "";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const id = `${r},${c}`;
        if (obstacles.includes(id)) {
          cells += `<div class="cell obstacle">block</div>`;
          continue;
        }
        const intensity = max === min ? 0.5 : (values[id] - min) / (max - min);
        const bg = `rgba(15, 118, 110, ${0.12 + intensity * 0.55})`;
        const activeClass = activeStates.includes(id) ? "active-cell" : "";
        cells += `<div class="cell ${id === terminal ? "terminal" : ""} ${activeClass}" style="background:${bg}">${id}<br>V=${round(values[id])}<br>${arrows[policy[id]] || policy[id]}</div>`;
      }
    }
    target.innerHTML = `<h3>Value Heatmap and Policy</h3><div class="grid" style="grid-template-columns: repeat(${cols}, 1fr)">${cells}</div>`;
    return;
  }
  const layouts = {
    2: [[180, 260], [620, 260]],
    3: [[400, 130], [180, 390], [620, 390]]
  };
  const positions = layouts[mdp.states.length];
  const points = mdp.states.map((s, index) => {
    if (positions) return { state: s, x: positions[index][0], y: positions[index][1] };
    const angle = (Math.PI * 2 * index) / mdp.states.length - Math.PI / 2;
    return { state: s, x: 400 + Math.cos(angle) * 270, y: 260 + Math.sin(angle) * 170 };
  });
  const pointByState = Object.fromEntries(points.map((p) => [p.state, p]));
  const edges = mdp.states.flatMap((s) => availableActions(mdp, s).flatMap((a) =>
    mdp.transitions[s][a]
      .filter((t) => t.probability > 0)
      .map((t) => ({ from: pointByState[s], to: pointByState[t.next], action: a, probability: t.probability, reward: t.reward }))
  ));
  const pairGroups = new Map();
  const selfGroups = new Map();
  for (const edge of edges) {
    if (edge.from.state === edge.to.state) {
      const group = selfGroups.get(edge.from.state) || [];
      group.push(edge);
      selfGroups.set(edge.from.state, group);
    } else {
      const key = [edge.from.state, edge.to.state].sort().join("|");
      const group = pairGroups.get(key) || [];
      group.push(edge);
      pairGroups.set(key, group);
    }
  }
  const ellipsePoint = (center, toward) => {
    const dx = toward.x - center.x;
    const dy = toward.y - center.y;
    const scale = 1 / Math.sqrt((dx * dx) / (72 * 72) + (dy * dy) / (38 * 38));
    return { x: center.x + dx * scale, y: center.y + dy * scale };
  };
  const labelBox = (x, y, edge) => `<g class="graph-label-box" transform="translate(${x} ${y})">
    <rect x="-72" y="-20" width="144" height="40" rx="8" />
    <text class="graph-label graph-label-action" x="0" y="-5" text-anchor="middle">${edge.action}</text>
    <text class="graph-label graph-label-detail" x="0" y="12" text-anchor="middle">p=${round(edge.probability)} | r=${round(edge.reward)}</text>
  </g>`;
  const markerId = `arrowhead-${++graphSequence}`;
  const svgEdges = edges.map((edge) => {
    if (edge.from.state === edge.to.state) {
      const group = selfGroups.get(edge.from.state);
      const index = group.indexOf(edge);
      const center = { x: 400, y: 260 };
      const centerDistance = Math.hypot(edge.from.x - center.x, edge.from.y - center.y);
      const outwardAngle = centerDistance > 1 ? Math.atan2(edge.from.y - center.y, edge.from.x - center.x) : -Math.PI / 2;
      const angle = outwardAngle + (index - (group.length - 1) / 2) * 0.85;
      const radial = { x: Math.cos(angle), y: Math.sin(angle) };
      const tangent = { x: -radial.y, y: radial.x };
      const start = { x: edge.from.x - tangent.x * 27 + radial.x * 18, y: edge.from.y - tangent.y * 27 + radial.y * 18 };
      const end = { x: edge.from.x + tangent.x * 27 + radial.x * 18, y: edge.from.y + tangent.y * 27 + radial.y * 18 };
      const control1 = { x: start.x + radial.x * 96 - tangent.x * 22, y: start.y + radial.y * 96 - tangent.y * 22 };
      const control2 = { x: end.x + radial.x * 96 + tangent.x * 22, y: end.y + radial.y * 96 + tangent.y * 22 };
      const label = { x: edge.from.x + radial.x * 102, y: edge.from.y + radial.y * 102 };
      return `<path class="graph-edge" marker-end="url(#${markerId})" d="M ${start.x} ${start.y} C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${end.x} ${end.y}" />${labelBox(label.x, label.y, edge)}`;
    }
    const key = [edge.from.state, edge.to.state].sort().join("|");
    const group = pairGroups.get(key);
    const index = group.indexOf(edge);
    const canonical = key.split("|").map((state) => pointByState[state]);
    const dx = canonical[1].x - canonical[0].x;
    const dy = canonical[1].y - canonical[0].y;
    const length = Math.hypot(dx, dy) || 1;
    const normal = { x: -dy / length, y: dx / length };
    const offset = (index - (group.length - 1) / 2) * 130;
    const control = {
      x: (edge.from.x + edge.to.x) / 2 + normal.x * offset,
      y: (edge.from.y + edge.to.y) / 2 + normal.y * offset
    };
    const start = ellipsePoint(edge.from, control);
    const end = ellipsePoint(edge.to, control);
    const label = {
      x: 0.25 * start.x + 0.5 * control.x + 0.25 * end.x,
      y: 0.25 * start.y + 0.5 * control.y + 0.25 * end.y
    };
    return `<path class="graph-edge" marker-end="url(#${markerId})" d="M ${start.x} ${start.y} Q ${control.x} ${control.y}, ${end.x} ${end.y}" />${labelBox(label.x, label.y, edge)}`;
  }).join("");
  const svgNodes = points.map((p) => `<g class="graph-node-group"><ellipse class="graph-node ${activeStates.includes(p.state) ? "active-graph-node" : ""}" cx="${p.x}" cy="${p.y}" rx="72" ry="38" /><text class="graph-state-name" x="${p.x}" y="${p.y - 5}" text-anchor="middle">${p.state}</text><text class="graph-state-value" x="${p.x}" y="${p.y + 15}" text-anchor="middle">V=${round(values[p.state])} | π=${policy[p.state]}</text></g>`).join("");
  const rows = mdp.states.map((s) => `<tr class="${activeStates.includes(s) ? "active-row" : ""}"><td>${s}</td><td>${round(values[s])}</td><td>${arrows[policy[s]] || policy[s]}</td></tr>`).join("");
  target.innerHTML = `<h3>State Graph</h3>
    <div class="graph-scroll"><svg class="state-graph" viewBox="0 0 800 520" role="img" aria-label="State graph with clearly labeled transition probabilities and rewards">
      <defs><marker id="${markerId}" markerWidth="9" markerHeight="9" refX="8" refY="3.5" orient="auto"><path d="M0,0 L0,7 L8,3.5 z" /></marker></defs>
      <g class="graph-edges">${svgEdges}</g><g class="graph-nodes">${svgNodes}</g>
    </svg></div>
    <div class="graph-legend"><strong>Arrow labels:</strong> action on the first line; transition probability <strong>p</strong> and immediate reward <strong>r</strong> on the second line.</div>
    <table class="policy-table"><thead><tr><th>State</th><th>V(s)</th><th>π(s)</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function renderPolicyTable(target, mdp, values, policy, gamma) {
  const rows = mdp.states.map((s) => {
    const qs = availableActions(mdp, s).map((a) => `${a}: ${round(qValue(mdp, values, s, a, gamma))}`).join("<br>");
    return `<tr><td>${s}</td><td>${qs}</td><td>${policy[s]}</td></tr>`;
  }).join("");
  target.innerHTML = `<h3>Policy Extraction</h3><div class="equation">\\[\\pi^*(s)=\\arg\\max_a \\sum_{s'}P(s'\\mid s,a)\\left[R(s,a,s')+\\gamma V^*(s')\\right]\\]</div><table class="policy-table"><thead><tr><th>State</th><th>Final \\(Q(s,a)\\)</th><th>Selected action</th></tr></thead><tbody>${rows}</tbody></table>`;
  typesetMath(target);
}

function fixed(n, digits) {
  const threshold = 0.5 * (10 ** -digits);
  const value = Math.abs(Number(n)) < threshold ? 0 : Number(n);
  return value.toFixed(digits);
}

function compact(n) {
  return String(Number(fixed(n, 2)));
}

function actionName(action) {
  return String(action).toUpperCase();
}

function renderActionCalculation(calculation, selectedAction) {
  const selected = calculation.action === selectedAction;
  const terms = calculation.terms.map((term) => `
    <div class="calculation-term">
      <span>${fixed(term.probability, 2)} * (${compact(term.reward)} + ${compact(calculation.gamma)}*${fixed(term.futureValue, 2)})</span>
      <span class="outcome-label">[${term.label}]</span>
      <small>${term.actualAction ? `${actionName(term.actualAction)} &rarr; ` : ""}${term.next}</small>
    </div>`).join("");
  return `
    <div class="action-calculation ${selected ? "selected-calculation" : ""}">
      <div class="q-item"><strong>Q(${calculation.state}, ${actionName(calculation.action)}) = ${fixed(calculation.value, 3)}</strong>${selected ? '<span class="max-badge">selected</span>' : ""}</div>
      <div class="calculation-terms">${terms}</div>
      <div class="calculation-total">= ${fixed(calculation.value, 3)}</div>
    </div>`;
}

function renderBackupHeading(state, value, action) {
  return `<div class="backup-result"><strong>${state} &rarr; ${fixed(value, 3)} <span>(via ${actionName(action)})</span></strong></div>`;
}

function renderTrace(target, result, algorithm) {
  if (algorithm === "value") {
    target.innerHTML = `<h3>Bellman Update Trace</h3>${result.trace.map((step) => `
      <div class="trace-step">
        <span class="phase">Iteration ${step.iteration}</span>
        <p>Convergence residual \\(\\Delta = ${round(step.delta)}\\).</p>
        ${step.stateUpdates.map((u) => `
          <div class="backup-card">
            ${renderBackupHeading(u.state, u.newValue, u.best.action)}
            <div class="backup-previous">Previous value: ${fixed(u.old, 3)}. Candidate action computations:</div>
            <div class="q-list">${u.qs.map((q) => renderActionCalculation(q, u.best.action)).join("")}</div>
          </div>`).join("")}
      </div>`).join("")}`;
    typesetMath(target);
    return;
  }
  target.innerHTML = `<h3>Policy Iteration Trace</h3>${result.trace.map((step) => `
    <div class="trace-step">
      <span class="phase">Policy iteration ${step.iteration}</span>
      <p><strong>Evaluation phase:</strong> ${step.evaluation.length} sweeps until \\(\\Delta = ${round(step.evaluation.at(-1).delta)}\\).</p>
      <div class="trace-subsection">
        <h4>Final evaluation sweep computations</h4>
        ${step.evaluation.at(-1).updates.map((u) => `
          <div class="backup-card">
            ${renderBackupHeading(u.state, u.newValue, u.action)}
            <div class="backup-previous">Previous value: ${fixed(u.old, 3)}.</div>
            ${renderActionCalculation(u.calculation, u.action)}
          </div>`).join("")}
      </div>
      <p><strong>Improvement phase:</strong> ${step.stable ? "policy stable, stop" : "policy changed, evaluate again"}.</p>
      <div class="trace-subsection">
        <h4>Policy improvement computations</h4>
        ${step.improvements.map((u) => `
          <div class="backup-card">
            ${renderBackupHeading(u.state, u.qs.find((q) => q.action === u.newAction).value, u.newAction)}
            <div class="backup-previous">Policy: ${actionName(u.oldAction)} &rarr; ${actionName(u.newAction)}${u.changed ? " (changed)" : " (unchanged)"}.</div>
            <div class="q-list">${u.qs.map((q) => renderActionCalculation(q, u.newAction)).join("")}</div>
          </div>`).join("")}
      </div>
    </div>`).join("")}`;
  typesetMath(target);
}

function buildPresetSession(prefix, stochastic) {
  const envKey = $(`#${prefix}-env`).value;
  const gamma = Number($(`#${prefix}-gamma`).value);
  const theta = Number($(`#${prefix}-theta`).value);
  const terminalReward = Number($(`#${prefix}-terminal`).value);
  const stepReward = Number($(`#${prefix}-step`).value);
  const algorithm = $(`#${prefix}-algorithm`).value;
  const mdp = environmentFactories[envKey]({ stochastic, terminalReward, stepReward });
  mdp.algorithm = algorithm;
  mdp.detailHref = `problem.html?mode=${stochastic ? "stochastic" : "deterministic"}&env=${envKey}`;
  const result = algorithm === "value" ? valueIteration(mdp, gamma, theta) : policyIteration(mdp, gamma, theta);
  const initialValues = Object.fromEntries(mdp.states.map((s) => [s, 0]));
  const initialPolicy = Object.fromEntries(mdp.states.map((s) => [s, availableActions(mdp, s)[0]]));
  solverSessions[prefix] = { mdp, result, algorithm, gamma, index: 0, initialValues, initialPolicy };
  renderPresetSession(prefix);
}

function renderPresetSession(prefix) {
  const session = solverSessions[prefix];
  const { mdp, result, algorithm, gamma, index, initialValues, initialPolicy } = session;
  const visibleTrace = result.trace.slice(0, index);
  const currentStep = visibleTrace.at(-1);
  const values = currentStep?.values || initialValues;
  const policy = currentStep?.policy || initialPolicy;
  const activeStates = algorithm === "value"
    ? currentStep?.stateUpdates.map((u) => u.state) || []
    : currentStep?.improvements.map((u) => u.state) || [];
  renderSummary($(`#${prefix}-summary`), mdp);
  renderVisual($(`#${prefix}-visual`), mdp, values, policy, activeStates);
  renderPolicyTable($(`#${prefix}-policy`), mdp, values, policy, gamma);
  const status = index === 0
    ? "Ready. Values are initialized to 0. Press Next Computation Step to apply the first Bellman update."
    : index >= result.trace.length
      ? `Solved to completion in ${result.trace.length} ${algorithm === "value" ? "Bellman sweeps" : "policy-improvement rounds"}.`
      : `Showing step ${index} of ${result.trace.length}. Values in the visual panel are the current computed values.`;
  $(`#${prefix}-status`).textContent = status;
  renderTrace($(`#${prefix}-trace`), { ...result, trace: visibleTrace, values, policy }, algorithm);
  if (index === 0) {
    $(`#${prefix}-trace`).innerHTML = `<h3>Computation Trace</h3><div class="notice">No Bellman backup has been applied yet. The next step will compute each state's candidate \\(Q(s,a)\\), select the best action, and write the new value into the visual panel.</div>`;
    typesetMath($(`#${prefix}-trace`));
  }
}

function stepPreset(prefix, stochastic) {
  if (!solverSessions[prefix]) buildPresetSession(prefix, stochastic);
  const session = solverSessions[prefix];
  session.index = Math.min(session.index + 1, session.result.trace.length);
  renderPresetSession(prefix);
}

function solvePreset(prefix, stochastic) {
  buildPresetSession(prefix, stochastic);
  solverSessions[prefix].index = solverSessions[prefix].result.trace.length;
  renderPresetSession(prefix);
}

function round(n) {
  return Number(n).toFixed(3).replace(/\.?0+$/, "");
}

function initTutorials() {
  const render = (key) => {
    const t = tutorialContent[key];
    $("#tutorial-content").innerHTML = `<h2>${t.title}</h2>${t.body}`;
    typesetMath($("#tutorial-content"));
  };
  $$(".topic").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".topic").forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      render(button.dataset.topic);
    });
  });
  render("foundations");
}

function initTabs() {
  $$(".tab").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".tab").forEach((b) => b.classList.remove("active"));
      $$(".section").forEach((s) => s.classList.remove("active"));
      button.classList.add("active");
      $(`#${button.dataset.section}`).classList.add("active");
      typesetMath($(`#${button.dataset.section}`));
    });
  });
}

function initPresetControls() {
  for (const [prefix, stochastic] of [["det", false], ["sto", true]]) {
    const select = $(`#${prefix}-env`);
    select.innerHTML = `<option value="grid">Grid World</option><option value="robot">Robot Can Collector</option><option value="health">Health State MDP</option>`;
    $(`#${prefix}-gamma`).addEventListener("input", (event) => $(`#${prefix}-gamma-out`).textContent = Number(event.target.value).toFixed(2));
    [`${prefix}-env`, `${prefix}-algorithm`, `${prefix}-gamma`, `${prefix}-theta`, `${prefix}-terminal`, `${prefix}-step`].forEach((id) => {
      $(`#${id}`).addEventListener("change", () => buildPresetSession(prefix, stochastic));
    });
    $(`#start-${prefix}`).addEventListener("click", () => buildPresetSession(prefix, stochastic));
    $(`#step-${prefix}`).addEventListener("click", () => stepPreset(prefix, stochastic));
    $(`#solve-${prefix}`).addEventListener("click", () => solvePreset(prefix, stochastic));
    buildPresetSession(prefix, stochastic);
  }
}

function generateCustomRows() {
  const states = parseList($("#custom-states").value);
  const actions = parseList($("#custom-actions").value);
  const container = $("#custom-transitions");
  container.innerHTML = "";
  for (const s of states) {
    for (const a of actions) {
      const block = document.createElement("div");
      block.className = "pair-editor";
      block.dataset.state = s;
      block.dataset.action = a;
      block.innerHTML = `
        <strong>From ${s} using ${a}</strong>
        <div class="rows"></div>
        <button class="add-outcome" type="button">Add outcome</button>`;
      container.appendChild(block);
      addOutcome(block, states, states[0], "1", "0");
      block.querySelector(".add-outcome").addEventListener("click", () => addOutcome(block, states, states[0], "0", "0"));
    }
  }
}

function addOutcome(block, states, next, probability, reward) {
  const row = document.createElement("div");
  row.className = "outcome-row";
  row.innerHTML = `
    <select class="next">${states.map((s) => `<option ${s === next ? "selected" : ""}>${s}</option>`).join("")}</select>
    <input class="prob" type="number" min="0" max="1" step="0.01" value="${probability}" />
    <input class="reward" type="number" step="0.1" value="${reward}" />
    <button type="button" class="remove">Remove</button>`;
  block.querySelector(".rows").appendChild(row);
  row.querySelector(".remove").addEventListener("click", () => row.remove());
}

function readCustomMdp() {
  const states = parseList($("#custom-states").value);
  const actions = parseList($("#custom-actions").value);
  const errors = [];
  if (!states.length) errors.push("Define at least one state.");
  if (!actions.length) errors.push("Define at least one action.");
  const transitions = Object.fromEntries(states.map((s) => [s, {}]));
  $$(".pair-editor").forEach((block) => {
    const state = block.dataset.state;
    const action = block.dataset.action;
    const outcomes = $$(".outcome-row", block).map((row) => ({
      next: row.querySelector(".next").value,
      probability: Number(row.querySelector(".prob").value),
      reward: Number(row.querySelector(".reward").value)
    }));
    const sum = outcomes.reduce((a, b) => a + b.probability, 0);
    if (Math.abs(sum - 1) > 0.0001) errors.push(`${state}/${action} probabilities sum to ${round(sum)}, not 1.`);
    if (outcomes.some((o) => !states.includes(o.next))) errors.push(`${state}/${action} has an undefined next state.`);
    if (outcomes.some((o) => Number.isNaN(o.probability) || o.probability < 0)) errors.push(`${state}/${action} has an invalid probability.`);
    transitions[state][action] = outcomes;
  });
  if (!$$(".pair-editor").length) errors.push("Generate transition rows before solving.");
  return { errors, mdp: { name: "Custom MDP", type: "User-defined transition model", states, actions, transitions, terminalStates: [], description: "A custom MDP generated from your transition rows." } };
}

function solveCustom() {
  const { errors, mdp } = readCustomMdp();
  const validation = $("#validation");
  if (errors.length) {
    validation.innerHTML = `<div class="validation-box bad"><strong>Validation failed</strong><br>${errors.join("<br>")}</div>`;
    $("#custom-trace").innerHTML = "";
    return;
  }
  validation.innerHTML = `<div class="validation-box good"><strong>Validation passed.</strong> Every transition points to a known state and every probability distribution sums to 1.</div>`;
  const gamma = Number($("#custom-gamma").value);
  const theta = Number($("#custom-theta").value);
  const algorithm = $("#custom-algorithm").value;
  mdp.algorithm = algorithm;
  const result = algorithm === "value" ? valueIteration(mdp, gamma, theta) : policyIteration(mdp, gamma, theta);
  const temp = document.createElement("div");
  renderSummary(temp, mdp);
  const visual = document.createElement("div");
  renderPolicyTable(visual, mdp, result.values, result.policy, gamma);
  $("#custom-trace").innerHTML = temp.innerHTML + visual.innerHTML;
  const trace = document.createElement("div");
  renderTrace(trace, result, algorithm);
  $("#custom-trace").append(...trace.childNodes);
  typesetMath($("#custom-trace"));
}

function initCustom() {
  $("#custom-gamma").addEventListener("input", (event) => $("#custom-gamma-out").textContent = Number(event.target.value).toFixed(2));
  $("#generate-custom").addEventListener("click", generateCustomRows);
  $("#solve-custom").addEventListener("click", solveCustom);
  generateCustomRows();
}

initTabs();
initTutorials();
initPresetControls();
initCustom();
typesetMath(document.body);
