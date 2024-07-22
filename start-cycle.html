<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <title>Start Cycle</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="manifest" href="manifest.json">
</head>
<body>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const params = new URLSearchParams(window.location.search);
            const index = parseInt(params.get('index'), 10);
            const currentIndex = isNaN(index) ? 0 : index;
            const songsJsonUrl = 'songs.json';
            const dropdownValue = localStorage.getItem('dropdownValue') || 'music-score';

            fetch(songsJsonUrl)
                .then(response => response.json())
                .then(data => {
                    if (currentIndex >= data.length) {
                        window.location.href = 'index.html';
                        return;
                    }

                    const song = data[currentIndex];
                    const imageUrl = `src/Hymnal.XF/Resources/Assets/MusicSheets/${song.image}`;
                    const title = encodeURIComponent(song.title);
                    const number = encodeURIComponent(song.number);
                    const content = encodeURIComponent(song.content);

                    const nextIndex = currentIndex + 1;
                    let redirectUrl;
                    
                    if (dropdownValue === 'lyrics') {
                        redirectUrl = `lyrics.html?content=${content}&title=${title}&number=${number}&index=${nextIndex}`;
                    } else {
                        redirectUrl = `image.html?image=${encodeURIComponent(imageUrl)}&title=${title}&number=${number}&index=${nextIndex}`;
                    }

                    // Redirect to the next song's page
                    window.location.href = redirectUrl;
                })
                .catch(error => {
                    console.error('Error fetching songs:', error);
                });
        });
    </script>
</body>
</html>
