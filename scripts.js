document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const songList = document.getElementById('song-list');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const startCycleButton = document.getElementById('start-cycle');

    // Set the default dropdown value from local storage
    const savedDropdownValue = localStorage.getItem('dropdownValue') || 'music-score';
    dropdownMenu.value = savedDropdownValue;

    // Add event listener to save the dropdown value to local storage
    dropdownMenu.addEventListener('change', () => {
        localStorage.setItem('dropdownValue', dropdownMenu.value);
    });

    // Fetch the song data
    fetch('songs.json')  // Updated path
        .then(response => response.json())
        .then(data => {
            console.log('Data loaded:', data);

            // Populate the song list
            function populateList(songs) {
                songList.innerHTML = '';
                songs.forEach(song => {
                    const li = document.createElement('li');
                    li.textContent = `${song.number} - ${song.title}`;
                    li.dataset.image = song.image; // Store the image filename in data attribute
                    li.dataset.title = song.title; // Store the title in data attribute
                    li.dataset.number = song.number; // Store the number in data attribute
                    li.dataset.content = song.content; // Store the content in data attribute
                    li.addEventListener('click', () => {
                        // Navigate to the appropriate page based on dropdown value
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

                if (dropdownMenu.value === 'lyrics') {
                    window.location.href = `start-cycle.html?content=${content}&title=${title}&number=${number}&index=0`;
                } else {
                    window.location.href = `start-cycle.html?image=${encodeURIComponent(imageUrl)}&title=${title}&number=${number}&index=0`;
                }
            });
        })
        .catch(error => {
            console.error('Error loading songs.json:', error);
        });
});
