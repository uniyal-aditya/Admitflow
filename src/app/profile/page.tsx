"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Check, Pencil, Mail, CalendarDays, Shield } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, updateProfile, logout } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) { setError("Name cannot be empty"); return; }
    setSaving(true);
    setError("");
    const result = await updateProfile(name.trim());
    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account information</p>
        </div>
        {saved && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full dark:bg-green-950/30 dark:text-green-400">
            <Check className="h-3.5 w-3.5" /> Saved
          </motion.div>
        )}
      </div>

      {/* Avatar & Basic Info */}
      <div className="rounded-xl border bg-white p-6 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="h-20 w-20 rounded-full object-cover border-2 border-indigo-200" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold border-2 border-indigo-200">
                {(user.name || user.email)[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">{user.name || "User"}</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
              <Mail className="h-3.5 w-3.5" />
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Name */}
      <div className="rounded-xl border bg-white p-6 dark:bg-gray-900 dark:border-gray-800">
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <Pencil className="h-4 w-4" />
          Display Name
        </h2>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">{error}</div>
        )}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your display name"
            className="flex-1 rounded-xl border bg-white/50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700"
          />
          <button
            onClick={handleSave}
            disabled={saving || name === (user.name || "")}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Account Details */}
      <div className="rounded-xl border bg-white p-6 dark:bg-gray-900 dark:border-gray-800">
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4" />
          Account Details
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-b dark:border-gray-800">
            <span className="text-gray-500">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b dark:border-gray-800">
            <span className="text-gray-500">Auth Method</span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full dark:bg-indigo-950/30 dark:text-indigo-400">
              Google
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-500">Member Since</span>
            <CalendarDays className="h-3.5 w-3.5 inline text-gray-400 mr-1" />
            <span>Registered</span>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <div className="flex justify-center">
        <button
          onClick={logout}
          className="rounded-xl border border-red-200 px-6 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </motion.div>
  );
}
