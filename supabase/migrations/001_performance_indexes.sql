-- Performance Optimization Indexes for Phase 1
-- 为 works 表添加复合索引以提高查询性能

-- 1. 作品列表查询优化 (已审核 + 创建时间倒序)
-- 这个索引将大幅提升首页作品列表加载速度
CREATE INDEX IF NOT EXISTS idx_works_approved_created
ON works(is_approved, created_at DESC);

-- 2. 热门作品排序优化 (浏览量 + 点赞数倒序)
-- 这个索引将提升按热门度排序的性能
CREATE INDEX IF NOT EXISTS idx_works_views_likes
ON works(views DESC, likes DESC);

-- 3. 标签搜索优化
-- 如果 tags 是数组类型，使用 GIN 索引；如果是文本，使用全文索引
CREATE INDEX IF NOT EXISTS idx_works_tags
ON works USING GIN(tags);

-- 4. 作者查询优化
CREATE INDEX IF NOT EXISTS idx_works_author
ON works(author) WHERE author IS NOT NULL;

-- 5. 评论查询优化
-- 为评论表添加作品和时间的复合索引
CREATE INDEX IF NOT EXISTS idx_comments_work_created
ON comments(work_id, created_at DESC);

-- 6. 用户相关查询优化
CREATE INDEX IF NOT EXISTS idx_works_uploaded_by
ON works(uploaded_by) WHERE uploaded_by IS NOT NULL;

-- 分析表以更新统计信息
ANALYZE works;
ANALYZE comments;

-- 显示索引创建结果
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('works', 'comments')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;