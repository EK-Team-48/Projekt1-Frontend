import { fetchAnyUrl, postObjectAsJson } from './modulejson.js';

const API_BASE = 'http://localhost:8080/api/v1';

let allMovies = [];
let allGenres = [];
let allAgeLimits = [];
let allScreenings = [];
let container, addMovieBtn, gBtn, alBtn, search;

document.addEventListener('DOMContentLoaded', () => {
    container = document.querySelector('.movieHandlerBoxContainer');
    addMovieBtn = document.getElementById("addMovieBtn");
    gBtn = document.getElementById("manageGenres");
    alBtn = document.getElementById("manageAgeLimits");
    search = document.getElementById("search");

    fetchMovies();
    fetchGenres();
    fetchAgeLimits();
    fetchScreenings();

    addMovieBtn.addEventListener('click', () => movieMaker());
    gBtn.addEventListener('click', () => openGenreDetails());
    alBtn.addEventListener('click', () => openAgeLimitDetails());
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
        d.className = 'adminButton delete';
        d.textContent = "Delete"

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
                <button class="adminButton" id="saveBtn">Save</button>
                <button class="adminButton delete" id="cancelBtn">Cancel</button>
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
            throw new Error(msg);
        }
        alert(`${movie.movieTitle} has been deleted`);
        await fetchMovies();
    } catch (err) {
        alert(`${movie.movieTitle} is attached to a screening. Remove/Delete the screening before deleting the movie.`);
    }
}

async function movieMaker() {

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
                <button class="adminButton" id="saveBtn">Save</button>
                <button class="adminButton delete" id="cancelBtn">Cancel</button>
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

function openGenreDetails() {

    const genreWindow = document.createElement('div');
    genreWindow.className = 'movieEditorModal';
    genreWindow.innerHTML = `
    <div class="movieEditorContent">
      <div class="row">
        <input type="text" placeholder="etc. Horror, Drama, Sci-Fi" id="newGenre">
        <button class="adminButton" id="addGenre">Add Genre</button>
      </div>

      <table class="table" id="tblGenres">
        <thead>
          <tr>
            <th>Genres</th>
            <th></th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>

      <div class="editorButtons">
        <button class="adminButton grey" id="cancelBtn">Cancel</button>
      </div>
    </div>
  `;

    document.body.appendChild(genreWindow);

    const tbody = genreWindow.querySelector('#tblGenres tbody');
    const addGenreBtn = genreWindow.querySelector('#addGenre');
    const input = genreWindow.querySelector('#newGenre');

    function createTable(genre) {
        const row = tbody.insertRow();
        row.id = `genre-${genre.genreId}`;

        const cellGenre = row.insertCell();
        cellGenre.textContent = genre.genre;

        const cellDeleteGenre = row.insertCell();
        const pbDelete = document.createElement('button');
        pbDelete.type = 'button';
        pbDelete.textContent = 'Delete';
        pbDelete.className = 'adminButton delete';
        cellDeleteGenre.appendChild(pbDelete);

        pbDelete.onclick = async function () {
            try {
                const res = await postObjectAsJson(`${API_BASE}/genres/${genre.genreId}`, genre, "DELETE");
                if (!res.ok) {
                    const msg = await res.text().catch(() => '');
                    throw new Error(msg || `HTTP ${res.status}`);
                }
                allGenres = allGenres.filter(g => g.genreId !== genre.genreId);
                renderRows();
            } catch (err) {
                alert(`${genre.genre} is attached to a movie. Remove/Edit the movies before deleting the genres.`);
            }
        };
    }

    function renderRows() {
        tbody.innerHTML = '';
        allGenres.forEach(createTable);
    }

    addGenreBtn.addEventListener('click', async () => {
        const name = (input.value).trim();
        if (!name) return;
        if (allGenres.some(g => g.genre.toLowerCase() === name.toLowerCase())) {
            alert('Genre already exists');
            return;
        }

        try {
            const res = await postObjectAsJson(`${API_BASE}/genres`, { genre: name }, 'POST');
            if (!res.ok) {
                const msg = await res.text().catch(() => '');
                throw new Error(msg);
            }
            allGenres = await fetchAnyUrl(`${API_BASE}/genres`);
            input.value = '';
            renderRows();
        } catch (err) {
            alert('Genre already exist');
        }
    });

    genreWindow.querySelector('#cancelBtn').addEventListener('click', () => genreWindow.remove());

    renderRows();
}

function openAgeLimitDetails() {

    const ageLimitWindow = document.createElement('div');
    ageLimitWindow.className = 'movieEditorModal';
    ageLimitWindow.innerHTML = `
    <div class="movieEditorContent">
      <div class="row">
        <input type="text" placeholder="etc. 7, 12, 18" id="newAgeLimit">
        <button class="adminButton" id="addAgeLimit">Add Age Limit</button>
      </div>

      <table class="table" id="tblAgeLimits">
        <thead>
          <tr>
            <th>Age Limits</th>
            <th></th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>

      <div class="editorButtons">
        <button class="adminButton grey" id="cancelBtn">Cancel</button>
      </div>
    </div>
  `;

    document.body.appendChild(ageLimitWindow);

    const tbody = ageLimitWindow.querySelector('#tblAgeLimits tbody');
    const addAgeLimitBtn = ageLimitWindow.querySelector('#addAgeLimit');
    const input = ageLimitWindow.querySelector('#newAgeLimit');

    function createTable(ageLimit) {
        const row = tbody.insertRow();
        row.id = `${ageLimit.ageLimitId}`;

        const cellAgeLimit = row.insertCell();
        cellAgeLimit.textContent = ageLimit.ageRating;

        const cellDeleteAgeLimit = row.insertCell();
        const pbDelete = document.createElement('button');
        pbDelete.type = 'button';
        pbDelete.textContent = 'Delete';
        pbDelete.className = 'adminButton delete';
        cellDeleteAgeLimit.appendChild(pbDelete);

        pbDelete.onclick = async function () {
            try {
                const res = await postObjectAsJson(`${API_BASE}/ageLimits/${ageLimit.ageLimitId}`, ageLimit, "DELETE");
                if (!res.ok) {
                    const msg = await res.text().catch(() => '');
                    throw new Error(msg);
                }
                allAgeLimits = allAgeLimits.filter(al => al.ageLimitId !== ageLimit.ageLimitId);
                renderRows();
            } catch (err) {
                alert(`${ageLimit.ageRating} is attached to a movie. Remove/Edit the movies before deleting the genres.`);
            }
        };
    }

    function renderRows() {
        tbody.innerHTML = '';
        allAgeLimits.forEach(createTable);
    }

    addAgeLimitBtn.addEventListener('click', async () => {
        const val = (input.value).trim();
        if (!val) return;
        if (allAgeLimits.some(al => al.ageRating === val)) {
            alert('Age Limit already exists');
            return;
        }

        try {
            const res = await postObjectAsJson(`${API_BASE}/ageLimits`, { ageRating: val }, 'POST');
            if (!res.ok) {
                const msg = await res.text().catch(() => '');
                throw new Error(msg);
            }
            allAgeLimits = await fetchAnyUrl(`${API_BASE}/ageLimits`);
            input.value = '';
            renderRows();
        } catch (err) {
            alert('Age Limit already exist');
        }
    });

    ageLimitWindow.querySelector('#cancelBtn').addEventListener('click', () => ageLimitWindow.remove());

    renderRows();
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