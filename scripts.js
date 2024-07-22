document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const songList = document.getElementById('song-list');
    const dropdownMenu = document.getElementById('dropdown-menu');

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
        })
        .catch(error => {
            console.error('Error loading songs.json:', error);
        });
});
