/**
 * Lightweight Judge0 helper. This module will call a Judge0 instance if configured.
 * Set environment variables:
 *   JUDGE0_URL - base URL for Judge0 (e.g. https://judge0-ce.p.rapidapi.com or your self-hosted instance)
 *   JUDGE0_KEY - optional API key or RapidAPI key
 *
 * Note: Network access is required. This file only implements the HTTP calls; do not call without protecting secrets.
 */

type SubmissionResponse = unknown;

const JUDGE0_URL = process.env.JUDGE0_URL || '';
const JUDGE0_KEY = process.env.JUDGE0_KEY || '';

export async function submitToJudge0(source: string, languageId: number, stdin = ''): Promise<SubmissionResponse> {
  if (!JUDGE0_URL) throw new Error('JUDGE0_URL not configured');

  const url = `${JUDGE0_URL.replace(/\/$/, '')}/submissions?wait=false`;
  const body = {
    source_code: source,
    language_id: languageId,
    stdin,
    // additional fields: cpu_time_limit, memory_limit etc.
  };

  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (JUDGE0_KEY) headers['X-Auth-Token'] = JUDGE0_KEY;

  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Judge0 submit failed: ${res.status}`);
  return res.json();
}

export async function getSubmissionResult(token: string): Promise<SubmissionResponse> {
  if (!JUDGE0_URL) throw new Error('JUDGE0_URL not configured');
  const url = `${JUDGE0_URL.replace(/\/$/, '')}/submissions/${encodeURIComponent(token)}`;
  const headers: Record<string,string> = {};
  if (JUDGE0_KEY) headers['X-Auth-Token'] = JUDGE0_KEY;

  const res = await fetch(url, { method: 'GET', headers });
  if (!res.ok) throw new Error(`Judge0 get result failed: ${res.status}`);
  return res.json();
}
