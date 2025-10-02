import{fetchAnyUrl} from "/modulejson.js";
console.log("er i consolen")

////////////////////////////////
// SIMON ///
/////////////////////////////////

const API_BASE = 'http://localhost:8080/api/v1';

let allMovies = [];
let container, modal, titleEl, genresEl, descEl, trailerContainer, background, scrContainer, bookBtn, movieContainer, chooseTime;

document.addEventListener('DOMContentLoaded', () => {
    scrContainer = document.querySelector(".screeningBoxContainer");
    scrContainer.style.display = 'none';

    movieContainer = document.querySelector(".movieContainer");
    movieContainer.style.display = "none";

    chooseTime = document.querySelector(".vælgSpilletid")
    chooseTime.style.display = "none";

    container = document.querySelector('.filmBoxContainer');
    modal = document.getElementById('movieDetails');
    titleEl = document.getElementById('movieTitle');
    genresEl = document.getElementById('genres');
    descEl = document.getElementById('movieDescription');
    trailerContainer = document.getElementById("trailerContainer");
    background = document.querySelector(".background");
    bookBtn = document.getElementById("bookMovieButton");

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

    bookBtn.textContent = "Book";
    bookBtn.className="book-btn";



    bookBtn.addEventListener("click", () => {
    
        displayScreenings();
    
        fetchScreening(movie.movieId);
    })

    modal.appendChild(bookBtn)



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

function closeMovieDetails() {
    modal.style.display = 'none';
}

window.closeMovieDetails = closeMovieDetails;


function displayScreenings(){
    modal.style.display = 'none';
    background.style.display = 'none';
    scrContainer.style.display = '';
    movieContainer.style.display = "";
    chooseTime.style.display = "";
}




///////////////////////////////
// HANNIBAL ///
//////////////////////////////

//de her to url skal blive mere dynamiske, så 5 tallet ikke er hardcodet, men kommer fra simons side
const urlScreening = "http://localhost:8080/api/v1/screenings";


let screenings = [];


//loader de to fetchmetoder, når man starter skitet



// document.addEventListener("DOMContentLoaded", ()=>{
//     scrContainer = document.querySelector(".screeningBoxContainer");
//     movieContainer = document.querySelector(".movieContainer");
//     fetchScreening();
// })


//laver en movie poster for den givne film, ens med NFBIO
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
    if(screenings && screenings.length > 0){
        createScreeningSchedule(screenings);
        const movie = screenings[0].movie;
        createMoviePoster(movie);
    } else {
        alert("fejl ved kald til backend url=" + urlScreening + " vil du vide mere så kig i console")
    }
}

