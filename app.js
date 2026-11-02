const state = {
  running: true,
  doseRate: 0.42,
  totalDose: 0.0,
  battery: 92,
  temperature: 22.3,
  history: [0.18, 0.32, 0.44, 0.24, 0.48, 0.54, 0.42, 0.39, 0.5, 0.46, 0.53, 0.41, 0.33, 0.27, 0.3, 0.36, 0.44, 0.58, 0.52, 0.47, 0.4, 0.43, 0.49, 0.62, 0.52, 0.46, 0.42, 0.33, 0.39, 0.46, 0.42, 0.54, 0.58, 0.49, 0.44, 0.41],
};

const chartArea = document.getElementById('chartArea');
const chartLine = document.getElementById('chartLine');
const chartGrid = document.querySelector('.chart-grid');
const statusChip = document.getElementById('statusChip');
const statusMeta = document.getElementById('statusMeta');
const statDose = document.getElementById('statDose');
const statTotal = document.getElementById('statTotal');
const statBattery = document.getElementById('statBattery');
const statStatus = document.getElementById('statStatus');
const doseRateValue = document.getElementById('doseRateValue');
const meterRing = document.getElementById('meterRing');
const metricRadiation = document.getElementById('metricRadiation');
const metricNeutron = document.getElementById('metricNeutron');
const metricTemp = document.getElementById('metricTemp');
const metricLocation = document.getElementById('metricLocation');
const startDemoButton = document.getElementById('startDemo');
const alarmTestButton = document.getElementById('alarmTest');

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getStatus(dose) {
  if (dose >= 1.5) {
    return { label: 'Danger', className: 'danger', meta: 'High radiation' };
  }
  if (dose >= 0.7) {
    return { label: 'Warning', className: 'warning', meta: 'Elevated' };
  }
  return { label: 'Normal', className: 'normal', meta: 'Background' };
}

function renderChart() {
  const values = state.history;
  const width = 620;
  const height = 230;
  const padding = 18;

  const min = Math.min(...values) * 0.8;
  const max = Math.max(...values) * 1.2 || 1;

  const points = values.map((value, index) => {
    const x = padding + (index / (values.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / Math.max(max - min, 0.0001)) * (height - padding * 2);
    return [x, y];
  });

  const linePath = points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`)
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1][0]} ${height - padding} L ${points[0][0]} ${height - padding} Z`;

  chartArea.setAttribute('d', areaPath);
  chartLine.setAttribute('d', linePath);

  const gridLines = Array.from({ length: 5 }, (_, i) => {
    const y = padding + (i * (height - padding * 2)) / 4;
    return `<line x1="${padding}" x2="${width - padding}" y1="${y}" y2="${y}" />`;
  }).join('');

  chartGrid.innerHTML = gridLines;
}

function updateDashboard() {
  const status = getStatus(state.doseRate);
  const gaugePercent = clamp((state.doseRate / 2.5) * 100, 0, 100);

  meterRing.style.setProperty('--gauge', `${gaugePercent}%`);
  doseRateValue.textContent = Number(state.doseRate).toFixed(2);
  statDose.textContent = `${state.doseRate.toFixed(2)} μSv/h`;
  statTotal.textContent = `${state.totalDose.toFixed(2)} mSv`;
  statBattery.textContent = `${Math.round(state.battery)}%`;
  statStatus.textContent = status.label;
  statusMeta.textContent = status.meta;
  statusChip.textContent = status.label;
  statusChip.className = `status-chip ${status.className}`;

  metricRadiation.textContent = state.doseRate >= 1.5 ? 'High' : state.doseRate >= 0.7 ? 'Elevated' : 'Low';
  metricNeutron.textContent = state.doseRate >= 1.2 ? 'Detected' : 'No signal';
  metricTemp.textContent = `${state.temperature.toFixed(1)}°C`;
  metricLocation.textContent = 'Indoor / Lab A';

  const deviceState = document.querySelector('.device-state');
  deviceState.textContent = status.label;
  deviceState.className = `device-state ${status.className}`;
}

function tick() {
  if (!state.running) return;

  const drift = (Math.random() - 0.5) * 0.9;
  state.doseRate = clamp(0.42 + drift, 0.05, 2.5);
  state.temperature = clamp(22.3 + (Math.random() - 0.5) * 2.8, 18, 29);
  state.battery = clamp(state.battery - Math.random() * 0.3, 18, 100);
  state.totalDose += state.doseRate * 0.04;
  state.history.push(state.doseRate);

  if (state.history.length > 36) {
    state.history.shift();
  }

  updateDashboard();
  renderChart();
}

startDemoButton.addEventListener('click', () => {
  state.running = !state.running;
  startDemoButton.textContent = state.running ? 'Pause demo' : 'Resume demo';
});

alarmTestButton.addEventListener('click', () => {
  state.doseRate = 1.8;
  state.temperature = 25.5;
  state.totalDose += 0.25;
  state.history.push(state.doseRate);
  if (state.history.length > 36) state.history.shift();
  updateDashboard();
  renderChart();
});

updateDashboard();
renderChart();
setInterval(tick, 1800);
