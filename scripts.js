document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const songList = document.getElementById('song-list');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const languageDropdown = document.getElementById('language-dropdown');

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
                window.location.href = `${page}?${dropdownMenu.value === 'lyrics' ? `content=${content}&` : `image=${encodeURIComponent(imageUrl)}&`}title=${title}&number=${number}`;
            });
            songList.appendChild(li);
        });
    }

    searchInput.addEventListener('input', () => {
        let query = normalizeText(searchInput.value.toLowerCase());

        // Automatically pad numbers to 3 digits
        if (!isNaN(query) && query.length > 0) {
            query = query.padStart(3, '0');
        }
        
        console.log('Search query:', query);

        // Find songs that match the search query directly
        let filteredSongs = allSongs.filter(song => 
            normalizeText(song.number).includes(query) || 
            normalizeText(song.title).toLowerCase().includes(query)
        );

        console.log('Filtered songs:', filteredSongs);

        // Initialize a set to avoid duplicate entries
        const mappedSongs = new Set(filteredSongs);

        // Handle mappings for each song in the filtered list
        filteredSongs.forEach(song => {
            // Check if the song is in the mapping based on its language
            if (song.language === 'english') {
                const englishMapping = songMapping.find(map => 
                    Array.isArray(map.english) ? map.english.includes(song.number) : map.english === song.number
                );
                if (englishMapping) {
                    const correspondingSpanishNumbers = Array.isArray(englishMapping.spanish) ? englishMapping.spanish : [englishMapping.spanish];
                    correspondingSpanishNumbers.forEach(correspondingNumber => {
                        const correspondingSong = allSongs.find(s => 
                            s.number === correspondingNumber && s.language === 'spanish'
                        );
                        if (correspondingSong) {
                            mappedSongs.add(correspondingSong);
                        }
                    });
                }
            } else if (song.language === 'spanish') {
                const spanishMapping = songMapping.find(map => 
                    Array.isArray(map.spanish) ? map.spanish.includes(song.number) : map.spanish === song.number
                );
                if (spanishMapping) {
                    const correspondingEnglishNumbers = Array.isArray(spanishMapping.english) ? spanishMapping.english : [spanishMapping.english];
                    correspondingEnglishNumbers.forEach(correspondingNumber => {
                        const correspondingSong = allSongs.find(s => 
                            s.number === correspondingNumber && s.language === 'english'
                        );
                        if (correspondingSong) {
                            mappedSongs.add(correspondingSong);
                        }
                    });
                }
            }
        });

        // Convert the set to an array and populate the list
        populateList(Array.from(mappedSongs));
    });

    // Helper function to normalize text by removing accents and punctuation
    function normalizeText(text) {
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s]/gi, '');
    }

    // Display the service worker version
    function displayServiceWorkerVersion() {
        const version = localStorage.getItem('serviceWorkerVersion');
        if (version) {
            const versionElement = document.getElementById('sw-version');
            if (versionElement) {
                versionElement.textContent = `Service Worker Version: ${version}`;
            }
        }
    }

    // Load initial data
    Promise.all([loadSongs(), loadSongMapping()]);

    // Display version information
    displayServiceWorkerVersion();

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
