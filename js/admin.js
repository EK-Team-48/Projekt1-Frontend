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


// Create new screenings: //

let allMoviesInSystem, allScreenings, allTheaters;

const createScreeningContainer = document.getElementById(".createScreeningContainer"); 
const displayScreeningsContainer = document.getElementById(".displayScreeningsContainer")

async function fetchAllMoviesAndTheaters(){
    allMoviesInSystem = await fetchAnyUrl("http://localhost:8080/api/v1/screenings");
    allTheaters = await fetchAnyUrl("http://localhost:8080/api/v1/theaters")

    if(allMoviesInSystem && allTheaters){
        createNewScreening(allMoviesInSystem, allTheaters);
    } else {
        alert("fejl ved kald til backend url," + " vil du vide mere så kig i console")
    }
}

async function fetchAllScreenings(){
    allScreenings = await fetchAnyUrl("http://localhost:8080/api/v1/movies");
    if(allScreenings){

    } else{
        alert("fejl ved kald til backend url," + " vil du vide mere så kig i console")
    }

}

async function fetchAllTheaters(){
    allTheaters = await fetchAnyUrl("http://localhost:8080/api/v1/theaters")
    if(allTheaters){

    } else{
        alert("fejl ved kald til backend url," + " vil du vide mere så kig i console")
    }

}

function createNewScreening(movies, theaters){
    createScreeningContainer.innerHTML ="";

    if(!movies){
        createScreeningContainer.innerHTML = "Could not find any movies, create it before the screening";
        return
    }
    if(!theaters){
        createScreeningContainer.innerHTML = "could not find any theaters, create it before the screening"
        return
    }


    const inputContainer = document.createElement("div");


    const inputForm = document.createElement("form");
    


    const selectMovie = document.createElement("select");
    selectMovie.id = "selectMovie";

    movies.forEach(movie => {
        const movieOption = document.createElement("option");
        movieOption.value = movie.movieId;
        movieOption.textContent = movie.movieTitle;
        selectMovie.appendChild(movieOption);
    });

    
    const selectTheater = document.createElement("select");
    selectTheater.id= "selectTheater";

    theaters.forEach(theater => {
        const theaterOption = document.createElement("option");
        theaterOption.value = theater.theaterId;
        theaterOption.textContent = theater.theaterName;
        theaterOption.appendChild(theaterOption);
    })

    const screeningDateLabel = document.createElement("label");
    screeningDateLabel.textContent = "Date:";
    screeningDateLabel.className="screeningDateLabel";

    const dateInput = document.createElement("input");
    dateInput.id ="screeningDate";
    dateInput.type="date";
    dateInput.required = true;


    const timeLabel = document.createElement("label");
    timeLabel.textContent ="Time:";

    const timeInput = document.createElement("select");
    timeInput.type = "time";
    timeInput.id = "startTime"
    timeInput.required = true;


    const priceLabel = document.createElement("label");
    priceLabel.textContent = "Price:";

    const princeInput = document.createElement("select");
    princeInput.type ="number";
    princeInput.id = "price";
    princeInput.required = true;
    princeInput.min = 0;

    const submitScreeningButton = document.createElement("button");
    submitScreeningButton.type = "submit";
    submitScreeningButton.textContent ="Create Screening";
    







}

function displayAllScreenings(screenings){

}

