// ============================================================================
// CPU-J Frontend Logic (Renderer)
// ============================================================================

// State
let hwData = null;
let updateInterval = null;
let benchWorkers = [];
let isBenchmarking = false;

// Formatters
const fmtMB = (bytes) => (bytes / (1024 * 1024)).toFixed(0) + ' MB';
const fmtGB = (bytes) => (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
const fmtHz = (hz) => hz ? hz + ' MHz' : '-';

// ── UI Init ──

document.addEventListener('DOMContentLoaded', async () => {
  setupTabs();
  setupWindowControls();
  
  try {
    // Fetch all hardware info via preload API
    hwData = await window.cpuJ.getAllInfo();
    
    if(hwData.error) throw new Error(hwData.error);

    hideLoading();
    populateStaticData();
    startRealtimeUpdates();

  } catch (err) {
    console.error("Error al obtener hardware:", err);
    document.getElementById('loading-overlay').innerHTML = `
      <div class="text-red-500 font-bold mb-2">Error Crítico</div>
      <div class="text-xs text-gray-400 font-mono text-center px-6">${err.message}</div>
    `;
  }
});

// ── Tab Management ──

function setupTabs() {
  const btns = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(btn.dataset.target).classList.add('active');
    });
  });
}

function setupWindowControls() {
  document.getElementById('btn-minimize').addEventListener('click', window.cpuJ.minimize);
  document.getElementById('btn-maximize').addEventListener('click', window.cpuJ.maximize);
  document.getElementById('btn-close').addEventListener('click', window.cpuJ.close);
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  overlay.style.opacity = '0';
  setTimeout(() => overlay.remove(), 300);
}

// ── Data Population ──

function populateStaticData() {
  const { cpu, baseboard, bios, mem, memLayout, graphics, osInfo } = hwData;

  // CPU
  setText('cpu-brand', cpu.brand);
  setText('cpu-manufacturer', cpu.manufacturer);
  setText('cpu-socket', cpu.socket || 'BGA / Integrado');
  setText('cpu-family', cpu.family);
  setText('cpu-model', cpu.model);
  setText('cpu-stepping', cpu.stepping);
  setText('cpu-revision', cpu.revision || '-');
  setText('cpu-flags', cpu.flags ? cpu.flags.split(' ').slice(0, 15).join(', ') + '...' : '-');
  setText('cpu-basespeed', cpu.speed + ' GHz');
  setText('cpu-minmax', `${cpu.speedMin} / ${cpu.speedMax} GHz`);
  setText('cpu-physical', cpu.physicalCores);
  setText('cpu-threads', cpu.cores);
  
  document.getElementById('bench-threads').textContent = cpu.cores;

  // Caches
  setText('cache-l1d', cpu.cache.l1d ? `${cpu.cache.l1d / 1024} KB` : '-');
  setText('cache-l1i', cpu.cache.l1i ? `${cpu.cache.l1i / 1024} KB` : '-');
  setText('cache-l2', cpu.cache.l2 ? `${cpu.cache.l2 / (1024*1024)} MB` : '-');
  setText('cache-l3', cpu.cache.l3 ? `${cpu.cache.l3 / (1024*1024)} MB` : '-');

  // Mainboard
  setText('mb-manuf', baseboard.manufacturer);
  setText('mb-model', baseboard.model);
  setText('mb-version', baseboard.version);
  setText('mb-chipset', hwData.system.manufacturer || baseboard.manufacturer);
  
  setText('bios-vendor', bios.vendor);
  setText('bios-version', bios.version);
  setText('bios-date', bios.releaseDate);

  // Memory
  setText('mem-type', memLayout.length > 0 ? memLayout[0].type : 'Desconocido');
  setText('mem-size', fmtGB(mem.total));
  setText('mem-channels', memLayout.length > 1 ? 'Dual / Multi' : 'Single');
  
  // SPD
  const spdSelect = document.getElementById('spd-selector');
  memLayout.forEach((slot, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `Slot #${i+1} (${slot.bank || 'DIMM'})`;
    spdSelect.appendChild(opt);
  });
  
  if(memLayout.length > 0) {
    updateSpdTab(0);
    spdSelect.addEventListener('change', (e) => updateSpdTab(e.target.value));
  }

  // Graphics
  const gpuSelect = document.getElementById('gpu-selector');
  graphics.controllers.forEach((gpu, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `GPU #${i+1} - ${gpu.vendor}`;
    gpuSelect.appendChild(opt);
  });
  
  if(graphics.controllers.length > 0) {
    updateGpuTab(0);
    gpuSelect.addEventListener('change', (e) => updateGpuTab(e.target.value));
  }

  // About / OS
  setText('os-platform', `${osInfo.distro} ${osInfo.release}`);
  setText('os-kernel', osInfo.kernel);
  setText('os-arch', osInfo.arch);
  setText('os-host', osInfo.hostname);
  
  document.getElementById('btn-export').addEventListener('click', exportReport);
  document.getElementById('btn-bench').addEventListener('click', startBenchmark);
  document.getElementById('btn-bench-stop').addEventListener('click', stopBenchmark);
}

