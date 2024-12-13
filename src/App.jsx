import React, { useState } from 'react';

function App() {
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loyaltyProgram, setLoyaltyProgram] = useState(null);
  const [error, setError] = useState(null);

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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate loyalty program');
      }

      const data = await response.json();
      setLoyaltyProgram(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTier = (tier) => (
    <div key={tier.name} className="mb-4 p-4 border rounded-lg bg-gray-50">
      <h4 className="font-semibold text-lg mb-2">{tier.name}</h4>
      <p className="text-gray-600 mb-2">{tier.requirements}</p>
      <div className="pl-4">
        <p className="font-medium mb-1">Benefits:</p>
        <ul className="list-disc pl-4">
          {tier.benefits.map((benefit, index) => (
            <li key={index}>{benefit}</li>
          ))}
        </ul>
      </div>
    </div>
  );

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

      {loyaltyProgram && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">{loyaltyProgram.programName}</h2>
          <p className="text-gray-600 mb-6">{loyaltyProgram.description}</p>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Point System</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Earning:</strong> {loyaltyProgram.pointSystem.earning}</p>
              <p><strong>Redemption:</strong> {loyaltyProgram.pointSystem.redemption}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Membership Tiers</h3>
            {loyaltyProgram.tiers.map(renderTier)}
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Special Perks</h3>
            <ul className="list-disc pl-6">
              {loyaltyProgram.specialPerks.map((perk, index) => (
                <li key={index} className="mb-1">{perk}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Sign-up Process</h3>
            <p className="text-gray-600">{loyaltyProgram.signupProcess}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;