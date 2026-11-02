const state = {
  running: true,
  doseRate: 0.42,
  totalDose: 1.34,
  battery: 92,
  temperature: 22.3,
  history: [0.34, 0.38, 0.44, 0.42, 0.48, 0.43, 0.51, 0.49, 0.46, 0.44, 0.52, 0.55, 0.5, 0.57, 0.49, 0.43, 0.4, 0.46, 0.51, 0.54, 0.58, 0.6, 0.48, 0.45, 0.42, 0.41, 0.35, 0.44, 0.46, 0.49, 0.53, 0.5, 0.58, 0.6, 0.54, 0.49],
  log: []
};

const chartLine = document.getElementById('chartLine');
const chartArea = document.getElementById('chartArea');
const statusChip = document.getElementById('statusChip');
const doseRateValue = document.getElementById('doseRateValue');
const statDose = document.getElementById('statDose');
const statTotal = document.getElementById('statTotal');
const statBattery = document.getElementById('statBattery');
const statStatus = document.getElementById('statStatus');
const statusMeta = document.getElementById('statusMeta');
const meterRing = document.getElementById('meterRing');
const metricRadiation = document.getElementById('metricRadiation');
const metricNeutron = document.getElementById('metricNeutron');
const metricTemp = document.getElementById('metricTemp');
const metricLocation = document.getElementById('metricLocation');
const eventLog = document.getElementById('eventLog');
const miniMeterFill = document.getElementById('miniMeterFill');
const startDemo = document.getElementById('startDemo');
const alarmTest = document.getElementById('alarmTest');
const resetData = document.getElementById('resetData');

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatDose(value) {
  return `${Number(value).toFixed(2)} µSv/h`;
}

function getStatus(dose) {
  if (dose >= 1.5) return { label: 'Danger', cssClass: 'danger', meta: 'High radiation' };
  if (dose >= 0.7) return { label: 'Warning', cssClass: 'warning', meta: 'Elevated' };
  return { label: 'Normal', cssClass: 'normal', meta: 'Background' };
}

function addLog(message, level = 'info') {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  state.log.unshift({ time, message, level });
  state.log = state.log.slice(0, 6);

  eventLog.innerHTML = state.log
    .map(
      (entry) => `
        <li>
          <span>${entry.message}</span>
          <small>${entry.time}</small>
        </li>
      `
    )
    .join('');
}

function updateChart() {
  const values = state.history;
  const width = 520;
  const height = 220;
  const padding = 18;

  const min = Math.min(...values) * 0.8;
  const max = Math.max(...values) * 1.2;

  const points = values.map((value, index) => {
    const x = padding + (index / (values.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / Math.max(max - min, 0.0001)) * (height - padding * 2);
    return [x, y];
  });

  const linePath = points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`)
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1][0]} ${height - padding} L ${points[0][0]} ${height - padding} Z`;

  chartLine.setAttribute('d', linePath);
  chartArea.setAttribute('d', areaPath);

  const gridGroup = document.querySelector('.grid-lines');
  const lines = Array.from({ length: 5 }, (_, i) => {
    const y = padding + (i * (height - padding * 2)) / 4;
    return `<line x1="${padding}" x2="${width - padding}" y1="${y}" y2="${y}" />`;
  }).join('');
  gridGroup.innerHTML = lines;
}

function renderStatus() {
  const status = getStatus(state.doseRate);
  const gaugePercent = clamp((state.doseRate / 3) * 100, 0, 100);

  meterRing.style.setProperty('--gauge', `${gaugePercent}%`);
  if (gaugePercent > 70) {
    meterRing.style.boxShadow = '0 0 28px rgba(255, 122, 122, 0.2)';
  } else {
    meterRing.style.boxShadow = '0 18px 34px rgba(8, 18, 29, 0.4)';
  }

  doseRateValue.textContent = Number(state.doseRate).toFixed(2);
  statDose.textContent = formatDose(state.doseRate);
  statTotal.textContent = `${(state.totalDose / 1000).toFixed(2)} mSv`;
  statBattery.textContent = `${Math.round(state.battery)}%`;
  statStatus.textContent = status.label;
  statusMeta.textContent = status.meta;
  statusChip.textContent = status.label;
  statusChip.className = `status-chip ${status.cssClass}`;

  metricRadiation.textContent = state.doseRate >= 1.5 ? 'High' : state.doseRate >= 0.7 ? 'Elevated' : 'Low';
  metricNeutron.textContent = state.doseRate >= 1.2 ? 'Detected' : 'No signal';
  metricTemp.textContent = `${state.temperature.toFixed(1)}°C`;
  metricLocation.textContent = 'Indoor / Lab A';

  miniMeterFill.style.width = `${gaugePercent}%`;
}

function simulateReading() {
  if (!state.running) return;

  const drift = (Math.random() - 0.5) * 1.2;
  const base = 0.42 + drift;
  state.doseRate = clamp(base, 0.08, 2.8);
  state.temperature = clamp(22.3 + (Math.random() - 0.4) * 4, 18, 29);
  state.battery = clamp(state.battery - Math.random() * 0.17, 24, 100);
  state.totalDose += state.doseRate * 0.12;
  state.history.push(state.doseRate);
  if (state.history.length > 36) state.history.shift();

  const status = getStatus(state.doseRate);
  if (status.label !== 'Normal' && Math.random() > 0.55) {
    addLog(`Alert: ${status.label.toLowerCase()} dose detected`, 'alert');
  } else {
    addLog(`Ambient check stable at ${state.doseRate.toFixed(2)} µSv/h`, 'info');
  }

  renderStatus();
  updateChart();
}

function resetDemoState() {
  state.running = true;
  state.doseRate = 0.42;
  state.totalDose = 1.34;
  state.battery = 92;
  state.temperature = 22.3;
  state.history = Array.from({ length: 36 }, (_, index) => 0.34 + Math.sin(index / 4) * 0.12 + (index % 5) * 0.02);
  state.log = [];
  addLog('System reset complete', 'info');
  addLog('Demo mode ready', 'info');
  renderStatus();
  updateChart();
}

startDemo.addEventListener('click', () => {
  state.running = !state.running;
  startDemo.textContent = state.running ? 'Pause demo' : 'Resume demo';
  addLog(state.running ? 'Demo resumed' : 'Demo paused', 'info');
});

alarmTest.addEventListener('click', () => {
  state.doseRate = 1.8;
  state.totalDose += 0.4;
  renderStatus();
  updateChart();
  addLog('Manual alarm test triggered', 'alert');
});

resetData.addEventListener('click', () => {
  resetDemoState();
});

resetDemoState();
setInterval(simulateReading, 1800);
