import { fetchAnyUrl, postObjectAsJson } from './modulejson.js';


const API_BASE = 'http://localhost:8080/api/v1';


let dashboardFrame, dashboardTheaters, dashboardMovies, dashboardScreenings, dashboardReservations, dashboardEmployees, theaterFrame, movieFrame, screeningsFrame, reservationsFrame, employeeFrame, content;

let theaterContent;
let movieContent;
let screeningContent;
let reservationsContent;
let employeeContent;


document.addEventListener('DOMContentLoaded', () => {
    dashboardFrame = document.querySelector('.dashboardFrame');
    dashboardTheaters = document.querySelector('#dashboardTheaters');
    dashboardMovies = document.querySelector('#dashboardMovies');
    dashboardScreenings = document.querySelector('#dashboardScreenings');
    dashboardReservations = document.querySelector('#dashboardReservations');
    dashboardEmployees = document.querySelector('#dashboardEmployees');
    content = document.querySelector('.adminContent');


    theaterFrame = document.querySelector('#theaterFrame');
    movieFrame = document.querySelector('#movieFrame');
    screeningsFrame = document.querySelector('#screeningsFrame');
    reservationsFrame = document.querySelector('#reservationsFrame');
    employeeFrame = document.querySelector('#employeeFrame');


    dashboardTheaters.addEventListener('click', viewTheaters);
    dashboardMovies.addEventListener('click', viewMovies);
    dashboardScreenings.addEventListener('click', viewScreenings);
    dashboardReservations.addEventListener('click', viewReservations);
    dashboardEmployees.addEventListener('click', viewEmployees);

})


    function closeView() {
        theaterFrame.style.display = 'none';
        movieFrame.style.display = 'none';
        screeningsFrame.style.display = 'none';
        reservationsFrame.style.display = 'none';
        employeeFrame.style.display = 'none';
    }


    function viewTheaters() {
        closeView();
        fetchTheaters();
        theaterFrame.style.display = 'flex';
    }

    async function fetchTheaters() {
        const theaterContentContainer = theaterFrame.querySelector('.adminContent');

        theaterContentContainer.innerHTML = '';

        theaterContent = await fetchAnyUrl(`${API_BASE}/theaters`);

        theaterContent.forEach((t) => {
            
            const adminContentTheaterElement = document.createElement('div');
            adminContentTheaterElement.className = "adminContentTheaterElement";
            theaterContentContainer.appendChild(adminContentTheaterElement);

            const title = document.createElement('h2');
            title.textContent = t.theaterName;
            adminContentTheaterElement.appendChild(title);

            const button = document.createElement('button');
            button.textContent = 'Delete';
            button.className = 'adminButton delete';
            button.addEventListener('click', async () => {
                const response = await postObjectAsJson(`${API_BASE}/theaters/${t.theaterId}`, null, "DELETE");
                if (response && (response.status === 200 || response.status === 204 || response.ok)) {
                    await fetchTheaters(); 
                } else {
                    console.error("Failed to delete theater:", response);
                    alert(`Error: Could not delete ${t.theaterName}. Check console.`);
                }
                
            })
            adminContentTheaterElement.appendChild(button);
            console.log(t);
        })
        adminContentMovieElement.appendChild(button);
    })


}



function fetchScreenings() {

}

function viewReservations() {

}

function fetchReservations() {

}

function viewEmployees() {
    closeView();
    fetchEmployees();
    employeeFrame.style.display = 'flex';
}

