// app.js
import { fetchAnyUrl } from './modulejson.js';

const API_BASE = 'http://localhost:8080/api/v1';

let allMovies = [];
let container, modal, titleEl, genresEl, descEl, trailerContainer, movieDetailsContent, abc;
let bookButtonHandler = null;

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
