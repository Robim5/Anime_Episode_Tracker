//DOM
//categories
const allAnimes = document.getElementById('all');
const watchingAnimes = document.getElementById('watching');
const complAnimes = document.getElementById('completed');
const onholdAnimes = document.getElementById('onhold');
const dropAnimes = document.getElementById('dropped');
const planAnimes = document.getElementById('plantowatch');
//add info
// image, name, numep, totalep and rate
const anImage = document.getElementById('imageadd');
const anName = document.getElementById('nameadd');
const anNumEp = document.getElementById('epadd');
const anTotalEp = document.getElementById('totaladd');
const anRate = document.getElementById('rateadd');
const anStatus = document.getElementById('statusadd');
//table and anime
const table = document.querySelector('.animetable');
const animes = [];
let editingAnimeId = null;
//buttons 
const btnaddAnime = document.getElementById('addanime');
const cancelAdd = document.getElementById('canceladd');
const saveAdd = document.getElementById('saveadd');
//windows
const addAnimeWindow = document.querySelector('.addWindow');
const overlay = document.getElementById('overlay');
//event listeners
//start auto click on all
window.addEventListener('DOMContentLoaded', () => {
    allAnimes.click();
});
//open windows
btnaddAnime.addEventListener('click', () => {
    addAnimeWindow.style.display = 'flex';
    overlay.style.display = 'block';
});
cancelAdd.addEventListener('click', () => {
    addAnimeWindow.style.display = 'none';
    overlay.style.display = 'none';
});
//category click
//function to remove all background classes
function removeBackgroundClasses() {
    document.querySelectorAll('.category h2').forEach(elem => {
        elem.classList.remove('purple', 'green', 'blue', 'yellow', 'red', 'orange');
    });
}
//category click events
allAnimes.addEventListener('click', () => {
    removeBackgroundClasses();
    allAnimes.classList.add('purple');
    filterAnime('all');
});
watchingAnimes.addEventListener('click', () => {
    removeBackgroundClasses();
    watchingAnimes.classList.add('green');
    filterAnime('watching');
});
complAnimes.addEventListener('click', () => {
    removeBackgroundClasses();
    complAnimes.classList.add('blue');
    filterAnime('completed');
});
onholdAnimes.addEventListener('click', () => {
    removeBackgroundClasses();
    onholdAnimes.classList.add('yellow');
    filterAnime('onhold');
});
dropAnimes.addEventListener('click', () => {
    removeBackgroundClasses();
    dropAnimes.classList.add('red');
    filterAnime('dropped');
});
planAnimes.addEventListener('click', () => {
    removeBackgroundClasses();
    planAnimes.classList.add('orange');
    filterAnime('plantowatch');
});
//add anime
function addAnime() {
    const file = anImage.files[0];

    if (!file) {
        alert("Please select an image file.");
        return;
    }

    const name = anName.value.trim();
    const curEp = parseInt(anNumEp.value.trim(), 10);
    const totalEp = parseInt(anTotalEp.value.trim(), 10);
    const rate = parseInt(anRate.value.trim(), 10);
    const status = anStatus.value.trim();

    //validate the fields
    if (!name || isNaN(curEp) || isNaN(totalEp) || isNaN(rate) || !status) {
        alert('Please fill out all fields correctly.');
        return;
    }

    //validate the rating and episodes
    if (rate < 0 || rate > 10) {
        alert("Please enter a valid rating between 0 and 10.");
        return;
    }

    if (curEp > totalEp) {
        alert("You can't watch more episodes than the total number of episodes.");
        return;
    }

    //load the image and save the anime data
    const reader = new FileReader();
    reader.onload = function(e) {
        const image = e.target.result;

        const newAnime = {
            id: Date.now(),
            image,
            name,
            curEp,
            totalEp,
            rate,
            status
        };

        animes.push(newAnime);
        displayAnime(newAnime);
        updateLocalStorage(); //save

        //clear fields
        anImage.value = '';
        anName.value = '';
        anNumEp.value = '';
        anTotalEp.value = '';
        anRate.value = '';
        anStatus.selectedIndex = 0;
        addAnimeWindow.style.display = 'none';
        overlay.style.display = 'none';
    };
    reader.readAsDataURL(file); //load the image
}
saveAdd.addEventListener('click', (event) => {
    event.preventDefault();

    const curEp = parseInt(anNumEp.value.trim(), 10);
    const totalEp = parseInt(anTotalEp.value.trim(), 10);
    const rate = parseInt(anRate.value.trim(), 10);
    const status = anStatus.value.trim();

    //validate the rating and episode again
    if (rate < 0 || rate > 10) {
        alert("Please enter a valid rating between 0 and 10.");
        return;
    }

    if (curEp > totalEp) {
        alert("You can't watch more episodes than the total number of episodes.");
        return;
    }

    if (editingAnimeId) {
        //edit mode
        const anime = animes.find(a => a.id === editingAnimeId);
        if (anime) {
            const file = anImage.files[0];

            if (file) {
                //if a new image is selected, read and update it
                const reader = new FileReader();
                reader.onload = function(e) {
                    const image = e.target.result;
                    anime.image = image;
                    updateAnimeDetails(anime);
                };
                reader.readAsDataURL(file);
            } else {
                //if no new image is selected, retain the existing image
                updateAnimeDetails(anime);
            }
        }
        editingAnimeId = null;
    } else {
        //add mode
        addAnime();
    }
});

