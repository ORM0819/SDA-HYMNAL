document.addEventListener('DOMContentLoaded', function () {
    var searchInput = document.getElementById('search');
    var songList = document.getElementById('song-list');
    var dropdownMenu = document.getElementById('dropdown-menu');
    var languageDropdown = document.getElementById('language-dropdown');
    
    var allSongs = [];
    var songMapping = [];

    function loadSongMapping() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'song_mapping.json', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                songMapping = JSON.parse(xhr.responseText);
            }
        };
        xhr.send();
    }

    function getSongsUrls() {
        var language = languageDropdown.value;
        switch (language) {
            case 'spanish':
                return [{ url: 'songs_es.json', language: 'spanish' }];
            case 'both':
                return [
                    { url: 'songs.json', language: 'english' },
                    { url: 'songs_es.json', language: 'spanish' }
                ];
            default:
                return [{ url: 'songs.json', language: 'english' }];
        }
    }

    function loadSongs() {
        var urls = getSongsUrls();
        var completedRequests = 0;
        var tempSongs = [];

        urls.forEach(function (item) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', item.url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var data = JSON.parse(xhr.responseText);
                    data.forEach(function (song) {
                        song.language = item.language;
                        tempSongs.push(song);
                    });
                    completedRequests++;
                    if (completedRequests === urls.length) {
                        allSongs = tempSongs;
                        populateList(allSongs);
                    }
                }
            };
            xhr.send();
        });
    }

    function populateList(songs) {
        songList.innerHTML = '';
        songs.forEach(function (song) {
            var li = document.createElement('li');
            li.textContent = song.number + ' - ' + song.title;
            li.dataset.image = song.image;
            li.dataset.title = song.title;
            li.dataset.number = song.number;
            li.dataset.content = song.content;
            li.addEventListener('click', function () {
                var imageUrl = 'src/Hymnal.XF/Resources/Assets/MusicSheets/' + song.image;
                var title = encodeURIComponent(song.title);
                var number = encodeURIComponent(song.number);
                var content = encodeURIComponent(song.content);

                var page = dropdownMenu.value === 'lyrics' ? 'lyrics-old.html' : 'image-old.html';
                window.location.href = page + '?' + (dropdownMenu.value === 'lyrics' ? 'content=' + content + '&' : 'image=' + encodeURIComponent(imageUrl) + '&') + 'title=' + title + '&number=' + number;
            });
            songList.appendChild(li);
        });
    }

    function normalizeText(text) {
        // Replace accented characters with their non-accented equivalents
        return text.replace(/[áàäâã]/g, 'a')
                   .replace(/[éèëê]/g, 'e')
                   .replace(/[íìïî]/g, 'i')
                   .replace(/[óòöôõ]/g, 'o')
                   .replace(/[úùüû]/g, 'u')
                   .replace(/[ñ]/g, 'n')
                   .replace(/[^\w\s]/gi, ''); // Remove punctuation
    }

    searchInput.addEventListener('input', function () {
        var query = normalizeText(searchInput.value.toLowerCase());
        var filteredSongs = allSongs.filter(function (song) {
            return normalizeText(song.number.toLowerCase()).indexOf(query) !== -1 || 
                   normalizeText(song.title.toLowerCase()).indexOf(query) !== -1;
        });

        var mappedSongs = [];
        filteredSongs.forEach(function (song) {
            mappedSongs.push(song);
            var mapping = songMapping.find(function (map) {
                return map.english === song.number || map.spanish === song.number;
            });
            if (mapping) {
                var correspondingNumber = mapping.english === song.number ? mapping.spanish : mapping.english;
                var correspondingSong = allSongs.find(function (s) {
                    return s.number === correspondingNumber && s.language === (mapping.english === song.number ? 'spanish' : 'english');
                });
                if (correspondingSong) {
                    mappedSongs.push(correspondingSong);
                }
            }
        });

        populateList(mappedSongs);
    });

    languageDropdown.addEventListener('change', function () {
        loadSongs();
    });

    dropdownMenu.addEventListener('change', function () {
        localStorage.setItem('displayOption', dropdownMenu.value);
    });

    function restoreSettings() {
        var savedLanguage = localStorage.getItem('selectedLanguage');
        if (savedLanguage) {
            languageDropdown.value = savedLanguage;
        }

        var savedDisplayOption = localStorage.getItem('displayOption');
        if (savedDisplayOption) {
            dropdownMenu.value = savedDisplayOption;
        }
    }

    languageDropdown.addEventListener('change', function () {
        localStorage.setItem('selectedLanguage', languageDropdown.value);
        loadSongs();
    });

    restoreSettings();
    loadSongs();
    loadSongMapping();
});
