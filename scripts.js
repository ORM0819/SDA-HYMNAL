document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const songList = document.getElementById('song-list');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const languageDropdown = document.getElementById('language-dropdown');
    const startCycleButton = document.getElementById('start-cycle');

    // Set the default dropdown values from local storage
    const savedDropdownValue = localStorage.getItem('dropdownValue') || 'music-score';
    dropdownMenu.value = savedDropdownValue;

    const savedLanguageValue = localStorage.getItem('languageValue') || 'english';
    languageDropdown.value = savedLanguageValue;

    // Save dropdown values to local storage
    dropdownMenu.addEventListener('change', () => {
        localStorage.setItem('dropdownValue', dropdownMenu.value);
    });

    languageDropdown.addEventListener('change', () => {
        localStorage.setItem('languageValue', languageDropdown.value);
        loadSongs(); // Load songs based on the selected language
    });

    let allSongs = [];
    let songMapping = [];

    // Function to determine the correct JSON file based on the selected language
    function getSongsUrl() {
        const language = languageDropdown.value;
        switch (language) {
            case 'spanish':
                return ['songs_es.json'];
            case 'english-spanish':
                return ['songs.json', 'songs_es.json'];
            default:
                return ['songs.json'];
        }
    }

    // Fetch song mapping data
    function loadSongMapping() {
        return fetch('song_mapping.json')
            .then(response => response.json())
            .then(data => {
                songMapping = data;
                console.log('Song mapping loaded:', data);
            })
            .catch(error => {
                console.error('Error loading song mapping:', error);
            });
    }

    // Fetch and display songs based on the selected language
    function loadSongs() {
        const urls = getSongsUrl();
        const requests = urls.map(url => fetch(url).then(res => res.json()));

        Promise.all(requests)
            .then(dataArray => {
                allSongs = dataArray.flat();
                console.log('All songs loaded:', allSongs);
                populateList(allSongs);
            })
            .catch(error => {
                console.error('Error loading songs:', error);
            });
    }

    // Populate the song list in the HTML
    function populateList(songs) {
        songList.innerHTML = '';
        songs.forEach(song => {
            const li = document.createElement('li');
            li.textContent = `${song.number} - ${song.title}`;
            li.dataset.image = song.image;
            li.dataset.title = song.title;
            li.dataset.number = song.number;
            li.dataset.content = song.content;
            li.addEventListener('click', () => {
                const imageUrl = `src/Hymnal.XF/Resources/Assets/MusicSheets/${song.image}`;
                const title = encodeURIComponent(song.title);
                const number = encodeURIComponent(song.number);
                const content = encodeURIComponent(song.content);

                if (dropdownMenu.value === 'lyrics') {
                    window.location.href = `lyrics.html?content=${content}&title=${title}&number=${number}`;
                } else {
                    window.location.href = `image.html?image=${encodeURIComponent(imageUrl)}&title=${title}&number=${number}`;
                }
            });
            songList.appendChild(li);
        });
    }

    // Enhance search functionality
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const filteredSongs = allSongs.filter(song => 
            song.number.toLowerCase().includes(query) || 
            song.title.toLowerCase().includes(query)
        );

        const mappedSongs = new Set(filteredSongs);

        // Add corresponding songs based on the mapping
        filteredSongs.forEach(song => {
            const mapping = songMapping.find(map => map.english === song.number || map.spanish === song.number);
            if (mapping) {
                const correspondingNumber = mapping.english === song.number ? mapping.spanish : mapping.english;
                const correspondingSong = allSongs.find(s => s.number === correspondingNumber);
                if (correspondingSong) {
                    mappedSongs.add(correspondingSong);
                }
            }
        });

        populateList([...mappedSongs]);
    });

    // Start Cycle Button Functionality
    startCycleButton.addEventListener('click', () => {
        localStorage.setItem('currentIndex', 0);
        const dropdownValue = dropdownMenu.value;
        if (dropdownValue === 'lyrics') {
            window.location.href = 'start-cycle-lyrics.html';
        } else {
            window.location.href = 'start-cycle.html';
        }
    });

    // Load initial data
    Promise.all([loadSongs(), loadSongMapping()]);
});
