// app.js
import { fetchAnyUrl, postObjectAsJson } from './modulejson.js';

const API_BASE = 'http://localhost:8080/api/v1';
const urlScreening = API_BASE + "/screenings";
const API_CUSTOMER = 'http://localhost:8080/api/v1/customer';
const API_RESERVATION = 'http://localhost:8080/api/v1/reservations'

let allMovies = [];
let screenings = [];
let seats;
let bookedSeats;
let selectedScreening = null;
let container, modal, modal2, modal3, titleEl, genresEl, descEl, trailerContainer, 
timeSelectionFrame, timeColumnContainer, timeSelectionFrameContent, movieDetailsContent, 
bookBtn, price, tickets, confirmButton, movieContainer, 
background, genre, search, createUser, test, checkoutButton, checkoutFrame;
let bookButtonHandler = null;
let ticketCounter = 0;
let priceCounter = 0;


const seatSvg = `<svg width="373" height="302" viewBox="0 0 373 302" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M59.6255 62.943C61.8735 27.1287 92.2795 0 128.164 0H244.496C280.524 0 310.983 27.3426 313.109 63.3074C315.642 106.136 315.478 142.505 312.758 185.141C310.614 218.737 283.726 245.44 250.12 247.418C204.942 250.078 167.264 250.032 122.613 247.39C89.1292 245.408 62.2622 218.906 60.004 185.44C57.0857 142.19 56.9444 105.656 59.6255 62.943Z" fill="#D9D9D9"/>
<path d="M296.023 252.852C311.158 250.483 325 262.053 325 277.373C325 290.974 313.944 302 300.343 302C214.166 302 156.788 302 70.598 302C57.0292 302 46 291 46 277.432C46 262.105 59.8773 250.553 75.0129 252.962C156.766 265.977 213.123 265.83 296.023 252.852Z" fill="#D9D9D9"/>
<path d="M327.859 30.2823C326.451 16.8263 336.913 5 350.443 5C362.901 5 373 15.0993 373 27.5574V225.33C373 237.85 362.85 248 350.33 248C336.818 248 326.326 236.248 327.662 222.802C334.863 150.292 335.276 101.163 327.859 30.2823Z" fill="#D9D9D9"/>
<path d="M45.1413 30.2823C46.5494 16.8263 36.0869 5 22.5574 5C10.0993 5 1.90735e-06 15.0993 1.90735e-06 27.5574V225.33C1.90735e-06 237.85 10.1497 248 22.67 248C36.1822 248 46.6737 236.248 45.3382 222.802C38.1366 150.292 37.7242 101.163 45.1413 30.2823Z" fill="#D9D9D9"/>
</svg>
`


document.addEventListener('DOMContentLoaded', () => {
    container = document.querySelector('.filmBoxContainer');
    modal = document.getElementById('movieDetails');
    modal2 = document.querySelector('.seatFrame');
    titleEl = document.getElementById('movieTitle');
    genresEl = document.getElementById('genres');
    descEl = document.getElementById('movieDescription');
    trailerContainer = document.getElementById("trailerContainer");
    movieDetailsContent = document.querySelector(".movieDetails-content");
    bookBtn = document.querySelector("#book-btn");
    price = document.querySelector('#price');
    tickets = document.querySelector('#tickets');
    confirmButton = document.querySelector('.confirm-btn');
    genre = document.querySelector('#genre');
    search = document.querySelector('#search');
    timeSelectionFrame = document.querySelector('.timeSelectionFrame');
    timeSelectionFrameContent = document.querySelector('.timeSelectionFrameContent');
    timeColumnContainer = document.querySelector('.timeColumnContainer');
    createUser = document.querySelector(".checkout-form");
    test = document.querySelector(".checkout-box");
    checkoutButton = document.querySelector(".btn");
    checkoutFrame = document.querySelector(".checkoutFrame");


    movieContainer = document.querySelector(".movieContainer");

    background = document.querySelector(".background");


    

    fetchMovies();
    loadGenres();
    window.closeView = closeView;

    tickets.textContent = ticketCounter;
    price.textContent = priceCounter;
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeView(); });
    modal.addEventListener('click', e => { if (e.target === modal) closeView(); });
    modal2.addEventListener('click', e => { if (e.target === modal2) closeView(); });
    timeSelectionFrame.addEventListener('click', e => { if (e.target === timeSelectionFrame) closeView(); });
    checkoutFrame.addEventListener('click', e => { if (e.target === checkoutFrame) closeView(); });
    confirmButton.addEventListener('click', handleConfirmClick);
    genre.addEventListener("change", (e) => {
      const selected = e.target.value;
      filterMoviesByGenre(selected);
    });
    search.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      filterMoviesBySearch(query);
    });

});

