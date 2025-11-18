-- ============================================
-- 添加上传者追踪字段
-- ============================================
-- 解决问题：记录谁上传了作品，防止滥用和便于管理

-- 1. 添加 uploaded_by 字段（上传者用户名）
ALTER TABLE works 
ADD COLUMN IF NOT EXISTS uploaded_by TEXT;

-- 2. 添加 uploaded_at 字段（上传时间，区别于 created_at）
ALTER TABLE works 
ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. 添加 is_approved 字段（审核状态）
ALTER TABLE works 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;

-- 4. 添加 审核备注字段
ALTER TABLE works 
ADD COLUMN IF NOT EXISTS admin_note TEXT;

-- 5. 创建索引提高查询效率
CREATE INDEX IF NOT EXISTS idx_works_uploaded_by ON works(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_works_is_approved ON works(is_approved);
CREATE INDEX IF NOT EXISTS idx_works_uploaded_at ON works(uploaded_at DESC);

-- 6. 更新现有数据（将 author 复制到 uploaded_by）
UPDATE works 
SET uploaded_by = author 
WHERE uploaded_by IS NULL AND author IS NOT NULL;

-- 7. 为未来的记录设置默认值
COMMENT ON COLUMN works.uploaded_by IS '上传者用户名（从登录信息获取）';
COMMENT ON COLUMN works.uploaded_at IS '上传时间';
COMMENT ON COLUMN works.is_approved IS '是否通过审核（默认 true，可改为 false 需要审核）';
COMMENT ON COLUMN works.admin_note IS '管理员备注';

-- ============================================
-- 查看更新后的表结构
-- ============================================
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'works' AND column_name IN ('uploaded_by', 'uploaded_at', 'is_approved', 'admin_note')
ORDER BY ordinal_position;

