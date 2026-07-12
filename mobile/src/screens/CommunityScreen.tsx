import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/api/client';
import { Post } from '@/types';
import { Spacing, BorderRadius, FontSize, Shadows } from '@/constants/theme';

export default function CommunityScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadPosts = useCallback(async (p = 1) => {
    try {
      const data = await api.getCommunityPosts({ page: p, limit: 20 });
      if (p === 1) setPosts(data.posts || []);
      else setPosts((prev) => [...prev, ...(data.posts || [])]);
      setTotalPages(data.totalPages);
    } catch {}
  }, []);

  useEffect(() => { loadPosts(1); }, [loadPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts(1);
    setPage(1);
    setRefreshing(false);
  };

  const submitPost = async () => {
    if (!newPostContent.trim()) return;
    try {
      await api.createPost({ title: newPostTitle.trim() || undefined, content: newPostContent.trim() });
      setNewPostContent('');
      setNewPostTitle('');
      setShowComposer(false);
      await loadPosts(1);
      setPage(1);
    } catch {}
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: Spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
          <Text style={{ fontSize: FontSize.xxl, fontWeight: '700', color: colors.text }}>Community</Text>
          <TouchableOpacity
            onPress={() => setShowComposer(!showComposer)}
            style={[styles.composeBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name={showComposer ? 'close' : 'add'} size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {showComposer && (
          <View style={[styles.composer, { backgroundColor: colors.card }, Shadows.md]}>
            <TextInput
              style={[styles.composerTitle, { color: colors.text, borderBottomColor: colors.border }]}
              placeholder="Title (optional)"
              placeholderTextColor={colors.textMuted}
              value={newPostTitle}
              onChangeText={setNewPostTitle}
            />
            <TextInput
              style={[styles.composerContent, { color: colors.text }]}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.textMuted}
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity
              onPress={submitPost}
              style={[styles.submitBtn, { backgroundColor: newPostContent.trim() ? colors.primary : colors.surfaceVariant }]}
            >
              <Text style={{ color: newPostContent.trim() ? '#fff' : colors.textMuted, fontWeight: '600' }}>Post</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item: post }) => (
          <View style={[styles.postCard, { backgroundColor: colors.card }, Shadows.sm]}>
            <View style={styles.postHeader}>
              <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                <Text style={{ color: colors.primary, fontSize: FontSize.sm, fontWeight: '700' }}>
                  {(post.user.name || 'U').slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: FontSize.sm, fontWeight: '600' }}>
                  {post.user.name || 'Anonymous'}
                  {post.user.role === 'admin' && <Text style={{ color: colors.primary }}> (Admin)</Text>}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: FontSize.xs }}>{timeAgo(post.createdAt)}</Text>
              </View>
              {post.isPinned && <Ionicons name="pin" size={14} color={colors.warning} />}
            </View>
            {post.title && <Text style={[styles.postTitle, { color: colors.text }]}>{post.title}</Text>}
            <Text style={[styles.postContent, { color: colors.textSecondary }]} numberOfLines={5}>{post.content}</Text>
            {post.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {post.tags.map((tag) => (
                  <View key={tag} style={[styles.tag, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={{ color: colors.primary, fontSize: FontSize.xs }}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
            <View style={[styles.postFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity style={styles.footerAction}>
                <Ionicons name="chatbubble-outline" size={16} color={colors.textSecondary} />
                <Text style={{ color: colors.textSecondary, fontSize: FontSize.xs }}>{post._count.comments}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: colors.textMuted, textAlign: 'center', padding: 60 }}>No posts yet. Be the first!</Text>}
        onEndReached={() => { if (page < totalPages) { setPage(page + 1); loadPosts(page + 1); } }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  composeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  composer: { padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.md },
  composerTitle: { fontSize: FontSize.md, fontWeight: '600', borderBottomWidth: 1, paddingBottom: Spacing.sm, marginBottom: Spacing.sm },
  composerContent: { fontSize: FontSize.md, minHeight: 80, marginBottom: Spacing.md },
  submitBtn: { paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.md, alignItems: 'center' },
  postCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.md },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  postTitle: { fontSize: FontSize.md, fontWeight: '700', marginBottom: Spacing.xs },
  postContent: { fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.sm },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.sm },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.sm },
  postFooter: { flexDirection: 'row', borderTopWidth: 1, paddingTop: Spacing.sm },
  footerAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