async function fetchMovies() {
    try {
        allMovies = await fetchAnyUrl(`${API_BASE}/movies`);
        renderMovies(allMovies);
    } catch (err) {
        container.innerHTML = `${err.message}</p>`;
    }
}

function renderMovies(allMovies) {
    container.innerHTML = '';
    if (!allMovies.length) {
        container.innerHTML = `<p>No movie found.</p>`;
        return;
    }

    allMovies.forEach(m => {
        const box = document.createElement('div');
        box.className = 'filmBox';
        box.tabIndex = 0;
        box.setAttribute('role', 'button');

        const poster = document.createElement('div');
        poster.className = 'filmBox__poster';
        poster.style.backgroundImage = `url("${m.movieImg}")`;

        const t = document.createElement('h3');
        t.className = 'filmBox__title';
        t.textContent = m.movieTitle;

        box.appendChild(poster);
        box.appendChild(t);
        box.addEventListener('click', () => openMovieDetails(m));

        container.appendChild(box);
    });
}

function openMovieDetails(movie) {
    titleEl.textContent = movie.movieTitle;
    const genreNames = (movie.genres).map(g => g.genre);
    genresEl.textContent = genreNames.join(' • ');
    descEl.textContent = movie.description;

    const videoId = getYouTubeId(movie.trailerLink)
    trailerContainer.innerHTML = "";

    if (videoId) {
        trailerContainer.innerHTML = `
            <iframe width="560" height="315" 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
            </iframe>`;
    } else {
        alert("Invalid Link");
    }

    //håndter book knap, så den resetter hver gang vi trykker på en ny movie og sender movieobjektet videre.
    if (bookButtonHandler) {
        bookBtn.removeEventListener('click', bookButtonHandler)
    }

    bookButtonHandler = () => testHanni(movie);

    bookBtn.addEventListener("click", bookButtonHandler);

    modal.style.display = 'flex';
  
}

function getYouTubeId(trailerLink) {
    let url = trailerLink;

    let videoId = "";
    const urlObj = new URL(url);

    if (urlObj.hostname.includes("youtube.com")) {
        videoId = urlObj.searchParams.get("v");
    } else if (urlObj.hostname.includes("youtu.be")) {
        videoId = urlObj.pathname.slice(1);
    }

    return videoId;
}

function closeView() {
    modal.style.display = 'none';
    modal2.style.display = 'none';
    timeSelectionFrame.style.display = 'none';
    checkoutFrame.style.display = 'none';
}

async function loadGenres() {
    try {
        const response = await fetch("http://localhost:8080/api/v1/genres");
        const res = await response.json();

        const select = document.getElementById("genre");
        select.innerHTML = '<option value=""> All Genres </option>';

        for (const g of res) {
            const option = document.createElement("option");
            option.value = g.genre;
            option.textContent = g.genre;
            select.appendChild(option);
        }
    } catch (err) {
        console.error("Kunne ikke hente genres:", err);
    }
}

function filterMoviesByGenre(genre) {
  if (!genre) {
    renderMovies(allMovies);
    return;
  }

  const filtered = allMovies.filter(movie =>
    movie.genres.some(g => g.genre === genre)
  );
  renderMovies(filtered);
}

