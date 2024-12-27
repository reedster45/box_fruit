

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










// horizontal scrolling (home page)
function scrollLUM() {
  console.log('left');
  document.getElementById('scroll-containerUM').scrollBy({
      left: -250,
      behavior: 'smooth'
  });
}

function scrollRUM() {
  console.log('right');
  document.getElementById('scroll-containerUM').scrollBy({
      left: 250,
      behavior: 'smooth'
  });
}


function scrollLUS() {
  console.log('left');
  document.getElementById('scroll-containerUS').scrollBy({
      left: -250,
      behavior: 'smooth'
  });
}

function scrollRUS() {
  console.log('right');
  document.getElementById('scroll-containerUS').scrollBy({
      left: 250,
      behavior: 'smooth'
  });
}



function scrollLMM() {
  console.log('left');
  document.getElementById('scroll-containerMM').scrollBy({
      left: -250,
      behavior: 'smooth'
  });
}

function scrollRMM() {
  console.log('right');
  document.getElementById('scroll-containerMM').scrollBy({
      left: 250,
      behavior: 'smooth'
  });
}


function scrollLMS() {
  console.log('left');
  document.getElementById('scroll-containerMS').scrollBy({
      left: -250,
      behavior: 'smooth'
  });
}

function scrollRMS() {
  console.log('right');
  document.getElementById('scroll-containerMS').scrollBy({
      left: 250,
      behavior: 'smooth'
  });
}




function scrollLR() {
  console.log('left');
  document.getElementById('scroll-containerR').scrollBy({
      left: -250,
      behavior: 'smooth'
  });
}

function scrollRR() {
  console.log('right');
  document.getElementById('scroll-containerR').scrollBy({
      left: 250,
      behavior: 'smooth'
  });
}