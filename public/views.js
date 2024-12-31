

const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');

// document.getElementById('videoPlayer').volume = 1.0;


// check if pathname match the pattern "/tvshow/:id/season/:season_number"
const tvshowRegex = /^\/tvshow\/([^/]+)\/season\/([^/]+)$/;
const movieRegex = /^\/movie\/([^/]+)$/;
const pathname = window.location.pathname;
const tvshowMatch = pathname.match(tvshowRegex);
const movieMatch = pathname.match(movieRegex);

// Check if the sidebar was open on a previous page visit (from localStorage) or close if on /movie or /tvshow
if (localStorage.getItem('sidebarOpen') === 'true' && (!tvshowMatch && !movieMatch)) {
  sidebar.classList.add('show');
  document.body.classList.add('sidebar-open');
}

// Toggle the sidebar when the hamburger icon is clicked
sidebarToggle.addEventListener('click', function () {
  sidebar.classList.toggle('show');
  document.body.classList.toggle('sidebar-open');

  // save state of sidebar in localStorage
  const isOpen = sidebar.classList.contains('show');
  localStorage.setItem('sidebarOpen', isOpen);
});




const movieOption = document.getElementById('movie-option');
const tvOption = document.getElementById('tv-option');
const form = document.getElementById('search-bar');


// Function to handle search selection type
function toggleMediaType(selectedOption) {
  movieOption.classList.remove('selected');
  tvOption.classList.remove('selected');
  selectedOption.classList.add('selected');

  if (selectedOption === movieOption) {
    form.action = '/searchmovie';
  } else if (selectedOption === tvOption) {
    form.action = '/searchtv'; 
  }
}

// Add event listeners to the options
movieOption.addEventListener('click', () => toggleMediaType(movieOption));
tvOption.addEventListener('click', () => toggleMediaType(tvOption));

// Set default selection to 'Movie'
toggleMediaType(movieOption);  









// hover description beside thumbnails
document.querySelectorAll('.desc-hover').forEach(thumbnail => {
  const hoverBox = thumbnail.querySelector('.desc-hover-box');
  
  // Check position when hovering over the thumbnail
  thumbnail.addEventListener('mouseenter', function() {
    const thumbnailRect = thumbnail.getBoundingClientRect();
    const screenWidth = window.innerWidth;

    // Check if the thumbnail's right edge is within 200px of the screen's right edge
    if (screenWidth - thumbnailRect.right < 225) {
      // Adjust the hover box position to the left side
      hoverBox.style.marginLeft = `-${hoverBox.offsetWidth}px`; // Moves box to the left
    } else {
      // Default position: display box to the right
      hoverBox.style.marginLeft = `200px`; // Position to the right
    }
  });

  // Reset the hover box position when leaving the hover area
  thumbnail.addEventListener('mouseleave', function() {
    hoverBox.style.marginLeft = ''; // Reset to default
  });
});




const sort_popularity = document.getElementById('sort-popularity');
const sort_trending = document.getElementById('sort-trending');
const sort_date = document.getElementById('sort-date');
const sort_alpha = document.getElementById('sort-alpha');

// Function to handle the filter selection logic
function toggleFilter(selectedOption) {
  sort_popularity.classList.remove('selected');
  sort_trending.classList.remove('selected');
  sort_date.classList.remove('selected');
  sort_alpha.classList.remove('selected');

  selectedOption.classList.add('selected');
}

// Add event listeners to the options
sort_popularity.addEventListener('click', () => {
  toggleFilter(sort_popularity);
  localStorage.setItem('toggledFilter', 'popular');
});

sort_trending.addEventListener('click', () => {
  toggleFilter(sort_trending);
  localStorage.setItem('toggledFilter', 'trending');
});

sort_date.addEventListener('click', () => {
  toggleFilter(sort_date);
  localStorage.setItem('toggledFilter', 'date');
});

sort_alpha.addEventListener('click', () => {
  toggleFilter(sort_alpha);
  localStorage.setItem('toggledFilter', 'alpha');
});

// Set default selection to 'Movie'
console.log(localStorage.getItem('toggledFilter'));

if (localStorage.getItem('toggledFilter') == 'trending') {
  toggleFilter(sort_trending);
} else if (localStorage.getItem('toggledFilter') == 'date') {
  toggleFilter(sort_date);
} else if (localStorage.getItem('toggledFilter') == 'alpha') {
  toggleFilter(sort_alpha);
} else if (localStorage.getItem('toggledFilter') == 'popular') {
  toggleFilter(sort_popularity);
}











// horizontal scrolling (home page)
function scrollLUM() {
  document.getElementById('scroll-containerUM').scrollBy({
      left: -250,
      behavior: 'smooth'
  });
}

function scrollRUM() {
  document.getElementById('scroll-containerUM').scrollBy({
      left: 250,
      behavior: 'smooth'
  });
}


function scrollLUS() {
  document.getElementById('scroll-containerUS').scrollBy({
      left: -250,
      behavior: 'smooth'
  });
}

function scrollRUS() {
  document.getElementById('scroll-containerUS').scrollBy({
      left: 250,
      behavior: 'smooth'
  });
}



function scrollLMM() {
  document.getElementById('scroll-containerMM').scrollBy({
      left: -250,
      behavior: 'smooth'
  });
}

function scrollRMM() {
  document.getElementById('scroll-containerMM').scrollBy({
      left: 250,
      behavior: 'smooth'
  });
}


function scrollLMS() {
  document.getElementById('scroll-containerMS').scrollBy({
      left: -250,
      behavior: 'smooth'
  });
}

function scrollRMS() {
  document.getElementById('scroll-containerMS').scrollBy({
      left: 250,
      behavior: 'smooth'
  });
}




function scrollLR() {
  document.getElementById('scroll-containerR').scrollBy({
      left: -250,
      behavior: 'smooth'
  });
}

function scrollRR() {
  document.getElementById('scroll-containerR').scrollBy({
      left: 250,
      behavior: 'smooth'
  });
}