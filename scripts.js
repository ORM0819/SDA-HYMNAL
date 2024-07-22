document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const songList = document.getElementById('song-list');

    fetch('songs.json')
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
                    li.addEventListener('click', () => {
                        const imageUrl = `src/Hymnal.XF/Resources/Assets/MusicSheets/${song.image}`;
                        const title = encodeURIComponent(song.title);
                        const number = encodeURIComponent(song.number);
                        window.location.href = `image.html?image=${encodeURIComponent(imageUrl)}&title=${title}&number=${number}`;
                    });
                    songList.appendChild(li);
                });
            }

            populateList(data);

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
