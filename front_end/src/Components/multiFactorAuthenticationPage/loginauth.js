import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import AWS from 'aws-sdk';

const SingleFactorAuth = () => {
    const location = useLocation();
    const userId = location.state?.userId;
    const navigate = useNavigate();
    const [answer, setAnswer] = useState('');
    const [isValidAnswer, setIsValidAnswer] = useState(null);
    const lambda = new AWS.Lambda();

    const handleFormSubmit = (event) => {
        event.preventDefault();

        // Get the authenticated user's ID
        const userId = location.state?.userId;
        console.log(' login mfa userId:', userId);

        // Define the input for the Lambda function
        const input = {
            userId: userId,
            answer: answer
        };

        // Parameters for the invoke operation
        const params = {
            FunctionName: 'authenticateSecurityAnswers',
            Payload: JSON.stringify(input)
        };

        // Invoke the Lambda function
        lambda.invoke(params, (err, data) => {
            if (err) {
                console.error('Error invoking Lambda function:', err);
            } else {
                const response = JSON.parse(data.Payload);
                if (response.isValidAnswer) {
                    setIsValidAnswer(true);
                    navigate('/');
                    // You can redirect to the desired page after successful validation
                    // For example, navigate("/dashboard");
                } else {
                    setIsValidAnswer(false);
                    console.log('Invalid answer. Please try again.');
                }
            }
        });

        // Clear the form field after submission
        setAnswer('');
    };

    return (
        <div>
            <h1>Security Question</h1>
            <form onSubmit={handleFormSubmit}>
                <label htmlFor="answer">What is your favorite color?</label>
                <input type="text" id="answer" value={answer} onChange={(e) => setAnswer(e.target.value)} required /><br />
                <button type="submit">Submit</button>
            </form>
            {isValidAnswer === false && <p>Invalid answer. Please try again.</p>}
        </div>
    );
};

export default SingleFactorAuth;
