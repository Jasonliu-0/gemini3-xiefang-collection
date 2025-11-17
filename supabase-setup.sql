-- Supabase 数据库初始化脚本
-- 请在 Supabase 控制台的 SQL Editor 中运行此脚本

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建作品表
CREATE TABLE IF NOT EXISTS works (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  -- 用于存储可直接预览或下载的源码内容（data URL 或存储文件地址）
  source_code_url TEXT,
  -- 新增：源码仓库 / 外部链接（GitHub、Linux DO 帖子等）
  source_repo_url TEXT,
  thumbnail TEXT,
  tags TEXT[],
  author TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建评论表
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建点赞表（防止重复点赞）
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  user_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(work_id, user_ip)
);

-- 创建收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(work_id, user_name)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_works_created_at ON works(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_work_id ON comments(work_id);
CREATE INDEX IF NOT EXISTS idx_likes_work_id ON likes(work_id);
CREATE INDEX IF NOT EXISTS idx_favorites_work_id ON favorites(work_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_name ON favorites(user_name);

-- 启用行级安全策略 (RLS)
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 创建策略：所有人可以读取
CREATE POLICY "允许所有人查看作品" ON works
  FOR SELECT USING (true);

CREATE POLICY "允许所有人查看评论" ON comments
  FOR SELECT USING (true);

CREATE POLICY "允许所有人查看点赞" ON likes
  FOR SELECT USING (true);

CREATE POLICY "允许所有人查看收藏" ON favorites
  FOR SELECT USING (true);

-- 创建策略：所有人可以插入
CREATE POLICY "允许所有人上传作品" ON works
  FOR INSERT WITH CHECK (true);

CREATE POLICY "允许所有人评论" ON comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "允许所有人点赞" ON likes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "允许所有人收藏" ON favorites
  FOR INSERT WITH CHECK (true);

-- 创建策略：允许删除自己的收藏
CREATE POLICY "允许删除自己的收藏" ON favorites
  FOR DELETE USING (true);

-- 创建策略：允许更新浏览量和点赞数
CREATE POLICY "允许更新作品统计" ON works
  FOR UPDATE USING (true);

-- 创建存储桶（Storage Buckets）
-- 注意：这部分需要在 Supabase 控制台的 Storage 界面手动创建

-- 1. 创建 'thumbnails' 存储桶（用于缩略图）
--    - Bucket name: thumbnails
--    - Public: true
--    - File size limit: 5MB
--    - Allowed MIME types: image/*

-- 2. 创建 'source-code' 存储桶（用于源码文件）
--    - Bucket name: source-code
--    - Public: true
--    - File size limit: 50MB
--    - Allowed MIME types: application/zip, application/x-rar-compressed, etc.

-- 插入示例数据（可选）
INSERT INTO works (title, description, url, tags, author, views, likes) VALUES
  ('AI 生成的网页设计', '使用 Gemini 3.0 生成的现代化网页设计，包含完整的响应式布局和交互效果。', 'https://example.com/demo1', ARRAY['网页设计', 'UI/UX', 'AI'], 'Alice', 120, 15),
  ('智能代码助手', '基于 Gemini 3.0 开发的智能代码补全工具，支持多种编程语言。', 'https://example.com/demo2', ARRAY['开发工具', '代码', 'AI'], 'Bob', 89, 12),
  ('创意海报生成器', '输入关键词即可生成专业级海报设计，适用于各种场景。', 'https://example.com/demo3', ARRAY['设计', '海报', '创意'], 'Carol', 156, 23);

-- 为示例数据添加评论
INSERT INTO comments (work_id, user_name, content, rating) 
SELECT 
  id, 
  '测试用户', 
  '这个作品非常棒！创意十足，实现也很完善。', 
  5
FROM works 
LIMIT 1;

COMMENT ON TABLE works IS '作品表：存储用户上传的 Gemini 3.0 生成的作品';
COMMENT ON TABLE comments IS '评论表：存储用户对作品的评价和评论';
COMMENT ON TABLE likes IS '点赞表：记录用户点赞行为，防止重复点赞';

