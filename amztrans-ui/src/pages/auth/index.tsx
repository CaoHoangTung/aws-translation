import { StatusIndicator } from "@awsui/components-react";
import React from "react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getLocalAccessToken, setLocalAccessToken } from "../../utils/auth";

const AuthPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const activeURL = window.location.href;

        let urlComponents = activeURL.split("#");
        if (urlComponents.length !== 2) {
            window.location.replace("/")
            console.log("NO")
        }

        let paramStrings = urlComponents[1].split("&");
        let params = {};
        for (let paramString of paramStrings) {
            let [k, v] = paramString.split("=");
            params[k] = v;
        }

        setLocalAccessToken(params?.id_token, params?.expires_in || 0);
        navigate("/")
    }, [])
    
    return <><StatusIndicator type="loading" />Authenticating</>
} 
export default AuthPage;