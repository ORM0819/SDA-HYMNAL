// Example: Assuming you have a function that navigates to the image or lyrics viewer
function navigateToViewer(type, song) {
    var baseUrl;
    if (type === 'image') {
        baseUrl = 'image-old.html';
    } else if (type === 'lyrics') {
        baseUrl = 'lyrics-old.html';
    }

    // Construct the URL with the necessary query parameters
    var url = baseUrl + '?number=' + encodeURIComponent(song.number) +
              '&title=' + encodeURIComponent(song.title);

    if (type === 'image') {
        url += '&image=' + encodeURIComponent(song.image);
    } else if (type === 'lyrics') {
        url += '&content=' + encodeURIComponent(song.content);
    }

    // Redirect to the constructed URL
    window.location.href = url;
}

// Example of usage when a user clicks on a song
document.getElementById('song-list').addEventListener('click', function(e) {
    var target = e.target;
    if (target.tagName === 'LI') {
        var songNumber = target.getAttribute('data-number');
        var songTitle = target.getAttribute('data-title');
        var songImage = target.getAttribute('data-image'); // For image viewer
        var songContent = target.getAttribute('data-content'); // For lyrics viewer

        // Example of determining which type of viewer to navigate to
        if (someCondition) {
            navigateToViewer('image', {
                number: songNumber,
                title: songTitle,
                image: songImage
            });
        } else {
            navigateToViewer('lyrics', {
                number: songNumber,
                title: songTitle,
                content: songContent
            });
        }
    }
});
