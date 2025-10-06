// app.js
import { fetchAnyUrl, postObjectAsJson } from './modulejson.js';

const API_BASE = 'http://localhost:8080/api/v1';

let allMovies = [];
let screenings = [];
let seats;
let bookedSeats;
let container, modal, modal2, modal3, titleEl, genresEl, descEl, trailerContainer, movieDetailsContent, abc, price, tickets, confirmButton, scrContainer, movieContainer, chooseTime, background, genre, search;
let bookButtonHandler = null;
let ticketCounter = 0;
let priceCounter = 0;
const urlScreening = API_BASE + "/screenings";

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
    abc = document.querySelector("#abc");
    price = document.querySelector('#price');
    tickets = document.querySelector('#tickets');
    confirmButton = document.querySelector('.confirm-btn');
    genre = document.querySelector('#genre');
    search = document.querySelector('#search');

    scrContainer = document.querySelector(".screeningBoxContainer");

    movieContainer = document.querySelector(".movieContainer");

    chooseTime = document.querySelector(".vælgSpilletid");

    background = document.querySelector(".background");


    

    fetchMovies();
    renderSeatsByScreening();
    loadGenres();
    window.closeView = closeView;

    tickets.textContent = ticketCounter;
    price.textContent = priceCounter;
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeView(); });
    modal.addEventListener('click', e => { if (e.target === modal) closeView(); });
    modal2.addEventListener('click', e => { if (e.target === modal2) closeView(); });
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
        abc.removeEventListener('click', bookButtonHandler)
    }

    bookButtonHandler = () => testHanni(movie);

    abc.addEventListener("click", bookButtonHandler);

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
    modal3.style.display = 'none';
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

async function handleConfirmClick() {
  const seatsToBook = Array.from(selectedSeatsMap.values());

  if (seatsToBook.length === 0) {
    alert("Vælg venligst sæder inden du booker");
    return;
  }

  const bookingPayload = {
    screeningId: 1,
    seatIds: seatsToBook.map(seat => seat.seatId),
  };

  const BOOKING_API_URL = `${API_BASE}/bookedseats`;



  console.log(bookingPayload);

  try {
    console.log("Attempting to book seats with payload:", bookingPayload);

    const response = await postObjectAsJson(
      BOOKING_API_URL,
      bookingPayload,
      'POST'
    )

    if(response.ok) {
      const result = await response.json();
      selectedSeatsMap.clear();
    } else {
      const errorText = await response.text();
      console.error("Booking failed:", response.status, errorText);
      alert(`Booking failed. Status: ${response.status}`);
    }

  } catch(e) {
    console.error("Error during post operation:", e);
        alert("An unexpected error occurred.");
  }

}


async function renderSeatsByScreening(screeningId) {
  const seatContainer = document.querySelector(".seatContainer");
  seats = await fetchAnyUrl(`${API_BASE}/seats/${1}`);
  console.log(seats);
  bookedSeats = await fetchAnyUrl(`${API_BASE}/bookedseats/${1}`)

  const bookedSeatsIds = new Set(bookedSeats.map(seat => seat.seatId));

  if (!seats || !seats.length) {
    seatContainer.innerHTML = "<p>Ingen sæder.</p>";
    return;
  }

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
  }

}


//Hannis funktion
function testHanni(movie) {
    displayScreenings();
    fetchScreening(movie.movieId);
    closeView();

}



function displayScreenings(){
    scrContainer.style.display = 'grid';
    movieContainer.style.display = 'flex';
    chooseTime.style.display = 'flex';
}

function createMoviePoster(movie){
    movieContainer.innerHTML = "";
    if (!movie || movie.length === 0) {
        movieContainer.innerHTML = `<p>Could not find movie</p>`;
        return;
    }
    const movieBox = document.createElement("div");
    movieBox.className="movieBox";


    const moviePoster = document.createElement('div');
    moviePoster.className = 'moviePoster';
    moviePoster.style.backgroundImage = `url("${movie.movieImg}")`;


    const movieDetails = document.createElement("div");
    movieDetails.className = "movieDetailsBook";


    const movieTitle = document.createElement("h1");
    movieTitle.className="movieTitle";
    movieTitle.textContent = movie.movieTitle


    const movieDesc = document.createElement("p");
    movieDesc.className = "movieDesc";
    movieDesc.textContent = movie.description;


    const ageRating = document.createElement("p");
    ageRating.className ="ageRating";
    ageRating.textContent = movie.ageLimit.ageRating;


    const genreList = document.createElement("P");
    genreList.className = "genreList";
    genreList.textContent = movie.genres.map(g => g.genre).join(", ");


    movieDetails.appendChild(movieTitle);
    movieDetails.appendChild(movieDesc);
    movieDetails.appendChild(ageRating);
    movieDetails.appendChild(genreList);

    movieBox.appendChild(moviePoster);
    movieBox.appendChild(movieDetails);

    movieContainer.appendChild(movieBox);

}

function createScreeningSchedule(screenings) {
    scrContainer.innerHTML = "";

    if (!screenings || screenings.length === 0) {
        scrContainer.innerHTML = `<p>No times available</p>`;
        return;
    }

    //Gruppere screening via date
    const screeningsByDate = screenings.reduce((acc, screening) => {
        const date = screening.screeningDate;
        if (!acc[date]) acc[date] = [];
        acc[date].push(screening);
        return acc;
    }, {});

    //Sortere dates ud fra ældst først
    const sortedDates = Object.keys(screeningsByDate).sort(
        (a, b) => new Date(a) - new Date(b)
    );

    //Opretter en screening box for alle screenings
    sortedDates.forEach(date => {
        const screeningsForDate = screeningsByDate[date];

        const srcBox = document.createElement("div");
        srcBox.className = "screeningBox";

        const srcDate = document.createElement("time");
        srcDate.textContent = new Date(date).toLocaleDateString("da-DK", {
            weekday: "long",
            day: "numeric",
            month: "long"
        });
        srcBox.appendChild(srcDate);

        const boxForTimes = document.createElement("div");
        boxForTimes.className = "boxForTimes";

        screeningsForDate.forEach(s => {
            const timeBox = document.createElement("a");
            timeBox.className = "timeBox";

            const theater = document.createElement("p");
            theater.className = "theaterName";
            //theater.textContent = s.theaterName; Lige nu er den hardcoded, fordi jeg ikke får theater med API
            theater.textContent = "sal 1"

            const time = document.createElement("p");
            time.className = "startTime";

            //format time fra 1200 -> 12.00

            let formatTime =  (s.startTime / 100).toFixed(2);

            time.textContent = formatTime;

            timeBox.addEventListener("click", () => {
                //her tænker jeg at næste view bliver trigget?
                //Brug s som parameter for at få screening objektet med, fx:
                //     vic's Function(s)

            })

            timeBox.appendChild(theater);
            timeBox.appendChild(time);
            boxForTimes.appendChild(timeBox);
        });

        srcBox.appendChild(boxForTimes);
        scrContainer.appendChild(srcBox);
    });
}

async function fetchScreening(movieId){
    screenings = await fetchAnyUrl(urlScreening + "/" +  movieId);
    try {
        if(screenings && screenings.length > 0){
            createScreeningSchedule(screenings);
            const movie = screenings[0].movie;
            createMoviePoster(movie);
        } else {
            movieContainer.innerHTML = "";
            chooseTime.style.display = "none";
            scrContainer.innerHTML = `<p style="color: white"> No screenings for this movie at the time</p>`;
        }
    } catch (err) {
        console.error(err);
    }

}
