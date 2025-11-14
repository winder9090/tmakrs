-- ============================================================================
-- 删除所有表 - 完全重置数据库
-- 警告: 此脚本会删除所有表和数据!执行后需要重新运行 d1_console_pure.sql
-- ============================================================================

-- 删除所有表(按依赖顺序,先删除子表,后删除父表)
DROP TABLE IF EXISTS api_key_logs;
DROP TABLE IF EXISTS api_keys;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS bookmark_tags;
DROP TABLE IF EXISTS bookmarks;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS shares;
DROP TABLE IF EXISTS tab_group_items;
DROP TABLE IF EXISTS tab_groups;
DROP TABLE IF EXISTS statistics;
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS auth_tokens;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS registration_limits;
DROP TABLE IF EXISTS schema_migrations;

-- 完成!所有表已删除
-- 下一步: 在 D1 Console 执行 d1_console_pure.sql 重新创建表结构

