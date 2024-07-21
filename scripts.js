document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const songList = document.getElementById('song-list');
    const songImage = document.getElementById('song-image');
    const imageContainer = document.getElementById('image-container');

    // Fetch the song data
    fetch('songs.json')  // Updated path
        .then(response => response.json())
        .then(data => {
            console.log('Data loaded:', data); // Debugging message

            // Populate the song list
            function populateList(songs) {
                songList.innerHTML = '';
                songs.forEach(song => {
                    const li = document.createElement('li');
                    li.textContent = `${song.number} - ${song.title}`;
                    li.dataset.image = song.image; // Store the image filename in data attribute
                    li.addEventListener('click', () => {
                        // Show the image when a song item is clicked
                        songImage.src = `src/Hymnal.XF/Resources/Assets/MusicSheets/${song.image}`;
                        songImage.style.display = 'block';
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
        })
        .catch(error => {
            console.error('Error loading songs.json:', error); // Debugging message
        });
});
