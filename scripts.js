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
    let songMappingEnToEs = [];
    let songMappingEsToEn = [];

    // Function to determine the correct JSON file based on the selected language
    function getSongsUrls() {
        const language = languageDropdown.value;
        switch (language) {
            case 'spanish':
                return ['songs_es.json'];
            case 'both':
                return ['songs.json', 'songs_es.json'];
            default:
                return ['songs.json'];
        }
    }

    // Fetch song mapping data
    function loadSongMappings() {
        return Promise.all([
            fetch('song_mapping_en_to_es.json')
                .then(response => response.json())
                .then(data => {
                    songMappingEnToEs = data;
                    console.log('English to Spanish song mapping loaded:', data);
                })
                .catch(error => {
                    console.error('Error loading English to Spanish song mapping:', error);
                }),
            fetch('song_mapping_es_to_en.json')
                .then(response => response.json())
                .then(data => {
                    songMappingEsToEn = data;
                    console.log('Spanish to English song mapping loaded:', data);
                })
                .catch(error => {
                    console.error('Error loading Spanish to English song mapping:', error);
                })
        ]);
    }

    // Fetch and display songs based on the selected language
    function loadSongs() {
        const urls = getSongsUrls();
        const requests = urls.map(url => fetch(url).then(res => res.json()));

        Promise.all(requests)
            .then(dataArray => {
                // Flatten and merge all songs
                allSongs = dataArray.flat();
                console.log('All songs loaded:', allSongs); // Check allSongs content here
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

        // Filter songs based on the search query
        let filteredSongs = allSongs.filter(song => 
            song.number.toLowerCase().includes(query) || 
            song.title.toLowerCase().includes(query)
        );

        // Create a set to avoid duplicate entries
        const mappedSongs = new Set(filteredSongs);

        // Add corresponding songs based on the mapping
        filteredSongs.forEach(song => {
            // Check in both mappings
            let correspondingNumber, correspondingSong;

            const mappingEnToEs = songMappingEnToEs.find(map => map.english === song.number);
            if (mappingEnToEs) {
                correspondingNumber = mappingEnToEs.spanish;
                correspondingSong = allSongs.find(s => s.number === correspondingNumber);
                if (correspondingSong) {
                    mappedSongs.add(correspondingSong);
                }
            }

            const mappingEsToEn = songMappingEsToEn.find(map => map.spanish === song.number);
            if (mappingEsToEn) {
                correspondingNumber = mappingEsToEn.english;
                correspondingSong = allSongs.find(s => s.number === correspondingNumber);
                if (correspondingSong) {
                    mappedSongs.add(correspondingSong);
                }
            }
        });

        // Populate the list with all relevant songs
        populateList(Array.from(mappedSongs));
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
    Promise.all([loadSongs(), loadSongMappings()]);
});
