import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, Button, TableHead, TableRow, Paper } from '@mui/material';

const EditProfile = () => {
  const userEmail = localStorage.getItem('userEmail');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState('');
  const [teamName, setTeamName] = useState('');
  const [isInTeam, setIsInTeam] = useState(false);

  useEffect(() => {
    fetchUserDetails();
    fetchUserTeamDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.post(
        'https://z2udydjwzj.execute-api.us-east-1.amazonaws.com/stage1',
        {
          body: JSON.stringify({
            "user_email": userEmail,
            "action": "fetch"
          }),
        }
      );
      console.log('User details:', response.data.body);
      setUser(JSON.parse(response.data.body));
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setIsLoading(false);
    }
  };

  const fetchUserTeamDetails = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        'https://jc51s5am6l.execute-api.us-east-1.amazonaws.com/stage1',
        {
          body: JSON.stringify({
            "user_email": userEmail,
            "action": "fetch"
          }),
        }
      );
      console.log('User teams details:', response.data.body);
      const teamsData = JSON.parse(response.data.body);
      console.log('Teams data:', teamsData);
      const userTeams = teamsData.filter(teamName => teamName.CurrentMembers.includes(userEmail));
      console.log('User teams:', userTeams);
      setTeamName(userTeams);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setIsLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    setIsLoading(true);
    try {
      // Fetch the current team details
      const response = await axios.post(
        'https://jc51s5am6l.execute-api.us-east-1.amazonaws.com/stage1',
        {
          body: JSON.stringify({
            "user_email": userEmail,
            "action": "fetch"
          }),
        }
      );
      const teamsData = JSON.parse(response.data.body);
      const team = teamsData[0];
  
      // Remove the current user from the CurrentMembers array
      const updatedMembers = team.CurrentMembers.filter(member => member !== userEmail);
  
      // Update the team details with the new CurrentMembers array
      const updatedTeam = {
        ...team,
        CurrentMembers: updatedMembers,
      };
      console.log('Updated team:', updatedTeam)
  
      // Send the updated team details to the Lambda function
      const updateResponse = await axios.post(
        'https://jc51s5am6l.execute-api.us-east-1.amazonaws.com/stage1',
        {
          body: JSON.stringify({
            "user_email": userEmail,
            "team_name": teamName,
            "teamName": teamName,
            "team_data": updatedTeam,
            "action": "update"
          }),
        }
      );
      console.log('Leave team response:', updateResponse.data);
      fetchUserTeamDetails();
    } catch (error) {
      console.error('Error leaving team:', error);
      setIsLoading(false);
    }
  };

  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'https://z2udydjwzj.execute-api.us-east-1.amazonaws.com/stage1',
        {
          body: JSON.stringify({
            "user_email": userEmail,
            "action": "update",
            "new_first_name": firstName,
            "new_last_name": lastName,
            "new_username": username,
          }),
        }
      );
      console.log('User information updated:', response.data);
    } catch (error) {
      console.error('Error updating user information:', error);
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>Edit Personal Information</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>First Name</TableCell>
            <TableCell>Last Name</TableCell>
            <TableCell>User Name</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>{user.first_name}</TableCell>
            <TableCell>{user.last_name}</TableCell>
            <TableCell>{user.user_email}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      {teamName.length > 0 && (
      <div>
        <h3>Team Information</h3>
        <ul>
          {teamName.map(team => (
            <li key={team.teamName}>
              <p>Team Name: {team.teamName}</p>
              {team.currentMembers && (
                <p>Current Members: {team.currentMembers.join(', ')}</p>
              )}
              <Button onClick={handleLeaveTeam} variant="outlined" color="secondary">
                Leave Team
              </Button>
            </li>
          ))}
        </ul>
      </div>
    )}
          <h3>Update Personal Information</h3>
          <form onSubmit={handleFormSubmit}>
            <label>First Name:</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <label>Last Name:</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button type="submit">Save</button>
          </form>
        </div>
      );
};

      export default EditProfile;
