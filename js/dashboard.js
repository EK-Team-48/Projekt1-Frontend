import { fetchAnyUrl, postObjectAsJson } from './modulejson.js';


const API_BASE = 'http://localhost:8080/api/v1';


let dashboardFrame, dashboardTheaters, dashboardMovies, dashboardScreenings, dashboardReservations, dashboardEmployees, theaterFrame, movieFrame, screeningsFrame, reservationsFrame, employeeFrame, content, createTheaterPopup, newTheaterBtn, createTheaterForm;

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
    createTheaterPopup = document.querySelector('.createTheaterPopup');
    newTheaterBtn = document.querySelector('#newTheaterBtn');
    createTheaterForm = document.querySelector('#createTheaterForm');


    theaterFrame = document.querySelector('#theaterFrame');
    movieFrame = document.querySelector('#movieFrame');
    screeningsFrame = document.querySelector('#screeningsFrame');
    reservationsFrame = document.querySelector('#reservationsFrame');
    employeeFrame = document.querySelector('#employeeFrame');

    document.addEventListener('keydown', e => { if (e.key === 'Escape') closePopup(); });
    createTheaterPopup.addEventListener('click', e => { if (e.target === createTheaterPopup) closePopup()})
    dashboardTheaters.addEventListener('click', viewTheaters);
    dashboardMovies.addEventListener('click', viewMovies);
    dashboardScreenings.addEventListener('click', viewScreenings);
    dashboardReservations.addEventListener('click', viewReservations);
    dashboardEmployees.addEventListener('click', viewEmployees);
    newTheaterBtn.addEventListener('click', () => createTheaterPopup.style.display = 'flex');
    createTheaterForm.addEventListener('submit', createTheater)

    viewTheaters();


})

function closePopup() {
    createTheaterPopup.style.display = 'none';

}


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

        let originalName = title.theaterName;
        title.addEventListener('click', () => {
            originalName = title.textContent;
            title.setAttribute('contenteditable', true);
            title.classList.add('editing');
            title.focus();
        })

        title.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') {
                e.preventDefault();
                updateTheater(title, t.theaterId, t.theaterName);
                title.blur();
            }
        })

        title.addEventListener('blur', () => {
        updateTheater(title, t.theaterId, t.theaterName);
        });


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
}

async function createTheater() {
    const formData = new FormData(createTheaterForm);
        const theaterData = {
            theaterName: formData.get('theaterName'),
            numberOfRows: formData.get("numberOfRows"),
            seatsPerRow: formData.get('seatsPerRow'),
        };

        const res = await postObjectAsJson(`${API_BASE}/theaters`, theaterData, "POST");      
            if(!res.ok) {
              alert("Theater creation failed");
              return;
            }
}

async function updateTheater(element, theaterId, originalName) {
    const newName = element.textContent.trim();

    if (newName === originalName) {
        element.removeAttribute('contenteditable');
        element.classList.remove('editing');
        return;
    }

    if (newName) {
        try {
            const payload = {
                theaterName: newName
            }

            const res = await postObjectAsJson(`${API_BASE}/theaters/${theaterId}`, payload, "PUT");

        if (!res.ok) {
                console.error('Update failed:', await res.text());
                alert('Failed to update theater name.');
                element.textContent = originalName;
            } else {
                originalName = newName;
                console.log('Theater name updated successfully!');
            }
        } catch (e) {
            console.error('Network or fetch error:', e);
            alert('An error occurred during the update.');
            element.textContent = originalName;
        }
    }
    console.log(element, theaterId, originalName);
    element.removeAttribute('contenteditable');
    element.classList.remove('editing');
}



function viewReservations() {
    closeView();
    fetchReservations();
    reservationsFrame.style.display = 'flex';
}

async function fetchReservations() {
    const adminContentContainer = reservationsFrame.querySelector('.adminContent');

    adminContentContainer.innerHTML = '';
    reservationsContent = await fetchAnyUrl(`${API_BASE}/reservations`);

    reservationsContent.forEach((reservation) => {
        const adminContentReservationElement = document.createElement('div');
        adminContentReservationElement.className = "adminContentReservationElement";
        adminContentContainer.appendChild(adminContentReservationElement);

        const title = document.createElement('h2');
        const fullID = reservation.reservationID;
        const idLastFour = fullID.substring(fullID.length - 4);
        title.textContent = "Reservation ID: " + idLastFour;
        title.style.cursor = 'pointer';

        const date = document.createElement('time');
        date.textContent = "Date: " + reservation.screeningDate;

        adminContentReservationElement.appendChild(title);
        adminContentReservationElement.appendChild(date);

        title.addEventListener('click', () => openReservationDetails(reservation));

        const button = document.createElement('button');
        button.textContent = 'Delete';
        button.className = 'reservation-delete-btn';
        button.addEventListener('click', async () => {
            const response = await postObjectAsJson(`${API_BASE}/reservations/${idLastFour}`, idLastFour, "DELETE");
            if (!response.ok) {
                alert("Failed to delete reservation: " + response.status);
                return;
            }
            alert(`Reservation ${reservation.reservationID} has been deleted`);
            fetchReservations();
        });
        adminContentReservationElement.appendChild(button);
    });
}