function filterMoviesBySearch(query) {
  if (!query) {
    renderMovies(allMovies);
    return;
  }

  const filtered = allMovies.filter(movie =>
    movie.movieTitle.toLowerCase().includes(query));

  renderMovies(filtered);
}






//Seat Booking

const selectedSeatsMap = new Map();

function handleSeatClick(screeningId) {
  const seatDiv = this;
  const seatId = seatDiv.dataset.seatId;

  const seatData = {
    seatId: seatId,
    seatRow: seatDiv.dataset.seatRow,
    seatNumber: seatDiv.dataset.seatNumber,
    theater: {
      id: seatDiv.dataset.theaterId,
      theaterName: seatDiv.dataset.theaterName
    }
  };


  seatDiv.classList.toggle('selected');



  if(seatDiv.classList.contains('selected')) {
    selectedSeatsMap.set(seatId, seatData);
    console.log(selectedSeatsMap);
    ticketCounter++;
    priceCounter += 150;
    tickets.textContent = ticketCounter;
    price.textContent = priceCounter;


  } else {
    selectedSeatsMap.delete(seatId);
    ticketCounter --;
    priceCounter -= 150;
    tickets.textContent = ticketCounter;
    price.textContent = priceCounter;



  }

}

function openPopUP() {
  if (!test) return;
  closeView();
  checkoutFrame.style.display = "flex";
  test.classList.add("active");
}

async function handleConfirmClick() {
  const seatsToBook = Array.from(selectedSeatsMap.values());

  if (seatsToBook.length === 0) {
    alert("Vælg venligst sæder inden du booker");
    return;
  }
  openPopUP();
}


async function renderSeatsByScreening(screening) {
  const seatContainer = document.querySelector(".seatContainer");
  seats = await fetchAnyUrl(`${API_BASE}/seats/${screening.theater.id}`);
  bookedSeats = await fetchAnyUrl(`${API_BASE}/bookedseats/${screening.screeningId}`)

  const bookedSeatsIds = new Set(bookedSeats.map(seat => seat.seatId));

  if (!seats || !seats.length) {
    seatContainer.innerHTML = "<p>Ingen sæder.</p>";
    return;
  }

  //reset data
  selectedSeatsMap.clear();
  ticketCounter = 0;
  priceCounter = 0;
  tickets.textContent = ticketCounter;
  price.textContent = priceCounter;

  // Find antal rækker
  const maxRows = seats.reduce((m, s) => Math.max(m, Number(s.seatRow)), 0);

  // Nulstil container
  seatContainer.innerHTML = "";
  seatContainer.style.display = "grid";
  seatContainer.style.gridTemplateColumns = "1fr"; // en række per linje
  seatContainer.style.gap = "8px";


  // Loop rækker (while)
  let r = 1;
  while (r <= maxRows) {
    const row = document.createElement("div");
    row.className = "seatRow";
    row.dataset.row = String(r);

    // Rækken er et grid, men vi lader kun rigtige seats fylde op (ingen placeholders)
    row.style.display = "grid";
    row.style.gridAutoFlow = "column";
    row.style.gridAutoColumns = "1fr";
    row.style.gap = ".5em";

    // Find og sorter sæder i denne række
    const seatsInRow = seats
      .filter(s => Number(s.seatRow) === r)
      .sort((a, b) => Number(a.seatNumber) - Number(b.seatNumber));

    // Tilføj kun seat-elementer (ingen wrappers)
    seatsInRow.forEach((seat) => {
      const el = document.createElement("div");
      el.innerHTML = seatSvg;

      el.dataset.seatId = seat.seatId;
      el.dataset.seatRow = seat.seatRow;
      el.dataset.seatNumber = seat.seatNumber;
      el.dataset.theaterId = seat.theater.id;
      el.dataset.theaterName = seat.theater.theaterName;

      const isBooked = bookedSeatsIds.has(seat.seatId);
      if(isBooked) {
        el.className = "bookedSeat";
      } else {
        el.className = "seat";
        el.addEventListener('click', handleSeatClick);
      }


      row.appendChild(el);
    })
    
    seatContainer.appendChild(row);

    r++;

    modal2.style.display = 'flex';
  }

}


