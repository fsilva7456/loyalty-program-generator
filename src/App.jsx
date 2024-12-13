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
              {Object.keys(drivers).map(driverKey => (
                <button
                  key={driverKey}
                  onClick={() => setActiveTab(driverKey)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === driverKey
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {drivers[driverKey].name} Analysis
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
          {Object.keys(drivers).map(driverKey => 
            activeTab === driverKey && renderDriverAnalysis(driverKey)
          )}
          {activeTab === 'improved' && renderProgram(programData.improved)}
        </div>
      )}
    </div>
  );
}

export default App;