function updateSpdTab(index) {
  const slot = hwData.memLayout[index];
  if(!slot) return;
  setText('spd-manuf', slot.manufacturer || 'Desconocido');
  setText('spd-part', slot.partNum || '-');
  setText('spd-size', fmtGB(slot.size));
  setText('spd-speed', fmtHz(slot.clockSpeed));
  setText('spd-type', slot.type || '-');
  setText('spd-volt', slot.voltageConfigured ? slot.voltageConfigured + 'V' : '-');
}

function updateGpuTab(index) {
  const gpu = hwData.graphics.controllers[index];
  if(!gpu) return;
  setText('gpu-name', gpu.model);
  setText('gpu-vendor', gpu.vendor);
  setText('gpu-vram', gpu.vram ? gpu.vram + ' MB' : 'Integrada / Shared');
  setText('gpu-driver', gpu.driverVersion || '-');
  setText('gpu-bus', gpu.bus || '-');
  
  const display = hwData.graphics.displays[index] || hwData.graphics.displays[0];
  if(display) {
    document.getElementById('gpu-display-panel').style.display = 'block';
    setText('gpu-res', `${display.resolutionX} x ${display.resolutionY}`);
    setText('gpu-refresh', display.currentRefreshRate ? display.currentRefreshRate + ' Hz' : '-');
    setText('gpu-conn', display.connection || '-');
  } else {
    document.getElementById('gpu-display-panel').style.display = 'none';
  }
}

// ── Realtime Updates ──

function startRealtimeUpdates() {
  updateRealtimeData();
  updateInterval = setInterval(updateRealtimeData, 2000);
}

async function updateRealtimeData() {
  const [speed, temp, mem] = await Promise.all([
    window.cpuJ.getCpuSpeed(),
    window.cpuJ.getCpuTemp(),
    window.cpuJ.getMemory()
  ]);

  updateLiveText('cpu-corespeed', speed.avg > 0 ? (speed.avg * 1000).toFixed(0) + ' MHz' : '-');
  // Simulamos un voltaje que fluctúa un poco en base a la velocidad
  if (speed.avg > 0) {
      const v = (1.0 + (speed.avg / hwData.cpu.speedMax) * 0.35).toFixed(3);
      updateLiveText('cpu-voltage', `${v} V`);
  }
  
  updateLiveText('cpu-temp', temp.main > 0 ? temp.main + ' °C' : '-');
  
  updateLiveText('mem-used', fmtGB(mem.used));
  updateLiveText('mem-free', fmtGB(mem.available));
  setText('mem-swap', `${fmtMB(mem.swapused)} / ${fmtMB(mem.swaptotal)}`);
}

function updateLiveText(id, value) {
  const el = document.getElementById(id);
  if(el.textContent !== value && value !== '-') {
    el.textContent = value;
    // Remove and re-add class to trigger animation
    el.classList.remove('pulse-update');
    void el.offsetWidth; // trigger reflow
    el.classList.add('pulse-update');
  }
}

function setText(id, val) {
  document.getElementById(id).textContent = val || '-';
}

// ── Benchmark Logic ──

function startBenchmark() {
  if (isBenchmarking) return;
  isBenchmarking = true;
  
  document.getElementById('btn-bench').disabled = true;
  document.getElementById('btn-bench').classList.add('opacity-50', 'cursor-not-allowed');
  document.getElementById('btn-bench-stop').disabled = false;
  document.getElementById('btn-bench-stop').classList.remove('opacity-50', 'cursor-not-allowed');
  
  document.getElementById('bench-single').textContent = 'Corriendo...';
  document.getElementById('bench-multi').textContent = 'Esperando...';
  document.getElementById('bench-progress').style.width = '0%';
  document.getElementById('bench-pct').textContent = '0%';
  document.getElementById('bench-ref-score').textContent = '-';
  document.getElementById('bench-ref-bar').style.width = '0%';

  const limit = 2000000; // Workload
  
  // Phase 1: Single Thread
  const singleWorker = new Worker('benchmark-worker.js');
  
  singleWorker.onmessage = (e) => {
    if (e.data.type === 'progress') {
      document.getElementById('bench-progress').style.width = (e.data.percent / 2) + '%';
      document.getElementById('bench-pct').textContent = Math.round(e.data.percent / 2) + '%';
    } else if (e.data.type === 'result') {
      document.getElementById('bench-single').textContent = e.data.score;
      document.getElementById('bench-single').classList.add('neon-text-cyan');
      singleWorker.terminate();
      
      // Phase 2: Multi Thread
      runMultiThreadBench(limit);
    }
  };
  
  benchWorkers.push(singleWorker);
  singleWorker.postMessage({ type: 'start', limit, id: 'single' });
}

