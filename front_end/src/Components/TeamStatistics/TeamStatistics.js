import React, { useState } from 'react';
import './TeamStatistics.css'; // Import the CSS file

const TeamStatistics = ({ teamName, gamesPlayed, wins, losses, totalPoints, fetchTeamDetails }) => {
  
  // Calculate win/loss ratio
  const winLossRatio = wins && losses ? (wins / (wins + losses)) * 100 : 0;

  // State to hold the input value for the team name
  const [inputTeamName, setInputTeamName] = useState('');

  // Handler for the text box input change
  const handleInputChange = (event) => {
    setInputTeamName(event.target.value);
  };

  // Handler for the fetch button click
  const handleFetchButtonClick = () => {
    // Call the fetchTeamDetails function passed from the parent component
    fetchTeamDetails(inputTeamName);
  };

  return (
    <div>
      <h1>Team Management</h1>
    
    <div className="team-statistics">
      
      <h2>{teamName} Team Statistics</h2>
      <p>
        <span className="label">Games Played:</span> <span className="label-value">{gamesPlayed}</span>
      </p>
      <p>
        <span className="label">Wins:</span> <span className="label-value">{wins}</span>
      </p>
      <p>
        <span className="label">Losses:</span> <span className="label-value">{losses}</span>
      </p>
      <p>
        <span className="label">Win/Loss Ratio:</span> <span className="label-value">{winLossRatio.toFixed(2)}%</span>
      </p>
      <p>
        <span className="label">Total Points Earned:</span> <span className="label-value">{totalPoints}</span>
      </p>
      <div className="fetch-team-details">
        <input type="text" value={inputTeamName} onChange={handleInputChange} placeholder="Enter team name" />
        <button onClick={handleFetchButtonClick}>Fetch Team Details</button>
      </div>
    </div>
    </div>
  );
};

export default TeamStatistics;
