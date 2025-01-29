

import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser'
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();


const app = express();
const db_path = 'database/database.db'
const port = 3000;

// Convert the current module URL to a file path and derive __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TMDb Base URL and API Key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const TMDB_API_KEY = process.env.TMDB_API_KEY;




// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (like CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(bodyParser.json());









// Routes for pages

// homepage
app.get('/', async (req, res) => {
  try {
    // Fetch popular movies
    const res1 = await axios.get(`${TMDB_BASE_URL}/movie/now_playing`, {params: { api_key: TMDB_API_KEY }, });
    const res2 = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {params: { api_key: TMDB_API_KEY }, });
    const res3 = await axios.get(`${TMDB_BASE_URL}/tv/airing_today`, {params: { api_key: TMDB_API_KEY }, });
    const res4 = await axios.get(`${TMDB_BASE_URL}/tv/popular`, {params: { api_key: TMDB_API_KEY }, });

    // Get the first movie
    const new_movies = res1.data.results;
    const pop_movies = res2.data.results;
    const new_tv = res3.data.results;
    const pop_tv = res4.data.results;

    // Render the page with the movie
    res.render('home', {new_movies, pop_movies, new_tv, pop_tv, imageBaseUrl: TMDB_IMAGE_BASE_URL, });

  } catch (error) {
    console.error('Error fetching movie:', error.message);
    res.status(500).send('Error fetching movie');
  }
});


// Movie Details Route
app.get('/movie/:id', async (req, res) => {
  const movieId = req.params.id; // Get the movie ID from the URL

  try {
    // Fetch detailed movie information
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, { params: { api_key: TMDB_API_KEY }, });
    const creditsResponse = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/credits`, { params: { api_key: TMDB_API_KEY }, });
    const releaseDatesResponse = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/release_dates`, { params: { api_key: TMDB_API_KEY }, });

    const trailerResponse = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/videos`, {params: {api_key : TMDB_API_KEY }, });
    const trailer = trailerResponse.data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');


    const movie = response.data;
    const cast = creditsResponse.data.cast;  // Actors
    const crew = creditsResponse.data.crew;  // Crew (Directors, etc.)
    const releaseDates = releaseDatesResponse.data.results;

    // Get the age rating from the release dates (example for US)
    const usRelease = releaseDates.find(release => release.iso_3166_1 === 'US');
    const ageRating = usRelease ? usRelease.release_dates[0].certification : 'N/A';

    // Find the director (the first person in the crew with 'Director' role)
    const director = crew.find(person => person.job === 'Director');

    // Find the backdrop image if available
    const backdropPath = movie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}/w1280${movie.backdrop_path}` : null;

    // Render movie details page
    res.render('movie', { movie, cast, director, backdropPath, ageRating, trailer, imageBaseUrl: TMDB_IMAGE_BASE_URL, });

  } catch (error) {
    console.error('Error fetching movie details:', error.message);
    res.status(500).send('Error fetching movie details');
  }
});


// TV Show Details Route
app.get('/tvshow/:id/season/:season_number', async (req, res) => {
  const { id, season_number } = req.params;

  try {
    const tvResponse = await axios.get(`${TMDB_BASE_URL}/tv/${id}`, { params: { api_key: TMDB_API_KEY }, });
    const seasonResponse = await axios.get(`${TMDB_BASE_URL}/tv/${id}/season/${season_number}`, { params: { api_key: TMDB_API_KEY }, });
    const creditsResponse = await axios.get(`${TMDB_BASE_URL}/tv/${id}/credits`, { params: { api_key: TMDB_API_KEY }, });

    const trailerResponse = await axios.get(`${TMDB_BASE_URL}/tv/${id}/videos`, {params: {api_key : TMDB_API_KEY }, });
    const trailer = trailerResponse.data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');

    // Get the cast and crew
    const cast = creditsResponse.data.cast;
    const crew = creditsResponse.data.crew;

    const tvshow = tvResponse.data;
    const season = seasonResponse.data;

    // Render TV show details page
    res.render('tv_show', {
      tvshow,
      cast,
      crew,
      season,
      trailer,
      imageBaseUrl: TMDB_IMAGE_BASE_URL,
      availableSeasons: tvshow.seasons,
    });

  } catch (error) {
    console.error('Error fetching TV show details:', error.message);
    res.status(500).send('Error fetching TV show details');
  }
});


app.get('/browsemovie', async (req, res) => {
  try {
    // Pagination parameters (defaults to page 1 if no query provided)
    const page = parseInt(req.query.page) || 1;
    const per_page = 36;
    const query = req.query.query;
    let sort_by = req.query.sort_by;

    if (!sort_by) {
      sort_by = 'popularity.desc';
    }

    // Fetch movies from TMDB API
    let response = [];
    if (query) {
      response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          query: query,
          page: page,
          sort_by: sort_by,
          language: 'en-US',
        },
      });
    } else {
      response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          page: page,
          sort_by: sort_by,
          language: 'en-US',
        },
      });
    }

    // Get the movie data and total pages
    const movies = response.data.results;
    const total_pages = response.data.total_pages;

    res.render('browse_movies', {
      movies,
      page,
      total_pages,
      query,
      sort_by,
      imageBaseUrl: TMDB_IMAGE_BASE_URL,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching movies');
  }
});


