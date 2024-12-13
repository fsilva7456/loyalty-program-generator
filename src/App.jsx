import React, { useState } from 'react';

function App() {
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [programData, setProgramData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('improved');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setProgramData(null);
    
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
      setProgramData(data);
      setActiveTab('improved');
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

  const renderProgram = (program) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-2">{program.programName}</h2>
      <p className="text-gray-600 mb-6">{program.description}</p>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Point System</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p><strong>Earning:</strong> {program.pointSystem.earning}</p>
          <p><strong>Redemption:</strong> {program.pointSystem.redemption}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Membership Tiers</h3>
        {program.tiers.map(renderTier)}
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Special Perks</h3>
        <ul className="list-disc pl-6">
          {program.specialPerks.map((perk, index) => (
            <li key={index} className="mb-1">{perk}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-3">Sign-up Process</h3>
        <p className="text-gray-600">{program.signupProcess}</p>
      </div>
    </div>
  );
