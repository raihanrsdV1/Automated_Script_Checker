import QuestionForm from './components/QuestionForm';
// import RubricForm from './components/RubricForm'; // Rubric might be part of QuestionForm

function QuestionRubricSetup() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Question and Rubric Setup Dashboard</h1>
      <p className="mb-4">Welcome, Teacher! Create, edit, or delete questions and their rubrics.</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Create/Edit Question</h2>
        <QuestionForm />
        {/* TODO: Add logic to handle editing existing questions */}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Existing Questions</h2>
        {/* TODO: Fetch and display list of existing questions with edit/delete options */}
        <p>TODO: List existing questions here.</p>
      </section>
    </div>
  );
}

export default QuestionRubricSetup;