//Hannis funktion
function testHanni(movie) {
    createMoviePoster(movie);
    fetchScreening(movie.movieId);

    closeView();
    displayScreenings()


}



function displayScreenings(){
    timeSelectionFrame.style.display = "flex";
}

function createMoviePoster(movie){
    movieContainer.innerHTML = ''; 
    if (!movie || movie.length === 0) {
        alert("couldnt find movie");
        return;
    }
    

    /* const moviePoster = document.createElement('div');
    moviePoster.className = 'filmBox__poster';
    moviePoster.style.backgroundImage = `url("${movie.movieImg}")`;
    movieContainer.appendChild(moviePoster); */



    const movieTitle = document.createElement("h1");
    movieTitle.className="movieTitle";
    movieTitle.textContent = movie.movieTitle
    movieContainer.appendChild(movieTitle);
    

    const ageRating = document.createElement("p");
    ageRating.className ="ageRating";
    ageRating.textContent = movie.ageLimit.ageRating;

    const genreList = document.createElement("P");
    genreList.className = "genreList";
    genreList.textContent = movie.genres.map(g => g.genre).join(", ");
    movieContainer.appendChild(genreList);




}

function createScreeningSchedule(screenings) {
    if(timeColumnContainer) timeColumnContainer.innerHTML = ''; 

    if (!screenings || screenings.length === 0) {
        const warning = document.createElement('h3');
        warning.textContent = "No times available.";
        warning.className = "warning";
        timeColumnContainer.appendChild(warning);
        return;

    }


    //Gruppere screening via date
    const screeningsByDate = screenings.reduce((acc, screening) => {
        const date = screening.screeningDate;
        if (!acc[date]) acc[date] = [];
        acc[date].push(screening);
        return acc;
    }, {});


    //Sortere dates ud fra tidligst først
    const sortedDates = Object.keys(screeningsByDate).sort(
        (a, b) => new Date(a) - new Date(b)
        
    );


    //Opretter en screening box for alle screenings
    sortedDates.forEach(date => {
        const screeningsForDate = screeningsByDate[date];
        const screeningDate = new Date(date);

        const timeColumn = document.createElement('div');
        timeColumn.className = 'timeColumn';
        timeColumnContainer.appendChild(timeColumn);

        const timeDataContainer = document.createElement('div');
        timeDataContainer.className = "timeDataContainer";
        timeColumn.appendChild(timeDataContainer);

        const weekdayEl = document.createElement("h4");
        let weekDayElData;
        weekdayEl.className = "screeningWeekday";
        weekDayElData = screeningDate.toLocaleDateString("da-DK", {
            weekday: "long"
        });
        const firstLetter = weekDayElData.charAt(0).toUpperCase();
        const restOfString = weekDayElData.slice(1);
        weekDayElData = firstLetter + restOfString;
        weekdayEl.textContent = weekDayElData
        timeDataContainer.appendChild(weekdayEl);

        const dateEl = document.createElement("p");
        dateEl.className = "screeningDate";
        let dateElData = screeningDate.toLocaleDateString("da-DK", {
            day: "numeric",
            month: "numeric"
        });
        dateElData = dateElData.replace('.', '/');
        dateEl.textContent = dateElData;
        timeDataContainer.appendChild(dateEl);
        


        screeningsForDate.forEach(s => {
            const timeBox = document.createElement("div");
            timeBox.className = "timeBox";
            timeColumn.appendChild(timeBox);

            const time = document.createElement("h4");
            time.className = "startTime";
            let formatTime =  (s.startTime / 100).toFixed(2);
            time.textContent = formatTime;
            timeBox.appendChild(time);


            const theaterName = document.createElement("p");
            theaterName.textContent = s.theater.theaterName;
            timeBox.appendChild(theaterName);

              

            

            timeBox.addEventListener('click', () => {
             selectedScreening = s;
             console.log(selectedScreening);

             closeView();
             renderSeatsByScreening(s)

             
              
            })

        });

        
    });
    
}

