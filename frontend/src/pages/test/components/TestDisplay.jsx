// Simple display component for the test page data

function TestDisplay({ testValues }) { // Changed prop name to testValues (plural)
  return (
    <div className="p-4 border rounded bg-gray-50">
      <h3 className="text-lg font-semibold mb-3">Current Values in `test_table`:</h3>
      {testValues && testValues.length > 0 ? (
        <ul className="list-disc list-inside">
          {testValues.map((item, index) => (
            <li key={item.id || index} className="mb-1">
              {item.value} (ID: {item.id || 'N/A'})
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No values found or still loading...</p>
      )}
    </div>
  );
}

export default TestDisplay;
