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
        button.addEventListener('click', () => {
            //Delete Request
        })
        adminContentTheaterElement.appendChild(button);
        console.log(t);
    })

    console.log(theaterContent);

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

function viewScreenings() {

}

function fetchScreenings() {

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
                <button class="adminButton close-btn">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    const closeBtn = popup.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => popup.remove());
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
                        <button type="button" class="adminButton close-btn">Close</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    const closeBtn = popup.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => popup.remove());

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
            const reservation = await postObjectAsJson(`${API_BASE}/employee/${employee.employeeId}`, employee.employeeId,"DELETE");
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


const addEmployee = document.querySelector("#addEmployeeBtn");
addEmployee.addEventListener("click", openAddEmployee);

function openAddEmployee() {
  const addEmployeeFrame = document.querySelector('.addEmployeeFrame');
  const closeBtn = addEmployeeFrame.querySelector('.close-btn');

      closeBtn.addEventListener('click', () => {
        addEmployeeFrame.classList.remove('active');
        document.querySelector('.addEmployee-form').reset();
    });

  addEmployeeFrame.classList.add('active');

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