//helper function to update anime details
function updateAnimeDetails(anime) {
    //update details
    anime.name = anName.value.trim();
    anime.curEp = parseInt(anNumEp.value.trim(), 10);
    anime.totalEp = parseInt(anTotalEp.value.trim(), 10);
    anime.rate = parseInt(anRate.value.trim(), 10);
    anime.status = anStatus.value.trim();

    updateUI();
    updateLocalStorage(); 

    //clear 
    anImage.value = '';
    anName.value = '';
    anNumEp.value = '';
    anTotalEp.value = '';
    anRate.value = '';
    anStatus.selectedIndex = 0;
    addAnimeWindow.style.display = 'none';
    overlay.style.display = 'none';
}
//display anime
/*
base:  
<div class="animestats">
    <img src="..." alt="...">
    <h2> ...(nome)..</h2>
    <p>...(ep watch)... / ...(how many ep have)...</p>
    <p> ...(rate).../10 <i class='bx bxs-star-half' ></i></p>
    <div class="options" >
        <div id="edit"><i class='bx bx-edit-alt' ></i></div>
        <div id="delete"><i class='bx bx-trash' ></i></div>
    </div>
</div>
*/
function displayAnime(anime) {
    const animeDiv = document.createElement('div');
    animeDiv.classList.add('animestats');
    animeDiv.dataset.id = anime.id;
    animeDiv.innerHTML = `
        <img src="${anime.image}" alt="${anime.name}">
        <h2>${anime.name}</h2>
        <p>${anime.curEp} / ${anime.totalEp}</p>
        <p>${anime.rate}/10 <i class='bx bxs-star-half'></i></p>
        <div class="options">
            <div id="edit"><i class='bx bx-edit-alt'></i></div>
            <div id="delete"><i class='bx bx-trash'></i></div>
        </div>
    `;
    table.appendChild(animeDiv);
}

//edit anime
function editAnime(animeId) {
    editingAnimeId = animeId;
    const anime = animes.find(a => a.id === animeId);
    if (anime) {
        anImage.value = '';  // Reset the image input
        anName.value = anime.name;
        anNumEp.value = anime.curEp;
        anTotalEp.value = anime.totalEp;
        anRate.value = anime.rate;
        anStatus.value = anime.status;

        addAnimeWindow.style.display = 'flex';
        overlay.style.display = 'block';
    }
}
//update UI
function updateUI(){
    //clear table
    table.innerHTML = '';
    //display animes
    animes.forEach(displayAnime);
}
//delete anime
function deleteAnime(animeId) {
    const index = animes.findIndex(a => a.id === animeId);
    if (index !== -1) {
        animes.splice(index, 1);
        updateUI();
        updateLocalStorage(); 
    }
}
//find target on the table 
table.addEventListener('click', (event) => {
    if (event.target.closest('#delete')) {
        const animeId = parseInt(event.target.closest('.animestats').dataset.id);
        deleteAnime(animeId);
    }
    if (event.target.closest('#edit')) {
        const animeId = parseInt(event.target.closest('.animestats').dataset.id);
        editAnime(animeId);
    }
});
//filter by category
function filterAnime(status) {
    const filteredAnimes = animes.filter(anime => anime.status === status || status === 'all');
    table.innerHTML = '';
    filteredAnimes.forEach(displayAnime);
}
//save all animes in the localstorage
function updateLocalStorage() {
    localStorage.setItem('animes', JSON.stringify(animes));
}

//load all animes from local storage
if (localStorage.getItem('animes')) {
    const storedAnimes = JSON.parse(localStorage.getItem('animes'));
    storedAnimes.forEach(anime => {
        animes.push(anime);
        displayAnime(anime);
    });
}

