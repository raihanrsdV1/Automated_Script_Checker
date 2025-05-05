import { useState, useEffect } from 'react';
import { fetchUserSubmissions, requestRecheck } from '../../../api/submissions';
import { MathJax } from 'better-react-mathjax';

function SubmissionHistory() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recheckIssue, setRecheckIssue] = useState('');
  const [recheckSubmissionId, setRecheckSubmissionId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setLoading(true);
        const data = await fetchUserSubmissions();
        setSubmissions(data);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to load your submission history');
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, []);

  const openRecheckModal = (submissionId) => {
    setRecheckSubmissionId(submissionId);
    setIsModalOpen(true);
  };

  const closeRecheckModal = () => {
    setIsModalOpen(false);
    setRecheckSubmissionId(null);
    setRecheckIssue('');
  };

  const handleRecheckSubmit = async (e) => {
    e.preventDefault();
    
    if (!recheckIssue.trim()) {
      return;
    }
    
    try {
      await requestRecheck(recheckSubmissionId, recheckIssue);
      
      // Update submission status locally after recheck is requested
      setSubmissions(submissions.map(submission => 
        submission.id === recheckSubmissionId
          ? { ...submission, recheck_requested: true }
          : submission
      ));
      
      closeRecheckModal();
    } catch (err) {
      console.error('Error requesting recheck:', err);
      setError('Failed to request recheck. Please try again later.');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading submission history...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">{error}</div>;
  }

  if (submissions.length === 0) {
    return <div className="text-center py-8 text-gray-500">You haven't submitted any answers yet.</div>;
  }

  return (
    <div>
      {/* Submission History */}
      <div className="space-y-6">
        {submissions.map((submission) => (
          <div key={submission.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {submission.question_set_name} - {submission.question_text}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Submitted {new Date(submission.created_at).toLocaleString()}
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <dl>
                <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <span 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${submission.evaluated ? 
                            (submission.recheck_requested ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800') : 
                            'bg-blue-100 text-blue-800'}`}
                      >
                        {submission.evaluated ? 
                          (submission.recheck_requested ? 'Recheck Requested' : 'Evaluated') : 
                          'Pending Evaluation'}
                      </span>
                    </dd>
                  </div>

                  {submission.evaluated && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Result</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {submission.result ? `${submission.result} / ${submission.question_marks}` : 'N/A'}
                      </dd>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Your Solution PDF</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {submission.solution_pdf_url ? (
                        <a 
                          href={submission.solution_pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-500"
                        >
                          View PDF
                        </a>
                      ) : (
                        'PDF not available'
                      )}
                    </dd>
                  </div>

                  {submission.extracted_text && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Extracted Text</dt>
                      <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded overflow-auto max-h-40">
                        {submission.extracted_text}
                      </dd>
                    </div>
                  )}

                  {submission.evaluated && submission.feedback && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Feedback</dt>
                      <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                        {submission.feedback}
                      </dd>
                    </div>
                  )}
                </div>
              </dl>

              {/* Action buttons */}
              <div className="mt-4 flex justify-end">
                {submission.evaluated && !submission.recheck_requested && (
                  <button
                    type="button"
                    onClick={() => openRecheckModal(submission.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Request Recheck
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recheck Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Request a Recheck</h3>
            
            <form onSubmit={handleRecheckSubmit}>
              <div className="mb-4">
                <label htmlFor="recheck-issue" className="block text-sm font-medium text-gray-700 mb-1">
                  Please describe why you think this evaluation needs a recheck:
                </label>
                <textarea
                  id="recheck-issue"
                  rows={4}
                  value={recheckIssue}
                  onChange={(e) => setRecheckIssue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your issue with the evaluation..."
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeRecheckModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={!recheckIssue.trim()}
                >
                  Submit Recheck Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubmissionHistory;