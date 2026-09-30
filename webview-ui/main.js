const vscode = acquireVsCodeApi();

const TRANSLATIONS = {
    vi: {
        refreshBtn: 'Làm mới',
        refreshTitle: 'Làm mới hạn mức',
        settingsTitle: 'Cài đặt',
        serverOfflineTitle: 'Máy chủ Antigravity Ngoại Tuyến',
        serverOfflineDesc: 'Hãy đảm bảo Antigravity IDE đang chạy để theo dõi hạn mức mô hình.',
        noActiveTitle: 'Không có dịch vụ AI nào đang hoạt động',
        noActiveDesc: 'Hãy đảm bảo Antigravity IDE đang chạy, hoặc đăng nhập Claude Code / Codex.',
        connecting: 'Đang kết nối dịch vụ AI...',
        refreshing: 'Đang làm mới hạn mức...',
        fetchingLive: 'Đang tải hạn mức thời gian thực...',
        currentModelDesc: 'Mô hình hiện tại cho phiên làm việc.',
        fullLimit: 'Hạn mức khả dụng 100%, {reset}.',
        hitLimit: 'Bạn đã dùng hết hạn mức, {reset}.',
        usedSome: 'Đã sử dụng một phần hạn mức, {reset}.',
        resetsToday: 'Đặt lại hôm nay lúc {time}',
        resetsTomorrow: 'Đặt lại ngày mai lúc {time}',
        resetsIn: 'Đặt lại sau {time}',
        ready: 'Sẵn sàng',
        fiveHourWindow: 'Khung 5 giờ',
        sevenDayWindow: 'Khung 7 ngày',
        sharedPool: 'Hồ dùng chung',
        left: 'còn lại',
        fiveHourLimit: 'Hạn mức 5 giờ còn lại',
        weeklyLimit: 'Hạn mức tuần còn lại',
        activeModelLabel: 'Mô hình hoạt động',
        codexSessionQuota: 'Hạn mức phiên làm việc OpenAI Codex.',
        codexFullyRefreshed: 'Hạn mức đã được làm mới hoàn toàn.',
        codexModelDesc: 'Mô hình hiện tại cho phiên OpenAI Codex CLI.',
        rateLimitRefreshDesc: 'Hạn mức sẽ được làm mới sau {time}.',
        settingsHeader: 'CÀI ĐẶT',
        langLabel: 'Ngôn ngữ (Language)',
        usagePeriodLabel: 'Chu kỳ sử dụng Claude',
        usage5h: '5 Giờ',
        usage7d: '7 Ngày',
        usageBoth: 'Cả hai',
        refreshIntervalLabel: 'Tần suất làm mới (phút)',
        notificationsLabel: 'Thông báo khi sắp hết',
        notifyThresholdLabel: 'Ngưỡng thông báo (%)',
        statusBarLabel: 'Thanh trạng thái',
        sbFull: 'Đầy đủ',
        sbCompact: 'Thu gọn',
        sbDot: 'Chỉ chấm tròn',
        saveBtn: 'Lưu cài đặt',
        savingBtn: 'Đang lưu...',
        savedBtn: 'Đã lưu ✓',
        dayAbbr: 'ngày',
        hourAbbr: 'giờ',
        minAbbr: 'phút'
    },
    en: {
        refreshBtn: 'Refresh',
        refreshTitle: 'Refresh Quotas',
        settingsTitle: 'Settings',
        serverOfflineTitle: 'Antigravity Server Offline',
        serverOfflineDesc: 'Ensure Antigravity IDE is running to monitor model quotas.',
        noActiveTitle: 'No AI Services Active',
        noActiveDesc: 'Ensure Antigravity IDE is running, or sign in to Claude Code / Codex.',
        connecting: 'Connecting to AI services...',
        refreshing: 'Refreshing quotas...',
        fetchingLive: 'Fetching live quotas...',
        currentModelDesc: 'Current model selected for session.',
        fullLimit: 'You have full limit available, {reset}.',
        hitLimit: 'You have hit your limit, {reset}.',
        usedSome: 'You have used some of your limit, {reset}.',
        resetsToday: 'Resets today at {time}',
        resetsTomorrow: 'Resets tomorrow at {time}',
        resetsIn: 'Resets in {time}',
        ready: 'Ready',
        fiveHourWindow: '5-hour window',
        sevenDayWindow: '7-day window',
        sharedPool: 'Shared Pool',
        left: 'left',
        fiveHourLimit: 'Five Hour Limit Remaining',
        weeklyLimit: 'Weekly Limit Remaining',
        activeModelLabel: 'Active Model',
        codexSessionQuota: 'OpenAI Codex session quota.',
        codexFullyRefreshed: 'Rate limit is currently fully refreshed.',
        codexModelDesc: 'Current model selected for OpenAI Codex CLI sessions.',
        rateLimitRefreshDesc: 'Rate limit will fully refresh in {time}.',
        settingsHeader: 'SETTINGS',
        langLabel: 'Language',
        usagePeriodLabel: 'Claude Usage Period',
        usage5h: '5 Hour',
        usage7d: '7 Day',
        usageBoth: 'Both',
        refreshIntervalLabel: 'Refresh Interval (min)',
        notificationsLabel: 'Notifications',
        notifyThresholdLabel: 'Notify Threshold (%)',
        statusBarLabel: 'Status Bar',
        sbFull: 'Full',
        sbCompact: 'Compact',
        sbDot: 'Dot only',
        saveBtn: 'Save',
        savingBtn: 'Saving...',
        savedBtn: 'Saved ✓',
        dayAbbr: 'd',
        hourAbbr: 'h',
        minAbbr: 'm'
    }
};

