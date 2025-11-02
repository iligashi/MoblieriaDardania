-- Insert admin user into Supabase auth and admins table
-- Email: admin@admin.com
-- Password: IlazGashi123

-- First, we need to create the user in auth.users
-- Note: This uses Supabase's auth.users table and encrypts the password
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change_token_new,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@admin.com',
  crypt('IlazGashi123', gen_salt('bf')), -- Encrypts password using bcrypt
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  '',
  '',
  ''
)
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- Then insert into admins table using the created user's id
INSERT INTO admins (user_id, email, created_at)
SELECT id, email, NOW()
FROM auth.users
WHERE email = 'admin@admin.com'
ON CONFLICT (user_id) DO NOTHING;
