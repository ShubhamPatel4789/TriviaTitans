import React, { useState } from 'react';
import axios from 'axios';

const EditProfile = () => {

  const userId = localStorage.getItem('userId');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'https://iyuu60o1xj.execute-api.us-east-1.amazonaws.com/stage1',
        {
          body: JSON.stringify({
            userId,
            name,
            username,
            contactInfo,
          }),
        }
      );
      console.log('User information updated:', response.data);
    } catch (error) {
      console.error('Error updating user information:', error);
    }
  };



  return (
    <div>
      <h2>Edit Personal Information</h2>
      <form onSubmit={handleFormSubmit}>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label>username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label>Contact Information:</label>
        <input
          type="text"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
        />
        <button type="submit">Save</button>
      </form>
    </div>
  );
};
export default EditProfile;