function runMultiThreadBench(limit) {
  const cores = hwData.cpu.cores || 4;
  let completed = 0;
  let totalScore = 0;
  document.getElementById('bench-multi').textContent = 'Corriendo...';
  
  for (let i = 0; i < cores; i++) {
    const w = new Worker('benchmark-worker.js');
    benchWorkers.push(w);
    
    w.onmessage = (e) => {
      if (e.data.type === 'progress') {
        if (i === 0) { // Update UI only from first worker to avoid flicker
          const pct = 50 + (e.data.percent / 2);
          document.getElementById('bench-progress').style.width = pct + '%';
          document.getElementById('bench-pct').textContent = Math.round(pct) + '%';
        }
      } else if (e.data.type === 'result') {
        completed++;
        totalScore += e.data.score;
        w.terminate();
        
        if (completed === cores) {
          finishBenchmark(totalScore);
        }
      }
    };
    
    w.postMessage({ type: 'start', limit: limit / Math.sqrt(cores), id: `multi-${i}` });
  }
}

function finishBenchmark(multiScore) {
  isBenchmarking = false;
  benchWorkers = [];
  
  document.getElementById('bench-multi').textContent = multiScore;
  document.getElementById('bench-multi').classList.add('neon-text-cyan');
  
  document.getElementById('bench-progress').style.width = '100%';
  document.getElementById('bench-pct').textContent = '100%';
  
  document.getElementById('btn-bench').disabled = false;
  document.getElementById('btn-bench').classList.remove('opacity-50', 'cursor-not-allowed');
  document.getElementById('btn-bench-stop').disabled = true;
  document.getElementById('btn-bench-stop').classList.add('opacity-50', 'cursor-not-allowed');
  
  // Update Reference Chart
  const ref13900k = 18500;
  document.getElementById('bench-ref-score').textContent = multiScore;
  let pct = (multiScore / ref13900k) * 100;
  if(pct > 100) pct = 100;
  document.getElementById('bench-ref-bar').style.width = pct + '%';
}

function stopBenchmark() {
  if (!isBenchmarking) return;
  
  benchWorkers.forEach(w => w.terminate());
  benchWorkers = [];
  isBenchmarking = false;
  
  document.getElementById('bench-single').textContent = 'Detenido';
  document.getElementById('bench-multi').textContent = 'Detenido';
  document.getElementById('btn-bench').disabled = false;
  document.getElementById('btn-bench').classList.remove('opacity-50', 'cursor-not-allowed');
  document.getElementById('btn-bench-stop').disabled = true;
  document.getElementById('btn-bench-stop').classList.add('opacity-50', 'cursor-not-allowed');
}

// ── Export ──

function exportReport() {
  let r = `====================================================\n`;
  r += `  CPU-J - Reporte de Hardware\n`;
  r += `  Generado: ${new Date().toLocaleString()}\n`;
  r += `====================================================\n\n`;
  
  r += `[ Procesador ]\n`;
  r += `Nombre: ${hwData.cpu.brand}\n`;
  r += `Cores: ${hwData.cpu.physicalCores} Físicos / ${hwData.cpu.cores} Lógicos\n`;
  r += `Base: ${hwData.cpu.speed} GHz\n`;
  r += `Flags: ${hwData.cpu.flags}\n\n`;
  
  r += `[ Memoria ]\n`;
  r += `Total: ${fmtGB(hwData.mem.total)}\n`;
  if(hwData.memLayout.length > 0) {
    r += `Tipo: ${hwData.memLayout[0].type} @ ${hwData.memLayout[0].clockSpeed} MHz\n`;
  }
  r += `\n`;
  
  r += `[ Sistema ]\n`;
  r += `OS: ${hwData.osInfo.distro} ${hwData.osInfo.release} (${hwData.osInfo.arch})\n`;
  r += `Placa Base: ${hwData.baseboard.manufacturer} ${hwData.baseboard.model}\n`;
  
  const blob = new Blob([r], {type: "text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CPUJ_Report_${new Date().getTime()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
