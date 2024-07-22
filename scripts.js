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
                return 'songs_es.json';
            default:
                return 'songs.json';
        }
    }

    // Fetch and display songs based on the selected language
    function loadSongs() {
        fetch(getSongsUrl())
            .then(response => response.json())
            .then(data => {
                console.log('Data loaded:', data);

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

                // Initial population
                populateList(data);

                // Search functionality
                searchInput.addEventListener('input', () => {
                    const query = searchInput.value.toLowerCase();
                    const filteredSongs = data.filter(song => 
                        song.number.toLowerCase().includes(query) || 
                        song.title.toLowerCase().includes(query)
                    );
                    populateList(filteredSongs);
                });

                // Start Cycle Button Functionality
                startCycleButton.addEventListener('click', () => {
                    localStorage.setItem('currentIndex', 0);
                    const firstSong = data[0];
                    const imageUrl = `src/Hymnal.XF/Resources/Assets/MusicSheets/${firstSong.image}`;
                    const title = encodeURIComponent(firstSong.title);
                    const number = encodeURIComponent(firstSong.number);
                    const content = encodeURIComponent(firstSong.content);

                    const redirectUrl = dropdownMenu.value === 'lyrics'
                        ? `lyrics.html?content=${content}&title=${title}&number=${number}`
                        : `image.html?image=${encodeURIComponent(imageUrl)}&title=${title}&number=${number}`;

                    window.location.href = redirectUrl;
                });
            })
            .catch(error => {
                console.error('Error loading songs:', error);
            });
    }

    // Initial load
    loadSongs();
});
