-- ============================================
-- Supabase Storage 权限配置
-- ============================================
-- 解决缩略图和源码文件上传失败的问题

-- 允许所有人上传和读取 thumbnails 存储桶
INSERT INTO storage.policies (name, bucket_id, definition, check)
VALUES (
  'Allow public uploads to thumbnails',
  'thumbnails',
  'true',
  'true'
) ON CONFLICT DO NOTHING;

INSERT INTO storage.policies (name, bucket_id, definition)
VALUES (
  'Allow public reads from thumbnails',
  'thumbnails',
  'true'
) ON CONFLICT DO NOTHING;

-- 允许所有人上传和读取 source-code 存储桶
INSERT INTO storage.policies (name, bucket_id, definition, check)
VALUES (
  'Allow public uploads to source-code',
  'source-code',
  'true',
  'true'
) ON CONFLICT DO NOTHING;

INSERT INTO storage.policies (name, bucket_id, definition)
VALUES (
  'Allow public reads from source-code',
  'source-code',
  'true'
) ON CONFLICT DO NOTHING;

-- 验证策略是否创建成功
SELECT * FROM storage.policies 
WHERE bucket_id IN ('thumbnails', 'source-code')
ORDER BY bucket_id, name;

