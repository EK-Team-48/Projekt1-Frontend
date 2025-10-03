// app.js
import { fetchAnyUrl } from './modulejson.js';

const API_BASE = 'http://localhost:8080/api/v1';

let allMovies = [];
let seats;
let bookedSeats;
let container, modal, titleEl, genresEl, descEl, trailerContainer, movieDetailsContent, abc;
let bookButtonHandler = null;

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
    titleEl = document.getElementById('movieTitle');
    genresEl = document.getElementById('genres');
    descEl = document.getElementById('movieDescription');
    trailerContainer = document.getElementById("trailerContainer");
    movieDetailsContent = document.querySelector(".movieDetails-content");
    abc = document.querySelector("#abc");

    

    fetchMovies();
    renderSeatsByScreening();


    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMovieDetails(); });
    modal.addEventListener('click', e => { if (e.target === modal) closeMovieDetails(); });

});


async function fetchMovies() {
    try {
        allMovies = await fetchAnyUrl(`${API_BASE}/movies`);
        console.log(allMovies);
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

//Hannis funktion
function testHanni(movie) {
    console.log(movie.movieId);
    closeMovieDetails();
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

function closeMovieDetails() {
    modal.style.display = 'none';
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

 
//Al Nedenstående javascript er til at filtrere film ud fra genre og søge ud fra deres navne
document.getElementById("genre").addEventListener("change", (e) => {
  const selected = e.target.value;
  filterMoviesByGenre(selected);
});

document.getElementById("search").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  filterMoviesBySearch(query);
});

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


loadGenres();
window.closeMovieDetails = closeMovieDetails;



//Seat Booking


async function renderSeatsByScreening() {
  const seatContainer = document.querySelector(".seatContainer");
  const seats = await fetchAnyUrl(`${API_BASE}/seats/${1}`);

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
    row.style.gap = "6px";

    // Find og sorter sæder i denne række
    const seatsInRow = seats
      .filter(s => Number(s.seatRow) === r)
      .sort((a, b) => Number(a.seatNumber) - Number(b.seatNumber));

    // Tilføj kun seat-elementer (ingen wrappers)
    for (const seat of seatsInRow) {
      const el = document.createElement("div");
      el.className = "seat";
      el.innerHTML = seatSvg;   // din eksisterende SVG
      el.dataset.seatId = seat.seatId; // behold dine felter, hvis du bruger dem
      row.appendChild(el);
    }
    seatContainer.appendChild(row);

    r++;
  }

}


/* async function renderSeatsByScreening() {
    const seatContainer = document.querySelector('.seatContainer');

    seats = await fetchAnyUrl(`${API_BASE}/seats/${2}`);

    //Sæt rækker baseret på theaterId
    
        
        seatContainer.style.gridTemplateColumns = 'repeat(10, 1fr)';
        for (let i = 1; i < 9; i++) {
            const seatRow = document.createElement('div');
            seatRow.setAttribute('id', i);
            seatRow.className = 'seatRow';
            seatRow.style.gridTemplateColumns = 'repeat(10, 1fr)';
            seatContainer.appendChild(seatRow);

            seats.forEach((seat) => {
                if(seat.seatRow == i) {
                    const seatElement = document.createElement('div');
                    seatElement.innerHTML = seatSvg;        
                    seatElement.className = 'seat';
                    seatRow.appendChild(seatElement);
                }
            
             });
        }

} */
    /* let bookedSeats = await fetchAnyUrl(`${API_BASE}/bookedseats/${1}`); */


    function getTotalRowsBySeatList(seatlist) {
        seatlist.for
    }

