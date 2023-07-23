import React, { useState } from 'react';
import GoogleLogin from 'react-google-login';
import FacebookLogin from 'react-facebook-login';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import './register.css';
import 'firebase/auth';
import 'firebase/firestore';
import firebaseConfig from '../../firebaseConfig';

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}


const db = firebase.firestore();

const UserRegistration = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [users, loading, error] = useCollectionData(
        db.collection('users').where('email', '==', email),
        { idField: 'id' }
    );

    const handleRegistration = async (event) => {
        event.preventDefault();

        // Check password strength
        if (!isStrongPassword(password)) {
            setPasswordError('Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one digit.');
            return;
        }

        try {
            // Sign up the user with email/password
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);

            // Add the user's email to their Firestore document
            const userRef = db.collection('users').doc(userCredential.user.uid);
            userRef.set({
                username: username,
                email: email,
            });

            // Add Firebase Authentication code here
            console.log('User registered:', userCredential.user);
        } catch (error) {
            console.log('Error registering user:', error);
        }
    };

    const isStrongPassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        return passwordRegex.test(password);
    };

    const handleGoogleLoginSuccess = async (response) => {
        // Sign in the user with Google
        const credential = firebase.auth.GoogleAuthProvider.credential(response.tokenId);
        const userCredential = await firebase.auth().signInWithCredential(credential);

        // Add the user's email to their Firestore document
        const userRef = db.collection('users').doc(userCredential.user.uid);
        userRef.set({
            email: userCredential.user.email,
        });
    };

    const handleGoogleLoginFailure = (error) => {
        console.log('Google login failure:', error);
    };

    const handleFacebookLoginSuccess = async (response) => {
        // Sign in the user with Facebook
        const credential = firebase.auth.FacebookAuthProvider.credential(response.accessToken);
        const userCredential = await firebase.auth().signInWithCredential(credential);

        // Add the user's email to their Firestore document
        const userRef = db.collection('users').doc(userCredential.user.uid);
        userRef.set({
            email: userCredential.user.email,
        });
    };

    const handleFacebookLoginFailure = (error) => {
        console.log('Facebook login failure:', error);
    };

    return (
        <div className="App">
            <h2>User Registration</h2>
            <form onSubmit={handleRegistration}>
                {/* Username field */}
                <label htmlFor="username-input">Username</label>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    id="username-input"
                />

                {/* Email field */}
                <label htmlFor="email-input">Email</label>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    id="email-input"
                />

                {/* Password field */}
                <label htmlFor="password-input">Password</label>
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    id="password-input"
                />
                {passwordError && <div className="error">{passwordError}</div>}

                {/* Submit button */}
                <button type="submit" id="register-button">Register</button>

                {/* Google Login */}
                <div className="socialButtons">
                    <GoogleLogin
                        clientId="171588375686-dbg2fdc4gkt3t0vevf85gsdmmg7n0f2r.apps.googleusercontent.com"
                        buttonText="Register with Google"
                        onSuccess={handleGoogleLoginSuccess}
                        onFailure={handleGoogleLoginFailure}
                        cookiePolicy={'single_host_origin'}
                        className="google-login-button"
                    />

                    {/* Facebook Login */}
                    <FacebookLogin
                        appId="6444597895621328"
                        fields="name,email,picture"
                        callback={handleFacebookLoginSuccess}
                        onFailure={handleFacebookLoginFailure}
                        cssClass="facebook-login-button"
                        textButton="Register with Facebook"
                        icon="fa-facebook"
                    />
                </div>
            </form >
        </div >
    );
};

export default UserRegistration;