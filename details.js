const detailRoot = document.querySelector("#problem-details");
const title = document.querySelector("#detail-title");

function round(n) {
  return Number(n).toFixed(3).replace(/\.?0+$/, "");
}

function typesetMath(root = document.body) {
  if (window.MathJax?.typesetPromise) {
    window.MathJax.typesetPromise([root]).catch(() => {});
  }
}

function makeGridWorld(stochastic) {
  const rows = 3;
  const cols = 4;
  const terminalReward = 10;
  const stepReward = -1;
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
        transitions[s][a] = [{ next: s, probability: 1, reward: 0 }];
      } else if (stochastic) {
        const side = a === "up" || a === "down" ? ["left", "right"] : ["up", "down"];
        transitions[s][a] = [a, side[0], side[1]].map((actual, i) => {
          const next = move(s, actual);
          return { next, probability: i === 0 ? 0.8 : 0.1, reward: next === terminal ? terminalReward : stepReward };
        });
      } else {
        const next = move(s, a);
        transitions[s][a] = [{ next, probability: 1, reward: next === terminal ? terminalReward : stepReward }];
      }
    }
  }
  return { name: "Grid World", states, actions, transitions, description: "Movement over a grid with one obstacle and one terminal state." };
}

function makeRobot(stochastic) {
  const alpha = stochastic ? 0.8 : 1;
  const beta = stochastic ? 0.2 : 1;
  return {
    name: "Sutton-Barto Recycling Robot",
    states: ["high", "low"],
    actions: ["search", "wait", "recharge"],
    description: "The can-collector robot has high or low battery. Searching gives can reward but may deplete battery; waiting gives a smaller reward; recharging restores high battery.",
    transitions: {
      high: {
        search: [
          { next: "high", probability: alpha, reward: 4 },
          { next: "low", probability: 1 - alpha, reward: 4 }
        ],
        wait: [{ next: "high", probability: 1, reward: 1 }]
      },
      low: {
        search: [
          { next: "high", probability: 1 - beta, reward: -3 },
          { next: "low", probability: beta, reward: 4 }
        ],
        wait: [{ next: "low", probability: 1, reward: 1 }],
        recharge: [{ next: "high", probability: 1, reward: 0 }]
      }
    }
  };
}

function makeHealth(stochastic) {
  return {
    name: "Health State MDP",
    states: ["Healthy", "Sick", "Rested"],
    actions: ["exercise", "rest"],
    description: "Exercise and rest change health states. The stochastic version includes uncertain health outcomes.",
    transitions: {
      Healthy: {
        exercise: stochastic ? [{ next: "Healthy", probability: 0.75, reward: 3 }, { next: "Sick", probability: 0.25, reward: -1 }] : [{ next: "Healthy", probability: 1, reward: 3 }],
        rest: [{ next: "Rested", probability: 1, reward: 1 }]
      },
      Sick: {
        exercise: stochastic ? [{ next: "Healthy", probability: 0.35, reward: 5 }, { next: "Sick", probability: 0.65, reward: -3 }] : [{ next: "Sick", probability: 1, reward: -3 }],
        rest: stochastic ? [{ next: "Rested", probability: 0.7, reward: 2 }, { next: "Sick", probability: 0.3, reward: -1 }] : [{ next: "Rested", probability: 1, reward: 2 }]
      },
      Rested: {
        exercise: [{ next: "Healthy", probability: 1, reward: 5 }],
        rest: [{ next: "Rested", probability: 1, reward: 1 }]
      }
    }
  };
}

const params = new URLSearchParams(window.location.search);
const env = params.get("env") || "grid";
const mode = params.get("mode") || "deterministic";
const stochastic = mode === "stochastic";
const factories = { grid: makeGridWorld, robot: makeRobot, health: makeHealth };
const mdp = (factories[env] || makeGridWorld)(stochastic);

const rows = mdp.states.flatMap((state) => {
  const actions = Object.keys(mdp.transitions[state] || {});
  return actions.map((action) => {
    const outcomes = mdp.transitions[state][action]
      .map((t) => `\\(P(${t.next}\\mid ${state},${action})=${round(t.probability)}\\), \\(R=${round(t.reward)}\\)`)
      .join("<br>");
    return `<tr><td>${state}</td><td>${action}</td><td>${outcomes}</td></tr>`;
  });
});

title.textContent = `${mdp.name} (${mode})`;
detailRoot.innerHTML = `
  <h2>${mdp.name}</h2>
  <p>${mdp.description}</p>
  <div class="equation-panel">
    <strong>Transition and reward notation</strong>
    <div class="equation">\\[P(s'\\mid s,a) \\quad \\text{and} \\quad R(s,a,s')\\]</div>
  </div>
  <div class="concept-grid">
    <div class="mini-card"><strong>States</strong><br>${mdp.states.join(", ")}</div>
    <div class="mini-card"><strong>Mode</strong><br>${mode}</div>
  </div>
  <table class="transition-table">
    <thead><tr><th>State \\(s\\)</th><th>Action \\(a\\)</th><th>Outcomes \\(s'\\), probability, reward</th></tr></thead>
    <tbody>${rows.join("")}</tbody>
  </table>`;

typesetMath(detailRoot);
