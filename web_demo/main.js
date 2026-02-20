const overviewList = document.getElementById('overview-list');
const form = document.getElementById('call-form');
const profileSelect = document.getElementById('profile-select');
const sessionsBody = document.getElementById('sessions-body');
const kpiGrid = document.getElementById('kpi-grid');
const concurrencyInput = document.getElementById('concurrency');
const concurrencyValue = document.getElementById('concurrency-value');
const trafficTypeInput = document.getElementById('traffic-type');

const trafficTuning = {
  voice: { latencyBias: -0.8, prbScale: 0.7, reliabilityBoost: 0.003, slice: 'URLLC' },
  video: { latencyBias: 1.9, prbScale: 1.5, reliabilityBoost: -0.004, slice: 'eMBB' },
  iot: { latencyBias: 0.2, prbScale: 0.45, reliabilityBoost: 0.006, slice: 'mMTC' },
};

let demoData = null;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function renderKpis(metrics) {
  kpiGrid.innerHTML = '';
  [
    ['Estimated Throughput', `${metrics.throughputGbps.toFixed(2)} Gbps`],
    ['Avg Latency', `${metrics.avgLatencyMs.toFixed(2)} ms`],
    ['Target Reliability', `${(metrics.reliability * 100).toFixed(3)}%`],
    ['GPU Load Index', `${metrics.gpuLoad.toFixed(1)} / 100`],
  ].forEach(([label, value]) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `<h3>${label}</h3><div class="count">${value}</div>`;
    kpiGrid.appendChild(card);
  });
}

function generateSessions(profile, trafficType, concurrency) {
  const tuning = trafficTuning[trafficType];
  const density = profile.num_testcases / Math.max(profile.groups, 1);
  const baseLatency = 2.4 + profile.groups * 0.4 + tuning.latencyBias;
  const basePrb = Math.round((14 + density) * tuning.prbScale);
  const reliability = clamp(0.992 + tuning.reliabilityBoost - profile.groups * 0.0007, 0.97, 0.99999);

  const sessions = Array.from({ length: 8 }, (_, idx) => {
    const jitter = ((idx % 3) - 1) * 0.28;
    return {
      sessionId: `${profile.name.toUpperCase()}-${String(idx + 1).padStart(3, '0')}`,
      slice: tuning.slice,
      prbs: Math.max(8, Math.round(basePrb + idx * 2)),
      latencyMs: clamp(baseLatency + jitter + concurrency / 140, 1.2, 20),
      reliability: clamp(reliability - idx * 0.0003, 0.95, 0.99999),
    };
  });

  const avgLatencyMs = sessions.reduce((acc, session) => acc + session.latencyMs, 0) / sessions.length;
  const throughputGbps = (concurrency * basePrb * (trafficType === 'video' ? 0.0016 : 0.0007));
  const gpuLoad = clamp((concurrency / 2.2) + profile.groups * 2.3, 8, 100);

  return {
    sessions,
    metrics: {
      throughputGbps,
      avgLatencyMs,
      reliability,
      gpuLoad,
    },
  };
}

function renderSessions(sessions) {
  sessionsBody.innerHTML = '';
  sessions.forEach((session) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${session.sessionId}</td>
      <td>${session.slice}</td>
      <td>${session.prbs}</td>
      <td>${session.latencyMs.toFixed(2)}</td>
      <td>${(session.reliability * 100).toFixed(3)}%</td>
    `;
    sessionsBody.appendChild(row);
  });
}

function runSimulation() {
  const selectedProfile = demoData.perf_profiles.find((profile) => profile.name === profileSelect.value);
  const trafficType = trafficTypeInput.value;
  const concurrency = Number(concurrencyInput.value);
  const { sessions, metrics } = generateSessions(selectedProfile, trafficType, concurrency);
  renderKpis(metrics);
  renderSessions(sessions);
}

async function load() {
  const response = await fetch('./data/demo-data.json');
  demoData = await response.json();

  demoData.overview.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    overviewList.appendChild(li);
  });

  demoData.perf_profiles.forEach((profile) => {
    const option = document.createElement('option');
    option.value = profile.name;
    option.textContent = `${profile.name} (${profile.num_testcases} scenarios)`;
    profileSelect.appendChild(option);
  });

  runSimulation();
}

concurrencyInput.addEventListener('input', () => {
  concurrencyValue.textContent = concurrencyInput.value;
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  runSimulation();
});

load();