async function fetchEmployees() {

    const adminContentContainer = employeeFrame.querySelector('.adminContent');

    adminContentContainer.innerHTML = '';
    employeeContent = await fetchAnyUrl(`${API_BASE}/employee`);

    employeeContent.forEach((employee) => {
        console.log(employee);


        const adminContentEmployeeElement = document.createElement('div');
        adminContentEmployeeElement.className = "adminContentEmployeeElement";
        adminContentContainer.appendChild(adminContentEmployeeElement);

        const title = document.createElement('h2');
        title.textContent = "Name: " + employee.employeeName;
        const role = document.createElement('p');   
        role.textContent = "Role: " + employee.employeeType;
        const createdDate = document.createElement('time')
        createdDate.textContent = "Created date: " + employee.employeeCreatedDate;
        adminContentEmployeeElement.appendChild(title);
        adminContentEmployeeElement.appendChild(role);
        adminContentEmployeeElement.appendChild(createdDate);


        const button = document.createElement('button');
        button.textContent = 'Delete';
        button.className = 'adminButton delete';
        button.addEventListener('click', async () => {
            const reservation = await postObjectAsJson(`${API_BASE}/employee/${employee.employeeId}`, employee.employeeId,"DELETE");
            if (!reservation.ok) {
                alert("Fejl i at sende info" + res.status);
                return;
            }
            alert(`${employee.employeeName} has been deleted`);
        })
        adminContentEmployeeElement.appendChild(button);
    })

}

    function viewMovies () {
        closeView();
        fetchMovies();
        movieFrame.style.display = 'flex';
    }

    async function fetchMovies() {
        const movieContentContainer = movieFrame.querySelector('.adminContent');

        movieContentContainer.innerHTML = '';
        movieContent = await fetchAnyUrl(`${API_BASE}/movies`);

        movieContent.forEach((movie) => {
            console.log(movie);

            
            const adminContentMovieElement = document.createElement('div');
            adminContentMovieElement.className = "adminContentMovieElement";
            movieContentContainer.appendChild(adminContentMovieElement);

            const title = document.createElement('h2');
            title.textContent = movie.movieTitle;
            adminContentMovieElement.appendChild(title);

            const button = document.createElement('button');
            button.textContent = 'Delete';
            button.className = 'adminButton delete';
            button.addEventListener('click', () => {
                //Delete Request
            })
            adminContentMovieElement.appendChild(button);
        })


    }

    function viewScreenings() {

    }

    function fetchScreenings() {

    }

    function viewReservations() {

    }

    function fetchReservations() {

    }

    function viewEmployees() {

    }

    function fetchEmployees() {

    }
    





// Create new screenings: //
function viewScreenings() {
    closeView();
    screeningsFrame.style.display = 'flex';
    //createScreeningContainer.style.display = "none";
    fetchAllScreenings();
    fetchAllMoviesAndTheaters();
    
}



const postScreeningUrl = "http://localhost:8080/api/v1/screenings"
let allMoviesInSystem, allScreenings, allTheaters;

let createScreeningContainer = document.querySelector(".createScreeningContainer"); 
let tableScreening = document.querySelector(".screeningTable");


async function fetchAllMoviesAndTheaters(){
    allMoviesInSystem = await fetchAnyUrl("http://localhost:8080/api/v1/movies");
    allTheaters = await fetchAnyUrl("http://localhost:8080/api/v1/theaters")

    if(allMoviesInSystem && allTheaters){


        
        createScrButton.addEventListener("click", () => {
            createScreeningContainer.style.display = "flex";
            createNewScreening(allMoviesInSystem, allTheaters);
    })
        
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
    inputContainer.className ="update-overlay";

    const popup = document.createElement("div");
    popup.className = "update-popup";

    const inputForm = document.createElement("form");
    inputForm.className = "update-form";
    
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
        theaterOption.value = theater.theaterId;
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

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.textContent = "Cancel";
    cancelButton.onclick = () => document.body.removeChild(inputContainer);
    


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
    inputForm.appendChild(cancelButton)



    inputForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newScreening ={
            movieId: parseInt(selectMovie.value),
            screeningDate: dateInput.value,
            startTime: parseInt(timeInput.value.replace(":", "")),
            theaterId: parseInt(selectTheater.value),
            price: parseFloat(princeInput.value)
        }
        console.log("new screening: ", newScreening);
        await postObjectAsJson(postScreeningUrl, newScreening, "POST")
        await viewScreenings();
        //createScreeningContainer.style.display = "none";
        document.body.removeChild(inputContainer);

        
    })

    popup.appendChild(inputForm);

    inputContainer.appendChild(popup);
    document.body.appendChild(inputContainer);


    //createScreeningContainer.appendChild(inputContainer);


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
    updateScreening.className = "updateButton";
    cell.appendChild(updateScreening);

    updateScreening.onclick = function(){
        row.remove();
        updateScreeningFunc(screenings);
    }

    cell = row.insertCell(cellCount++);
    const deleteScrenning = document.createElement("input");
    deleteScrenning.type="button";
    deleteScrenning.className="deleteButton";
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
        option.value = theater.theaterId;
        option.textContent = theater.theaterName;
        if (theater.theaterId === screening.theater.theaterId) option.selected = true;
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


