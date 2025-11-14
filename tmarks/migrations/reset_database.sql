-- ============================================================================
-- 数据库重置脚本
-- 警告: 此脚本会删除所有数据!请谨慎使用!
-- ============================================================================

-- 1. 删除所有数据(保留表结构)
DELETE FROM api_key_logs;
DELETE FROM api_keys;
DELETE FROM audit_logs;
DELETE FROM bookmark_tags;
DELETE FROM bookmarks;
DELETE FROM tags;
DELETE FROM shares;
DELETE FROM tab_group_items;
DELETE FROM tab_groups;
DELETE FROM statistics;
DELETE FROM user_preferences;
DELETE FROM auth_tokens;
DELETE FROM users;
DELETE FROM registration_limits;

-- 2. 重置自增ID(如果有的话)
DELETE FROM sqlite_sequence WHERE name IN (
  'api_key_logs',
  'audit_logs',
  'auth_tokens'
);

-- 3. 插入初始迁移记录
INSERT OR REPLACE INTO schema_migrations (version) VALUES ('v2.0');

-- 完成!数据库已重置,所有用户数据已清空

