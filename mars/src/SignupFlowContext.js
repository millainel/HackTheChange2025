import React, { createContext, useContext, useState } from 'react';

const SignupFlowContext = createContext(null);

export const SignupFlowProvider = ({ children }) => {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [profile, setProfile] = useState({
    fname: '', lname: '', gender: '', birth_date: '',
    email: '', address: '', phone: '',
    emergency_contact_name: '', emergency_contact_phone: '',
    device_id: '',
  });
  const [health, setHealth] = useState({
    medical_note: '', blood_type: '', allergy_note: '',
  });

  const resetAll = () => {
    setCreds({ username: '', password: '' });
    setProfile({
      fname: '', lname: '', gender: '', birth_date: '',
      email: '', address: '', phone: '',
      emergency_contact_name: '', emergency_contact_phone: '',
      device_id: '',
    });
    setHealth({ medical_note: '', blood_type: '', allergy_note: '' });
  };

  return (
    <SignupFlowContext.Provider value={{ creds, setCreds, profile, setProfile, health, setHealth, resetAll }}>
      {children}
    </SignupFlowContext.Provider>
  );
};

export const useSignupFlow = () => {
  const ctx = useContext(SignupFlowContext);
  if (!ctx) throw new Error('useSignupFlow must be used inside <SignupFlowProvider>');
  return ctx;
};
