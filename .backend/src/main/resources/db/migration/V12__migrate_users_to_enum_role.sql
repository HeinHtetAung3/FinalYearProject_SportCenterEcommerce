ALTER TABLE users
    ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'USER';

UPDATE users u
SET u.role = 'ADMIN'
WHERE EXISTS (
    SELECT 1
    FROM user_roles ur
             JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = u.id
      AND r.name = 'ROLE_ADMIN'
);

DROP TABLE IF EXISTS user_roles;
