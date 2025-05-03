# Login Page

## Overview
The Login page allows users to authenticate and access the exam system. It will integrate with Supabase Authentication or a custom backend API.

## Planned Features
- **Authentication Form**: Input fields for `username` and `password`.
- **Submit Logic**: Validate credentials and retrieve a JWT or session token.
- **Error Handling**: Display errors for invalid credentials.
- **Redirect**: Navigate to the User Dashboard or appropriate role-based page upon success.

## Components
- `LoginForm.jsx`: Contains the login form with input fields and submit button.

## Development Tasks
- Implement Supabase Authentication or custom API call.
- Add form validation (e.g., required fields).
- Style with Tailwind CSS for responsiveness.
