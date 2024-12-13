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