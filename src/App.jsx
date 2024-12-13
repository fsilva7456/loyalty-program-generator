  const renderAccessAnalysis = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Access Driver Analysis</h2>
      
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <h3 className="text-xl font-semibold">Overall Score: </h3>
          <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
            {programData.analysis.accessEvaluation.driverScore}/10
          </span>
        </div>
        <p className="text-gray-700">{programData.analysis.accessEvaluation.overallAssessment}</p>
      </div>

      <div className="space-y-6">
        {Object.entries(programData.analysis.accessEvaluation.subDriverAnalysis).map(([key, analysis]) => {
          const title = key.replace(/([A-Z])/g, ' $1').toLowerCase();
          return (
            <div key={key} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold capitalize">{title}</h4>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {analysis.score}/10
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-green-600">Strengths:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysis.strengths.map((strength, i) => (
                      <li key={i}>{strength}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="font-medium text-red-600">Weaknesses:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysis.weaknesses.map((weakness, i) => (
                      <li key={i}>{weakness}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="font-medium text-blue-600">Suggested Improvements:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysis.improvements.map((improvement, i) => (
                      <li key={i}>{improvement}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
