# Auth Module

## Overview
The Auth module handles user registration and login, integrating with Supabase Authentication or a custom JWT system.

## Planned Features
- **Register**: Create users with `role` (student, teacher, moderator) and store in `user` table.
- **Login**: Authenticate users and return a JWT or session token.
- **Role Validation**: Ensure role-based access to endpoints.

## Files
- `register.py`: Handle POST `/api/auth/register`.
- `login.py`: Handle POST `/api/auth/login`.

## Development Tasks
- Implement Supabase Authentication or JWT.
- Hash passwords with `bcrypt`.
- Add role checks with middleware.
