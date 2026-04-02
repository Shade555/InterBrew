export function normalizeCodingScore(rawScore: number, maxRaw: number, targetMax = 150) {
  if (maxRaw <= 0) return 0;
  return Math.round((rawScore / maxRaw) * targetMax);
}

export function computePercentile(score: number, mean = 180, stddev = 40) {
  // Use normal distribution CDF approximation (error function)
  const z = (score - mean) / (stddev * Math.SQRT2);
  const erf = (x: number) => {
    // numerical approximation of erf
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    const t = 1.0/(1.0 + p*x);
    const y = 1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-x*x);
    return sign*y;
  };
  const cdf = 0.5 * (1 + erf(z));
  return Math.round(cdf * 1000) / 10; // percentile with one decimal
}

export function determineRank(total: number) {
  if (total < 150) return 'Below Average';
  if (total < 210) return 'Average';
  if (total < 255) return 'Good';
  if (total < 285) return 'Excellent';
  return 'Exceptional';
}
