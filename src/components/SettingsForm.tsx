import { useState } from "react";
import type { InspectorSettings, SuiNetwork } from "../types";
import { SUI_GRPC_URLS, WALRUS_PACKAGE_IDS } from "../config";

// Where the two credentials come from. Linked, not automated: the dashboard's
// one-click handoff is parked until it ships /connect/app — see src/lib/connect.ts.
const DASHBOARD_URL = "https://memory.walrus.xyz";

interface Props {
    initial: InspectorSettings;
    onSave: (s: InspectorSettings) => void;
    onCancel?: () => void;
}

export function SettingsForm({ initial, onSave, onCancel }: Props) {
    const [form, setForm] = useState<InspectorSettings>(initial);

    function set<K extends keyof InspectorSettings>(key: K, value: InspectorSettings[K]) {
        setForm((f) => ({ ...f, [key]: value }));
    }

    // A malformed key would throw inside MemWal.create() during render — gate
    // save on the shapes the SDK requires (Ed25519 hex key, 0x-prefixed id).
    const keyOk = /^(0x)?[0-9a-fA-F]{64}$/.test(form.delegateKey.trim());
    const accountOk = /^0x[0-9a-fA-F]{64}$/.test(form.accountId.trim());
    const canSave = keyOk && accountOk;

    return (
        <div className="settings-form card">
            <h2>Connect to a Walrus Memory account</h2>
            <p className="hint">
                The palace needs the same two values <code>MemWal.create()</code> takes.
                Get them from the{" "}
                <a href={DASHBOARD_URL} target="_blank" rel="noreferrer">
                    Walrus Memory dashboard ↗
                </a>
                , then paste them below — both stay in this browser's localStorage.
            </p>

            {/* Each <li> must hold exactly ONE element after the counter: the row is a
                grid, so bare text and inline <code> would each become their own grid
                item and wrap into the number column. */}
            <ol className="settings-steps">
                <li>
                    <span>
                        Sign in at <code>memory.walrus.xyz</code>
                    </span>
                </li>
                <li>
                    <span>Create or copy a delegate key</span>
                </li>
                <li>
                    <span>
                        Copy your <code>MemWalAccount</code> object ID
                    </span>
                </li>
            </ol>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (canSave) {
                        onSave({
                            ...form,
                            delegateKey: form.delegateKey.trim(),
                            accountId: form.accountId.trim(),
                            serverUrl: form.serverUrl.trim().replace(/\/+$/, ""),
                            namespace: form.namespace.trim() || "default",
                        });
                    }
                }}
            >
                <label>
                    Delegate private key (hex)
                    <input
                        type="password"
                        value={form.delegateKey}
                        onChange={(e) => set("delegateKey", e.target.value)}
                        placeholder="ed25519 delegate key registered on your account"
                        autoComplete="off"
                    />
                </label>

                <label>
                    Account ID (MemWalAccount object on Sui)
                    <input
                        value={form.accountId}
                        onChange={(e) => set("accountId", e.target.value)}
                        placeholder="0x…"
                    />
                </label>

                {form.delegateKey.trim() !== "" && !keyOk && (
                    <p className="hint">Delegate key must be 64 hex characters.</p>
                )}
                {form.accountId.trim() !== "" && !accountOk && (
                    <p className="hint">Account ID must be 0x + 64 hex characters.</p>
                )}

                <details className="advanced">
                    <summary>Advanced options</summary>

                    <label>
                        Relayer URL
                        <input
                            value={form.serverUrl}
                            onChange={(e) => set("serverUrl", e.target.value)}
                            placeholder="https://relayer.memory.walrus.xyz"
                        />
                    </label>

                    <div className="settings-row">
                        <label>
                            Default namespace
                            <input
                                value={form.namespace}
                                onChange={(e) => set("namespace", e.target.value)}
                                placeholder="default"
                            />
                        </label>
                        <label>
                            Sui network
                            <select
                                value={form.network}
                                onChange={(e) => set("network", e.target.value as SuiNetwork)}
                            >
                                <option value="mainnet">mainnet</option>
                                <option value="testnet">testnet</option>
                            </select>
                        </label>
                    </div>

                    <label>
                        Sui gRPC endpoint
                        <input
                            value={form.suiGrpcUrl}
                            onChange={(e) => set("suiGrpcUrl", e.target.value)}
                            placeholder={SUI_GRPC_URLS[form.network]}
                        />
                    </label>
                    <label>
                        Walrus package ID (Blob object type)
                        <input
                            value={form.walrusPackageId}
                            onChange={(e) => set("walrusPackageId", e.target.value)}
                            placeholder={WALRUS_PACKAGE_IDS[form.network]}
                        />
                    </label>
                </details>

                <div className="form-actions">
                    <button type="submit" className="primary" disabled={!canSave}>
                        Save credentials
                    </button>
                    {onCancel && (
                        <button type="button" onClick={onCancel}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
