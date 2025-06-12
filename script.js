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
    let a = await fetch(`http://127.0.0.1:3000/${currentFolder}/`)
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
        songUl.innerHTML = songUl.innerHTML + `<li><img src="music.svg" class="invert" alt="">
                            <div class="info">
                                <div data-song= ${song}>${song.replaceAll("%20", " ",).replace(".mp3", "")}</div>
                                <div>priyank</div>
                            </div>
                            <div class="playNow">
                                <span>Play Now</span>
                                <img src="play.svg" alt="play">
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
        play.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function album() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
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
            let a = await fetch(`http://127.0.0.1:3000/songs/${folderName}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folderName}" class="card">
                        <div class="play">
                            <img src="icon.svg" alt="icon">
                        </div>
                        <img src="songs/${folderName}/cover.jpg" alt="">
                        <a class="song-title" href="">${response.title}</a>
                        <a class="artists" href="">${response.discription}</a>
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
async function main() {

    // It lists the song list
    await getSongs("songs/copyRightSong")
    playMusic(songs[0], true)

    // display all the albums on the page
    album()

    // attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        } else {
            currentSong.pause()
            play.src = "play.svg"
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

    previous.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {

            playMusic(songs[index - 1])
        }
    })
    next.addEventListener("click", () => {

        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        if ((index + 1) < songs.length - 1) {

            playMusic(songs[index + 1])
        }
    })

    // add an event listener to volume

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })

    // add event listener on volume to mute
    document.querySelector(".volume>img").addEventListener("click", e => {
        console.log(e.target)
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 100;
        }
    })

    // Play next song automatically when current song ends
    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            // Optional: Restart playlist or pause
            console.log("Playlist finished");
            play.src = "play.svg"; // Set play icon if you want to stop here
        }
    });



}
main();

