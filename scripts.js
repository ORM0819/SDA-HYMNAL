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

    // Function to determine the correct JSON file based on the selected language
    function getSongsUrl() {
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

    // Fetch and display songs based on the selected language
    function loadSongs() {
        const urls = getSongsUrl();
        const fetches = urls.map(url => fetch(url).then(response => response.json()));

        Promise.all(fetches)
            .then(results => {
                let data = results.flat();

                if (languageDropdown.value === 'both') {
                    fetch('song_mapping.json')
                        .then(response => response.json())
                        .then(mapping => {
                            const mappedData = [];
                            data.forEach(song => {
                                const correspondingMapping = mapping.find(map => map.english === song.number || map.spanish === song.number);
                                if (correspondingMapping) {
                                    const correspondingSongNumber = correspondingMapping.english === song.number ? correspondingMapping.spanish : correspondingMapping.english;
                                    const correspondingSong = data.find(s => s.number === correspondingSongNumber);
                                    if (correspondingSong) {
                                        if (!mappedData.some(s => s.number === song.number)) {
                                            mappedData.push(song);
                                        }
                                        if (!mappedData.some(s => s.number === correspondingSong.number)) {
                                            mappedData.push(correspondingSong);
                                        }
                                    }
                                } else {
                                    mappedData.push(song);
                                }
                            });
                            data = mappedData;
                            displaySongs(data);
                        });
                } else {
                    displaySongs(data);
                }
            })
            .catch(error => {
                console.error('Error loading songs:', error);
            });
    }

    function displaySongs(songs) {
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

        // Search functionality
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            const filteredSongs = songs.filter(song =>
                song.number.toLowerCase().includes(query) ||
                song.title.toLowerCase().includes(query)
            );
            songList.innerHTML = '';
            filteredSongs.forEach(song => {
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
        });

        // Start Cycle Button Functionality
        startCycleButton.addEventListener('click', () => {
            localStorage.setItem('currentIndex', 0);
            window.location.href = 'start-cycle.html';
        });
    }

    // Initial load
    loadSongs();
});
