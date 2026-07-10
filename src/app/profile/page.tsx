"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { User, ArrowLeft, Loader, Eye, EyeOff } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile, changePassword } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState("");
  const [cpCurrent, setCpCurrent] = useState("");
  const [cpNew, setCpNew] = useState("");
  const [cpMsg, setCpMsg] = useState("");
  const [cpLoading, setCpLoading] = useState(false);
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;
  if (!user) {
    router.push("/login");
    return null;
  }

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setNameMsg("Name cannot be empty"); return; }
    setSaving(true);
    const r = await updateProfile(name.trim());
    setSaving(false);
    setNameMsg(r.error ? r.error : "Saved!");
    setTimeout(() => setNameMsg(""), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setCpMsg("");
    if (!cpCurrent || !cpNew) { setCpMsg("Fill in both fields"); return; }
    if (cpNew.length < 6) { setCpMsg("New password must be at least 6 characters"); return; }
    setCpLoading(true);
    const r = await changePassword(cpCurrent, cpNew);
    setCpLoading(false);
    setCpMsg(r.error ? r.error : "Password updated!");
    if (!r.error) { setCpCurrent(""); setCpNew(""); }
    setTimeout(() => setCpMsg(""), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="rounded-2xl border bg-white p-8 shadow-lg dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{user.name || "User"}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSaveName} className="mb-8 pb-8 border-b dark:border-gray-800">
          <h2 className="text-lg font-semibold mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border bg-white/50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input type="email" value={user.email} disabled
                className="w-full rounded-xl border bg-gray-100 px-4 py-2.5 text-sm text-gray-500 dark:bg-gray-800 dark:border-gray-700 cursor-not-allowed" />
            </div>
            <button type="submit" disabled={saving}
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader className="h-4 w-4 animate-spin" />} Save
            </button>
            {nameMsg && <p className={`text-sm ${nameMsg === "Saved!" ? "text-green-600" : "text-red-600"}`}>{nameMsg}</p>}
          </div>
        </form>

        <form onSubmit={handleChangePassword}>
          <h2 className="text-lg font-semibold mb-4">Change Password</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Current Password</label>
              <div className="relative">
                <input type={showCur ? "text" : "password"} value={cpCurrent} onChange={(e) => setCpCurrent(e.target.value)}
                  className="w-full rounded-xl border bg-white/50 px-4 py-2.5 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700" />
                <button type="button" onClick={() => setShowCur(!showCur)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showCur ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">New Password</label>
              <div className="relative">
                <input type={showNew ? "text" : "password"} value={cpNew} onChange={(e) => setCpNew(e.target.value)} placeholder="At least 6 characters"
                  className="w-full rounded-xl border bg-white/50 px-4 py-2.5 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>
            <button type="submit" disabled={cpLoading}
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2">
              {cpLoading && <Loader className="h-4 w-4 animate-spin" />} Update Password
            </button>
            {cpMsg && <p className={`text-sm ${cpMsg === "Password updated!" ? "text-green-600" : "text-red-600"}`}>{cpMsg}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}
