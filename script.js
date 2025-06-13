console.log("Script is running")
let currentSong = new Audio();
let songs;
let currentFolder;

// converts seconds to minutes and remaining seconds
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');

    return `${formattedMins}:${formattedSecs}`;
}

async function getSongs(songFile) {
    currentFolder = songFile;
    let a = await fetch(`./${currentFolder}/`)
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${songFile}/`)[1]);
        }

    }
    // show all the song in the playlist
    let songUl = document.querySelector(".song-list").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li><img src="img/music.svg" class="invert" alt="">
                            <div class="info">
                                <div data-song= "${song}">${song.replaceAll("%20", " ",).replace(".mp3", "")}</div>
                                <div>priyank</div>
                            </div>
                            <div class="playNow">
                                <span>Play Now</span>
                                <img src="img/play.svg" alt="play">
                            </div></li>`;
    }

    // attach an event listener to each song
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {

        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.dataset.song)
        })
    });

    return songs

}
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currentFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function album() {
    let a = await fetch(`./songs/`)
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;
    let anchorsTag = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".card-container")

    let array = Array.from(anchorsTag)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs")) {
            let folderName = e.href.split("/").slice(-2)[0]
            // fetching meta data of the folder
            let a = await fetch(`./songs/${folderName}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folderName}" class="card">
                        <div class="play">
                            <img src="img/icon.svg" alt="icon">
                        </div>
                        <img src="songs/${folderName}/cover.jpg" alt="">
                        <a class="song-title" href="">${response.title}</a>
                        <a class="artists" href="">${response.description}</a>
                    </div>`
        }
    }
    // It will load the playlist whenever clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            song = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })

}
const playBtn = document.getElementById("play");
const previousBtn = document.getElementById("previous");
const nextBtn = document.getElementById("next");

async function main() {

    // It lists the song list
    await getSongs("songs/copyRightSong")
    playMusic(songs[0], true)

    // display all the albums on the page
    album()

    // attach an event listener to play, next and previous
    playBtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        } else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // listen for time update event

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    // add and event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";

        currentSong.currentTime = ((currentSong.duration) * percent) / 100

    })

    // add an event listener for hamburger

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%"
    })

    // add an event listener to previous and next

    previousBtn.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {

            playMusic(songs[index - 1])
        }
    })
    nextBtn.addEventListener("click", () => {

        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        if ((index + 1) < songs.length - 1) {

            playMusic(songs[index + 1])
        }
    })

    // add an event listener to volume

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseFloat(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
        }
        else if (currentSong.volume === 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("volume.svg", "mute.svg");
        }
    })

    // add event listener on volume to mute
    let lastVolume = 1;

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (currentSong.volume === 0) {
            currentSong.volume = lastVolume;
            document.querySelector(".range input").value = lastVolume * 100;
            e.target.src = "img/volume.svg";
        } else {
            lastVolume = currentSong.volume;
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
            e.target.src = "img/mute.svg";
        }
    });

    // Play next song automatically when current song ends
    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            // Optional: Restart playlist or pause
            console.log("Playlist finished");
            play.src = "img/play.svg"; // Set play icon if you want to stop here
        }
    });



}
main();

