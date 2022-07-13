import axios from "axios";
import { APIGATEWAY_ENDPOINT } from "../assets/config";
import { clearLocalAccessToken, getLocalAccessToken } from "./auth";

const axiosConfig = {
    baseURL: APIGATEWAY_ENDPOINT,
    timeout: 30000,
    headers: {
        Authorization: getLocalAccessToken()
    },
};


export const API = axios.create(
    axiosConfig
);
    
// Add a response interceptor
API.interceptors.response.use(function (response) {
    // Do something with response data
    return response;
    }, function (error) {
        // Do something with response error
        console.error("API Error", error);
        // window.location.replace("/login");
        return Promise.reject(error);
    });
