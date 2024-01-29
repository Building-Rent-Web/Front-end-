import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentView.css';
import logo from './logo.png';
import Select from 'react-select';
import Modal from 'react-modal';
import axios from 'axios';

Modal.setAppElement('#root'); 

function PaymentSuccess() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/'); // Navigate back to the home page or a relevant page
  };

  return (
    <div className="payment-view">
        <header className="payment-header">
            <div className="logo-and-name">
                <img src={logo} alt="Logo" className="logo" />
                <span className="building-name">CloudNuts MANAGEMENT</span>
            </div>
            
            </header>
      <h1>Payment Successful</h1>
      <p>Your payment has been processed successfully.</p>
      
      {/* You can include more details here if you wish */}
      
      <button onClick={handleGoBack}>
        Go Back to Home
      </button>
    </div>
  );
}

export default PaymentSuccess;