app.get('/browsetv', async (req, res) => {
  try {
    // Pagination parameters (defaults to page 1 if no query provided)
    const page = parseInt(req.query.page) || 1;
    const per_page = 36;
    const query = req.query.query;
    let sort_by = req.query.sort_by;

    if (!sort_by) {
      sort_by = 'popularity.desc';
    }

    // Fetch movies from TMDB API
    let response = [];
    if (query) {
      response = await axios.get(`${TMDB_BASE_URL}/search/tv`, {
        params: {
          api_key: TMDB_API_KEY,
          query: query,
          page: page,
          sort_by: sort_by,
          language: 'en-US',
        },
      });
    } else {
      response = await axios.get(`${TMDB_BASE_URL}/discover/tv`, {
        params: {
          api_key: TMDB_API_KEY,
          page: page,
          sort_by: sort_by,
          language: 'en-US',
        },
      });
    }

    // Get the movie data and total pages
    const shows = response.data.results;
    const total_pages = response.data.total_pages;

    res.render('browse_tv', {
      shows,
      page,
      total_pages,
      query,
      sort_by,
      imageBaseUrl: TMDB_IMAGE_BASE_URL,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching movies');
  }
});


app.get('/searchmovie', async (req, res) => {
  try {
    const query = req.query.query;
    const page = parseInt(req.query.page) || 1;  // Default to page 1

    // Fetch movies from TMDB API
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: query,
        page: page,
        sort_by: 'popularity.desc',
        language: 'en-US',
      },
    });

    const movies = response.data.results;
    const total_pages = response.data.total_pages;

    res.render('browse_movies', {
      movies,
      query,
      page,
      total_pages,
      sort_by: 'popularity.desc',
      imageBaseUrl: TMDB_IMAGE_BASE_URL,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching movies');
  }
});

app.get('/searchtv', async (req, res) => {
  try {
    const query = req.query.query;
    const page = parseInt(req.query.page) || 1;  // Default to page 1

    // Fetch movies from TMDB API
    const response = await axios.get(`${TMDB_BASE_URL}/search/tv`, {
      params: {
        api_key: TMDB_API_KEY,
        query: query,
        page: page,
        sort_by: 'popularity.desc',
        language: 'en-US',
      },
    });

    const shows = response.data.results;
    const total_pages = response.data.total_pages;

    res.render('browse_tv', {
      shows,
      query,
      page,
      total_pages,
      sort_by: 'popularity.desc',
      imageBaseUrl: TMDB_IMAGE_BASE_URL,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching shows');
  }
});


app.get('/downloads', (req, res) => {
  res.render('downloads');
});

app.get('/favs', (req, res) => {
  res.render('favorites');
});









// page for streaming media
// Movie Details Route
app.get('/streammovie/:id', async (req, res) => {
  const streamId = req.params.id; // Get the movie ID from the URL
  let curr_key = req.query.key;
  let curr_src;

  if (!curr_key) {
    curr_key = 'VidSrc';
  }

  try {
    // Fetch detailed movie information
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${streamId}`, { params: { api_key: TMDB_API_KEY }, });

    const movie = response.data;

    // Find the backdrop image if available
    const backdropPath = movie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}/w1280${movie.backdrop_path}` : null;

    // create list of sources
    const sources = new Map([
      ['VidSrc', encodeURI(`https://www.2embed.cc/embed/${streamId}`)],
      ['SuperEm', encodeURI(`https://multiembed.mov/?video_id=${streamId}&tmdb=1`)]
    ]);
    curr_src = sources.get(curr_key);
 

    // Render movie details page
    res.render('streammovie', { streamId, sources, curr_key, curr_src, movie, backdropPath, imageBaseUrl: TMDB_IMAGE_BASE_URL, });

  } catch (error) {
    console.error('Error fetching movie details:', error.message);
    res.status(500).send('Error fetching movie details');
  }
});

app.get('/streamtv/:tv_id/season/:season_number/episode/:episode_number', async (req, res) => {
  const { tv_id, season_number, episode_number } = req.params;
  let curr_key = req.query.key;
  let curr_src;

  if (!curr_key) {
    curr_key = 'VidSrc';
  }

  try {
    // Fetch the episode details
    const episodeResponse = await axios.get(`${TMDB_BASE_URL}/tv/${tv_id}/season/${season_number}/episode/${episode_number}`, { params: { api_key: TMDB_API_KEY }, });
    const episode = episodeResponse.data;

    // Fetch the TV show details for the header (optional)
    const tvResponse = await axios.get(`${TMDB_BASE_URL}/tv/${tv_id}`, { params: { api_key: TMDB_API_KEY }, });
    const tvshow = tvResponse.data;

    // Fetch details for the selected season
    const seasonResponse = await axios.get(`${TMDB_BASE_URL}/tv/${tv_id}/season/${season_number}`, { params: { api_key: TMDB_API_KEY }, });
    const season = seasonResponse.data;

    // create list of sources
    const sources = new Map([
      ['VidSrc', encodeURI(`https://www.2embed.cc/embedtv/${tv_id}&s=${season_number}&e=${episode_number}`)],
      ['SuperEm', encodeURI(`https://multiembed.mov/?video_id=${tv_id}&tmdb=1&s=${season_number}&e=${episode_number}`)],
      ['Anime', encodeURI(`https://2anime.xyz/embed/${tvshow.name}-episode-${episode_number}`)]
    ]);
    curr_src = sources.get(curr_key);



    // Render movie details page
    res.render('streamtv', { tv_id, episode, tvshow, season, sources, curr_key, curr_src, imageBaseUrl: TMDB_IMAGE_BASE_URL, availableSeasons: tvshow.seasons, });

  } catch (error) {
    console.error('Error fetching movie details:', error.message);
    res.status(500).send('Error fetching movie details');
  }
});















// Function to open Firefox in full-screen mode
function openBrowser() {
  // start command based on OS
  const command = process.platform === 'win32'
    ? 'start firefox --kiosk http://localhost:3000'
    : `firefox --kiosk http://localhost:${port}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error opening browser: ${error}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log("Launching Browser Window...");
  });
}


// listening on port 3000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  openBrowser();
});

