document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const songList = document.getElementById('song-list');
    const startCycleButton = document.getElementById('start-cycle-button');
    let songsData = [];
    let currentIndex = 0;
    let cycleInterval;

    // Fetch the song data
    fetch('songs.json')
        .then(response => response.json())
        .then(data => {
            console.log('Data loaded:', data);
            songsData = data;

            // Populate the song list
            function populateList(songs) {
                songList.innerHTML = '';
                songs.forEach(song => {
                    const li = document.createElement('li');
                    li.textContent = `${song.number} - ${song.title}`;
                    li.dataset.image = song.image; // Store the image filename in data attribute
                    li.dataset.title = song.title; // Store the title in data attribute
                    li.dataset.number = song.number; // Store the number in data attribute
                    li.addEventListener('click', () => {
                        // Navigate to the image page with title, number, and image URL
                        const imageUrl = `src/Hymnal.XF/Resources/Assets/MusicSheets/${song.image}`;
                        const title = encodeURIComponent(song.title);
                        const number = encodeURIComponent(song.number);
                        window.location.href = `image.html?image=${encodeURIComponent(imageUrl)}&title=${title}&number=${number}`;
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

            // Start cycle button functionality
            startCycleButton.addEventListener('click', () => {
                if (cycleInterval) {
                    clearInterval(cycleInterval); // Clear any existing interval
                }

                // Set interval to cycle through songs
                cycleInterval = setInterval(() => {
                    if (songsData.length > 0) {
                        const song = songsData[currentIndex];
                        const imageUrl = `src/Hymnal.XF/Resources/Assets/MusicSheets/${song.image}`;
                        const title = encodeURIComponent(song.title);
                        const number = encodeURIComponent(song.number);
                        window.location.href = `image.html?image=${encodeURIComponent(imageUrl)}&title=${title}&number=${number}`;
                        
                        // Update the current index
                        currentIndex = (currentIndex + 1) % songsData.length;
                    }
                }, 5000); // Change song every 5 seconds
            });
        })
        .catch(error => {
            console.error('Error loading songs.json:', error);
        });
});
