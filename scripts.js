document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const songList = document.getElementById('song-list');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const languageDropdown = document.getElementById('language-dropdown');
    const startCycleButton = document.getElementById('start-cycle');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text'); // Reference for progress text

    // Set default dropdown values from local storage
    dropdownMenu.value = localStorage.getItem('dropdownValue') || 'music-score';
    languageDropdown.value = localStorage.getItem('languageValue') || 'english';

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

    // Determine the correct JSON file based on the selected language
    function getSongsUrls() {
        const language = languageDropdown.value;
        switch (language) {
            case 'spanish':
                return [{ url: 'songs_es.json', language: 'spanish' }];
            case 'both':
                return [
                    { url: 'songs.json', language: 'english' },
                    { url: 'songs_es.json', language: 'spanish' }
                ];
            default:
                return [{ url: 'songs.json', language: 'english' }];
        }
    }

    // Fetch and load song mapping data
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
        const urls = getSongsUrls();
        const requests = urls.map(item => 
            fetch(item.url)
                .then(res => res.json())
                .then(data => data.map(song => ({ ...song, language: item.language })))
        );

        Promise.all(requests)
            .then(dataArray => {
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

                const page = dropdownMenu.value === 'lyrics' ? 'lyrics.html' : 'image.html';
                window.location.href = `${page}?${dropdownMenu.value === 'lyrics' ? `content=${content}&` : `image=${encodeURIComponent(imageUrl)}&` }title=${title}&number=${number}`;
            });
            songList.appendChild(li);
        });
    }

    // Enhance search functionality
    searchInput.addEventListener('input', () => {
        const query = normalizeText(searchInput.value.toLowerCase());
        console.log('Search query:', query);

        let filteredSongs = allSongs.filter(song => 
            normalizeText(song.number).includes(query) || 
            normalizeText(song.title).toLowerCase().includes(query)
        );

        console.log('Filtered songs:', filteredSongs);

        const mappedSongs = new Set(filteredSongs);

        filteredSongs.forEach(song => {
            const mapping = songMapping.find(map => map.english === song.number || map.spanish === song.number);
            if (mapping) {
                const correspondingNumber = mapping.english === song.number ? mapping.spanish : mapping.english;
                const correspondingSong = allSongs.find(s => s.number === correspondingNumber && s.language === (mapping.english === song.number ? 'spanish' : 'english'));
                if (correspondingSong) {
                    mappedSongs.add(correspondingSong);
                }
            }
        });

        populateList(Array.from(mappedSongs));
    });

    // Helper function to normalize text by removing accents and punctuation
    function normalizeText(text) {
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s]/gi, '');
    }

    // Start Cycle Button Functionality
    startCycleButton.addEventListener('click', () => {
        localStorage.setItem('currentIndex', 0);
        localStorage.setItem('currentIndexLyrics', 0);
        const page = dropdownMenu.value === 'lyrics' ? 'start-cycle-lyrics.html' : 'start-cycle.html';
        window.location.href = page;
    });

    // Load initial data
    Promise.all([loadSongs(), loadSongMapping()]);

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/SDA-HYMNAL/service-worker.js')
                .then((registration) => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch((error) => {
                    console.log('ServiceWorker registration failed: ', error);
                });
        });
    }
});
