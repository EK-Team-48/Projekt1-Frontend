import {fetchAnyUrl, postObjectAsJson } from './modulejson.js';

document.addEventListener("DOMContentLoaded", () => {
    fetchAllMoviesAndTheaters();
    fetchAllScreenings();

})



// Create new screenings: //
const postScreeningUrl = "http://localhost:8080/api/v1/screenings"
let allMoviesInSystem, allScreenings, allTheaters;

let createScreeningContainer = document.querySelector(".createScreeningContainer"); 
let tableScreening = document.querySelector(".screeningTable");

async function fetchAllMoviesAndTheaters(){
    allMoviesInSystem = await fetchAnyUrl("http://localhost:8080/api/v1/movies");
    allTheaters = await fetchAnyUrl("http://localhost:8080/api/v1/theaters")

    if(allMoviesInSystem && allTheaters){
        createNewScreening(allMoviesInSystem, allTheaters);
    } else {
        alert("fejl ved kald til movie og theaters backend url," + " vil du vide mere så kig i console")
    }
}


function createNewScreening(movies, theaters){
    createScreeningContainer.innerHTML = "";

    if(!movies || movies.length === 0){
        createScreeningContainer.innerHTML = "Could not find any movies, create it before the screening";
        return
    }
    if(!theaters || theaters.length === 0){
        createScreeningContainer.innerHTML = "could not find any theaters, create it before the screening"
        return
    }


    const inputContainer = document.createElement("div");


    const inputForm = document.createElement("form");
    
    const movieLabel = document.createElement("label");
    movieLabel.textContent = "Movie:"; 

    const selectMovie = document.createElement("select");
    selectMovie.id = "selectMovie";

    movies.forEach(movie => {
        const movieOption = document.createElement("option");
        movieOption.value = movie.movieId;
        movieOption.textContent = movie.movieTitle;
        selectMovie.appendChild(movieOption);
    });


    const theaterLabel = document.createElement("label");
    theaterLabel.textContent = "Theater:";

    const selectTheater = document.createElement("select");
    selectTheater.id= "selectTheater";

    theaters.forEach(theater => {
        const theaterOption = document.createElement("option");
        theaterOption.value = theater.id;
        theaterOption.textContent = theater.theaterName;
        selectTheater.appendChild(theaterOption);
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

    const timeInput = document.createElement("input");
    timeInput.type = "time"
    timeInput.id = "startTime"
    timeInput.required = true;


    const priceLabel = document.createElement("label");
    priceLabel.textContent = "Price:";

    const princeInput = document.createElement("input");
    princeInput.type ="number";
    princeInput.id = "price";
    princeInput.required = true;
    princeInput.min = 0;

    const submitScreeningButton = document.createElement("button");
    submitScreeningButton.type = "submit";
    submitScreeningButton.textContent ="Create Screening";
    


    inputForm.appendChild(movieLabel);
    inputForm.appendChild(selectMovie);
    inputForm.appendChild(theaterLabel);
    inputForm.appendChild(selectTheater);
    inputForm.appendChild(screeningDateLabel);
    inputForm.appendChild(dateInput);
    inputForm.appendChild(timeLabel);
    inputForm.appendChild(timeInput);
    inputForm.appendChild(priceLabel);
    inputForm.appendChild(princeInput);
    inputForm.appendChild(submitScreeningButton);


    inputForm.addEventListener("submit", e => {
        e.preventDefault();
        const newScreening ={
            movieId: parseInt(selectMovie.value),
            screeningDate: dateInput.value,
            startTime: parseInt(timeInput.value.replace(":", "")),
            theaterId: parseInt(selectTheater.value),
            price: parseFloat(princeInput.value)
        }
        console.log("new screening: ", newScreening);
        postObjectAsJson(postScreeningUrl, newScreening, "POST")
        location.reload();
        
    })

    inputContainer.appendChild(inputForm);

    createScreeningContainer.appendChild(inputContainer);


}



async function fetchAllScreenings(){
    allScreenings = await fetchAnyUrl("http://localhost:8080/api/v1/screenings");
    if(allScreenings && allScreenings.length > 0){
        allScreenings.forEach(displayAllScreenings)
    } else{
    }

}


function displayAllScreenings(screenings){
    if(!screenings){
        return
    }

    

    let cellCount = 0;
    let rowCount = tableScreening.rows.length;
    let row = tableScreening.insertRow(rowCount);

    let cell = row.insertCell(cellCount++);
    cell.innerHTML = screenings.movie.movieTitle;
    cell.style.width="25%";

    cell = row.insertCell(cellCount++);
    cell.innerHTML = screenings.theater.theaterName;
    cell.style.width="25%";

    cell = row.insertCell(cellCount++);
    cell.innerHTML = screenings.screeningDate;
    cell.style.width="25%";

    cell = row.insertCell(cellCount++);
    cell.innerHTML = formatTime(screenings.startTime);
    cell.style.width="25%";

    cell = row.insertCell(cellCount++);
    cell.innerHTML = screenings.price + " kr";
    cell.style.width="25%";

    cell = row.insertCell(cellCount++);
    const updateScreening = document.createElement("input");
    updateScreening.type="button";
    updateScreening.setAttribute("Value", "update screening");
    updateScreening.className = "adminButton grey";
    cell.appendChild(updateScreening);

    updateScreening.onclick = function(){
        updateScreeningFunc(screenings);
    }

    cell = row.insertCell(cellCount++);
    const deleteScrenning = document.createElement("input");
    deleteScrenning.type="button";
    deleteScrenning.className="adminButton delete";
    deleteScrenning.setAttribute("Value", "remove screening")
    cell.appendChild(deleteScrenning);

    deleteScrenning.onclick = function(){
        row.remove();
        deleteScreeningFunc(screenings)
        
    }

   

}
// Laver tidspunkt fra 1230 til 12:30
function formatTime(num) {
    let str = num.toString().padStart(4, "0");
    return `${str.slice(0, 2)}:${str.slice(2)}`;
}


async function deleteScreeningFunc(screening){
    const screeningDeleted = `\n ${screening.movie.movieTitle} \n ${screening.theater.theaterName} \n ${screening.screeningDate} \n ${formatTime(screening.startTime)} \n ${screening.price} kr \n`;
    try{
    const delSrc = await postObjectAsJson(postScreeningUrl + "/" + screening.screeningId, screening, "DELETE");
    if(!delSrc.ok){
        const srcMsg = await delSrc.text().catch(() => '');
        throw new Error(srcMsg)
    }
    alert(`Screening deleted: ${screeningDeleted}`);
    await fetchAllScreenings();
    } catch(err) {
        alert(`Could not delete screening:  ${screeningDeleted} It is attached to a reservation. Remove the reservation first.`)

    }
}

function updateScreeningFunc(screening) {
    const overlay = document.createElement("div");
    overlay.className = "update-overlay";

    const popup = document.createElement("div");
    popup.className = "update-popup";

    const form = document.createElement("form");
    form.className = "update-form";

    const movieLabel = document.createElement("label");
    movieLabel.textContent = "Movie:";
    const movieSelect = document.createElement("select");
    allMoviesInSystem.forEach(movie => {
        const option = document.createElement("option");
        option.value = movie.movieId;
        option.textContent = movie.movieTitle;
        if (movie.movieId === screening.movie.movieId) option.selected = true;
        movieSelect.appendChild(option);
    });

    const theaterLabel = document.createElement("label");
    theaterLabel.textContent = "Theater:";
    const theaterSelect = document.createElement("select");
    allTheaters.forEach(theater => {
        const option = document.createElement("option");
        option.value = theater.id;
        option.textContent = theater.theaterName;
        if (theater.id === screening.theater.theaterId) option.selected = true;
        theaterSelect.appendChild(option);
    });

    const dateLabel = document.createElement("label");
    dateLabel.textContent = "Date:";
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = screening.screeningDate;

    const timeLabel = document.createElement("label");
    timeLabel.textContent = "Time:";
    const timeInput = document.createElement("input");
    timeInput.type = "time";
    timeInput.value = formatTime(screening.startTime);

    const priceLabel = document.createElement("label");
    priceLabel.textContent = "Price:";
    const priceInput = document.createElement("input");
    priceInput.type = "number";
    priceInput.value = screening.price;

    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.textContent = "Save Changes";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.textContent = "Cancel";
    cancelButton.onclick = () => document.body.removeChild(overlay);

    form.appendChild(movieLabel);
    form.appendChild(movieSelect);
    form.appendChild(theaterLabel);
    form.appendChild(theaterSelect);
    form.appendChild(dateLabel);
    form.appendChild(dateInput);
    form.appendChild(timeLabel);
    form.appendChild(timeInput);
    form.appendChild(priceLabel);
    form.appendChild(priceInput);
    form.appendChild(saveButton);
    form.appendChild(cancelButton);

    popup.appendChild(form);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const updatedScreening = {
            movieId: parseInt(movieSelect.value),
            theaterId: parseInt(theaterSelect.value),
            screeningDate: dateInput.value,
            startTime: parseInt(timeInput.value.replace(":", "")),
            price: parseFloat(priceInput.value)
        };

        await postObjectAsJson(`${postScreeningUrl}/${screening.screeningId}`, updatedScreening, "PUT");

        document.body.removeChild(overlay);
        fetchAllScreenings(); //Opdatere så den nye værdi kommer med
    });
}


