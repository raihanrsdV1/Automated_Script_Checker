function QuestionForm({ questionData, onSubmit }) { // Expects optional questionData for editing
  return (
    <div>
      <p>TODO: Create a form to add/edit questions and rubrics.</p>
      <p>TODO: Include fields for subject (dropdown fetched from Supabase), question text (LaTeX), and rubric (LaTeX).</p>
      <textarea placeholder="Enter question text (LaTeX)..." className="w-full p-2 border rounded mb-2"></textarea>
      <textarea placeholder="Enter rubric (LaTeX)..." className="w-full p-2 border rounded mb-2"></textarea>
      {/* TODO: Add subject dropdown */}
      {/* TODO: Add live LaTeX preview using MathJax/KaTeX */}
      <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
        {questionData ? 'Update Question' : 'Create Question'}
      </button>
      <p>TODO: Implement logic to create/update Supabase `question` table.</p>
    </div>
  );
}

export default QuestionForm;