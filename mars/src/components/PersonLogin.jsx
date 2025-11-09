import React, { useState, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './PersonLogin.css';
import AuthMessage from './AuthMessage';
import Aurora from './Aurora';
import CustomerFillable from './CustomerFillable';

export const CredentialsContext = createContext();

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [loginPressed, setLoginPressed] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();

        setLoginPressed((old) => old + 1);
        // if (username && password) {
        //     //localStorage.setItem('isLoggedIn', 'true');
        //     //navigate('/CustomerFillable');
        // } else {
        //     setError('Please enter username and password');
        // }
    };

    return (
        <div className="login-container">
            <Aurora
                colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
                blend={0.5}
                amplitude={1.0}
                speed={0.5}
            />
            <div className="login-box">
                <h1>Welcome to MARS, User</h1>
                <h2>Please log in to continue filling your information</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="login-button">
                        Log In 
                    </button>
                </form>
            </div>
            <div>
                <h1> HIIIIIIIIIIIIIIIII</h1>
                <CredentialsContext.Provider value={{ username, password, loginPressed }}>
					<AuthMessage />
				</CredentialsContext.Provider>
            </div>

        </div>
    );
};

export default Login;