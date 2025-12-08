-- 测试和验证脚本
-- 运行此脚本以验证浏览量跟踪系统是否正确部署

-- 1. 检查表是否存在
DO $$
BEGIN
    RAISE NOTICE '=== 开始验证浏览量跟踪系统 ===';

    -- 检查 view_logs 表
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'view_logs') THEN
        RAISE NOTICE '✅ view_logs 表存在';
    ELSE
        RAISE NOTICE '❌ view_logs 表不存在';
    END IF;
END $$;

-- 2. 检查函数是否存在
SELECT
    proname as function_name,
    CASE
        WHEN proname IS NOT NULL THEN '✅ 存在'
        ELSE '❌ 不存在'
    END as status
FROM pg_proc
WHERE proname IN (
    'increment_views',
    'increment_views_batch',
    'increment_views_batch_safe',
    'get_daily_view_stats',
    'detect_view_anomalies'
)
ORDER BY proname;

-- 3. 检查索引是否存在
SELECT
    indexname,
    tablename,
    '✅ 索引存在' as status
FROM pg_indexes
WHERE indexname IN (
    'idx_view_logs_work_created',
    'idx_view_logs_session',
    'idx_views_updated_at',
    'idx_works_approved_created',
    'idx_works_views_likes',
    'idx_works_tags'
)
ORDER BY indexname;

-- 4. 测试函数 - 单个浏览量增加（需要一个有效的 work_id）
-- 注意：这个测试需要替换为实际的 work_id
/*
DO $$
DECLARE
    test_work_id UUID;
BEGIN
    -- 获取第一个作品的 ID
    SELECT id INTO test_work_id FROM works LIMIT 1;

    IF test_work_id IS NOT NULL THEN
        -- 测试单个浏览量增加
        PERFORM increment_views(test_work_id);
        RAISE NOTICE '✅ increment_views 函数测试成功';
    ELSE
        RAISE NOTICE '⚠️  没有找到测试作品，跳过函数测试';
    END IF;
END $$;
*/

-- 5. 显示 view_logs 表结构
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'view_logs'
ORDER BY ordinal_position;

-- 6. 完成验证
DO $$
BEGIN
    RAISE NOTICE '=== 验证完成 ===';
END $$;
