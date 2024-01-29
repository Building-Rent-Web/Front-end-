import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Googlelogin from './pages/google_login';
import { GoogleOAuthProvider } from '@react-oauth/google';
import PaymentView from './pages/PaymentView';
import PaymentSuccess from './pages/PaymentSuccess';

const clientId = "743827051356-tqskbtvpm1538mbqdu457gcjrbc3ovr2.apps.googleusercontent.com"

function App() {
  return (
    <>
    <GoogleOAuthProvider clientId={clientId}>
    <Routes>
      <Route path="/" element={<Googlelogin/>}></Route>
      <Route path="/login" element={<Googlelogin/>}></Route>
      <Route path="/payment" element={<PaymentView />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
    </Routes> 
    </GoogleOAuthProvider>
    </>
  );
}

export default App;