function openReservationDetails(reservation) {
    const popup = document.createElement('div');
    popup.className = 'reservationPopup';

    popup.innerHTML = `
        <div class="reservationDetails-section">
            <div class="reservationDetails-box">
                <h2>Reservation Details</h2>
                <div class="details-content">
                    <p><strong>Reservation ID:</strong> ${reservation.reservationID}</p>
                    <p><strong>Customer Name:</strong> ${reservation.firstName} ${reservation.lastName}</p>
                    <p><strong>Customer Number:</strong> ${reservation.phoneNumber}</p>
                    <p><strong>Movie:</strong> ${reservation.movieTitle}</p>
                    <p><strong>Date:</strong> ${reservation.screeningDate}</p>
                    <p><strong>Seats:</strong> ${reservation.seats.map(seat => `Row ${seat.row}, Seat ${seat.number}`).join(', ')}</p>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            popup.remove();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);

    const closeBtn = popup.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        popup.remove();
        document.removeEventListener('keydown', handleEsc);
    });
}

const findReservationBtn = document.querySelector("#findReservationBtn");
findReservationBtn?.addEventListener("click", openFindReservation);

function openFindReservation() {
    const popup = document.createElement('div');
    popup.className = 'findReservationPopup';

    popup.innerHTML = `
        <div class="findReservation-section">
            <div class="findReservation-box">
                <h2>Find Reservation</h2>
                <form class="findReservation-form">
                    <input type="text" 
                           id="reservationId" 
                           name="reservationId" 
                           placeholder="Enter 4-digit reservation code"
                           pattern="{4}"
                           maxlength="4"
                           required>
                    <div class="button-group">
                        <button type="submit" class="adminButton">Find</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

  const handleEsc = (e) => {
        if (e.key === 'Escape') {
            popup.remove();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);

    popup.addEventListener('click', () => {
        popup.remove();
        document.removeEventListener('keydown', handleEsc);
    });


    const form = popup.querySelector('.findReservation-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = form.reservationId.value;

        try {
            const reservation = await fetchAnyUrl(`${API_BASE}/reservations/${id}`);
            if (reservation) {
                popup.remove();
                openReservationDetails(reservation);
            } else {
                alert('Reservation not found');
            }
        } catch (error) {
            alert('Error finding reservation');
            console.error(error);
        }
    });
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
        button.className = 'reservation-delete-btn';
        button.addEventListener('click', async () => {
            const reservation = await postObjectAsJson(`${API_BASE}/employee/${employee.employeeId}`, employee.employeeId, "DELETE");
            if (!reservation.ok) {
                alert("Fejl i at sende info" + res.status);
                return;
            }
            alert(`${employee.employeeName} has been deleted`);
            fetchEmployees();
        })
        adminContentEmployeeElement.appendChild(button);
    })

}

