INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_at, last_login)
VALUES ('demo-user-001', 'demo@roshanalinfotech.com', '$2b$12$mo/WSOcTPdmdrJ5gnZKrBObJz1Zn7bymbpVNyOkopjel5NQycUGae', 'Demo User', 'admin', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET password_hash = '$2b$12$mo/WSOcTPdmdrJ5gnZKrBObJz1Zn7bymbpVNyOkopjel5NQycUGae', is_active = true
RETURNING id, email, full_name, role;
