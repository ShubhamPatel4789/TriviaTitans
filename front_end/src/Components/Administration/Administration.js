import React, { useState, useEffect } from 'react';

import './Administration.css'; // Import the CSS file

const Administration = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    // Retrieve the teamName from local storage
    const storedTeamName = localStorage.getItem('teamName');
    if (storedTeamName) {
      setTeamName(storedTeamName);
      fetchTeamMembers(storedTeamName); // Fetch team members after loading the teamName
    }
  }, []);
  const apiURL = `http://localhost:5000`;
  // Function to fetch team members based on the teamName
  const fetchTeamMembers = async (teamName) => {
    try {
      // const response = await fetch();
      const team = "Quiztify";
      const response = await fetch(`${apiURL}/get-current-members/${team}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        // console.log(data);
        setTeamMembers(data);
        console.log(data);
      } else {
        console.error('Error:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1 align="center">Team Management</h1>
      <h2>Team Name: {teamName}</h2>
      {/* Display the list of team members */}
      <ul>
        {teamMembers.map((member, index) => (
          <li key={index}>{member}</li>
        ))}
      </ul>
    </div>
  );
};

export default Administration;
