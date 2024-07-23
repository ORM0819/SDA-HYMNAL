document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const songList = document.getElementById('song-list');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const languageDropdown = document.getElementById('language-dropdown');
    const startCycleButton = document.getElementById('start-cycle');

    const savedDropdownValue = localStorage.getItem('dropdownValue') || 'music-score';
    dropdownMenu.value = savedDropdownValue;

    const savedLanguageValue = localStorage.getItem('languageValue') || 'english';
    languageDropdown.value = savedLanguageValue;

    dropdownMenu.addEventListener('change', () => {
        localStorage.setItem('dropdownValue', dropdownMenu.value);
    });

    languageDropdown.addEventListener('change', () => {
        localStorage.setItem('languageValue', languageDropdown.value);
        loadSongs(); // Load songs based on the selected language
    });

    function getSongsUrl() {
        const language = languageDropdown.value;
        switch (language) {
            case 'spanish':
                return 'songs_es.json';
            case 'both':
                return ['songs.json', 'songs_es.json'];
            default:
                return 'songs.json';
        }
    }

    function loadMapping() {
        return fetch('song_mapping.json')
            .then(response => response.json())
            .then(data => {
                console.log('Mapping data loaded:', data);
                return data;
            })
            .catch(error => {
                console.error('Error loading mapping file:', error);
                return [];
            });
    }

    function loadSongs() {
        const urls = getSongsUrl();
        const promises = Array.isArray(urls) ? urls.map(url => fetch(url).then(response => response.json())) : [fetch(urls).then(response => response.json())];

        Promise.all(promises)
            .then(results => {
                let allSongs = [];
                results.forEach(data => allSongs = allSongs.concat(data));
                
                return loadMapping().then(mapping => ({ allSongs, mapping }));
            })
            .then(({ allSongs, mapping }) => {
                console.log('All songs loaded:', allSongs);

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

                populateList(allSongs);

                searchInput.addEventListener('input', () => {
                    const query = searchInput.value.toLowerCase();
                    let filteredSongs = [];
                    
                    // Filter songs by title
                    filteredSongs = allSongs.filter(song => 
                        song.title.toLowerCase().includes(query)
                    );

                    // Check if the query is a number and find corresponding songs
                    const queryNumber = query.match(/^\d+$/);
                    if (queryNumber) {
                        const englishNumber = queryNumber[0];
                        const spanishNumber = mapping.find(entry => entry.english === englishNumber)?.spanish;
                        
                        // Filter songs based on the correct mapping
                        filteredSongs = filteredSongs.concat(
                            allSongs.filter(song => song.number === englishNumber || song.number === spanishNumber)
                        );

                        // Remove incorrect results (e.g., English 78 if English 125 is searched)
                        filteredSongs = filteredSongs.filter((song, index, self) => 
                            index === self.findIndex((t) => (t.number === song.number))
                        );
                    }

                    populateList(filteredSongs);
                });

                startCycleButton.addEventListener('click', () => {
                    localStorage.setItem('currentIndex', 0);
                    window.location.href = 'start-cycle.html';
                });
            })
            .catch(error => {
                console.error('Error loading songs:', error);
            });
    }

    loadSongs();
});
