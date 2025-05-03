function SubmissionForm({ questionId }) { // Expects selected questionId as prop
  return (
    <div>
      <p>TODO: Create a form to upload a PDF answer for question ID: {questionId || 'None selected'}.</p>
      <p>TODO: Integrate with Firebase Storage for PDF upload.</p>
      <p>TODO: Call backend/Supabase to create a submission record.</p>
    </div>
  );
}

export default SubmissionForm;