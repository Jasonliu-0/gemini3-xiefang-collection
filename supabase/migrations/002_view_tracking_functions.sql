-- 浏览量跟踪优化函数

-- 1. 单个作品浏览量增加函数
CREATE OR REPLACE FUNCTION increment_views(work_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE works
    SET views = views + 1
    WHERE id = work_id;

    -- 记录浏览日志（可选，用于后续分析）
    INSERT INTO view_logs (work_id, created_at, session_id)
    VALUES (work_id, NOW(), 'single-' || substring(gen_random_uuid()::text, 1, 8));
END;
$$ LANGUAGE plpgsql;

-- 2. 批量增加浏览量函数
CREATE OR REPLACE FUNCTION increment_views_batch(work_ids UUID[])
RETURNS VOID AS $$
BEGIN
    -- 使用 UPSERT 批量更新，防止重复计数
    UPDATE works
    SET views = views + 1
    WHERE id = ANY(work_ids);

    -- 批量插入浏览日志（可选）
    INSERT INTO view_logs (work_id, created_at, session_id)
    SELECT id, NOW(), 'batch-' || substring(gen_random_uuid()::text, 1, 8)
    FROM unnest(work_ids) AS id;

    -- 记录操作日志
    RAISE NOTICE '批量更新浏览量: % 个作品', array_length(work_ids, 1);
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '批量更新浏览量失败: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 2.5. 安全的批量增加浏览量函数（带重复检测）
CREATE OR REPLACE FUNCTION increment_views_batch_safe(work_ids UUID[])
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    updated_count INTEGER
) AS $$
DECLARE
    valid_ids UUID[];
    updated_count INTEGER;
BEGIN
    -- 清理和验证输入
    valid_ids := ARRAY(
        SELECT DISTINCT id
        FROM unnest(work_ids) AS id
        WHERE id IS NOT NULL
    );

    -- 检查是否有有效ID
    IF array_length(valid_ids, 1) IS NULL OR array_length(valid_ids, 1) = 0 THEN
        RETURN QUERY SELECT false, '没有有效的作品ID', 0;
        RETURN;
    END IF;

    -- 执行批量更新
    UPDATE works
    SET views = views + 1
    WHERE id = ANY(valid_ids);

    GET DIAGNOSTICS updated_count = ROW_COUNT;

    -- 批量插入浏览日志（带会话信息）
    INSERT INTO view_logs (work_id, created_at, session_id)
    SELECT id, NOW(), 'batch-' || substring(gen_random_uuid()::text, 1, 8)
    FROM unnest(valid_ids) AS id;

    RETURN QUERY SELECT true,
        format('成功更新 % 个作品的浏览量', updated_count),
        updated_count;
END;
$$ LANGUAGE plpgsql;

-- 3. 创建浏览日志表（用于分析）
CREATE TABLE IF NOT EXISTS view_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET,
    session_id TEXT -- 会话ID，用于统计分析
);

-- 创建浏览日志表的索引
CREATE INDEX IF NOT EXISTS idx_view_logs_work_created ON view_logs(work_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_view_logs_session ON view_logs(session_id, created_at DESC);

-- 4. 添加索引优化查询性能（仅在 updated_at 字段存在时）
DO $$
BEGIN
    -- 检查 updated_at 字段是否存在
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'works' AND column_name = 'updated_at'
    ) THEN
        -- 字段存在，创建索引
        CREATE INDEX IF NOT EXISTS idx_views_updated_at ON works(updated_at DESC);
        RAISE NOTICE '✅ 索引 idx_views_updated_at: 创建成功';
    ELSE
        -- 字段不存在，跳过索引创建
        RAISE NOTICE '⚠️  works 表没有 updated_at 字段，跳过索引创建';
    END IF;
END $$;

