import React, { useState } from 'react';
import { useNavigate  } from 'react-router-dom';

import './LandingPage.css';

const LandingPage = () => {
  const [generatedName, setGeneratedName] = useState('');
  const [confirmedName, setConfirmedName] = useState('');
  const navigate = useNavigate();
  const generate_name_URL = "http://localhost:5000/generate-team-name";

  const handleGenerateName = async () => {
    try {
      let tries = 0;
      let generated = false;
      while (tries < 3 && !generated) {
        const response = await fetch(generate_name_URL, {
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
    const confirm_name_URL = "http://localhost:5000/confirm-team-name";
    try {
      const response = await fetch(confirm_name_URL, {
        method: 'POST',
        body: JSON.stringify({ teamName: generatedName }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        console.log("Confirmed name",generatedName )
        setConfirmedName(generatedName);
      } else {
        console.error('Error:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleInviteUsers = () => {
    navigate(`/invite-users/${generatedName}`); // Navigate to the "Invite" page
  };

  return (
    <div>
      <h1>Team Management</h1>
      <button onClick={handleGenerateName}>Generate Team Name</button>
      <p>(max 3 tries)</p>
      {generatedName && <p>Generated Name: {generatedName}</p>}
      <button onClick={handleConfirmName} disabled={!generatedName}>
        Confirm
      </button>
      {confirmedName && <p>Confirmed Name: {confirmedName}</p>}
      <br/><br/><br/>
      <button onClick={handleInviteUsers}>Invite Users</button>
    </div>
  );
};

export default LandingPage;




// import React, { useState } from 'react';
// import './LandingPage.css';

// const LandingPage = () => {
//   const [userPrompt, setUserPrompt] = useState('');
//   const [generatedName, setGeneratedName] = useState('');
//   const [confirmedName, setConfirmedName] = useState('');
//   const requestPayload = {
//     "userPrompt": userPrompt
//   };
//   const apiURL = "http://localhost:5000/generate-team-name";

//   const handleGenerateName = async (event) => {
//     event.preventDefault();
//     try {
//       const response = await fetch(apiURL, {
//         method: 'POST',
//         mode: 'no-cors',
//         data: userPrompt,
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(requestPayload)
//       });
//       if(response.ok){
//         const data = await response.json();
//         setGeneratedName(data.generatedName);
//         console.log(userPrompt);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const handleConfirmName = () => {
//     setConfirmedName(generatedName);
//   };

//   const handleUserPromptChange = (e) => {
//     setUserPrompt(e.target.value);
//   };

//   return (
//     <div className="container">
//       <h1>Team Management</h1>
//       <form>
//         <label>
//           User Prompt:
//           <input
//             type="text"
//             value={userPrompt}
//             onChange={handleUserPromptChange}
//             placeholder="Enter your name preferences"
//           />
//         </label>
//       </form>
//       <button onClick={handleGenerateName}>Generate</button>
//       <br />
//       <button onClick={handleConfirmName}>Confirm Name</button>
//       {generatedName && <p>Generated Name: {generatedName}</p>}
//       {confirmedName && <p>Confirmed Name: {confirmedName}</p>}
//     </div>
//   );
// };

// export default LandingPage;
