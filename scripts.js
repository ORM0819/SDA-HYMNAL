async function loadSongs() {
    try {
        const response = await fetch('songs.json');
        const songs = await response.json();

        const songList = document.getElementById('song-list');
        songList.innerHTML = '';

        songs.forEach(song => {
            const li = document.createElement('li');
            const link = document.createElement('a');

            // Construct the URL for the image
            const imageUrl = `src/Hymnal.XF/Resources/Assets/MusicSheets/PianoSheet_NewHymnal_en_${song.number.padStart(3, '0')}.png`;
            link.href = `image.html?image=${encodeURIComponent(imageUrl)}&title=${encodeURIComponent(song.title)}&number=${song.number}`;
            link.textContent = `${song.number} - ${song.title}`;
            li.appendChild(link);
            songList.appendChild(li);
        });

        // Add event listener for search input
        document.getElementById('search').addEventListener('input', function() {
            const searchValue = this.value.toLowerCase();
            const items = songList.querySelectorAll('li');
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(searchValue)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    } catch (error) {
        console.error('Error loading songs:', error);
    }
}

window.addEventListener('load', () => {
    loadSongs();

    // Register the Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('https://orm0819.github.io/SDA-HYMNAL/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);

                // Send image URLs to the Service Worker
                const songListItems = document.querySelectorAll('#song-list li a');
                const imageUrls = [];
                songListItems.forEach(item => {
                    imageUrls.push(item.href);
                });

                if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({
                        type: 'CACHE_IMAGES',
                        imageUrls: imageUrls
                    });
                }
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    }
});
