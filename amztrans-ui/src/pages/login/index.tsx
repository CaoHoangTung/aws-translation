import React from "react";
import { useEffect } from "react";
import { COGNITO_USERPOOL_ENDPOINT } from "../../assets/config";
import { clearLocalAccessToken } from "../../utils/auth";

const LoginPage = () => {
    useEffect(() => {
        clearLocalAccessToken();
        console.log("REDIRECTING TO", COGNITO_USERPOOL_ENDPOINT);
        window.location.replace(COGNITO_USERPOOL_ENDPOINT);
      }, [])
    
    return <></>
} 
export default LoginPage;