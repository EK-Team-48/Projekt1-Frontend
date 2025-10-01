import{fetchAnyUrl} from "/modulejson.js";
console.log("er i consolen")

//de her to url skal blive mere dynamiske, så 5 tallet ikke er hardcodet, men kommer fra simons side
const urlScreening = "http://localhost:8080/api/v1/screenings/5";
const urlMovie = "http://localhost:8080/api/v1/movies/5";

let scrContainer, movieContainer;
let screenings, movie = [];

//loader de to fetchmetoder, når man starter skitet
document.addEventListener("DOMContentLoaded", ()=>{
    scrContainer = document.querySelector(".screeningBoxContainer");
    movieContainer = document.querySelector(".movieContainer");
    fetchMovie();
    fetchScreening();
})


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
        movieDetails.className = "movieDetails";


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


async function fetchScreening(){
    screenings = await fetchAnyUrl(urlScreening);
    if(screenings){
        createScreeningSchedule(screenings);
    } else {
        alert("fejl ved kald til backend url=" + urlScreening + " vil du vide mere så kig i console")
    }
}


async function fetchMovie(){
    movie = await fetchAnyUrl(urlMovie);
    if(movie){
        createMoviePoster(movie);
    } else {
        alert("fejl ved kald til backend url=" + urlMovie + " vil du vide mere så kig i console")
    }
}