-- 5. 创建每日浏览统计函数
CREATE OR REPLACE FUNCTION get_daily_view_stats(days INTEGER DEFAULT 30)
RETURNS TABLE(
    work_id UUID,
    work_title TEXT,
    total_views BIGINT,
    daily_avg NUMERIC,
    trend TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        w.id,
        w.title,
        w.views as total_views,
        CASE
            WHEN views = 0 THEN 0
            ELSE ROUND(views::NUMERIC / days, 2)
        END as daily_avg,
        CASE
            WHEN w.views > 100 THEN '热门'
            WHEN w.views > 50 THEN '良好'
            WHEN w.views > 10 THEN '一般'
            ELSE '冷门'
        END as trend
    FROM works w
    WHERE w.is_approved = true
    ORDER BY w.views DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- 6. 创建浏览量热点检测函数
CREATE OR REPLACE FUNCTION detect_view_anomalies()
RETURNS TABLE(
    work_id UUID,
    work_title TEXT,
    current_views BIGINT,
    expected_views NUMERIC,
    anomaly_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH work_stats AS (
        SELECT
            w.id,
            w.title,
            w.views,
            AVG(w.views) OVER () as avg_views,
            STDDEV(w.views) OVER () as std_views
        FROM works w
        WHERE w.is_approved = true
    )
    SELECT
        id,
        title,
        views,
        avg_views,
        CASE
            WHEN std_views > 0 THEN
                ABS(views - avg_views)::NUMERIC / std_views
            ELSE 0
        END as anomaly_score
    FROM work_stats
    WHERE std_views > 0
    AND ABS(views - avg_views) > 2 * std_views
    ORDER BY anomaly_score DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- 权限设置
GRANT EXECUTE ON FUNCTION increment_views TO authenticated;
GRANT EXECUTE ON FUNCTION increment_views TO anon;
GRANT EXECUTE ON FUNCTION increment_views_batch TO authenticated;
GRANT EXECUTE ON FUNCTION increment_views_batch TO anon;
GRANT EXECUTE ON FUNCTION increment_views_batch_safe TO authenticated;
GRANT EXECUTE ON FUNCTION increment_views_batch_safe TO anon;
GRANT EXECUTE ON FUNCTION get_daily_view_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_view_stats TO anon;
GRANT EXECUTE ON FUNCTION detect_view_anomalies TO authenticated;
GRANT EXECUTE ON FUNCTION detect_view_anomalies TO anon;

-- 权限设置 - view_logs 表
GRANT SELECT, INSERT ON view_logs TO authenticated;
GRANT SELECT ON view_logs TO anon;

-- 显示创建结果
DO $$
DECLARE
    function_count INTEGER;
    table_exists BOOLEAN;
    func_name TEXT;
BEGIN
    -- 检查函数创建数量
    SELECT COUNT(*) INTO function_count
    FROM pg_proc
    WHERE proname IN ('increment_views', 'increment_views_batch', 'increment_views_batch_safe', 'get_daily_view_stats', 'detect_view_anomalies');

    -- 检查表是否存在
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'view_logs'
    ) INTO table_exists;

    -- 输出结果
    RAISE NOTICE '=== 浏览量跟踪函数创建结果 ===';
    RAISE NOTICE '创建的函数数量: %', function_count;
    RAISE NOTICE 'view_logs 表创建: %', CASE WHEN table_exists THEN '成功' ELSE '失败' END;

    -- 显示每个函数的状态
    FOREACH func_name IN ARRAY ARRAY['increment_views', 'increment_views_batch', 'increment_views_batch_safe', 'get_daily_view_stats', 'detect_view_anomalies'] LOOP
        IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = func_name) THEN
            RAISE NOTICE '✅ 函数 %: 创建成功', func_name;
        ELSE
            RAISE NOTICE '❌ 函数 %: 创建失败', func_name;
        END IF;
    END LOOP;

    -- 检查索引
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_view_logs_work_created') THEN
        RAISE NOTICE '✅ 索引 idx_view_logs_work_created: 创建成功';
    ELSE
        RAISE NOTICE '❌ 索引 idx_view_logs_work_created: 创建失败';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_view_logs_session') THEN
        RAISE NOTICE '✅ 索引 idx_view_logs_session: 创建成功';
    ELSE
        RAISE NOTICE '❌ 索引 idx_view_logs_session: 创建失败';
    END IF;

    RAISE NOTICE '=== 浏览量跟踪系统部署完成 ===';
END $$;