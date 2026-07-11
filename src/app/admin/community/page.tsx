"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Loader2, Search, ChevronLeft, ChevronRight, MessageCircle, Pin, Lock,
  Unlock, CheckCircle, XCircle, Trash2, AlertTriangle, Clock, ExternalLink,
  Filter, MessageSquareWarning, ShieldCheck, RefreshCw, Ban
} from "lucide-react";

interface AdminPost {
  id: string; userId: string; title: string | null; content: string;
  media: any; tags: string[]; isPinned: boolean; isLocked: boolean;
  status: string; moderatedById: string | null; moderatedAt: string | null;
  createdAt: string; updatedAt: string;
  user: { id: string; name: string | null; email: string; avatar: string | null };
  _count: { comments: number };
}

export default function AdminCommunityPage() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [commentPendingCount, setCommentPendingCount] = useState(0);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPosts = useCallback(async (p: number) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(p), limit: "20" });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/community/posts?${params}`);
      if (!res.ok) throw new Error("Failed to load");
      const d = await res.json();
      setPosts(d.posts);
      setTotalPages(d.totalPages);
      setTotal(d.total);
      setPendingCount(d.pendingCount);
      setCommentPendingCount(d.commentPendingCount);
      setPage(p);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchPosts(1); }, [fetchPosts]);

  const handleAction = async (postId: string, action: string, extra?: any) => {
    setActionLoading(postId);
    try {
      const body: any = {};
      if (action === "approve") body.status = "approved";
      else if (action === "reject") body.status = "rejected";
      else if (action === "delete") body.status = "deleted";
      else if (action === "pin") body.isPinned = true;
      else if (action === "unpin") body.isPinned = false;
      else if (action === "lock") body.isLocked = true;
      else if (action === "unlock") body.isLocked = false;

      const res = await fetch(`/api/community/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Action failed");
      await fetchPosts(page);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved": return <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full dark:bg-green-950/30 dark:text-green-400"><CheckCircle className="h-3 w-3" />Approved</span>;
      case "pending": return <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full dark:bg-amber-950/30 dark:text-amber-400"><Clock className="h-3 w-3" />Pending</span>;
      case "rejected": return <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full dark:bg-red-950/30 dark:text-red-400"><XCircle className="h-3 w-3" />Rejected</span>;
      case "deleted": return <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full dark:bg-gray-800 dark:text-gray-400"><Trash2 className="h-3 w-3" />Deleted</span>;
      default: return <span className="text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Community Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} posts · <span className="text-amber-600 font-medium">{pendingCount} pending</span> · <span className="text-amber-600 font-medium">{commentPendingCount} comments pending</span>
          </p>
        </div>
        <Link
          href="/community"
          className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <ExternalLink className="h-4 w-4" />
          View Community
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2 bg-white dark:bg-gray-900 rounded-lg border p-1">
          {["", "pending", "approved", "rejected", "deleted"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === s ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchPosts(1)}
              placeholder="Search posts, users..."
              className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
            />
          </div>
          <button onClick={() => fetchPosts(1)} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">Search</button>
          <button onClick={() => fetchPosts(page)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"><RefreshCw className="h-4 w-4" /></button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"><AlertTriangle className="h-4 w-4" />{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-gray-500"><MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>No posts found</p></div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {statusBadge(post.status)}
                    {post.isPinned && <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full dark:bg-amber-950/30 dark:text-amber-400"><Pin className="h-3 w-3" />Pinned</span>}
                    {post.isLocked && <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full dark:bg-gray-800 dark:text-gray-400"><Lock className="h-3 w-3" />Locked</span>}
                  </div>
                  {post.title && <h3 className="font-semibold mb-1">{post.title}</h3>}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>by <strong>{post.user.name || post.user.email}</strong></span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{post._count.comments}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {post.status === "pending" && (
                    <>
                      <button onClick={() => handleAction(post.id, "approve")} disabled={actionLoading === post.id} className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50">
                        <CheckCircle className="h-3.5 w-3.5" />Approve
                      </button>
                      <button onClick={() => handleAction(post.id, "reject")} disabled={actionLoading === post.id} className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50">
                        <XCircle className="h-3.5 w-3.5" />Reject
                      </button>
                    </>
                  )}
                  {post.status === "approved" && (
                    <>
                      <button onClick={() => handleAction(post.id, post.isPinned ? "unpin" : "pin")} disabled={actionLoading === post.id} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${post.isPinned ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-950/30 dark:text-amber-400" : "border hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"}`}>
                        <Pin className="h-3.5 w-3.5" />{post.isPinned ? "Unpin" : "Pin"}
                      </button>
                      <button onClick={() => handleAction(post.id, post.isLocked ? "unlock" : "lock")} disabled={actionLoading === post.id} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${post.isLocked ? "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300" : "border hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"}`}>
                        {post.isLocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                        {post.isLocked ? "Unlock" : "Lock"}
                      </button>
                      <button onClick={() => handleAction(post.id, "delete")} disabled={actionLoading === post.id} className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30">
                        <Trash2 className="h-3.5 w-3.5" />Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Page {page} of {totalPages} ({total} total)</span>
              <div className="flex items-center gap-1">
                <button onClick={() => fetchPosts(page - 1)} disabled={page <= 1} className="rounded-lg border p-2 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700"><ChevronLeft className="h-4 w-4" /></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center gap-1">
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-gray-400">...</span>}
                      <button onClick={() => fetchPosts(p)} className={`min-w-[32px] rounded-lg border px-2 py-1 text-sm ${page === p ? "bg-indigo-600 text-white border-indigo-600" : "hover:bg-gray-50 dark:border-gray-700"}`}>{p}</button>
                    </span>
                  ))}
                <button onClick={() => fetchPosts(page + 1)} disabled={page >= totalPages} className="rounded-lg border p-2 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
