import React, { useState } from 'react';
import './register.css';
import GoogleLogin from 'react-google-login';
import FacebookLogin from 'react-facebook-login';
import { Auth } from 'aws-amplify';

const UserRegister = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleRegistration = async (event) => {
        event.preventDefault();

        // Check password strength
        if (!isStrongPassword(password)) {
            setPasswordError('Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one digit.');
            return;
        }

        try {
            // Sign up the user with Amplify Auth
            const { user } = await Auth.signUp({
                username,
                password,
                attributes: {
                    email,
                },
            });

            console.log('User registered successfully:', user);
        } catch (error) {
            console.log('Error registering user:', error);
        }
    };

    const isStrongPassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        return passwordRegex.test(password);
    };

    const handleGoogleLoginSuccess = (response) => {
        // Send the Google access token to your backend for user registration or login
        console.log('Google login success:', response);
    };

    // Function to handle Google login failure
    const handleGoogleLoginFailure = (error) => {
        console.log('Google login failure:', error);
    };

    // Function to handle Facebook login success
    const handleFacebookLoginSuccess = (response) => {
        // Send the Facebook access token to your backend for user registration or login
        console.log('Facebook login success:', response);
    };

    // Function to handle Facebook login failure
    const handleFacebookLoginFailure = (error) => {
        console.log('Facebook login failure:', error);
    };

    return (
        <div className="App">
            <h2>User Registration</h2>
            <form onSubmit={handleRegistration}>
                {/* Input fields */}
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {passwordError && <div className="error">{passwordError}</div>}
                <button type="submit">Register</button>

                {/* Google Login */}
                <div className="socialButtons">
                    <GoogleLogin
                        clientId="YOUR_GOOGLE_CLIENT_ID"
                        buttonText="Register with Google"
                        onSuccess={handleGoogleLoginSuccess}
                        onFailure={handleGoogleLoginFailure}
                        cookiePolicy={'single_host_origin'}
                        className="socialButton google" // Apply the socialButton and google classes
                    />

                    {/* Facebook Login */}
                    <FacebookLogin
                        appId="6444597895621328"
                        fields="name,email,picture"
                        callback={handleFacebookLoginSuccess}
                        onFailure={handleFacebookLoginFailure}
                        cssClass="socialButton facebook" // Apply the socialButton and facebook classes
                        textButton="Register with Facebook"
                        icon="fa-facebook"
                    />
                </div>
            </form>
        </div>
    );
};

export default UserRegister;