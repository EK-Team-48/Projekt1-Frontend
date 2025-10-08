import { fetchAnyUrl, postObjectAsJson } from './modulejson.js';

const API_BASE = 'http://localhost:8080/api/v1';

let allMovies = [];
let allGenres = [];
let allAgeLimits = [];
let allScreenings = [];
let container, addMovieBtn;

document.addEventListener('DOMContentLoaded', () => {
    container = document.querySelector('.movieHandlerBoxContainer');
    addMovieBtn = document.getElementById("addMovieBtn");

    fetchMovies();
    fetchGenres();
    fetchAgeLimits();
    fetchScreenings();

    addMovieBtn.addEventListener('click', () => movieMaker())

});

async function fetchMovies() {
    try {
        allMovies = await fetchAnyUrl(`${API_BASE}/movies`);
        renderMovies(allMovies);
    } catch (err) {
        container.innerHTML = `${err.message}</p>`;
    }
}

async function fetchGenres() {
    try {
        allGenres = await fetchAnyUrl(`${API_BASE}/genres`);
    } catch (err) {
        container.innerHTML = `${err.message}</p>`;
    }
}

async function fetchAgeLimits() {
    try {
        allAgeLimits = await fetchAnyUrl(`${API_BASE}/ageLimits`);
    } catch (err) {
        container.innerHTML = `${err.message}</p>`;
    }
}

async function fetchScreenings() {
    try {
        allScreenings = await fetchAnyUrl(`${API_BASE}/screenings`);
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
        box.className = 'movieHandlerBox';
        box.tabIndex = 0;

        const poster = document.createElement('div');
        poster.className = 'movieHandlerBox__poster';
        poster.style.backgroundImage = `url("${m.movieImg}")`;
        poster.setAttribute('role', 'button');

        const t = document.createElement('h3');
        t.className = 'movieHandlerBox__title';
        t.textContent = m.movieTitle;

        const d = document.createElement('button');
        d.className = 'deleteMovieBtn';
        d.textContent = "Delete Movie"

        box.appendChild(poster);
        box.appendChild(t);
        box.appendChild(d);
        poster.addEventListener('click', () => openMovieEditor(m));

        d.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            deleteMovie(m);
        });

        container.appendChild(box);
    });
}

function openMovieEditor(m) {

    let oldEditor = document.querySelector('.movieEditorModal');
    if (oldEditor) oldEditor.remove();

    const modal = document.createElement('div');
    modal.className = 'movieEditorModal';
    modal.innerHTML = `
        <div class="movieEditorContent">
            <h2>Edit Movie</h2>
            <label>Image URL:</label>
            <input type="text" id="movieImg" value="${m.movieImg}" class="movieInput"/>

            <label>Title:</label>
            <input type="text" id="movieTitle" value="${m.movieTitle}" class="movieInput"/>

            <label>Description:</label>
            <textarea id="description">${m.description}</textarea>
            
            <label>Duration</label>
            <input type="text" id="movieDuration" value="${m.duration}" class="movieInput"/>

            <label>Trailer Link:</label>
            <input type="text" id="trailerLink" value="${m.trailerLink}" class="movieInput"/>

            <label>Age Limit:</label>
            <select id="ageLimit">
                ${allAgeLimits.map(limit => `
                    <option value="${limit.ageLimitId}" ${m.ageLimit?.ageLimitId === limit.ageLimitId ? 'selected' : ''}>
                            ${limit.ageRating}
                    </option>`).join('')}
            </select>

            <label>Genres:</label>
            <div class="genreCheckboxes">
                ${allGenres.map(g => `
                    <label>
                        <input type="checkbox" value="${g.genreId}" ${m.genres?.some(mg => mg.genreId === g.genreId) ? 'checked' : ''}>
                        ${g.genre}
                    </label>`).join('')}
            </div>

            <div class="editorButtons">
                <button id="saveBtn">Save</button>
                <button id="cancelBtn">Cancel</button>
            </div>
        </div>
    `;

    modal.querySelector('#cancelBtn').addEventListener('click', () => modal.remove());

    modal.querySelector('#saveBtn').addEventListener('click', async () => {

        const selectedAgeLimitId = parseInt(modal.querySelector('#ageLimit').value);
        const ageLimitObj = allAgeLimits.find(a => a.ageLimitId === selectedAgeLimitId);

        const genreById = new Map(allGenres.map(g => [g.genreId, g]));
        const checkboxes = modal.querySelectorAll('.genreCheckboxes input:checked');
        const genresArray = Array.from(checkboxes, cb => genreById.get(parseInt(cb.value)))
            .filter(Boolean);

        const updatedMovie = {
            movieId: m.movieId,
            movieImg: modal.querySelector('#movieImg').value,
            movieTitle: modal.querySelector('#movieTitle').value,
            description: modal.querySelector('#description').value,
            duration: modal.querySelector('#movieDuration').value,
            trailerLink: modal.querySelector('#trailerLink').value,
            ageLimit: {
                ageLimitId: ageLimitObj?.ageLimitId,
                ageRating: ageLimitObj?.ageRating
            },
            genres: genresArray.map(g => ({
                genreId: g.genreId,
                genre: g.genre
            }))
        };

        try {
            await postObjectAsJson(`${API_BASE}/movies/${m.movieId}`, updatedMovie, 'PUT');
            modal.remove();
            await fetchMovies();
        } catch (err) {
            alert('Error saving movie: ' + err.message);
        }
    });

    document.body.appendChild(modal);
}

