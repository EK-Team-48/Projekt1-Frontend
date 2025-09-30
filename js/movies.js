// app.js
import { fetchAnyUrl } from './modulejson.js';

const API_BASE = 'http://localhost:8080/api/v1';

let allMovies = [];
let container, modal, titleEl, genresEl, descEl;

document.addEventListener('DOMContentLoaded', () => {
    container = document.querySelector('.filmBoxContainer');
    modal = document.getElementById('movieDetails');
    titleEl = document.getElementById('movieTitle');
    genresEl = document.getElementById('genres');
    descEl = document.getElementById('movieDescription');

    fetchMovies();

    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMovieDetails(); });
    modal.addEventListener('click', e => { if (e.target === modal) closeMovieDetails(); });
});

async function fetchMovies() {
    try {
        allMovies = await fetchAnyUrl(`${API_BASE}/movies`);
        renderMovies(allMovies);
    } catch (err) {
        container.innerHTML = `${err.message}</p>`;
    }
}

function renderMovies(list) {
    container.innerHTML = '';
    if (!list.length) {
        container.innerHTML = `<p>No movie found.</p>`;
        return;
    }

    list.forEach(m => {
        const box = document.createElement('div');
        box.className = 'filmBox';
        box.tabIndex = 0;
        box.setAttribute('role', 'button');

        const poster = document.createElement('div');
        poster.className = 'filmBox__poster';
        poster.style.backgroundImage = `url("${m.movieImg}")`;

        const t = document.createElement('div');
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
    modal.style.display = 'flex';
}

function closeMovieDetails() {
    modal.style.display = 'none';
}

window.closeMovieDetails = closeMovieDetails;
