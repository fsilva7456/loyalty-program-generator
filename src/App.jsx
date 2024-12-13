import React, { useState } from 'react';

function App() {
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [programData, setProgramData] = useState(null);
  const [activeTab, setActiveTab] = useState('initial');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessName }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate program');
      }

      const data = await response.json();
      setProgramData(data);
      setActiveTab('initial');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderProgram = (program) => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">{program.programName}</h2>
        <p className="text-gray-600">{program.description}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Point System</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <p><span className="font-medium">Earning: </span>{program.pointSystem.earning}</p>
          <p><span className="font-medium">Redemption: </span>{program.pointSystem.redemption}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Tiers</h3>
        <div className="space-y-4">
          {program.tiers.map((tier, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium mb-2">{tier.name}</h4>
              <p><span className="font-medium">Requirements: </span>{tier.requirements}</p>
              <div className="mt-2">
                <span className="font-medium">Benefits:</span>
                <ul className="list-disc ml-6 mt-1">
                  {tier.benefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Special Perks</h3>
        <ul className="list-disc ml-6">
          {program.specialPerks.map((perk, index) => (
            <li key={index}>{perk}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Sign-up Process</h3>
        <p>{program.signupProcess}</p>
      </div>
    </div>
  );

  const renderAnalysis = () => {
    if (!programData.analysis) return null;
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Weaknesses</h3>
          <ul className="list-disc ml-6">
            {programData.analysis.weaknesses.map((weakness, index) => (
              <li key={index}>{weakness}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Suggested Improvements</h3>
          <ul className="list-disc ml-6">
            {programData.analysis.suggestedImprovements.map((improvement, index) => (
              <li key={index}>{improvement}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderDriverAnalysis = (driverKey) => {
    const evaluation = programData.analysis.drivers[driverKey];
    if (!evaluation) return null;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Overall Assessment</h3>
          <p>{evaluation.overallAssessment}</p>
          <p className="mt-2">
            <span className="font-medium">Score: </span>
            {evaluation.driverScore}/10
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Sub-Driver Analysis</h3>
          <div className="space-y-4">
            {Object.entries(evaluation.subDriverAnalysis).map(([key, analysis]) => (
              <div key={key} className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{key}</h4>
                  <span className="text-sm bg-gray-200 px-2 py-1 rounded">
                    Score: {analysis.score}/10
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Strengths:</span>
                    <ul className="list-disc ml-6 mt-1">
                      {analysis.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-medium">Weaknesses:</span>
                    <ul className="list-disc ml-6 mt-1">
                      {analysis.weaknesses.map((weakness, index) => (
                        <li key={index}>{weakness}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-medium">Suggested Improvements:</span>
                    <ul className="list-disc ml-6 mt-1">
                      {analysis.improvements.map((improvement, index) => (
                        <li key={index}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Loyalty Program Generator</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="businessName" className="block text-sm font-medium mb-2">
            Business Name
          </label>
          <input
            type="text"
            id="businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Enter your business name"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Generating...' : 'Generate Loyalty Program'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md mb-8">
          {error}
        </div>
      )}

      {programData && (
        <div>
          <div className="mb-4 border-b">
            <nav className="-mb-px flex space-x-6">
              <button
                onClick={() => setActiveTab('initial')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'initial'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Initial Design
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analysis'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Program Analysis
              </button>
              {programData.analysis.drivers && Object.keys(programData.analysis.drivers).map(driverKey => (
                <button
                  key={driverKey}
                  onClick={() => setActiveTab(driverKey)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === driverKey
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {driverKey.charAt(0).toUpperCase() + driverKey.slice(1)} Analysis
                </button>
              ))}
              <button
                onClick={() => setActiveTab('improved')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'improved'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Improved Design
              </button>
            </nav>
          </div>

          {activeTab === 'initial' && renderProgram(programData.initial)}
          {activeTab === 'analysis' && renderAnalysis()}
          {programData.analysis.drivers && Object.keys(programData.analysis.drivers).map(driverKey => 
            activeTab === driverKey && renderDriverAnalysis(driverKey)
          )}
          {activeTab === 'improved' && renderProgram(programData.improved)}
        </div>
      )}
    </div>
  );
}

export default App;