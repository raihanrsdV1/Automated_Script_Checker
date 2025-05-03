import RecheckList from './components/RecheckList';

function RecheckerDashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Rechecker Dashboard</h1>
      <p className="mb-4">Welcome, Teacher/Moderator! View and respond to pending recheck requests.</p>

      <section>
        <h2 className="text-xl font-semibold mb-2">Pending Recheck Requests</h2>
        <RecheckList />
        {/* TODO: Fetch and display pending rechecks */}
      </section>
    </div>
  );
}

export default RecheckerDashboard;