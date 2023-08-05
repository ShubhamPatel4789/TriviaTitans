import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import AWS from 'aws-sdk';

const MultiFactorAuth = () => {
    
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();
    const [q1, setQ1] = useState('');
    const [q2, setQ2] = useState('');
    const [q3, setQ3] = useState('');

    const handleFormSubmit = (event) => {
        event.preventDefault();

        // Configure DynamoDB client
        const docClient = new AWS.DynamoDB.DocumentClient();

        // Define the item to be stored in DynamoDB
        const item = {
            userId: userId,
            question1: q1,
            question2: q2,
            question3: q3
        };

        // Parameters for the put operation
        const params = {
            TableName: 'mfaQA',
            Item: item
        };

        // Put the item in DynamoDB
        docClient.put(params, (err, data) => {
            if (err) {
                console.error('Error saving answers:', err);
            } else {
                console.log('Answers saved to DynamoDB!');
                navigate('/landing-page', { state: { userId: userId } });
            }
        });

        // Clear the form fields after submission
        setQ1('');
        setQ2('');
        setQ3('');
    };
    return (
        <div>
            <h1>Security Questions</h1>
            <form onSubmit={handleFormSubmit}>
                <label htmlFor="q1">Question 1: What is your favorite color?</label>
                <input type="text" id="q1" value={q1} onChange={(e) => setQ1(e.target.value)} required /><br />
                <label htmlFor="q2">Question 2: What is your pet's name?</label>
                <input type="text" id="q2" value={q2} onChange={(e) => setQ2(e.target.value)} required /><br />
                <label htmlFor="q3">Question 3: What city were you born in?</label>
                <input type="text" id="q3" value={q3} onChange={(e) => setQ3(e.target.value)} required /><br />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default MultiFactorAuth;