let currentLang = 'vi';
let cachedDashboardData = null;
let cachedSettingsData = null;

function t(key, params = {}) {
    const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.vi;
    let str = dict[key] || TRANSLATIONS.en[key] || key;
    for (const [k, v] of Object.entries(params)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return str;
}

function updateStaticHeaderI18n() {
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.title = t('refreshTitle');
        const textSpan = refreshBtn.querySelector('span:not(.refresh-icon)');
        if (textSpan) textSpan.textContent = t('refreshBtn');
    }
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.title = t('settingsTitle');
    }
}

function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.type) {
        case "update":
            cachedDashboardData = message.data;
            renderDashboard(message.data);
            break;
        case "loading":
            document.getElementById('quota-list').innerHTML = `
                <div class="loading-state">
                    <div class="spinner"></div>
                    <span>${escapeHtml(t('refreshing'))}</span>
                </div>
            `;
            break;
        case "settings":
            if (message.settings && message.settings.language) {
                currentLang = message.settings.language;
                updateStaticHeaderI18n();
            }
            cachedSettingsData = message.settings;
            renderSettingsData(message.settings);
            if (cachedDashboardData) {
                renderDashboard(cachedDashboardData);
            }
            break;
    }
});

// Request initial data immediately on load
vscode.postMessage({ type: "onRefresh" });
vscode.postMessage({ type: "getSettings" });

