import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate  } from 'react-router-dom';

const InviteUsersPage = () => {
  const { teamName } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailList, setEmailList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  
  // const invite_users_URL = `https://w7b2jmg6rc.execute-api.us-east-1.amazonaws.com/invite-users/${teamName}`;
  const invite_users_URL = `https://8qv04lo2b2.execute-api.us-east-1.amazonaws.com//invite-users/${teamName}`;
  // const invite_users_URL = `http://localhost:5000/invite-users/${teamName}`;
  const handleAddEmail = () => {
    if (validateEmail(email)) {
      setEmailList([...emailList, email]);
      setEmail('');
      setErrorMessage('');
    } else {
      setErrorMessage('Please enter a valid email address.');
    }
  };

  // Function to add the teamName to local storage
  const storeTeamNameInLocalStorage = (teamName) => {
    localStorage.setItem('teamName', teamName);
  };
  const storeUserEmailInLocalStorage = (email) => {
    localStorage.setItem('email', email);
  };
  // Store the teamName in local storage when the component mounts
  storeTeamNameInLocalStorage(teamName);
  storeUserEmailInLocalStorage(email);

  
  const validateEmail = (email) => {
    // Use a regular expression pattern to validate the email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleRemoveEmail = (index) => {
    const updatedList = emailList.filter((_, i) => i !== index);
    setEmailList(updatedList);
  };

  const handleSendInvites = async () => {
    try {
      const response = await fetch(invite_users_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailList }),
      });
  
      if (response.ok) {
        console.log('Invitations sent:', emailList);
        alert("Invitations sent");
        setEmailList([]);
        navigate('/administration')
      } else {
        console.error('Error:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  return (
    <div>
      <h1>Invite Users</h1>
      <h2>Team Name : {teamName}</h2>
      <div>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
        />
        <button onClick={handleAddEmail}>Add</button>
      </div>
      {errorMessage && <p>{errorMessage}</p>}
      {emailList.length > 0 && (
        <ul>
          {emailList.map((email, index) => (
            <li key={index}>
              {email}{' '}
              <button onClick={() => handleRemoveEmail(index)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
      {emailList.length > 0 && (
        <button onClick={handleSendInvites}>Send Invitations</button>
      )}
    </div>
  );
};

export default InviteUsersPage;
