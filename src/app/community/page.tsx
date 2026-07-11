"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Loader2, MessageCircle, Send, Image, Link2, Hash, Pin, Lock,
  Shield, Ban, Trash2, CheckCircle, XCircle, AlertTriangle, Filter,
  Plus, X, Smile, GripVertical, Heart, Globe, Clock, User, Flag,
  ExternalLink
} from "lucide-react";

interface PostUser {
  id: string; name: string | null; avatar: string | null; role: string;
}

interface PostData {
  id: string; userId: string; title: string | null; content: string;
  media: any | null; tags: string[]; isPinned: boolean; isLocked: boolean;
  status: string; createdAt: string; updatedAt: string;
  user: PostUser;
  _count: { comments: number };
  comments?: CommentData[];
}

interface CommentData {
  id: string; content: string; media: any | null; isEdited: boolean;
  createdAt: string; updatedAt: string;
  user: PostUser;
}

interface MediaItem {
  type: "image" | "video" | "gif" | "link";
  url: string;
  thumbnail?: string;
  title?: string;
}

const MEDIA_PLACEHOLDER = "ttps://";

export default function CommunityPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newMedia, setNewMedia] = useState<MediaItem[]>([]);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "link">("image");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearch, setGifSearch] = useState("");
  const [gifResults, setGifResults] = useState<any[]>([]);
  const [gifLoading, setGifLoading] = useState(false);

  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, CommentData[]>>({});
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});

  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  const [modQueue, setModQueue] = useState<{ posts: number; comments: number }>({ posts: 0, comments: 0 });
  const [showModPanel, setShowModPanel] = useState(false);
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [modLoading, setModLoading] = useState(false);

  const gifPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user) setCurrentUser({ id: d.user.id, role: d.user.role || "user" });
    }).catch(() => {});
  }, []);

  const fetchPosts = useCallback(async (p: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/community/posts?page=${p}&limit=20`);
      if (!res.ok) throw new Error("Failed to load posts");
      const d = await res.json();
      if (p === 1) setPosts(d.posts);
      else setPosts(prev => [...prev, ...d.posts]);
      setTotalPages(d.totalPages);
      setPage(p);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(1); }, [fetchPosts]);

  useEffect(() => {
    if (currentUser?.role === "admin" || currentUser?.role === "moderator") {
      fetch("/api/community/moderate?type=posts&limit=1").then(r => r.json()).then(d => {
        setModQueue(prev => ({ ...prev, posts: d.total || 0 }));
      }).catch(() => {});
      fetch("/api/community/moderate?type=comments&limit=1").then(r => r.json()).then(d => {
        setModQueue(prev => ({ ...prev, comments: d.total || 0 }));
      }).catch(() => {});
    }
  }, [currentUser]);

  const addMedia = () => {
    if (!mediaUrl.trim()) return;
    let url = mediaUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    setNewMedia(prev => [...prev, { type: mediaType, url }]);
    setMediaUrl("");
  };

  const removeMedia = (idx: number) => {
    setNewMedia(prev => prev.filter((_, i) => i !== idx));
  };

  const searchGifs = async (query: string) => {
    setGifLoading(true);
    try {
      const res = await fetch(`/api/community/gif?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Failed");
      const d = await res.json();
      setGifResults(d.results || []);
    } catch {
      setGifResults([]);
    } finally {
      setGifLoading(false);
    }
  };

  const selectGif = (gif: any) => {
    setNewMedia(prev => [...prev, { type: "gif", url: gif.url, thumbnail: gif.preview }]);
    setShowGifPicker(false);
    setGifSearch("");
  };

  const handleCreatePost = async () => {
    if (!newContent.trim()) { setCreateError("Content is required"); return; }
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim() || undefined,
          content: newContent.trim(),
          tags: newTags.split(",").map(t => t.trim()).filter(Boolean),
          media: newMedia.length > 0 ? newMedia : undefined,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to create post"); }
      const d = await res.json();
      setPosts(prev => [d.post, ...prev]);
      setShowCreate(false);
      setNewTitle(""); setNewContent(""); setNewTags(""); setNewMedia([]);
    } catch (e: any) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const fetchComments = async (postId: string) => {
    if (comments[postId]) return;
    setLoadingComments(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`);
      const d = await res.json();
      setComments(prev => ({ ...prev, [postId]: d.comments || [] }));
    } catch {} finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const toggleExpand = async (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      return;
    }
    setExpandedPost(postId);
    if (!comments[postId]) {
      await fetchComments(postId);
    }
    const el = document.getElementById(`post-${postId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleComment = async (postId: string) => {
    if (!commentText.trim()) return;
    setCommentLoading(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      if (!res.ok) return;
      const d = await res.json();
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), d.comment] }));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, _count: { ...p._count, comments: p._count.comments + 1 } } : p));
      setCommentText("");
    } catch {} finally {
      setCommentLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const moderateItem = async (type: string, id: string, action: string) => {
    setModLoading(true);
    try {
      const res = await fetch("/api/community/moderate", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, action }),
      });
      if (res.ok) {
        setPendingItems(prev => prev.filter((i: any) => i.id !== id));
        setModQueue(prev => ({ ...prev, [type === "post" ? "posts" : "comments"]: prev[type === "post" ? "posts" : "comments"] - 1 }));
      }
    } catch {} finally {
      setModLoading(false);
    }
  };

  const openModPanel = async () => {
    setShowModPanel(true);
    setModLoading(true);
    try {
      const [postsRes, commentsRes] = await Promise.all([
        fetch("/api/community/moderate?type=posts&limit=50"),
        fetch("/api/community/moderate?type=comments&limit=50"),
      ]);
      const postsData = await postsRes.json();
      const commentsData = await commentsRes.json();
      setPendingItems([
        ...(postsData.items || []).map((i: any) => ({ ...i, modType: "post" })),
        ...(commentsData.items || []).map((i: any) => ({ ...i, modType: "comment" })),
      ]);
    } catch {} finally {
      setModLoading(false);
    }
  };

  const renderMedia = (media: MediaItem[] | null | undefined) => {
    if (!media || media.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {media.map((m, i) => (
          <div key={i} className="relative">
            {m.type === "image" && (
              <a href={m.url} target="_blank" rel="noopener noreferrer">
                <img src={m.url} alt="" className="max-h-64 rounded-lg object-cover max-w-full" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </a>
            )}
            {m.type === "gif" && (
              <a href={m.url} target="_blank" rel="noopener noreferrer">
                <img src={m.thumbnail || m.url} alt="" className="max-h-64 rounded-lg object-cover max-w-full" />
              </a>
            )}
            {m.type === "video" && (
              <div className="max-w-lg">
                <video src={m.url} controls className="rounded-lg max-h-64 w-full" />
              </div>
            )}
            {m.type === "link" && (
              <a href={m.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg dark:bg-indigo-950/30 dark:text-indigo-400">
                <ExternalLink className="h-3.5 w-3.5" />
                {m.title || m.url.replace(/^https?:\/\//, "").slice(0, 40)}
              </a>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderUserBadge = (u: PostUser) => {
    const badgeClass = u.role === "admin" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" :
      u.role === "moderator" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" : "";
    if (!badgeClass) return null;
    return <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${badgeClass}`}><Shield className="h-2.5 w-2.5" />{u.role}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Community</h1>
          <p className="text-sm text-gray-500 mt-1">Discuss, share updates, and connect with other students</p>
        </div>
        <div className="flex items-center gap-2">
          {(currentUser?.role === "admin" || currentUser?.role === "moderator") && (
            <button onClick={openModPanel} className="relative flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
              <Shield className="h-4 w-4" />
              Mod Queue
              {(modQueue.posts + modQueue.comments) > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {modQueue.posts + modQueue.comments}
                </span>
              )}
            </button>
          )}
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            <Plus className="h-4 w-4" />New Post
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-6 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {showModPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModPanel(false)}>
          <div className="w-full max-w-2xl max-h-[80vh] rounded-xl border bg-white p-6 overflow-y-auto dark:bg-gray-900 dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Moderation Queue</h2>
              <button onClick={() => setShowModPanel(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-5 w-5" /></button>
            </div>
            {modLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin" size={24} /></div>
            ) : pendingItems.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No items pending moderation</p>
            ) : (
              <div className="space-y-3">
                {pendingItems.map((item: any) => (
                  <div key={item.id} className="rounded-lg border p-4 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.modType === "post" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400" : "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"}`}>
                        {item.modType}
                      </span>
                      <span className="text-xs text-gray-500">by {item.user?.name || item.user?.email}</span>
                      <span className="text-xs text-gray-400 ml-auto">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm line-clamp-2">{item.content || item.title}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={() => moderateItem(item.modType, item.id, "approved")} disabled={modLoading} className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50">
                        <CheckCircle className="h-3.5 w-3.5" />Approve
                      </button>
                      <button onClick={() => moderateItem(item.modType, item.id, "rejected")} disabled={modLoading} className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50">
                        <XCircle className="h-3.5 w-3.5" />Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-2xl max-h-[85vh] rounded-xl border bg-white p-6 overflow-y-auto dark:bg-gray-900 dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Create Post</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-5 w-5" /></button>
            </div>

            {createError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-4 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />{createError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title (optional)</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="What's on your mind?" className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" maxLength={200} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content *</label>
                <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} rows={5} placeholder="Share your thoughts, updates, or questions..." className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 resize-y" maxLength={50000} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <input type="text" value={newTags} onChange={(e) => setNewTags(e.target.value)} placeholder="admission, counselling, engineering" className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Media</label>
                <div className="flex items-center gap-2 mb-2">
                  <select value={mediaType} onChange={(e) => setMediaType(e.target.value as any)} className="rounded-lg border px-2 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
                    <option value="image">Image URL</option>
                    <option value="video">Video URL</option>
                    <option value="link">Link</option>
                  </select>
                  <input type="text" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="Paste URL..." className="flex-1 rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
                  <button onClick={addMedia} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">Add</button>
                  <button onClick={() => { setShowGifPicker(true); searchGifs("trending"); }} className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
                    <Smile className="h-4 w-4" />GIF
                  </button>
                </div>
                {newMedia.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newMedia.map((m, i) => (
                      <div key={i} className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
                        <span className="font-medium uppercase text-[10px] text-gray-500">{m.type}</span>
                        <span className="truncate max-w-[150px]">{m.url.replace(/^https?:\/\//, "").slice(0, 30)}</span>
                        <button onClick={() => removeMedia(i)} className="text-gray-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {showGifPicker && (
                <div ref={gifPanelRef} className="border rounded-lg p-4 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <input type="text" value={gifSearch} onChange={(e) => setGifSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchGifs(gifSearch)} placeholder="Search GIFs..." className="flex-1 rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
                    <button onClick={() => searchGifs(gifSearch)} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">Search</button>
                    <button onClick={() => setShowGifPicker(false)} className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-4 w-4" /></button>
                  </div>
                  {gifLoading ? (
                    <div className="flex justify-center py-4"><Loader2 className="animate-spin" size={20} /></div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {gifResults.map((gif: any) => (
                        <button key={gif.id} onClick={() => selectGif(gif)} className="rounded-lg overflow-hidden hover:ring-2 ring-indigo-500 transition-all">
                          <img src={gif.preview} alt={gif.title || "GIF"} className="w-full h-24 object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowCreate(false)} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">Cancel</button>
                <button onClick={handleCreatePost} disabled={creating} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          <>
            {posts.map((post) => {
              const isExpanded = expandedPost === post.id;
              const postComments = comments[post.id] || [];
              return (
                <div key={post.id} id={`post-${post.id}`} className="rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      {post.user.avatar ? (
                        <img src={post.user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold shrink-0">
                          {(post.user.name || "U")[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{post.user.name || "Anonymous"}</span>
                          {renderUserBadge(post.user)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          {post.isPinned && <span className="flex items-center gap-0.5 text-amber-600"><Pin className="h-3 w-3" />Pinned</span>}
                          {post.isLocked && <span className="flex items-center gap-0.5 text-gray-400"><Lock className="h-3 w-3" />Locked</span>}
                        </div>
                      </div>
                      <button onClick={() => toggleExpand(post.id)} className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <MessageCircle className="h-4 w-4" />
                        <span className="ml-1 text-xs">{post._count.comments}</span>
                      </button>
                    </div>

                    {post.title && <h3 className="font-semibold mb-1">{post.title}</h3>}
                    <div className={`text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap ${!isExpanded ? "line-clamp-4" : ""}`}>{post.content}</div>
                    {renderMedia(post.media as MediaItem[])}

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {post.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            <Hash className="h-2.5 w-2.5" />{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-4 pt-3 border-t dark:border-gray-800">
                      <button onClick={() => toggleExpand(post.id)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {post._count.comments} {post._count.comments === 1 ? "comment" : "comments"}
                      </button>
                      {post.isLocked && <span className="text-xs text-gray-400 flex items-center gap-1"><Lock className="h-3 w-3" />Locked</span>}
                      {(currentUser?.role === "admin" || currentUser?.role === "moderator") && post.status !== "approved" && (
                        <span className="text-xs text-amber-600 flex items-center gap-1"><Clock className="h-3 w-3" />Pending review</span>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t bg-gray-50 px-5 py-4 dark:bg-gray-950/50 dark:border-gray-800">
                      {loadingComments[post.id] ? (
                        <div className="flex justify-center py-4"><Loader2 className="animate-spin" size={16} /></div>
                      ) : (
                        <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                          {postComments.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">No comments yet</p>
                          ) : (
                            postComments.map((c) => (
                              <div key={c.id} className="flex gap-3">
                                {c.user.avatar ? (
                                  <img src={c.user.avatar} alt="" className="h-8 w-8 rounded-full object-cover shrink-0 mt-0.5" />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0 mt-0.5">
                                    {(c.user.name || "U")[0].toUpperCase()}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{c.user.name || "Anonymous"}</span>
                                    {renderUserBadge(c.user)}
                                    <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                                    {c.isEdited && <span className="text-[10px] text-gray-400">(edited)</span>}
                                  </div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{c.content}</p>
                                  {renderMedia(c.media as MediaItem[])}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {post.isLocked ? (
                        <p className="text-sm text-gray-400 text-center"><Lock className="h-3.5 w-3.5 inline mr-1" />Comments are locked</p>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={expandedPost === post.id ? commentText : ""}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleComment(post.id); } }}
                            placeholder="Write a comment..."
                            className="flex-1 rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
                          />
                          <button
                            onClick={() => handleComment(post.id)}
                            disabled={commentLoading[post.id] || !commentText.trim()}
                            className="rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {commentLoading[post.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {page < totalPages && (
              <div className="text-center py-4">
                <button
                  onClick={() => fetchPosts(page + 1)}
                  disabled={loading}
                  className="rounded-lg border px-6 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  {loading ? <Loader2 className="animate-spin inline h-4 w-4" /> : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
