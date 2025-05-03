import RecheckResponseForm from './RecheckResponseForm';

function RecheckList() {
  // Placeholder data - replace with fetched data
  const pendingRechecks = [
    { id: 'uuid-recheck-1', submissionId: 'uuid-sub-1', studentName: 'Student A', issue: 'Grading seems incorrect.' },
    { id: 'uuid-recheck-2', submissionId: 'uuid-sub-2', studentName: 'Student B', issue: 'Partial credit missing.' },
  ];

  return (
    <div>
      <p>TODO: Fetch pending recheck requests from Supabase.</p>
      {pendingRechecks.length === 0 ? (
        <p>No pending recheck requests.</p>
      ) : (
        <ul>
          {pendingRechecks.map(recheck => (
            <li key={recheck.id} className="border p-4 mb-4 rounded">
              <p><strong>Submission ID:</strong> {recheck.submissionId}</p>
              <p><strong>Student:</strong> {recheck.studentName}</p>
              <p><strong>Issue:</strong> {recheck.issue}</p>
              {/* TODO: Add button to view submission details (PDF, evaluation) */}
              <details className="mt-2">
                <summary className="cursor-pointer">Respond to Request</summary>
                <RecheckResponseForm recheckId={recheck.id} />
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecheckList;