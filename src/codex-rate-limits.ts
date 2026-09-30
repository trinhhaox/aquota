import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { QuotaInfo } from './types';

/**
 * Codex CLI writes rollout-*.jsonl session logs under ~/.codex/sessions/
 * containing periodic "rate_limits" snapshots (primary = 5h window,
 * secondary = weekly). Reading the tail of the newest session file gives
 * real usage percentages without any network call.
 */

const MAX_STALE_MS = 24 * 60 * 60 * 1000; // ignore sessions older than 24h
const TAIL_BYTES = 262144;                // 256KB tail is plenty for last snapshot

function findNewestSessionFile(root: string): { file: string; mtime: number } | null {
    let newest: { file: string; mtime: number } | null = null;
    const walk = (dir: string, depth: number) => {
        if (depth > 4) return; // sessions/YYYY/MM/DD/*.jsonl
        let entries: fs.Dirent[];
        try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
        for (const e of entries) {
            const full = path.join(dir, e.name);
            if (e.isDirectory()) {
                walk(full, depth + 1);
            } else if (e.name.endsWith('.jsonl')) {
                try {
                    const mtime = fs.statSync(full).mtimeMs;
                    if (!newest || mtime > newest.mtime) newest = { file: full, mtime };
                } catch { /* file vanished mid-scan */ }
            }
        }
    };
    walk(root, 0);
    return newest;
}

function readTail(file: string, bytes: number): string {
    const fd = fs.openSync(file, 'r');
    try {
        const size = fs.fstatSync(fd).size;
        const len = Math.min(bytes, size);
        const buf = Buffer.alloc(len);
        fs.readSync(fd, buf, 0, len, size - len);
        return buf.toString('utf8');
    } finally {
        fs.closeSync(fd);
    }
}

function extractLatestRateLimits(content: string): any | null {
    const lines = content.split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
        if (!lines[i].includes('"rate_limits"')) continue;
        try {
            const obj = JSON.parse(lines[i]);
            const rl = obj?.payload?.rate_limits || obj?.rate_limits;
            if (rl?.primary || rl?.secondary) return rl;
        } catch { /* first line of the tail may be truncated */ }
    }
    return null;
}

function toQuota(win: any, label: string, color: string): QuotaInfo | null {
    if (!win) return null;
    const used = Number(win?.used_percent);
    if (!isFinite(used)) return null;

    let resetTime = '';
    let absResetTime = '';
    let hasResetSpec = false;
    let secs = 0;

    if (win?.resets_in_seconds !== undefined && win?.resets_in_seconds !== null) {
        const rawSecs = Number(win.resets_in_seconds);
        if (isFinite(rawSecs)) {
            secs = rawSecs;
            hasResetSpec = true;
        }
    }

    if (!hasResetSpec && win?.resets_at !== undefined && win?.resets_at !== null) {
        const at = Number(win.resets_at);
        if (isFinite(at) && at > 0) {
            secs = at - Math.floor(Date.now() / 1000);
            hasResetSpec = true;
        }
    }

    let pct: number;
    if (hasResetSpec) {
        if (secs > 0) {
            // Window is currently active and resetting in the future
            pct = 100 - Math.max(0, Math.min(100, used));
            const mins = Math.floor(secs / 60);
            resetTime = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
            const resetDate = new Date(Date.now() + secs * 1000);
            absResetTime = `(${String(resetDate.getHours()).padStart(2, '0')}h${String(resetDate.getMinutes()).padStart(2, '0')})`;
        } else {
            // Reset time has already passed! The window is fully refreshed.
            pct = 100;
            resetTime = '';
            absResetTime = '';
        }
    } else {
        // No reset window specified, fallback to standard percentage
        pct = 100 - Math.max(0, Math.min(100, used));
    }

    return {
        label,
        remaining: pct,
        displayValue: `${Math.round(pct)}%`,
        resetTime,
        absResetTime,
        themeColor: color,
        style: 'fluid'
    };
}

/** Returns real Codex usage quotas, or [] when no fresh session data exists. */
export function readCodexRateLimits(): QuotaInfo[] {
    try {
        const sessionsDir = path.join(os.homedir(), '.codex', 'sessions');
        if (!fs.existsSync(sessionsDir)) return [];

        const newest = findNewestSessionFile(sessionsDir);
        if (!newest || Date.now() - newest.mtime > MAX_STALE_MS) return [];

        const rl = extractLatestRateLimits(readTail(newest.file, TAIL_BYTES));
        if (!rl) return [];

        const quotas: QuotaInfo[] = [];
        const primary = toQuota(rl.primary, 'Session (5h)', '#69F0AE');
        const secondary = toQuota(rl.secondary, 'Weekly', '#26A69A');
        if (primary) quotas.push(primary);
        if (secondary) quotas.push(secondary);
        return quotas;
    } catch {
        return [];
    }
}
