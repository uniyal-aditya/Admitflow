"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, Pencil, Mail, CalendarDays, Shield, Camera, Image as ImageIcon, X } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

function AvatarPopup({ onClose, onCamera, onUpload, uploading }: {
  onClose: () => void;
  onCamera: () => void;
  onUpload: () => void;
  uploading: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      >
        <motion.div
          ref={ref}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border dark:border-gray-800 p-5 w-64"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Change Profile Picture</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            <button
              onClick={onCamera}
              disabled={uploading}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Camera className="h-5 w-5 text-indigo-600" />
              <div className="text-left">
                <p className="text-sm font-medium">Take Photo</p>
                <p className="text-xs text-gray-500">Use your camera</p>
              </div>
            </button>
            <button
              onClick={onUpload}
              disabled={uploading}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <ImageIcon className="h-5 w-5 text-indigo-600" />
              <div className="text-left">
                <p className="text-sm font-medium">Upload Image</p>
                <p className="text-xs text-gray-500">From your gallery</p>
              </div>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}



export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, updateProfile, logout } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showAvatarPopup, setShowAvatarPopup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  async function handleAvatarChange(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2MB");
      return;
    }
    setAvatarUploading(true);
    setError("");
    setShowAvatarPopup(false);
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: dataUrl }),
      });
      const result = await res.json();
      if (res.ok) {
        window.location.reload();
        return;
      } else {
        setError(result.error || "Failed to update avatar");
      }
    } catch {
      setError("Failed to upload image");
    } finally {
      setAvatarUploading(false);
    }
  }

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

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
    <>
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

        {/* Avatar */}
        <div className="rounded-xl border bg-white p-6 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center gap-6">
            <div className="relative shrink-0 group">
              <div className="relative">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-20 w-20 rounded-full object-cover border-2 border-indigo-200" />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold border-2 border-indigo-200">
                    {(user.name || user.email)[0].toUpperCase()}
                  </div>
                )}
                {avatarUploading && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarPopup(true)}
                disabled={avatarUploading}
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
                title="Change profile picture"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarChange(f); }}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarChange(f); }}
              />
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
              <span className="text-gray-700 dark:text-gray-300">
                <CalendarDays className="h-3.5 w-3.5 inline text-gray-400 mr-1" />
                {memberSince || "Registered"}
              </span>
            </div>
          </div>
        </div>

        {/* Onboarding Info */}
        {!user.onboardingCompleted && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 dark:bg-indigo-950/20 dark:border-indigo-900">
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-3">
              Tell us how you found us so we can improve!
            </p>
            <button
              onClick={() => router.push("/onboarding")}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              Complete Onboarding
            </button>
          </div>
        )}

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

      {/* Avatar popup */}
      {showAvatarPopup && (
        <AvatarPopup
          onClose={() => setShowAvatarPopup(false)}
          onCamera={() => cameraInputRef.current?.click()}
          onUpload={() => fileInputRef.current?.click()}
          uploading={avatarUploading}
        />
      )}
    </>
  );
}