async function deleteMovie(movie) {
    try {
        const res = await postObjectAsJson(`${API_BASE}/movies/${movie.movieId}`, movie, "DELETE");
        if (!res.ok) {
            const msg = await res.text().catch(() => '');
            throw new Error(msg || `HTTP ${res.status}`);
        }
        alert(`${movie.movieTitle} has been deleted`);
        await fetchMovies();
    } catch (err) {
        alert(`${movie.movieTitle} is attached to a screening. Remove/Delete the screening before deleting the movie.`);
    }
}

async function movieMaker() {

    let oldEditor = document.querySelector('.movieEditorModal');
    if (oldEditor) oldEditor.remove();

    const movieWindow = document.createElement('div');
    movieWindow.className = 'movieEditorModal';
    movieWindow.innerHTML = `
        <div class="movieEditorContent">
            <h2>Edit Movie</h2>
            <label>Image URL:</label>
            <input type="text" id="movieImg" class="movieInput"/>

            <label>Title:</label>
            <input type="text" id="movieTitle" class="movieInput"/>

            <label>Description:</label>
            <textarea id="description"></textarea>
            
            <label>Duration</label>
            <input type="text" id="movieDuration" class="movieInput"/>

            <label>Trailer Link:</label>
            <input type="text" id="trailerLink" class="movieInput"/>

            <label>Age Limit:</label>
            <select id="ageLimit">
                ${allAgeLimits.map(limit => `
                    <option value="${limit.ageLimitId}">${limit.ageRating}</option>
                `).join('')}
            </select>

            <label>Genres:</label>
            <div class="genreCheckboxes">
                ${allGenres.map(g => `
                    <label>
                        <input type="checkbox" value="${g.genreId}">
                        ${g.genre}
                    </label>
                `).join('')}
            </div>

            <div class="editorButtons">
                <button id="saveBtn">Save</button>
                <button id="cancelBtn">Cancel</button>
            </div>
        </div>
    `;

    movieWindow.querySelector('#cancelBtn').addEventListener('click', () => movieWindow.remove());

    movieWindow.querySelector('#saveBtn').addEventListener('click', async () => {

        const selectedAgeLimitId = parseInt(movieWindow.querySelector('#ageLimit').value);
        const ageLimitObj = allAgeLimits.find(a => a.ageLimitId === selectedAgeLimitId);

        const genreById = new Map(allGenres.map(g => [g.genreId, g]));
        const checkboxes = movieWindow.querySelectorAll('.genreCheckboxes input:checked');
        const genresArray = Array.from(checkboxes, cb => genreById.get(parseInt(cb.value)))
            .filter(Boolean);

        const newMovie = {
            movieImg: movieWindow.querySelector('#movieImg').value,
            movieTitle: movieWindow.querySelector('#movieTitle').value,
            description: movieWindow.querySelector('#description').value,
            duration: movieWindow.querySelector('#movieDuration').value,
            trailerLink: movieWindow.querySelector('#trailerLink').value,
            ageLimit: {
                ageLimitId: ageLimitObj?.ageLimitId,
                ageRating: ageLimitObj?.ageRating
            },
            genres: genresArray.map(g => ({
                genreId: g.genreId,
                genre: g.genre
            }))
        };

        try {
            await postObjectAsJson(`${API_BASE}/movies`, newMovie, 'POST');
            movieWindow.remove();
            await fetchMovies();
        } catch (err) {
            alert('Error saving movie: ' + err.message);
        }
    });

    document.body.appendChild(movieWindow);
}
