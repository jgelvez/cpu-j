// ═══════════════════════════════════════════════════════
// CPU-J Benchmark Worker — Cálculo de primos por fuerza bruta
// ═══════════════════════════════════════════════════════

function isPrime(n) {
  if (n < 2) return false;
  if (n === 2 || n === 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

self.onmessage = function (e) {
  const { type, limit, id } = e.data;

  if (type === 'start') {
    let count = 0;
    const reportInterval = Math.max(1, Math.floor(limit / 200));
    const startTime = performance.now();

    for (let i = 2; i <= limit; i++) {
      if (isPrime(i)) count++;

      if (i % reportInterval === 0) {
        self.postMessage({
          type: 'progress',
          percent: Math.round((i / limit) * 100),
          id,
        });
      }
    }

    const elapsed = performance.now() - startTime;
    const score = Math.round((count / elapsed) * 10000);

    self.postMessage({
      type: 'result',
      score,
      primes: count,
      timeMs: Math.round(elapsed),
      id,
    });
  }
};
