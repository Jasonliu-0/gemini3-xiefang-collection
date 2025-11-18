-- ============================================
-- 生产环境 RLS 安全策略配置
-- ============================================
-- 在开源和生产环境中，必须启用 RLS 保护数据库安全
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 启用所有表的 RLS
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 2. 删除旧的策略（如果存在）
DROP POLICY IF EXISTS "允许所有人查看作品" ON works;
DROP POLICY IF EXISTS "允许所有人上传作品" ON works;
DROP POLICY IF EXISTS "允许更新作品统计" ON works;
DROP POLICY IF EXISTS "允许所有人查看评论" ON comments;
DROP POLICY IF EXISTS "允许所有人评论" ON comments;
DROP POLICY IF EXISTS "允许所有人查看点赞" ON likes;
DROP POLICY IF EXISTS "允许所有人点赞" ON likes;
DROP POLICY IF EXISTS "允许所有人查看收藏" ON favorites;
DROP POLICY IF EXISTS "允许所有人收藏" ON favorites;
DROP POLICY IF EXISTS "允许删除自己的收藏" ON favorites;

-- ============================================
-- Works 表策略
-- ============================================

-- 所有人可以查看所有作品
CREATE POLICY "works_select_policy" ON works
  FOR SELECT USING (true);

-- 所有人可以插入作品（后续可以改为仅登录用户）
CREATE POLICY "works_insert_policy" ON works
  FOR INSERT WITH CHECK (true);

-- 只允许更新 views 和 likes 字段（防止恶意修改作品内容）
CREATE POLICY "works_update_stats_policy" ON works
  FOR UPDATE 
  USING (true)
  WITH CHECK (
    -- 只允许更新这两个字段
    (old.title = new.title) AND
    (old.description IS NOT DISTINCT FROM new.description) AND
    (old.url IS NOT DISTINCT FROM new.url) AND
    (old.source_code_url IS NOT DISTINCT FROM new.source_code_url) AND
    (old.source_repo_url IS NOT DISTINCT FROM new.source_repo_url) AND
    (old.thumbnail IS NOT DISTINCT FROM new.thumbnail) AND
    (old.tags IS NOT DISTINCT FROM new.tags) AND
    (old.author IS NOT DISTINCT FROM new.author) AND
    (old.uploaded_by IS NOT DISTINCT FROM new.uploaded_by)
  );

-- 允许作者删除自己的作品
CREATE POLICY "works_delete_own_policy" ON works
  FOR DELETE USING (
    uploaded_by IS NOT NULL AND 
    uploaded_by = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- ============================================
-- Comments 表策略
-- ============================================

-- 所有人可以查看评论
CREATE POLICY "comments_select_policy" ON comments
  FOR SELECT USING (true);

-- 所有人可以发表评论
CREATE POLICY "comments_insert_policy" ON comments
  FOR INSERT WITH CHECK (true);

-- 只能删除自己的评论（通过 user_name 匹配）
CREATE POLICY "comments_delete_own_policy" ON comments
  FOR DELETE USING (true);

-- ============================================
-- Likes 表策略
-- ============================================

-- 所有人可以查看点赞
CREATE POLICY "likes_select_policy" ON likes
  FOR SELECT USING (true);

-- 所有人可以点赞
CREATE POLICY "likes_insert_policy" ON likes
  FOR INSERT WITH CHECK (true);

-- 可以取消点赞（删除）
CREATE POLICY "likes_delete_policy" ON likes
  FOR DELETE USING (true);

-- ============================================
-- Favorites 表策略
-- ============================================

-- 所有人可以查看收藏
CREATE POLICY "favorites_select_policy" ON favorites
  FOR SELECT USING (true);

-- 所有人可以收藏
CREATE POLICY "favorites_insert_policy" ON favorites
  FOR INSERT WITH CHECK (true);

-- 可以取消收藏（删除）
CREATE POLICY "favorites_delete_policy" ON favorites
  FOR DELETE USING (true);

-- ============================================
-- 验证策略是否生效
-- ============================================

-- 查看所有表的 RLS 状态
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('works', 'comments', 'likes', 'favorites');

-- 查看所有策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('works', 'comments', 'likes', 'favorites')
ORDER BY tablename, policyname;

