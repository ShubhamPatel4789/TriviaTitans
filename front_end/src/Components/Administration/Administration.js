import React, { useState, useEffect, useCallback  } from 'react';

// import './Administration.css'; // Import the CSS file
import './Administration.css';
const Administration = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamName, setTeamName] = useState('');
  // const admin = "";
  const [admin, setAdmin] = useState('');
  const [logged_in_user_email, setlogged_in_user_email] = useState('');
  
  // const apiURL = `https://w7b2jmg6rc.execute-api.us-east-1.amazonaws.com`;
  
  const apiURL = `https://xiayg5tk76.execute-api.us-east-1.amazonaws.com`;
  // const apiURL = `http://localhost:5000`;
  

  // Function to fetch admin information based on the teamName
  const fetchAdmin = useCallback(async (teamName) => {
    try {
     
      const response = await fetch(`${apiURL}/get-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "team_name": team
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Admin:',data.admin_email)
        // console.log(typeof admin)
        // admin = data.admin_email;
        setAdmin(data.admin_email);
        setlogged_in_user_email(data.admin_email);
        // console.log('Admin:', data.);
      } else {
        console.error('Error:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [apiURL]);
  
  const team = "Quiztify"
  // Function to fetch team members based on the teamName
  const fetchTeamMembers = useCallback (async (teamName) => {
    try {
      
      const response = await fetch(`${apiURL}/get-current-members/${team}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
      } else {
        console.error('Error:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [apiURL]);

  useEffect(() => {
    // Retrieve the teamName from local storage
    const storedTeamName = localStorage.getItem('teamName');
    const storedUserEmail = localStorage.getItem('email');
    
    if (storedTeamName) {
      setTeamName(storedTeamName);
      fetchTeamMembers(storedTeamName); // Fetch team members after loading the teamName
      fetchAdmin(storedTeamName); // Fetch admin information after loading the teamName
    }
  }, [fetchTeamMembers, fetchAdmin]);
  const handleRemoveMember = async (email) => {
    try {
      const response = await fetch(`${apiURL}/remove-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "team_name": team,
          "email": email
        })
      });

      if (response.ok) {
        console.log('Member removed:', email);
        // Update the team members list after removing the member
        setTeamMembers((prevMembers) => prevMembers.filter((member) => member !== email));
      } else {
        console.error('Error:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handlePromoteToAdmin = async (email) => {
    try {
      const response = await fetch(`${apiURL}/promote-to-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "promote_to_admin": email,
          "team_name": team,
        }),
      });

      if (response.ok) {
        console.log('Member promoted to admin:', email);
        // Update the admin state after promoting a member
        setAdmin(email);
      } else {
        console.error('Error:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Function to handle leaving the team
  const handleLeaveTeam = async () => {
    try {
      const response = await fetch(`${apiURL}/leave-team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "email": logged_in_user_email, // Assuming admin is the current user's email
          "team_name": team,
        })
      });

      if (response.ok) {
        console.log('Left the team');
        alert("Left the team")
        window.location.reload();
        // Redirect to another page or handle the leave action as needed
      }else if (response.status === 400) {
        console.error("Cannot leave team!! You are the admin. Promote someone to admin and leave.");
        alert("Cannot leave team!! You are the admin. Promote someone to admin and leave.");
      } 
      else {
        console.error('Error:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {/* Leave Team Button */}
      <button className="leave-button" onClick={handleLeaveTeam}>Leave Team</button>
      <h1 align="center">Team Management</h1>
      <h2>Team Name: {teamName}</h2>
      {admin && <p><b>Admin:</b> {admin}</p>}
      {teamMembers.length > 0 ? (
        <ul>
          {teamMembers.map((member, index) => (
            <li key={index}>
              {member} <button onClick={() => handleRemoveMember(member)}>X</button>
              <button onClick={() => handlePromoteToAdmin(member)}>Promote to Admin</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No members present.</p>
      )}
    </div>
  );
};

export default Administration;
