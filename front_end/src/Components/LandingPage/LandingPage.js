import React, { useState } from 'react';
import { useNavigate  } from 'react-router-dom';

import './LandingPage.css';

const LandingPage = () => {
  const [generatedName, setGeneratedName] = useState('');
  const [confirmedName, setConfirmedName] = useState('');
  const navigate = useNavigate();
  // const generate_name_URL = "https://w7b2jmg6rc.execute-api.us-east-1.amazonaws.com/generate-team-name";
  // const generate_name_URL = `https://8qv04lo2b2.execute-api.us-east-1.amazonaws.com/generate-team-name`;
  // const generate_name_URL = "http://localhost:5000/generate-team-name";
  const apiURL = `https://8qv04lo2b2.execute-api.us-east-1.amazonaws.com`;
  const handleGenerateName = async () => {
    try {
      let tries = 0;
      let generated = false;
      while (tries < 3 && !generated) {
        const response = await fetch(`${apiURL}/generate-team-name`, {
          method: 'POST',
        });
        if (response.ok) {
          const data = await response.json();
          setGeneratedName(data);
          setConfirmedName('');
          console.log(data);
          generated = true;
        } else {
          const errorText = await response.text();
          console.error('Error:', errorText);
          tries++;
        }
      }
      if (!generated) {
        console.log('Failed to generate team name after 3 tries.');
        alert("Try again after some time!!")
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const handleConfirmName = async () => {
    // const confirm_name_URL = "https://w7b2jmg6rc.execute-api.us-east-1.amazonaws.com/confirm-team-name";
    // const confirm_name_URL = "http://localhost:5000/confirm-team-name";
    try {
      const response = await fetch(`${apiURL}/confirm-team-name`, {
        method: 'POST',
        body: JSON.stringify({ teamName: generatedName }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        console.log("Confirmed name", generatedName);
        setConfirmedName(generatedName);
      } else {
        console.error('Error:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleInviteUsers = () => {
    if (confirmedName) {
      navigate(`/invite-users/${generatedName}`); // Navigate to the "Invite" page
    }
  };

  return (
    <div>
      <h1 align="center">Team Management</h1>
      <button onClick={handleGenerateName}>Generate Team Name</button>
      <p>(max 3 tries)</p>
      {generatedName && <p>Generated Name: {generatedName}</p>}
      <button onClick={handleConfirmName} disabled={!generatedName}>
        Confirm
      </button>
      {confirmedName && <p>Confirmed Name: {confirmedName}</p>}
      <br/><br/><br/>
      <button onClick={handleInviteUsers} disabled={!confirmedName}>
        Invite Users
      </button>
    </div>
  );
};

export default LandingPage;
