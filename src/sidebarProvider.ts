import * as vscode from 'vscode';
import * as crypto from 'crypto';
import { QuotaService } from './quotaService';
import { setLatestData } from "./extension";
import { DashboardData, WebviewMessage, HistoryEntry } from './types';

type WebviewPayload = DashboardData & { history?: HistoryEntry[] };

function getNonce(): string {
    return crypto.randomBytes(16).toString('hex');
}

export class SidebarProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    private static _latestData: WebviewPayload | null = null;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _quotaService: QuotaService
    ) { }

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        if (SidebarProvider._latestData) {
            this.syncToWebview(SidebarProvider._latestData);
        }

        this.updateData();
        this._sendSettings();

        webviewView.webview.onDidReceiveMessage(async (data: WebviewMessage) => {
            if (data.type === "onRefresh") {
                this.updateData();
            } else if (data.type === "getSettings") {
                await this._sendSettings();
            } else if (data.type === "saveSettings") {
                await this._saveSettings(data.settings);
            }
        });
    }

    public syncToWebview(data: WebviewPayload) {
        SidebarProvider._latestData = data;
        if (this._view) {
            this._view.webview.postMessage({ type: "update", data });
        }
    }

    public async updateData() {
        if (this._view) {
            this._view.webview.postMessage({ type: "loading" });
        }
        const data = await this._quotaService.fetchDashboard();
        setLatestData(data);
    }

    private async _sendSettings() {
        const sqm = vscode.workspace.getConfiguration('sqm');

        this._view?.webview.postMessage({
            type: 'settings',
            settings: {
                'language': sqm.get<string>('language') || 'vi',
                'claude.usagePeriod': sqm.get<string>('claude.usagePeriod') || 'both',
                'refreshInterval': sqm.get<number>('refreshInterval') ?? 5,
                'enableNotifications': sqm.get<boolean>('enableNotifications') !== false,
                'notifyThreshold': sqm.get<number>('notifyThreshold') ?? 20,
                'statusBar.mode': sqm.get<string>('statusBar.mode') || 'full',
            }
        });
    }

    private async _saveSettings(settings: Record<string, unknown>) {
        const sqm = vscode.workspace.getConfiguration('sqm');

        for (const [key, value] of Object.entries(settings)) {
            const inspection = sqm.inspect(key);
            // If the setting was overridden in workspace or workspaceFolder, update them so workspace doesn't shadow user selection
            if (inspection?.workspaceFolderValue !== undefined) {
                await sqm.update(key, value, vscode.ConfigurationTarget.WorkspaceFolder);
            }
            if (inspection?.workspaceValue !== undefined) {
                await sqm.update(key, value, vscode.ConfigurationTarget.Workspace);
            }
            await sqm.update(key, value, vscode.ConfigurationTarget.Global);
        }

        await this._sendSettings();
        this.updateData();
        const lang = sqm.get<string>('language') || 'vi';
        const msg = lang === 'vi' ? 'Aquota: Đã lưu cài đặt!' : 'Aquota: Settings saved!';
        vscode.window.showInformationMessage(msg);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "webview-ui", "style.css"));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "webview-ui", "main.js"));

        const nonce = getNonce();
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <link href="${styleUri}" rel="stylesheet">
            </head>
            <body>
                <div id="app">
                    <div class="header">
                        <div class="brand">
                            <span class="brand-icon">⚡</span>
                            <span class="brand-title">Aquota</span>
                        </div>
                        <div class="header-actions">
                            <button id="refresh-btn" class="action-btn" title="Refresh Quotas">
                                <span class="refresh-icon">↻</span>
                                <span>Refresh</span>
                            </button>
                            <button id="settings-btn" class="action-btn icon-only" title="Settings">⚙</button>
                        </div>
                    </div>
                    <div id="settings-panel" class="settings-container hidden"></div>
                    <div id="user-info"></div>
                    <div id="quota-list">
                        <div class="loading-state">
                            <div class="spinner"></div>
                            <span>Connecting to AI services...</span>
                        </div>
                    </div>
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}
