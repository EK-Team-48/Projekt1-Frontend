import { fetchAnyUrl, postObjectAsJson } from './modulejson.js';


const API_BASE = 'http://localhost:8080/api/v1';


let dashboardFrame, dashboardTheaters, dashboardMovies, dashboardScreenings, dashboardReservations, dashboardEmployees, theaterFrame, movieFrame, screeningsFrame, reservationsFrame, employeeFrame, content;

let theaterContent;


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
    /* dashboardMovies.addEventListener('click', viewMovies);
    dashboardScreenings.addEventListener('click', viewScreenings);
    dashboardReservations.addEventListener('click', viewReservations);
    dashboardEmployees.addEventListener('click', viewEmployees); */

})

    function closeView() {
        theaterFrame.style.display = 'none';
        movieFrame.style.display = 'none';
        screeningsFrame.style.display = 'none';
        reservationsFrame.style.display = 'none';
        employeeFrame.style.display = 'none';
    }


    function viewTheaters() {
        console.log("hejj");
        fetchTheaters();
        theaterFrame.style.display = 'flex';
    }

    async function fetchTheaters() {
        content.innerHTML = '';
        theaterContent = await fetchAnyUrl(`${API_BASE}/theaters`);

        theaterContent.forEach((t) => {
            
            const adminContentTheaterElement = document.createElement('div');
            adminContentTheaterElement.className = "adminContentTheaterElement";
            content.appendChild(adminContentTheaterElement);

            const title = document.createElement('h2');
            title.textContent = t.theaterName;
            adminContentTheaterElement.appendChild(title);

            const button = document.createElement('button');
            button.textContent = 'Delete';
            button.className = 'adminButton delete';
            adminContentTheaterElement.appendChild(button);
            console.log(t);
        })

        console.log(theaterContent);

    }

    


