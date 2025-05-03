import RegisterForm from './components/RegisterForm';

function Register() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <RegisterForm />
      {/* TODO: Add link to Login page */}
    </div>
  );
}

export default Register;