import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';
import './PaymentView.css';
import logo from './logo.png';
import Select from 'react-select';
import Modal from 'react-modal';
import axios from 'axios';

Modal.setAppElement('#root'); 

function PaymentView() {
  const options = [
    { value: 'Account', label: 'Account' },
    { value: 'my-profile', label: 'My Profile' },
    { value: 'payment-history', label: 'Payment History' },
    { value: 'add-remove-unit', label: 'Add/Remove Unit' },
  ];
  const [selectedOption, setSelectedOption] = useState(options[0].value);


  const navigate = useNavigate();
  const location = useLocation();

  const userGoogleId = location.state?.userGoogleId;
  const userName = location.state?.userName;
  const userEmail = location.state?.emailAddress;

  const [profileEditBtn, setProfileEditBtn] = useState(false);

  const [tenantId, setTenantId] = useState('');
  const [address, setAddress] = useState('');
  const [balanceDue, setBalanceDue] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const [unitAddress, setUnitAddress] = useState(''); // State for unit address
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false); // State for Add Unit modal
  const [uniqueCode, setUniqueCode] = useState(''); // State for the unique code
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [roomDetails, setRoomDetails] = useState({
    roomNumber: '',
    buildingName: ''
  });
  
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  const [userInfo, setUserInfo] = useState({
    building_name: "",
    email: userEmail,
    gender: "Male",
    identity: "Tenant",
    lease_end_date: "2000-01-01",
    lease_start_date: "1999-01-01",
    phone_number: "9999999999",
    rent: 0,
    room_name: ""
  })
  

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    firstName: '',
    lastName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    billingAddress1: '',
    billingAddress2: '',
    city: '',
    country: '',
    state: '',
    zipCode: ''
  });

  const fetchPaymentHistory = async (start_num = 0, end_num = 4) => {
    try {
      const response = await fetch(`https://dr0xv1guya3y3.cloudfront.net/api/billing/history?email=${userEmail}&start_num=${start_num}&end_num=${end_num}`);
      const data = await response.json();
      setPaymentHistory(data); // Assuming the API returns an array of payment transactions
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };


  useEffect(() => {
    const fetchRoomAddress = async () => {
      try {
        const response = await fetch(`https://dr0xv1guya3y3.cloudfront.net/api/room/search_room_by_email?email=${userEmail}`);
        const data = await response.json();
    
        if (data.message === 'Room info found') {
          const roomData = data.room;
          setRoomDetails({
            roomNumber: roomData.room_number,
            buildingName: roomData.building_name
          });
          const fullAddress = `Building: ${roomData.building_name}, Room Number: ${roomData.room_number}`;
          setAddress(fullAddress);  // Set the full address
        } else {
          console.log(data.message); // Log other messages
        }
      } catch (error) {
        console.error('Error fetching room info:', error);
      }
    };
    
    // Define the function to fetch balance due
    const fetchBalanceDue = async () => {
      try {
        const response = await fetch(`https://dr0xv1guya3y3.cloudfront.net/api/billing/get_balance?email=${userEmail}`);
        const data = await response.json();
        if (data.balance !== undefined) {
          setBalanceDue(data.balance);  // Set the fetched balance
        } else {
          console.error('Error fetching balance due:', data.error || 'Unknown error');
        }
      } catch (error) {
        console.error('Error fetching balance due:', error);
      }
    };

    // Fetch tenant ID and balance due using userGoogleId and tenantId
    // Replace with your actual fetch calls
    setTenantId('T0831190'); // Placeholder for tenant ID
    // setAddress('501 W 110th Street, #8C, New York, NY 10025'); // Placeholder for address
    fetchRoomAddress();
    // setBalanceDue(1000.00); // Placeholder for balance
    fetchBalanceDue();
    setUnitAddress('501 W 110th Street, #8C, New York, NY 10025')

    if (selectedOption === 'my-profile') {
      // 当变量等于特定值时调用的函数
        const link = 'https://ec2-3-220-219-78.compute-1.amazonaws.com:5000/api/Tenant/' + userEmail; //userEmail;
        fetch(link, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            mode:'cors',
            referrerPolicy: "unsafe_url" 
          },
        })
        .then(response => response.json())
        .then(data => {
          if(Object.keys(data).length === 0) {
            // Create tenant
            
            fetch('https://ec2-3-220-219-78.compute-1.amazonaws.com:5000/api/Tenant', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                mode:'cors',
                referrerPolicy: "unsafe_url" 
              },
              body: JSON.stringify(userInfo)
            })
            .then(response => response.json())           
          }
          else {
            setUserInfo(data);
          }
        })
        .catch(error => console.log('Error:', error));
      }

      if (selectedOption === 'payment-history') {
        const start_num = currentPage * 4;
        const end_num = start_num + 4;
        fetchPaymentHistory(start_num, end_num);
      } 
    
  }, [userGoogleId, tenantId, selectedOption, userEmail]);

  const handleFocus = () => {
    setIsFocused(true);
    // Remove formatting when focused
    const numericValue = inputValue.endsWith('.00') ? `${inputValue.slice(1, -3)}` : `${inputValue}`;
    setInputValue(numericValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    // Check if the value already has .00, if not, add it
    const formattedValue = numericValue.endsWith('.00') ? `$${numericValue.slice(0, -2)}` : `$${numericValue}.00`;
    setInputValue(formattedValue);
  };

  const handleChange = (event) => {
    // Update input value only with numeric characters
    const input = event.target.value.replace(/[^0-9]/g, '');
    setInputValue(input);
  };


  const handlePayment = () => {
    console.log(inputValue);
    if (inputValue !== '$' + balanceDue + '.00') {
      alert('The entered amount does not match the balance due.');
      return;
    }
    setIsPaymentModalOpen(true); 
  };

  const handleCloseModal = () => {
    setIsPaymentModalOpen(false);
  };

  const handleModalFormSubmit = async (event) => {
    event.preventDefault();
    console.log('Submitted payment details:', paymentDetails);
    // Here, you would handle the payment processing logic
    try {
      const paymentAmount = paymentDetails.amount; // Replace with the actual payment amount
      const paymentDate = new Date().toISOString();
      const paymentStatus = 'paid'; // Example status
      const transactionId = '123456'; // Replace with actual transaction ID from payment gateway, if available

      const updateBillingResponse = await fetch(`https://dr0xv1guya3y3.cloudfront.net/api/billing/pay_rent/${apartmentNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: paymentAmount,
          date: paymentDate,
          status: paymentStatus,
          transactionId: transactionId
        })
      });
      const updateBillingData = await updateBillingResponse.json();
      console.log(updateBillingData.message);


      // Assuming the payment was successful, now send the email
      const emailResponse = await fetch('https://dr0xv1guya3y3.cloudfront.net/api/email/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_email: userEmail, // User's email
          recipient_name: userName, // User's name
          due_date: new Date().toISOString().split('T')[0], // Current date as due date, adjust as necessary
          balance: balanceDue // The balance that was due
        })
      });
  
      const emailData = await emailResponse.json();
      console.log(emailData.message);
  
      // After email is sent, navigate to the success page
      handleCloseModal();
      navigate('/payment-success');
  
    } catch (error) {
      console.error('Error sending email:', error);
    }
    handleCloseModal();
    navigate('/payment-success'); // Navigate to the success page
  };

  const handleLogout = () => {
    googleLogout();
    navigate('/');
  };
  
  const handleDropdownChange = (selectedOption) => {
    setSelectedOption(selectedOption.value);
  };


  const handleDeleteUnit = () => {
    // API call to delete the unit goes here
    setUnitAddress(''); // Clear the unit address from the state
  };
  const handleAddUnitSubmit = (event) => {
    event.preventDefault();
    // Logic to handle the addition of the unit using uniqueCode
    // Example: addUnitToDatabase(uniqueCode);
    // setIsAddUnitModalOpen(false);
    setUnitAddress(uniqueCode);
    setIsAddUnitModalOpen(false);
  };

  const handleEdit = () => {
    if(profileEditBtn === true) {
      setProfileEditBtn(false)
      //submit update to tenant db
      try {
        const link = 'https://ec2-3-220-219-78.compute-1.amazonaws.com:5000/api/Tenant/' + userEmail; //userEmail;
        fetch(link, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            mode:'cors',
            referrerPolicy: "unsafe_url" 
          },
          body: JSON.stringify(userInfo)
        })
        .then(response => response.json())
        .catch(error => console.error('Error:', error));
      } catch (error) {
        console.log(error)
      } 
    }
    else {
      setProfileEditBtn(true)
    }
  };



  return (
    <div className="payment-view">
      <header className="payment-header">
        <div className="logo-and-name">
          <img src={logo} alt="Logo" className="logo" />
          <span className="building-name">CloudNuts MANAGEMENT</span>
        </div>
        <div className="user-info">
          <div>Welcome, {userName}!</div>
          <div className="cloudnutspay-id">CloudNutsPay ID: {userEmail}</div>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>
      <nav className="payment-nav">
        <span className="pay-now-text">Pay Now</span>
        <div className="nav-dropdown-container">
        <Select
          className="nav-dropdown"
          options={options}
          defaultValue={options[0]}
          onChange={handleDropdownChange}
        />
        </div>
      </nav>

      <section className="payment-content">
      {selectedOption === 'my-profile' && (
        <div>
          <p className="payment-description">
          It is expressly agreed and understood that neither the tender nor acceptance by the Landlord of any rent payment...
          </p>
          <div className="profile-information">
            <h3>Profile Information</h3>
            <div className="profile-row">
              <p><strong>First Name:</strong> {userName.split(' ')[0]}</p>
            </div>
            <div className="profile-row">
              <p><strong>Last Name:</strong> {userName.split(' ')[1]}</p>
            </div>
            <div className="profile-row">
              <p><strong>CloudNutsPay ID:</strong> {userEmail}</p>
            </div>
            <div className="profile-row">
            { profileEditBtn === false? 
              (<p><strong>Phone Number:</strong> {userInfo.phone_number}</p>)
              :
              (<p>
                <strong>Phone Number: </strong>
                <input
                      type="text"
                      value={userInfo.phone_number}
                      onChange={(e) => setUserInfo({ ...userInfo, phone_number: e.target.value})}
                      placeholder="xxx-xxx-xxxx"
                    />
              </p>)
            }   
            </div>
            { profileEditBtn === true? 
              (<button onClick={handleEdit} className="edit-button">Save</button>)
              :
              (<button onClick={handleEdit} className="edit-button">Edit</button>)
            } 
          </div>
        </div>
      )}

        {selectedOption === 'payment-history' && (
          // <div>
          //   {/* Content for Payment History */}
          //   <p>Payment History Content</p>
          // </div>
          <div>
            <p>Payment History Content</p>
            <div>
              {paymentHistory.length > 0 ? (
                <ul>
                  {paymentHistory.map((transaction, index) => (
                    <li key={index}>
                      {/* Display the transaction details */}
                      Apartment ID: {transaction.apartment_id}, 
                      Amount: ${transaction.rental_price},
                      Date: {new Date(transaction.payment_date).toLocaleDateString()},
                      Rentor Name: {transaction.rentor_name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No payment history found.</p>
              )}
            </div>
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0}>Previous</button>
            <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
          </div>
        )}

        {selectedOption === 'add-remove-unit' && (
          <div>
            <p className="payment-description">
            It is expressly agreed and understood that neither the tender nor acceptance by the Landlord of any rent payment...
            </p>
            <div className="units-section">
              <p>View your unit below or add a new one to your list</p>
              <h2>My Unit</h2>
              {unitAddress ? (
                <div className="unit-info">
                  <span>{unitAddress}</span>
                  <button onClick={handleDeleteUnit}>Delete</button>
                </div>
              ) : (
                <p>No unit added.</p>
              )}
              <button onClick={() => setIsAddUnitModalOpen(true)}>Add New Unit</button>
            </div>
            {isAddUnitModalOpen && (
              <Modal
                isOpen={isAddUnitModalOpen}
                onRequestClose={() => setIsAddUnitModalOpen(false)}
                className="add-unit-modal"
                overlayClassName="add-unit-modal-overlay"
              >
                <div className="modal-content">
                  <h2>Add a New Unit</h2>
                  <form onSubmit={handleAddUnitSubmit} className="add-unit-form">
                    <input
                      type="text"
                      value={uniqueCode}
                      onChange={(e) => setUniqueCode(e.target.value)}
                      placeholder="Enter unique code"
                      className="modal-input"
                    />
                    <button type="submit" className="modal-submit-button">Submit</button>
                  </form>
                </div>
              </Modal>
            )}
          </div>
        )}

        {selectedOption === 'Account' && (
          <div>
            <p className="payment-description">
            It is expressly agreed and understood that neither the tender nor acceptance by the Landlord of any rent payment...
            </p>
            <div className="payment-details">
              {/* <div className="info-row">
                <label className="info-label">Address:</label>
                <span className="info-content">501 W 110th Street, #8C, New York, NY 10025</span>
              </div> */}
              <div className="info-row">
                <label className="info-label">Address:</label>
                <span className="info-content">{address}</span>
              </div>

              <div className="info-row1">
                  <label className="info-label">Balance Due: {'$' + balanceDue + '.00'}</label>
                    <span className="input_description">Enter Payment Amount:
                      <input
                          type="text"
                          placeholder="$0.00"
                          value={inputValue} // Bound to your state
                          onChange={handleChange}
                          onBlur={handleBlur}
                          onFocus={handleFocus}
                          className="amount-input"
                      />
                    </span>
              </div>
              <button onClick={handlePayment} className="pay-button-short">Continue</button>

              {
                isPaymentModalOpen && (
                  <Modal
                    isOpen={isPaymentModalOpen}
                    onRequestClose={() => setIsPaymentModalOpen(false)}
                    className="payment-modal"
                    overlayClassName="payment-modal-overlay"
                  >
                    <h2>Payment Information</h2>
                    <form onSubmit={handleModalFormSubmit} className="payment-form">
                      <div className="input-row">
                        <div className="form-group flex-half">
                          <label htmlFor="cardNumber">Card Number</label>
                          <input
                            type="text"
                            id="cardNumber"
                            name="cardNumber"
                            onChange={e => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group flex-quarter">
                          <label htmlFor="expiryMonth">Month</label>
                          <input
                            type="text"
                            id="expiryMonth"
                            name="expiryMonth"
                            onChange={e => setPaymentDetails({ ...paymentDetails, expiryMonth: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group flex-quarter">
                          <label htmlFor="expiryYear">Year</label>
                          <input
                            type="text"
                            id="expiryYear"
                            name="expiryYear"
                            onChange={e => setPaymentDetails({ ...paymentDetails, expiryYear: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group flex-quarter">
                          <label htmlFor="cvv">CVV</label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            onChange={e => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="input-row">
                        <div className="form-group flex-half">
                          <label htmlFor="firstName">First Name</label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            onChange={e => setPaymentDetails({ ...paymentDetails, firstName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group flex-half">
                          <label htmlFor="lastName">Last Name</label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            onChange={e => setPaymentDetails({ ...paymentDetails, lastName: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      {/* Billing Address Row */}
                      <div className="input-row">
                        <div className="form-group flex-half">
                          <label htmlFor="billingAddress1">Billing Address 1</label>
                          <input
                            type="text"
                            id="billingAddress1"
                            name="billingAddress1"
                            onChange={e => setPaymentDetails({ ...paymentDetails, billingAddress1: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group flex-half">
                          <label htmlFor="billingAddress2">Billing Address 2</label>
                          <input
                            type="text"
                            id="billingAddress2"
                            name="billingAddress2"
                            onChange={e => setPaymentDetails({ ...paymentDetails, billingAddress2: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* City and Country Row */}
                      <div className="input-row">
                        <div className="form-group flex-half">
                          <label htmlFor="city">City</label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            onChange={e => setPaymentDetails({ ...paymentDetails, city: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group flex-half">
                          <label htmlFor="country">Country</label>
                          {/* Replace with a select dropdown in your actual code */}
                          <input
                            type="text"
                            id="country"
                            name="country"
                            onChange={e => setPaymentDetails({ ...paymentDetails, country: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      {/* State and Zip Code Row */}
                      <div className="input-row">
                        <div className="form-group flex-half">
                          <label htmlFor="state">State</label>
                          {/* Replace with a select dropdown in your actual code */}
                          <input
                            type="text"
                            id="state"
                            name="state"
                            onChange={e => setPaymentDetails({ ...paymentDetails, state: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group flex-half">
                          <label htmlFor="zipCode">Zip Code</label>
                          <input
                            type="text"
                            id="zipCode"
                            name="zipCode"
                            onChange={e => setPaymentDetails({ ...paymentDetails, zipCode: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="submit-button">Submit</button>
                        <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="cancel-button">Cancel</button>
                      </div>
                    </form>
                  </Modal>

                )
              }
            </div>
          </div>
        )}
        
      </section>
    </div>
  );
}

export default PaymentView;



