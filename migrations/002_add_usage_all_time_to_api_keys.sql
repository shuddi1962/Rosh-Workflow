-- Migration: 002_add_usage_all_time_to_api_keys.sql
-- Adds usage_all_time column for cumulative API usage tracking

ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS usage_all_time INTEGER DEFAULT 0;
