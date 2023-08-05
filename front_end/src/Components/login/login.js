import React, { useState } from 'react';
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
    const [resetEmail, setResetEmail] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);

    const handleEmailPasswordLogin = async (event) => {
        event.preventDefault();

        try {
            setResetSuccess(false); 
            // Sign in the user with email/password
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);

            const userId = userCredential.user.uid;
            console.log('Logged in with email and password successfull:', userCredential.user);
            // Redirect to the landing page after successful login
            localStorage.setItem('userId', userId);
            localStorage.setItem('userEmail', email);
            setLoggedIn(true);
            navigate("/loginmfa", { state: { userId: userId } });// Replace '/landing' with the actual path of your landing page
            
        } catch (error) {
            console.log('Email/password login failure:', error.message);
            setLoginError('Invalid email or password.');
        }
    };

    const handleForgotPassword = async ({setResetSuccess}) => {
        try {
            await firebase.auth().sendPasswordResetEmail(resetEmail);
            setResetSuccess(true);
        } catch (error) {
            console.log('Error sending reset email:', error);
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
                localStorage.setItem('userEmail', user.email);
                user.getIdToken().then((idToken) => {
                    console.log("Token of the user" + idToken);

                    // IdP data available using getAdditionalUserInfo(result)
                    // ...

                    console.log(user);
                    const userId = user.uid;
                    localStorage.setItem('userId', userId);
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
    // const signInWithFacebook = async () => {
    //     // Sign in with the Facebook popup
    //     const result = await signInWithPopup(auth, FacebookAuthProvider);
    //     console.log(result);
    //     // Get the user data
    //     const user = result.user;
    
    //     // Return the user object
    //     return user;
    // };

    const handleFacebookLogin = async () => {
        try {
          // Create a new Facebook auth provider instance
          const provider = new firebase.auth.FacebookAuthProvider();
    
          // Sign in with the Facebook popup
          const result = await firebase.auth().signInWithPopup(provider);
    
          // Get the user data
          const user = result.user;
          const userId = user.uid;
    
          // Check if the user already exists in Firestore
          const userRef = firebase.firestore().collection('users').doc(userId);
          const doc = await userRef.get();
    
          if (!doc.exists) {
            // If the user does not exist, create a new user document in Firestore
            await userRef.set({
              name: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
            });
          }
    
          // Redirect to the landing page after successful login
          localStorage.setItem('userId', userId);
          navigate('/loginmfa');
        } catch (error) {
          console.error('Facebook login error:', error);
          setError(error.message);
        }
      };



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
                <button type="submit"  >Login</button>
            </form>
            <form>

                <label htmlFor="reset-email-input">Forgot your password? Enter your email:</label>
                <input
                    type="email"
                    placeholder="Email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    id="reset-email-input"
                />
                <button onClick={handleForgotPassword}>Send Reset Email</button>
                {resetSuccess && <div className="success">Password reset email sent!</div>}
            </form>
            {/* Google Login */}
            <button
                onClick={handleGoogleLogin}
                className="google-login-button"
            >
                Continue with Google
            </button>
            <button
                onClick={handleFacebookLogin}
                className="facebook-login-button"
            >
                Continue with Facebook
            </button>


            {/* Registration Link */}
            <p>Don't have an account? <a href="/register">Register here</a></p>
        </div>

    );
};

export default Login;
