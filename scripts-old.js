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
        if (language === 'spanish') {
            return [{ url: 'songs_es.json', language: 'spanish' }];
        } else if (language === 'both') {
            return [
                { url: 'songs.json', language: 'english' },
                { url: 'songs_es.json', language: 'spanish' }
            ];
        } else {
            return [{ url: 'songs.json', language: 'english' }];
        }
    }

    function loadSongs() {
        var urls = getSongsUrls();
        var completedRequests = 0;
        var tempSongs = [];

        for (var i = 0; i < urls.length; i++) {
            (function(item) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', item.url, true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var data = JSON.parse(xhr.responseText);
                        for (var j = 0; j < data.length; j++) {
                            data[j].language = item.language;
                            tempSongs.push(data[j]);
                        }
                        completedRequests++;
                        if (completedRequests === urls.length) {
                            allSongs = tempSongs;
                            populateList(allSongs);
                        }
                    }
                };
                xhr.send();
            })(urls[i]);
        }
    }

    function populateList(songs) {
        songList.innerHTML = '';
        for (var i = 0; i < songs.length; i++) {
            var song = songs[i];
            var li = document.createElement('li');
            li.textContent = song.number + ' - ' + song.title;
            li.dataset.image = song.image;
            li.dataset.title = song.title;
            li.dataset.number = song.number;
            li.dataset.content = song.content;
            li.addEventListener('click', function () {
                var imageUrl = 'src/Hymnal.XF/Resources/Assets/MusicSheets/' + this.dataset.image;
                var title = encodeURIComponent(this.dataset.title);
                var number = encodeURIComponent(this.dataset.number);
                var content = encodeURIComponent(this.dataset.content);

                var page = dropdownMenu.value === 'lyrics' ? 'lyrics-old.html' : 'image-old.html';
                window.location.href = page + '?' + (dropdownMenu.value === 'lyrics' ? 'content=' + content + '&' : 'image=' + encodeURIComponent(imageUrl) + '&') + 'title=' + title + '&number=' + number;
            });
            songList.appendChild(li);
        }
    }

    function normalizeText(text) {
        return text.replace(/[àáâãäå]/g,"a")
                   .replace(/[èéêë]/g,"e")
                   .replace(/[ìíîï]/g,"i")
                   .replace(/[òóôõö]/g,"o")
                   .replace(/[ùúûü]/g,"u")
                   .replace(/ñ/g,"n")
                   .replace(/[^\w\s]/g, ''); // Remove punctuation
    }

    searchInput.addEventListener('input', function () {
        var query = normalizeText(searchInput.value.toLowerCase());
        var filteredSongs = [];
        
        for (var i = 0; i < allSongs.length; i++) {
            var song = allSongs[i];
            if (normalizeText(song.number.toLowerCase()).indexOf(query) !== -1 || 
                normalizeText(song.title.toLowerCase()).indexOf(query) !== -1) {
                filteredSongs.push(song);

                // Check for corresponding song mapping
                for (var j = 0; j < songMapping.length; j++) {
                    var mapping = songMapping[j];
                    if (mapping.english === song.number || mapping.spanish === song.number) {
                        var correspondingNumber = mapping.english === song.number ? mapping.spanish : mapping.english;
                        for (var k = 0; k < allSongs.length; k++) {
                            var correspondingSong = allSongs[k];
                            if (correspondingSong.number === correspondingNumber && 
                                correspondingSong.language === (mapping.english === song.number ? 'spanish' : 'english')) {
                                filteredSongs.push(correspondingSong);
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        }

        populateList(filteredSongs);
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
