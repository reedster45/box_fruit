

const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');

// document.getElementById('videoPlayer').volume = 1.0;


// Check if the sidebar was open on a previous page visit (from localStorage)
if (localStorage.getItem('sidebarOpen') === 'true') {
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





// redirect to movie/show
function toMovie() {
  const param1 = 'value1';
  const param2 = 'value2';

  // Construct the URL with parameters
  const url = '/movie';

  // Redirect to the constructed URL
  window.location.href = url;
}

function toShow() {
  const param1 = 'value1';
  const param2 = 'value2';

  // Construct the URL with parameters
  const url = '/tvshow';

  // Redirect to the constructed URL
  window.location.href = url;
}

function toStream() {
  const param1 = 'value1';
  const param2 = 'value2';

  // Construct the URL with parameters
  const url = '/stream';

  // Redirect to the constructed URL
  window.location.href = url;
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