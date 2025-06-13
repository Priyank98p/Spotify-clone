console.log("Script is running")

// Global variables
let currentSong = new Audio();  // Current song playing
let songs;                      // List of songs in the current album/folder
let currentFolder;              // Current album/folder path

// Utility: Convert seconds to MM:SS format
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(Math.floor(seconds % 60)).padStart(2, '0');
    return `${mins}:${secs}`;
}

// Fetch and display songs from the selected folder
async function getSongs(songFolder) {
    currentFolder = songFolder;

    // Fetch songs.json metadata
    let songListResponse = await fetch("songs.json");
    let songData = await songListResponse.json();
    let folderKey = songFolder.replace("songs/", "");
    songs = songData[folderKey].songs;

    // Populate the song list in the UI
    let songUl = document.querySelector(".song-list ul");
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML += `
        <li>
            <img src="img/music.svg" class="invert" alt="">
            <div class="info">
                <div data-song="${song}">${song.replace(".mp3", "")}</div>
                <div>priyank</div>
            </div>
            <div class="playNow">
                <span>Play Now</span>
                <img src="img/play.svg" alt="play">
            </div>
        </li>`;
    }

    // Add click event listeners to each song in the list
    Array.from(document.querySelector(".song-list li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info div").dataset.song);
        });
    });

    return songs;
}

// Play a specific song
const playMusic = (track, pause = false) => {
    currentSong.src = `${currentFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

// Load and render album cards from songs.json
async function album() {
    let response = await fetch("songs.json");
    let albums = await response.json();
    let cardContainer = document.querySelector(".card-container");

    // Create album cards dynamically
    for (let key in albums) {
        let album = albums[key];
        cardContainer.innerHTML += `
        <div data-folder="${key}" class="card">
            <div class="play">
                <img src="img/icon.svg" alt="icon">
            </div>
            <img src="songs/${key}/${album.cover}" alt="">
            <a class="song-title" href="#">${album.title}</a>
            <a class="artists" href="#">${album.description}</a>
        </div>`;
    }

    // Handle album card click to load songs
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async () => {
            await getSongs(`songs/${e.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

// Get control buttons
const playBtn = document.getElementById("play");
const previousBtn = document.getElementById("previous");
const nextBtn = document.getElementById("next");

// App initialization
async function main() {
    await getSongs("songs/copyRightSong"); // Default album
    playMusic(songs[0], true);             // Load first song but don't autoplay
    album();                               // Render all albums

    // Toggle play/pause
    playBtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    // Update time and seek bar
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seek functionality
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Hamburger menu (mobile view)
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Close sidebar
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });

    // Previous song
    previousBtn.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index - 1 >= 0) playMusic(songs[index - 1]);
    });

    // Next song
    nextBtn.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index + 1 < songs.length) playMusic(songs[index + 1]);
    });

    // Volume slider
    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseFloat(e.target.value) / 100;
        document.querySelector(".volume img").src =
            currentSong.volume === 0 ? "img/mute.svg" : "img/volume.svg";
    });

    // Mute/unmute toggle
    let lastVolume = 1;
    document.querySelector(".volume img").addEventListener("click", e => {
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

    // Auto-play next song when current ends
    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index + 1 < songs.length) playMusic(songs[index + 1]);
        else play.src = "img/play.svg";  // Reset play button if last song
    });
}

main(); // Run the app