async function fetchScreening(movieId){
    try {
        screenings = await fetchAnyUrl(urlScreening + "/movie/" + movieId);
        createScreeningSchedule(screenings);

    } catch (err) {
        console.error(err);
    }

}

const confirmOrder = document.querySelector(".confirm-order");
confirmOrder?.addEventListener("click", async (e) => {
  e.preventDefault();

  const seatsToBook = Array.from(selectedSeatsMap.values());
  const seatIds = seatsToBook.map(seat => seat.seatId);
  const id = self.crypto.randomUUID();

  const creds = Object.fromEntries(new FormData(createUser));
  const userObj = {
    firstName: creds.firstName,
    lastName: creds.lastName,
    age: creds.age,
    number: creds.number
  };

  try {
    const res = await postObjectAsJson(API_CUSTOMER, userObj, "POST");
    if(!res.ok) {
      alert("post virker ikke " + res.status);
      return;
    }

    const response = await res.json();

        const reservationObj = {
        customerID: response.customerId,
        screeningID: selectedScreening.screeningId,
        seatId: seatIds,
        userReservationId: id
      };

      const reservation = await postObjectAsJson(API_RESERVATION, reservationObj, "POST");
      if(!reservation.ok) {
        alert("Fejl i at sende info" + res.status);
        return;
      }


      const bookingPayload = {
        screeningId: selectedScreening.screeningId,
        seatIds: seatIds
      };

    console.log(selectedScreening);

    const seatBookingResponse = await postObjectAsJson(`${API_BASE}/bookedseats`,bookingPayload,"POST");      
    if(!seatBookingResponse.ok) {
      alert("Seat booking failed");
      return;
    }

    const seatsInfo = Array.from(selectedSeatsMap.values())
    const seatDetails = seatsInfo.map(seat => `Row: ${seat.seatRow}, Seat: ${seat.seatNumber}`).join(" | ");
    const theaterName = seatsInfo[0]?.theater.theaterName || 'Unknown Theater';


    selectedSeatsMap.clear();
    test.classList.remove("active");


      const firstName = document.getElementById("firstName").value;
      const lastName = document.getElementById("lastName").value;
      const email = document.getElementById("email").value;
      const number = document.getElementById("number").value;


    const confirmation = `
    <div class="confirmedFrame">
      <div class="confirmed-section">
       <div class="confirmed-box">
        <div class="confirmed-header"><h1>Order confirmation</h1></div>
        <div class="confirmed-text"><i class="fa-solid fa-check"></i></div>
        <div class="confirmed-text"><p>Your order has been confirmed</p></div>
        <div class="confirmex-text"><p style="text-align: center" class="cusomter-id">Rservation id: <br>${id}</p></div>
        <div class="confirmed-text"><p class="customer-name">Name: ${firstName} ${lastName}</p></div>
        <div class="confirmed-text"><p class="customer-email">Email: ${email}</p></div>
        <div class="confirmed-text"><p class="customer-number">Number: ${number}</p></div>
        <div class="confirmed-text"><p class="customer-theater">Theater: ${theaterName}</p></div>
        <div class="confirmed-text"><p class="customer-movie">Movie: ${selectedScreening.movie.movieTitle}</p></div>
        <div class="confirmed-text"><time datetime="2025-01-01">Date: ${selectedScreening.screeningDate} & Start time: ${selectedScreening.startTime}</time></div>
        <div class="confirmed-text"><p class="customer-seats">Booked seats: ${seatDetails}</p></div>
        </div>
    </div>
    </div>
  `;

      document.body.insertAdjacentHTML("beforeend", confirmation);

      const orderConfirmed = document.querySelector(".confirmed-section");
      orderConfirmed.classList.add("active");

  } catch (err) {
    console.error(err);
  }

});






