"use client";

import { useEffect, useState } from "react";
import { Loader2, Shield, ShieldOff, Key, Check, Copy } from "lucide-react";

export default function AdminSecurityPage() {
  const [status, setStatus] = useState<{ enabled: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState<{ secret: string; uri: string } | null>(null);
  const [verifyToken, setVerifyToken] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/2fa/status")
      .then((r) => r.json())
      .then(setStatus)
      .finally(() => setLoading(false));
  }, []);

  async function startSetup() {
    const res = await fetch("/api/admin/2fa/setup");
    if (res.ok) setSetupData(await res.json());
  }

  async function confirmSetup() {
    if (!setupData || !verifyToken.trim()) return;
    setVerifying(true);
    setVerifyError("");
    const res = await fetch("/api/admin/2fa/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: setupData.secret, token: verifyToken.trim() }),
    });
    if (res.ok) {
      setStatus({ enabled: true });
      setSetupData(null);
      setVerifyToken("");
    } else {
      const err = await res.json();
      setVerifyError(err.error || "Invalid code");
    }
    setVerifying(false);
  }

  async function disable2FA() {
    if (!confirm("Disable two-factor authentication?")) return;
    const res = await fetch("/api/admin/2fa/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: "", token: verifyToken.trim() || "000000" }),
    });
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Security</h1>
        <p className="text-sm text-gray-500 mt-1">Manage two-factor authentication for your admin account</p>
      </div>

      <div className="rounded-xl border bg-white p-6 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-start gap-4">
          <div className={`rounded-lg p-3 ${status?.enabled ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-100 dark:bg-gray-800"}`}>
            {status?.enabled ? <Shield className="h-6 w-6 text-green-600" /> : <ShieldOff className="h-6 w-6 text-gray-400" />}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">Two-Factor Authentication</h2>
            <p className="text-sm text-gray-500 mt-1">
              {status?.enabled
                ? "2FA is enabled. An authenticator app code is required to access the admin panel."
                : "Add an extra layer of security by requiring a one-time code from your authenticator app."}
            </p>
            {!status?.enabled && !setupData && (
              <button onClick={startSetup} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
                <Shield className="h-4 w-4" /> Enable 2FA
              </button>
            )}
          </div>
        </div>

        {setupData && (
          <div className="mt-6 space-y-4 border-t pt-6 dark:border-gray-700">
            <h3 className="font-medium flex items-center gap-2"><Key className="h-4 w-4" /> Setup Instructions</h3>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal pl-5">
              <li>Open your authenticator app (Google Authenticator, Authy, etc.)</li>
              <li>Tap &quot;Add&quot; and scan the QR code (copy the secret below)</li>
              <li>Enter the 6-digit code from the app below</li>
            </ol>

            <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-950 dark:border-gray-700">
              <p className="text-xs text-gray-500 mb-2">Manual setup secret:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-white dark:bg-gray-900 rounded border px-3 py-2 truncate dark:border-gray-700">
                  {setupData.secret}
                </code>
                <button
                  onClick={() => { navigator.clipboard.writeText(setupData.secret); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="shrink-0 rounded-lg border px-3 py-2 text-xs hover:bg-white dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {verifyError && <p className="text-sm text-red-600">{verifyError}</p>}

            <div className="flex items-center gap-3">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-mono tracking-widest text-center focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700"
              />
              <button
                onClick={confirmSetup}
                disabled={verifying || verifyToken.length !== 6}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Enable"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
