import { postObjectAsJson } from './modulejson.js';

const authorizeUser = document.querySelector(".login-form");
const authenticateUserBtn = document.querySelector(".authenticate");
const loginContainer = document.querySelector(".login-container");

authenticateUserBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const userinfo = Object.fromEntries(new FormData(authorizeUser));

    const userCredentials = 
    {
        username: userinfo.username,
        password: userinfo.password
    }

    console.log(userCredentials);

    try {
        const res = await postObjectAsJson("http://localhost:8080/api/v1/authenticate", userCredentials, "POST")
        if(!res.ok){
        alert("error in trying to authenticate, probably wrong credentials: " + res.status);
        return;
        } 
        const authorizeMessage = await res.text();
        localStorage.setItem("authenticated", authorizeMessage)
        authenticated();
    } catch (error) {
        console.error(error);
    }
})

document.addEventListener("DOMContentLoaded", () => {
    authenticated();
});

window.addEventListener("storage", (e) => {
    if (e.key === "authenticated") {
        authenticated();
    }
});

function getToken() {
    return localStorage.getItem("authenticated");
}

function authenticated() {
    const token = getToken();

    const isLoggedIn = Boolean(token);

    if(isLoggedIn) {
        loginContainer.style.display = "none";
    }
}