function viewMovies() {
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
let createScrButton = document.getElementById("adminButtonScreening");


async function fetchAllMoviesAndTheaters() {
    allMoviesInSystem = [];
    allTheaters = [];
    allMoviesInSystem = await fetchAnyUrl("http://localhost:8080/api/v1/movies");
    allTheaters = await fetchAnyUrl("http://localhost:8080/api/v1/theaters")

    if (allMoviesInSystem && allTheaters) {

    } else {
        alert("fejl ved kald til movie og theaters backend url," + " vil du vide mere så kig i console")
    }
}

createScrButton.addEventListener("click", () => {
    createScreeningContainer.style.display = "flex";
    createNewScreening(allMoviesInSystem, allTheaters);
})

function createNewScreening(movies, theaters) {
    createScreeningContainer.innerHTML = "";

    if (!movies || movies.length === 0) {
        createScreeningContainer.innerHTML = "Could not find any movies, create it before the screening";
        return
    }
    if (!theaters || theaters.length === 0) {
        createScreeningContainer.innerHTML = "could not find any theaters, create it before the screening"
        return
    }




    const inputContainer = document.createElement("div");
    inputContainer.className = "update-overlay";

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
    selectTheater.id = "selectTheater";

    theaters.forEach(theater => {
        const theaterOption = document.createElement("option");
        theaterOption.value = theater.theaterId;
        theaterOption.textContent = theater.theaterName;
        selectTheater.appendChild(theaterOption);
    })

    const screeningDateLabel = document.createElement("label");
    screeningDateLabel.textContent = "Date:";
    screeningDateLabel.className = "screeningDateLabel";

    const dateInput = document.createElement("input");
    dateInput.id = "screeningDate";
    dateInput.type = "date";
    dateInput.required = true;


    const timeLabel = document.createElement("label");
    timeLabel.textContent = "Time:";

    const timeInput = document.createElement("input");
    timeInput.type = "time"
    timeInput.id = "startTime"
    timeInput.required = true;


    const priceLabel = document.createElement("label");
    priceLabel.textContent = "Price:";

    const princeInput = document.createElement("input");
    princeInput.type = "number";
    princeInput.id = "price";
    princeInput.required = true;
    princeInput.min = 0;

    const submitScreeningButton = document.createElement("button");
    submitScreeningButton.type = "submit";
    submitScreeningButton.className = "adminButton green"
    submitScreeningButton.textContent = "Create Screening";

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
        const newScreening = {
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



async function fetchAllScreenings() {
    clearScreeningsTable();
    allScreenings = await fetchAnyUrl("http://localhost:8080/api/v1/screenings");

    if (allScreenings && allScreenings.length > 0) {
        allScreenings.forEach(displayAllScreenings)
    } else {
    }

}
// har tilføjet denne så jeg ikke fik den samme screening flere gange
function clearScreeningsTable() {
    while (tableScreening.rows.length > 1) {
        tableScreening.deleteRow(1);
    }
}


function displayAllScreenings(screenings) {
    if (!screenings) {
        return
    }



    let cellCount = 0;
    let rowCount = tableScreening.rows.length;
    let row = tableScreening.insertRow(rowCount);

    let cell = row.insertCell(cellCount++);
    cell.innerHTML = screenings.movie.movieTitle;
    cell.style.width = "25%";

    cell = row.insertCell(cellCount++);
    cell.innerHTML = screenings.theater.theaterName;
    cell.style.width = "25%";

    cell = row.insertCell(cellCount++);
    cell.innerHTML = screenings.screeningDate;
    cell.style.width = "25%";

    cell = row.insertCell(cellCount++);
    cell.innerHTML = formatTime(screenings.startTime);
    cell.style.width = "25%";

    cell = row.insertCell(cellCount++);
    cell.innerHTML = screenings.price + " kr";
    cell.style.width = "25%";

    cell = row.insertCell(cellCount++);
    const updateScreening = document.createElement("input");
    updateScreening.type = "button";
    updateScreening.setAttribute("Value", "Update");
    updateScreening.className = "adminButton grey";
    cell.appendChild(updateScreening);

    updateScreening.onclick = function () {
        row.remove();
        updateScreeningFunc(screenings);
    }

    cell = row.insertCell(cellCount++);
    const deleteScrenning = document.createElement("input");
    deleteScrenning.type = "button";
    deleteScrenning.className = "adminButton delete";
    deleteScrenning.setAttribute("Value", "Delete")
    cell.appendChild(deleteScrenning);

    deleteScrenning.onclick = function () {
        row.remove();
        deleteScreeningFunc(screenings)

    }



}
// Laver tidspunkt fra 1230 til 12:30
function formatTime(num) {
    let str = num.toString().padStart(4, "0");
    return `${str.slice(0, 2)}:${str.slice(2)}`;
}


async function deleteScreeningFunc(screening) {
    const screeningDeleted = `\n ${screening.movie.movieTitle} \n ${screening.theater.theaterName} \n ${screening.screeningDate} \n ${formatTime(screening.startTime)} \n ${screening.price} kr \n`;
    try {
        const delSrc = await postObjectAsJson(postScreeningUrl + "/" + screening.screeningId, screening, "DELETE");
        if (!delSrc.ok) {
            const srcMsg = await delSrc.text().catch(() => '');
            throw new Error(srcMsg)
        }
        alert(`Screening deleted: ${screeningDeleted}`);
        await fetchAllScreenings();
    } catch (err) {
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
    saveButton.classList.add('adminButton')
    saveButton.textContent = "Save Changes";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.textContent = "Cancel";
    cancelButton.className = "adminButton grey";
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


const addEmployee = document.querySelector("#addEmployeeBtn");
addEmployee.addEventListener("click", openAddEmployee);

function openAddEmployee() {
    const addEmployeeFrame = document.querySelector('.addEmployeeFrame');
    addEmployeeFrame.classList.add('active');


    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            addEmployeeFrame.classList.remove('active');
            document.querySelector('.addEmployee-form').reset();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);

    const form = document.querySelector('.addEmployee-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const employeeData = {
            employeeName: formData.get('employeeName'),
            employeePassword: formData.get("employeePassowrd"),
            employeeType: formData.get('employeeType'),
            employeeCreatedDate: new Date().toISOString().slice(0, 10)
        };

        console.log(employeeData);

        try {
            const response = await fetch(`${API_BASE}/employee`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(employeeData)
            });

            if (response.ok) {
                addEmployeeFrame.classList.remove('active');
                form.reset();
                fetchEmployees();
            } else {
                alert('Failed to add employee');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding employee');
        }
    });
}




