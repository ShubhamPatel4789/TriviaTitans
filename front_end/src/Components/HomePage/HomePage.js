// HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      <h1>Team Management</h1>
      <div className="navigation-buttons">
        <Link to="/landing-page">
          <button>Generate a Team </button>
        </Link>
        <Link to="/teamStatistics">
          <button>View Team Stats</button>
        </Link>
        <Link to="/administration">
          <button>Administration</button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