document.getElementById('refresh-btn').addEventListener('click', () => {
    const btn = document.getElementById('refresh-btn');
    btn.classList.add('rotating');
    document.getElementById('quota-list').innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <span>${escapeHtml(t('fetchingLive'))}</span>
        </div>
    `;
    vscode.postMessage({ type: 'onRefresh' });
    setTimeout(() => btn.classList.remove('rotating'), 800);
});

// Settings toggle
document.getElementById('settings-btn').addEventListener('click', () => {
    const panel = document.getElementById('settings-panel');
    const isHidden = panel.classList.toggle('hidden');
    if (!isHidden) {
        vscode.postMessage({ type: 'getSettings' });
    }
});

// Per-service accent color & icon
const SERVICE_META = {
    Antigravity: { accent: '#38BDF8', icon: '⚡', title: 'ANTIGRAVITY' },
    Claude: { accent: '#FB923C', icon: '🟧', title: 'CLAUDE CODE' },
    Codex: { accent: '#4ADE80', icon: '🟩', title: 'OPENAI CODEX' }
};

// data: DashboardData { antigravity, claude, codex } (+ history)
function renderDashboard(data) {
    if (!data) {
        document.getElementById('user-info').innerHTML = '';
        document.getElementById('quota-list').innerHTML = `
            <div class="error-card">
                <div class="error-icon">⚠️</div>
                <div class="error-title">${escapeHtml(t('serverOfflineTitle'))}</div>
                <div class="error-desc">${escapeHtml(t('serverOfflineDesc'))}</div>
            </div>
        `;
        return;
    }

    const ag = data.antigravity;
    if (ag) {
        const tier = (ag.tier || 'Free').toUpperCase();
        const initial = (ag.name || 'U').charAt(0).toUpperCase();
        document.getElementById('user-info').innerHTML = `
            <div class="user-card">
                <div class="avatar">${escapeHtml(initial)}</div>
                <div class="user-details">
                    <div class="user-row-top">
                        <span class="user-name">${escapeHtml(ag.name || 'User')}</span>
                        <span class="tier-badge ${tier.toLowerCase()}">${escapeHtml(tier)}</span>
                    </div>
                    <div class="user-email">${escapeHtml(ag.email || '')}</div>
                </div>
            </div>
        `;
    } else {
        document.getElementById('user-info').innerHTML = '';
    }

    let html = '';

    // 1. Antigravity Quota Groups (Gemini Models & Claude/GPT Models with Weekly + 5H Session)
    if (ag && ag.limitGroups && ag.limitGroups.length > 0) {
        html += ag.limitGroups.map(group => renderLimitGroup(group)).join('');
    } else if (ag) {
        html += renderServiceGroup('Antigravity', ag);
    }

    // 2. External Services (Claude Code CLI & Codex if logged in)
    if (data.claude && data.claude.isAuthenticated) {
        const subtitle = `${data.claude.tier || 'User'} · ${data.claude.email || ''}`.trim();
        if (data.claude.limitGroups && data.claude.limitGroups.length > 0) {
            html += data.claude.limitGroups.map(group => renderLimitGroup(group, subtitle, '🟧')).join('');
        } else {
            html += renderServiceGroup('Claude', data.claude);
        }
    }
    if (data.codex && data.codex.isAuthenticated) {
        const subtitle = `${data.codex.tier || 'Free'} · ${data.codex.email || ''}`.trim();
        if (data.codex.limitGroups && data.codex.limitGroups.length > 0) {
            html += data.codex.limitGroups.map(group => renderLimitGroup(group, subtitle, '🟩')).join('');
        } else {
            html += renderServiceGroup('Codex', data.codex);
        }
    }

    if (!html) {
        html = `
            <div class="error-card">
                <div class="error-icon">🔍</div>
                <div class="error-title">${escapeHtml(t('noActiveTitle'))}</div>
                <div class="error-desc">${escapeHtml(t('noActiveDesc'))}</div>
            </div>
        `;
    }
    document.getElementById('quota-list').innerHTML = html;
}

function createDonutSvg(pct) {
    const size = 26;
    const strokeWidth = 3.2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clampedPct = Math.max(0, Math.min(100, pct));
    const offset = circumference - (clampedPct / 100) * circumference;
    const color = healthColor(clampedPct);

    return `
        <svg class="donut-chart" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle class="donut-bg" cx="${size/2}" cy="${size/2}" r="${radius}" stroke="rgba(255, 255, 255, 0.1)" stroke-width="${strokeWidth}" fill="none"/>
            ${clampedPct > 0 ? `
                <circle class="donut-fill" cx="${size/2}" cy="${size/2}" r="${radius}" 
                    stroke="${color}" stroke-width="${strokeWidth}" fill="none"
                    stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
                    stroke-linecap="round"
                    transform="rotate(-90 ${size/2} ${size/2})"/>
            ` : `
                <circle class="donut-empty" cx="${size/2}" cy="${size/2}" r="${radius}" 
                    stroke="rgba(255, 255, 255, 0.16)" stroke-width="${strokeWidth}" fill="none"/>
            `}
        </svg>
    `;
}

function renderLimitGroup(group, subtitle, icon) {
    let rowsHtml = '';
    group.items.forEach((item, index) => {
        const isNotApplicable = item.notApplicable || (item.remaining === 0 && item.label.includes('Five Hour') && item.notApplicable);
        
        let statRightHtml = '';
        if (item.displayValue !== undefined && item.displayValue !== '') {
            statRightHtml = `
                <div class="limit-stat">
                    <span class="limit-badge-value">${escapeHtml(item.displayValue)}</span>
                </div>
            `;
        } else if (!isNotApplicable) {
            statRightHtml = `
                <div class="limit-stat">
                    <span class="limit-pct">${item.remaining}%</span>
                    ${createDonutSvg(item.remaining)}
                </div>
            `;
        } else {
            statRightHtml = `
                <div class="limit-stat">
                    <span class="limit-pct">0%</span>
                    ${createDonutSvg(0)}
                </div>
            `;
        }

        const divider = index < group.items.length - 1 ? '<div class="limit-row-divider"></div>' : '';

        let displayLabel = item.label;
        if (item.label === 'Five Hour Limit Remaining') displayLabel = t('fiveHourLimit');
        else if (item.label === 'Weekly Limit Remaining') displayLabel = t('weeklyLimit');
        else if (item.label === 'Active Model') displayLabel = t('activeModelLabel');

        let displayDesc = item.description || '';
        if (displayDesc === 'OpenAI Codex session quota.') displayDesc = t('codexSessionQuota');
        else if (displayDesc === 'Quota is fully refreshed.' || displayDesc === 'Rate limit is currently fully refreshed.') displayDesc = t('codexFullyRefreshed');
        else if (displayDesc === 'Current model selected for OpenAI Codex CLI sessions.') displayDesc = t('codexModelDesc');
        else if (displayDesc.startsWith('Rate limit will fully refresh in ')) {
            const timeMatch = displayDesc.replace('Rate limit will fully refresh in ', '').replace('.', '');
            displayDesc = t('rateLimitRefreshDesc', { time: timeMatch });
        }

        rowsHtml += `
            <div class="limit-row">
                <div class="limit-row-header">
                    <span class="limit-name">${escapeHtml(displayLabel)}</span>
                    ${statRightHtml}
                </div>
                <div class="limit-desc">${escapeHtml(displayDesc)}</div>
            </div>
            ${divider}
        `;
    });

    const iconHtml = icon ? `<span class="group-icon">${icon}</span>` : '';
    const subtitleHtml = subtitle ? `<div class="limit-group-sub">${escapeHtml(subtitle)}</div>` : '';

    return `
        <div class="limit-group">
            <div class="limit-group-header">
                <div class="limit-group-title-wrap">
                    ${iconHtml}
                    <span class="limit-group-title">${escapeHtml(group.title)}</span>
                </div>
                <span class="info-icon" title="${escapeHtml(group.infoTooltip || '')}">ⓘ</span>
            </div>
            ${subtitleHtml}
            <div class="limit-card">
                ${rowsHtml}
            </div>
        </div>
    `;
}

// Five-stop health scale — full → empty maps green → lime → yellow → orange → red
function healthColor(pct) {
    if (pct >= 70) return '#22c55e';
    if (pct >= 45) return '#84cc16';
    if (pct >= 25) return '#eab308';
    if (pct >= 10) return '#f97316';
    return '#ef4444';
}

// Rows whose displayValue is not a percentage are informational (e.g. model name)
function isPercentQuota(q) {
    return q.displayValue === undefined || String(q.displayValue).endsWith('%');
}

function renderServiceGroup(serviceKey, status) {
    if (!status) return '';

    const meta = SERVICE_META[serviceKey] || { accent: '#64748B', icon: '🔹', title: serviceKey.toUpperCase() };
    const subtitle = `${status.tier || 'Free'} · ${status.email || ''}`.trim();

    if (status.error) {
        return `
            <div class="limit-group">
                <div class="limit-group-header">
                    <div class="limit-group-title-wrap">
                        <span class="group-icon">${meta.icon}</span>
                        <span class="limit-group-title">${escapeHtml(meta.title)}</span>
                    </div>
                </div>
                <div class="limit-card">
                    <div class="limit-row">
                        <p class="error-msg">${escapeHtml(status.error)}</p>
                    </div>
                </div>
            </div>
        `;
    }

    const items = (status.quotas || []).map(q => {
        const isPercent = isPercentQuota(q);
        if (!isPercent) {
            return {
                label: q.label,
                remaining: 0,
                displayValue: q.displayValue || '',
                description: t('currentModelDesc')
            };
        }
        const timeFormatted = formatSessionResetText(q.resetTime, q.absResetTime);
        const isSession = q.label.includes('Session') || q.label.includes('5hr');
        const defaultName = isSession ? t('fiveHourLimit') : (q.label.includes('Weekly') || q.label.includes('7day') ? t('weeklyLimit') : q.label);
        
        let desc = '';
        if (q.remaining === 100) {
            desc = t('fullLimit', { reset: timeFormatted });
        } else if (q.remaining === 0) {
            desc = t('hitLimit', { reset: timeFormatted });
        } else {
            desc = t('usedSome', { reset: timeFormatted });
        }

        return {
            label: defaultName,
            remaining: Math.round(q.remaining),
            description: desc,
            resetTimeText: q.resetTime
        };
    });

    return renderLimitGroup({
        id: serviceKey.toLowerCase(),
        title: meta.title,
        infoTooltip: `${meta.title} usage limits`,
        items
    }, subtitle, meta.icon);
}

function formatTime(tStr) {
    if (!tStr) return '';
    const hMatch = tStr.match(/(\d+)h/);
    const mMatch = tStr.match(/(\d+)m/);
    if (!hMatch && !mMatch) return tStr;
    const h = hMatch ? parseInt(hMatch[1]) : 0;
    const m = mMatch ? parseInt(mMatch[1]) : 0;
    if (h >= 24) return `${Math.floor(h / 24)}${t('dayAbbr')} ${h % 24}${t('hourAbbr')} ${m}${t('minAbbr')}`;
    return `${h}${t('hourAbbr')} ${m}${t('minAbbr')}`;
}

function formatSessionResetText(resetTime, absResetTime) {
    if (!resetTime || resetTime === 'Ready' || resetTime === 'Refreshing...') {
        return resetTime ? (resetTime === 'Ready' ? t('ready') : t('refreshing')) : t('ready');
    }

    const absMatch = absResetTime ? absResetTime.match(/\(?(\d{1,2})h(\d{2})\)?/) : null;
    const timeFormatted = absMatch ? `${absMatch[1].padStart(2, '0')}:${absMatch[2]}` : '';

    const hMatch = resetTime.match(/(\d+)h/);
    const mMatch = resetTime.match(/(\d+)m/);
    const totalHours = hMatch ? parseInt(hMatch[1]) : 0;
    const totalMins = mMatch ? parseInt(mMatch[1]) : 0;

    if (totalHours < 24) {
        const now = new Date();
        const resetDate = new Date(now.getTime() + (totalHours * 60 + totalMins) * 60 * 1000);
        const isToday = resetDate.getDate() === now.getDate();
        if (timeFormatted) {
            return isToday ? t('resetsToday', { time: timeFormatted }) : t('resetsTomorrow', { time: timeFormatted });
        }
        return t('resetsIn', { time: formatTime(resetTime) });
    }

    const days = Math.floor(totalHours / 24);
    const remHours = totalHours % 24;
    const inText = `${days}${t('dayAbbr')} ${remHours}${t('hourAbbr')}`;
    return absResetTime ? `${t('resetsIn', { time: inText })} ${absResetTime}` : t('resetsIn', { time: inText });
}

// Extract the last N history points for one "Service-Label" key
function historySeries(history, key) {
    if (!Array.isArray(history)) return [];
    const series = [];
    for (const entry of history) {
        if (entry && entry.v && typeof entry.v[key] === 'number') {
            series.push(entry.v[key]);
        }
    }
    return series.slice(-48); // ~4h at 5-min refresh
}

// Tiny inline trend chart rendered under the quota bar
function sparklineSvg(series, color) {
    if (!series || series.length < 3) return '';
    const w = 96, h = 12;
    const min = Math.min(...series);
    const max = Math.max(...series);
    const span = (max - min) || 1;
    const pts = series.map((v, i) =>
        `${((i / (series.length - 1)) * w).toFixed(1)},${(h - 2 - ((v - min) / span) * (h - 4)).toFixed(1)}`
    ).join(' ');
    return `<svg class="quota-spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <polyline points="${pts}" fill="none" stroke="${escapeHtml(color)}" stroke-width="1.5" stroke-opacity="0.75"/>
    </svg>`;
}

function createGauge(quota, series) {
    const pct = Math.round(quota.remaining);
    const label = shortLabel(quota.label);

    // Informational rows (model name, etc.): plain label/value, no bar or spark
    if (!isPercentQuota(quota)) {
        return `
            <div class="quota-row model-row">
                <div class="quota-label">${escapeHtml(label)}</div>
                <div class="quota-value model-value">${escapeHtml(quota.displayValue || '')}</div>
            </div>
        `;
    }

    const color = healthColor(pct);
    const timeFormatted = formatSessionResetText(quota.resetTime, quota.absResetTime);
    const barWidth = Math.max(0, Math.min(100, pct));
    const subLabel = label.includes('Session') ? t('fiveHourWindow') : (label.includes('Weekly') || label.includes('7day') ? t('sevenDayWindow') : t('sharedPool'));

    return `
        <div class="session-card">
            <div class="session-header">
                <span class="session-label">${escapeHtml(label)}</span>
                <span class="session-sub">${escapeHtml(subLabel)}</span>
            </div>
            <div class="session-bar-track">
                <div class="session-bar-fill" style="width:${barWidth}%;background:linear-gradient(90deg,${color}CC,${color});box-shadow:0 0 8px ${color}55;"></div>
            </div>
            <div class="session-footer">
                <span class="session-left"><strong style="color:${color};font-size:11.5px;">${pct}%</strong> ${escapeHtml(t('left'))}</span>
                <span class="session-reset">${escapeHtml(timeFormatted)}</span>
            </div>
            ${sparklineSvg(series, color)}
        </div>
    `;
}

function shortLabel(label) {
    return label
        .replace('Gemini 3.1', 'G3.1')
        .replace('Gemini 3', 'G3')
        .replace('Gemini 2', 'G2')
        .replace('Claude Sonnet', 'Sonnet')
        .replace('Claude Opus', 'Opus')
        .replace('Claude Haiku', 'Haiku')
        .replace('GPT-OSS', 'GPT')
        .replace(' (Thinking)', '')
        .replace(' (High)', '↑')
        .replace(' (Low)', '↓')
        .replace(' (Medium)', '');
}

function renderSettingsData(settings) {
    if (settings && settings.language) {
        currentLang = settings.language;
        updateStaticHeaderI18n();
    }

    const fields = [
        { key: 'language', label: t('langLabel'), type: 'select', options: [
            { value: 'vi', label: 'Tiếng Việt (Vietnamese)' },
            { value: 'en', label: 'English' }
        ]},
        { key: 'claude.usagePeriod', label: t('usagePeriodLabel'), type: 'select', options: [
            { value: '5-hour', label: t('usage5h') },
            { value: '7-day', label: t('usage7d') },
            { value: 'both', label: t('usageBoth') }
        ]},
        { key: 'refreshInterval', label: t('refreshIntervalLabel'), type: 'select', options: [
            { value: 1, label: '1' }, { value: 2, label: '2' }, { value: 5, label: '5' },
            { value: 10, label: '10' }, { value: 15, label: '15' }, { value: 30, label: '30' }
        ]},
        { key: 'enableNotifications', label: t('notificationsLabel'), type: 'toggle' },
        { key: 'notifyThreshold', label: t('notifyThresholdLabel'), type: 'select', options: [
            { value: 5, label: '5' }, { value: 10, label: '10' }, { value: 15, label: '15' },
            { value: 20, label: '20' }, { value: 30, label: '30' }, { value: 40, label: '40' },
            { value: 50, label: '50' }
        ]},
        { key: 'statusBar.mode', label: t('statusBarLabel'), type: 'select', options: [
            { value: 'full', label: t('sbFull') },
            { value: 'compact', label: t('sbCompact') },
            { value: 'dot', label: t('sbDot') }
        ]},
    ];

    const panel = document.getElementById('settings-panel');
    let html = `<div class="section-title">${escapeHtml(t('settingsHeader'))}</div>`;

    fields.forEach(f => {
        const val = settings[f.key] ?? '';
        html += '<div class="settings-row">';
        html += `<label class="settings-label">${escapeHtml(f.label)}</label>`;

        if (f.type === 'select') {
            html += `<select class="settings-select" data-key="${f.key}">`;
            f.options.forEach(opt => {
                const sel = String(val) === String(opt.value) ? 'selected' : '';
                html += `<option value="${opt.value}" ${sel}>${escapeHtml(opt.label)}</option>`;
            });
            html += '</select>';
        } else if (f.type === 'toggle') {
            html += `<label class="switch"><input type="checkbox" data-key="${f.key}" ${val ? 'checked' : ''}><span class="slider"></span></label>`;
        }

        html += '</div>';
    });

    html += `<button class="settings-save" id="save-settings-btn">${escapeHtml(t('saveBtn'))}</button>`;
    panel.innerHTML = html;

    // Immediate language switcher handler inside select
    const langSelect = panel.querySelector('select[data-key="language"]');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            currentLang = e.target.value;
            updateStaticHeaderI18n();
            if (cachedDashboardData) renderDashboard(cachedDashboardData);
            renderSettingsData({ ...settings, language: currentLang });
        });
    }

    document.getElementById('save-settings-btn').addEventListener('click', () => {
        const btn = document.getElementById('save-settings-btn');
        const result = {};
        panel.querySelectorAll('[data-key]').forEach(el => {
            if (el.tagName === 'BUTTON') return;
            const key = el.getAttribute('data-key');
            if (el.type === 'checkbox') {
                result[key] = el.checked;
            } else {
                let v = el.value.trim();
                if (key === 'refreshInterval' || key === 'notifyThreshold') v = parseInt(v, 10);
                result[key] = v;
            }
        });

        if (btn) {
            btn.textContent = t('savingBtn');
            btn.disabled = true;
        }

        vscode.postMessage({ type: 'saveSettings', settings: result });

        setTimeout(() => {
            if (btn) {
                btn.textContent = t('savedBtn');
                setTimeout(() => {
                    if (btn) {
                        btn.textContent = t('saveBtn');
                        btn.disabled = false;
                    }
                }, 1200);
            }
        }, 300);
    });
}

