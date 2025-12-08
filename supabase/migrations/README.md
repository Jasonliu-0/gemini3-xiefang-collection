# 数据库迁移指南

## Phase 1: 性能索引优化

### 文件: `001_performance_indexes.sql`

**执行步骤:**

1. 登录 Supabase Dashboard
2. 进入 SQL Editor
3. 复制 `001_performance_indexes.sql` 的全部内容
4. 粘贴到 SQL Editor 并执行
5. 等待执行完成，应该看到所有索引创建成功的消息

**预期结果:**
```
✅ idx_works_approved_created: 创建成功
✅ idx_works_views_likes: 创建成功
✅ idx_works_tags: 创建成功
✅ idx_works_author: 创建成功
✅ idx_comments_work_created: 创建成功
✅ idx_works_uploaded_by: 创建成功
```

---

## Phase 2: 浏览量跟踪系统

### 文件: `002_view_tracking_functions.sql`

**执行步骤:**

1. 登录 Supabase Dashboard
2. 进入 SQL Editor
3. 复制 `002_view_tracking_functions.sql` 的全部内容
4. 粘贴到 SQL Editor 并执行
5. 等待执行完成

**预期结果:**
```
创建的函数数量: 5
view_logs 表创建: 成功
✅ 函数 increment_views: 创建成功
✅ 函数 increment_views_batch: 创建成功
✅ 函数 increment_views_batch_safe: 创建成功
✅ 函数 get_daily_view_stats: 创建成功
✅ 函数 detect_view_anomalies: 创建成功
✅ 索引 idx_view_logs_work_created: 创建成功
✅ 索引 idx_views_updated_at: 创建成功
```

---

## 验证迁移

### 文件: `002_view_tracking_functions_test.sql`

**执行步骤:**

1. 在 SQL Editor 中执行测试脚本
2. 检查所有输出是否显示 ✅

**测试查询:**

```sql
-- 查看所有创建的函数
SELECT
    proname as function_name,
    '✅' as status
FROM pg_proc
WHERE proname LIKE 'increment_views%'
   OR proname = 'get_daily_view_stats'
   OR proname = 'detect_view_anomalies';

-- 查看所有索引
SELECT
    indexname,
    tablename
FROM pg_indexes
WHERE indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 查看 view_logs 表结构
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'view_logs'
ORDER BY ordinal_position;
```

---

## 常见问题排查

### 问题 1: 表已存在错误
**错误信息:** `relation "view_logs" already exists`

**解决方案:**
```sql
-- 删除已存在的表（注意：会丢失数据）
DROP TABLE IF EXISTS view_logs CASCADE;

-- 然后重新运行迁移脚本
```

### 问题 2: 函数已存在
**错误信息:** `function already exists`

**解决方案:**
脚本使用了 `CREATE OR REPLACE FUNCTION`，应该不会报错。如果报错，可以先删除：

```sql
DROP FUNCTION IF EXISTS increment_views(UUID);
DROP FUNCTION IF EXISTS increment_views_batch(UUID[]);
DROP FUNCTION IF EXISTS increment_views_batch_safe(UUID[]);
DROP FUNCTION IF EXISTS get_daily_view_stats(INTEGER);
DROP FUNCTION IF EXISTS detect_view_anomalies();

-- 然后重新运行迁移脚本
```

### 问题 3: 权限错误
**错误信息:** `permission denied`

**解决方案:**
确保使用 Supabase 的 `postgres` 角色或有足够权限的用户执行。

### 问题 4: 唯一约束冲突
**错误信息:** 涉及 `unique_work_session_time` 约束

**解决方案:**
这是正常的防重复机制，不影响功能。如果要清理：

```sql
-- 清空浏览日志表
TRUNCATE TABLE view_logs;
```

---

## 回滚指南

如果需要回滚迁移：

### 回滚 Phase 2
```sql
-- 删除函数
DROP FUNCTION IF EXISTS increment_views(UUID);
DROP FUNCTION IF EXISTS increment_views_batch(UUID[]);
DROP FUNCTION IF EXISTS increment_views_batch_safe(UUID[]);
DROP FUNCTION IF EXISTS get_daily_view_stats(INTEGER);
DROP FUNCTION IF EXISTS detect_view_anomalies();

-- 删除表
DROP TABLE IF EXISTS view_logs CASCADE;

-- 删除索引
DROP INDEX IF EXISTS idx_view_logs_work_created;
DROP INDEX IF EXISTS idx_view_logs_session;
DROP INDEX IF EXISTS idx_views_updated_at;
```

### 回滚 Phase 1
```sql
-- 删除性能索引
DROP INDEX IF EXISTS idx_works_approved_created;
DROP INDEX IF EXISTS idx_works_views_likes;
DROP INDEX IF EXISTS idx_works_tags;
DROP INDEX IF EXISTS idx_works_author;
DROP INDEX IF EXISTS idx_comments_work_created;
DROP INDEX IF EXISTS idx_works_uploaded_by;
```

---

## 性能监控

迁移完成后，可以使用以下查询监控性能：

### 查看索引使用情况
```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### 查看浏览量统计
```sql
-- 使用创建的函数
SELECT * FROM get_daily_view_stats(30);
```

### 查看浏览量异常
```sql
-- 检测异常浏览量
SELECT * FROM detect_view_anomalies();
```

### 查看浏览日志
```sql
-- 最近的浏览记录
SELECT
    w.title,
    vl.created_at,
    vl.session_id
FROM view_logs vl
JOIN works w ON w.id = vl.work_id
ORDER BY vl.created_at DESC
LIMIT 50;
```

---

## 迁移检查清单

执行迁移前请确认：

- [ ] 已备份数据库
- [ ] 使用有足够权限的用户
- [ ] 阅读了完整的迁移脚本
- [ ] 了解回滚步骤

执行迁移后请验证：

- [ ] 所有函数创建成功
- [ ] view_logs 表创建成功
- [ ] 所有索引创建成功
- [ ] 权限设置正确
- [ ] 运行测试脚本验证

---

## 技术支持

如遇到问题，请：

1. 检查 Supabase SQL Editor 的错误输出
2. 运行测试脚本 `002_view_tracking_functions_test.sql`
3. 查看本文档的"常见问题排查"部分
4. 在项目 GitHub Issues 中提问

---

**最后更新:** 2025-12-06
**版本:** Phase 2
