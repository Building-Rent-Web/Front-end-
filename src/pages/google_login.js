import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'
import { Helmet } from "react-helmet"
import './login.css'
import './PaymentView.css';

const client_id = "743827051356-tqskbtvpm1538mbqdu457gcjrbc3ovr2.apps.googleusercontent.com"

export function Googlelogin() {
    const [ user, setUser ] = useState("");
    const [ profile, setProfile ] = useState({});
    const navigate = useNavigate();

    function handleCallbackResponse(response) {
        const userObject = jwtDecode(response.credential);
        setUser(userObject.email)
        setProfile(userObject)
        navigate('/payment', { state: { userGoogleId: userObject.id, userName: userObject.name, emailAddress: userObject.email } });
    }    

    useEffect(() => {
        /*global google*/
        google.accounts.id.initialize({
            client_id: client_id,
            callback: handleCallbackResponse
        });

        google.accounts.id.renderButton(
            document.getElementById('signInDiv'),
            {theme: "outline", width: "420px", top: '50%', left: '50%', height: "60px",
            padding: '20px'}
        )

        google.accounts.id.prompt();
    }, []);

    function handleSignOut(event) {
        setUser("");
        setProfile({});
    }

    return (
        <>
            <Helmet>
                <script src="https://accounts.google.com/gsi/client" async></script>
            </Helmet>
            <div className='center'>
                <h1>Online Rent Payment</h1>
                <div className="center_div" id="signInDiv"></div>
            </div>
        </>  
    );

}
export default Googlelogin;