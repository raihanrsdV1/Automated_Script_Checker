import LoginForm from './components/LoginForm';

function Login() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <LoginForm />
      {/* TODO: Add link to Register page */}
    </div>
  );
}

export default Login;