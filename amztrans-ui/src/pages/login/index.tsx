import React from "react";
import { useEffect } from "react";
import { COGNITO_USERPOOL_ENDPOINT } from "../../assets/config";
import { clearLocalAccessToken } from "../../utils/auth";

const LoginPage = () => {
    useEffect(() => {
        clearLocalAccessToken();
        window.location.replace(COGNITO_USERPOOL_ENDPOINT);
      }, [])
    
    return <></>
} 
export default LoginPage;