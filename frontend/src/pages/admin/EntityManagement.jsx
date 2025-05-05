import React, { useState } from 'react';
import SubjectManagement from './SubjectManagement';
import ClassManagement from './ClassManagement';

const EntityManagement = () => {
  const [activeTab, setActiveTab] = useState('subjects');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Academic Entity Management</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`px-6 py-3 text-lg font-medium ${
            activeTab === 'subjects' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('subjects')}
        >
          Subjects
        </button>
        <button
          className={`px-6 py-3 text-lg font-medium ${
            activeTab === 'classes' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('classes')}
        >
          Classes
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="mt-4">
        {activeTab === 'subjects' && <SubjectManagement />}
        {activeTab === 'classes' && <ClassManagement />}
      </div>
    </div>
  );
};

export default EntityManagement;