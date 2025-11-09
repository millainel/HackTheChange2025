

import React, { useState, useEffect, useContext, createContext } from 'react';
import { CredentialsContext } from './PersonLogin';
import { useNavigate } from 'react-router-dom';
import './PersonLogin.css';


export const AuthContext = createContext();

function AuthMessage() {
    const navigate = useNavigate();

    const [showMessage, setShowMessage] = useState(false);

    const { username, password, loginPressed } = useContext(CredentialsContext);

    console.log("IN AUTH MESSAGE");
    console.log(username);
    console.log(loginPressed);
    const [message, setMessage] = useState("");
    const [type, setType] = useState("");




    function handleAuthentication() {

        
        setShowMessage(false);

        fetch('http://localhost:5000/PersonalLogin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'username': username, 'password': password })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Authentication Failed');
            }
        })
        .then(data => {
            if (data.success) {
                setMessage(data.message);
                setType("Success:");

                setShowMessage(true);
         
                setTimeout(() => {
                    navigate(`/PersonSignup`); 
                }, 2000);
            } else {
                setMessage(data.message);
                setType("Error:");
                setShowMessage(true);
            }
        })
        .catch(error => {
            setMessage('Authentication failed. Please try again');
            setType("Error:");
        });
    }



    useEffect(() => {
        if (loginPressed) {
            handleAuthentication();
        }
    }, [loginPressed]);

    return (
        <>
            {showMessage && (
                <>
                    <br />
                    <div className={`message-box ${type === "Success:" ? "success" : "error"}`}>
                        <p>{type} {message}</p>
                    </div>
                </>
            )}
        </>
    );
}

export default AuthMessage;
