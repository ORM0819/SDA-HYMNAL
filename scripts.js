document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const songList = document.getElementById('song-list');
    const startCycleButton = document.getElementById('start-cycle');

    // Fetch the song data
    fetch('songs.json')
        .then(response => response.json())
        .then(data => {
            // Store song data in localStorage for the cycle
            localStorage.setItem('totalSongs', data.length);
            localStorage.setItem('imageUrls', JSON.stringify(data.map(song => `src/Hymnal.XF/Resources/Assets/MusicSheets/${song.image}`)));
            localStorage.setItem('titles', JSON.stringify(data.map(song => song.title)));
            localStorage.setItem('numbers', JSON.stringify(data.map(song => song.number)));

            // Populate the song list
            function populateList(songs) {
                songList.innerHTML = '';
                songs.forEach(song => {
                    const li = document.createElement('li');
                    li.textContent = `${song.number} - ${song.title}`;
                    li.dataset.image = song.image;
                    li.dataset.title = song.title;
                    li.dataset.number = song.number;
                    li.addEventListener('click', () => {
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

            // Start cycle functionality
            startCycleButton.addEventListener('click', () => {
                localStorage.setItem('currentIndex', '0');
                window.location.href = 'start-cycle.html';
            });
        })
        .catch(error => {
            console.error('Error loading songs.json:', error);
        });
});
