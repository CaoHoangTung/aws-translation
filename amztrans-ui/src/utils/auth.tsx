import Cookies from 'universal-cookie';
const cookies = new Cookies();

const ACCESS_TOKEN_KEY = "amztrans-access-token";

export const setLocalAccessToken = (accessToken: string, expireMiliseconds: Number) => {
    let d = new Date();
    d.setTime(d.getTime() + (expireMiliseconds*1000));
    
    cookies.set(ACCESS_TOKEN_KEY, accessToken, {path: "/", expires: d});
}

export const getLocalAccessToken = () => {
    return cookies.get(ACCESS_TOKEN_KEY);
}

export const clearLocalAccessToken = () => {
    cookies.remove(ACCESS_TOKEN_KEY);
}