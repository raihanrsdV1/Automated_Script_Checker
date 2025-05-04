import QuestionBrowser from './components/QuestionBrowser';
import SubmissionForm from './components/SubmissionForm';
import SubmissionHistory from './components/SubmissionHistory';


function UserDashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
      <p className="mb-4">Welcome, Student! Here you can browse questions, submit answers, view results, and request rechecks.</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Browse Questions</h2>
        <QuestionBrowser />
        {/* TODO: Add filtering/selection logic */}
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Submit Answer</h2>
        <SubmissionForm />
        {/* TODO: Pass selected question ID to SubmissionForm */}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Submission History</h2>
        <SubmissionHistory />
        {/* TODO: Fetch and display user's submissions */}
      </section>
    </div>
  );
}

export default UserDashboard;