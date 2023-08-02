import React, { useState } from 'react';
import FacebookLogin from 'react-facebook-login';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import firebaseConfig from '../../firebaseConfig';
import './login.css';
import { useNavigate } from 'react-router-dom';

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const navigate = useNavigate();

    const handleEmailPasswordLogin = async (event) => {
        event.preventDefault();

        try {
            // Sign in the user with email/password
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);

            const userId = userCredential.user.uid;
            console.log('Logged in with email and password successfull:', userCredential.user);
            // Redirect to the landing page after successful login
            navigate("/loginmfa", { state: { userId: userId } });// Replace '/landing' with the actual path of your landing page
        } catch (error) {
            console.log('Email/password login failure:', error.message);
            setLoginError('Invalid email or password.');
        }
    };
    const handleGoogleLogin = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        const auth = firebase.auth();
        console.log("Google Register");

        auth.signInWithPopup(provider)
            .then((result) => {
                console.log("Inside the google method");

                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = firebase.auth.GoogleAuthProvider.credentialFromResult(result);
                // The signed-in user info.
                const user = result.user;
                user.getIdToken().then((idToken) => {
                    console.log("Token of the user" + idToken);

                    // IdP data available using getAdditionalUserInfo(result)
                    // ...

                    console.log(user);
                    const userId = user.uid;
                    console.log("User Id: " + userId);
                    console.log("User Credentials: " + credential);
                    console.log("Register success: " + result);
                    navigate("/loginmfa", { state: { userId: userId } });
                });
            }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData?.email;
                // The AuthCredential type that was used.
                const credential = firebase.auth.GoogleAuthProvider.credentialFromError(error);

                console.log(errorCode);
                console.log(errorMessage);
                console.log(email);
                console.log(credential);

                alert(errorMessage);
            });
    };

    
    // const handleFacebookLoginSuccess = async (response) => {
    //     // Sign in the user with Facebook
    //     const credential = firebase.auth.FacebookAuthProvider.credential(response.accessToken);
    //     const userCredential = await firebase.auth().signInWithCredential(credential);

    //     console.log('Logged in with Facebook:', userCredential.user);
    //     // You can redirect to the main page or handle the login success here
    // };

    // const handleFacebookLoginFailure = (error) => {
    //     console.log('Facebook login failure:', error);
    //     // Handle the login failure here
    // };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleEmailPasswordLogin}>
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

                {loginError && <div className="error">{loginError}</div>}

                {/* Submit button */}
                <button type="submit">Login</button>
            </form>
            {/* Google Login */}

            <button
                onClick={handleGoogleLogin}
                className="google-login-button"
            >
                Continue with Google
            </button>

            {/* Registration Link */}
            <p>Don't have an account? <a href="/register">Register here</a></p>
        </div>

    );
};

export default Login;
