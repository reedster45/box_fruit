

import { fileURLToPath } from 'url';
import { readFile } from 'fs' // Async version of readFile
import express from 'express';
import WebTorrent from 'webtorrent';
import path from 'path';
import bodyParser from 'body-parser'
import sqlite3 from 'sqlite3';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();


const app = express();
const db_path = 'database/database.db'
const port = 3000;

// Convert the current module URL to a file path and derive __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// setup WebTorrent client & handle errors
const client = new WebTorrent();

// TMDb Base URL and API Key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// JACKETT Base URL and API key
const JACKETT_URL = 'http://127.0.0.1:9117/api/v2.0/indexers/all/results';
const JACKETT_KEY = process.env.JACKETT_KEY;




// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (like CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(bodyParser.json());







// // Open SQLite database (it will create the database file if it doesn't exist)
// const db = new sqlite3.Database(db_path, (err) => {
//   if (err) {
//     console.error('Error opening database:', err.message);
//   } else {
//     console.log('Connected to the SQLite database.');
//   }
// });

// // Function to initialize the database by executing the create_database.sql file
// function initializeDatabase() {
//   // Asynchronously read the SQL statements from the create_database.sql file
//   readFile('./src/create_database.sql', 'utf-8', (err, sql) => {
//     if (err) {
//       console.error('Error reading the SQL file:', err.message);
//       return;
//     }

//     // Execute the SQL to create tables (if not already created)
//     db.exec(sql, (err) => {
//       if (err) {
//         console.error('Error executing SQL from file:', err.message);
//       } else {
//         console.log('Database tables checked/created from SQL file.');
//       }
//     });
//   });
// }

// // init database - should I leave it here?
// initializeDatabase();

// fetches top ten movie torrents from JACKETT API indexers













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
  let magnet_link = req.query.link;
  const magnet_links = await getTorrents(req.query.query, req.query.type);
  const streamId = req.params.id; // Get the movie ID from the URL

  if(!magnet_link) {
    if (magnet_links[0]) {
      magnet_link = encodeURIComponent(magnet_links[0].magnetLink);
    } else {
      magnet_link = 'magnet:?xt=urn:btih:6A30BCACA0F4C822FC5A581F73A239DC353B3352&dn=Hammy%20El%20Hamster%20DVDRip%20Spanish%20Ac3%202008&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2Ftracker.bittor.pw%3A1337%2Fannounce&tr=udp%3A%2F%2Fpublic.popcorn-tracker.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.dler.org%3A6969%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969&tr=udp%3A%2F%2Fopen.demonii.com%3A1337%2Fannounce';
    }
  }

  // console.log(magnet_links);
  // console.log(`magnet link: ${magnet_link}`);

  try {
    // Fetch detailed movie information
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${streamId}`, { params: { api_key: TMDB_API_KEY }, });

    const movie = response.data;

    // Find the backdrop image if available
    const backdropPath = movie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}/w1280${movie.backdrop_path}` : null;

    // Render movie details page
    res.render('streammovie', { movie, backdropPath, imageBaseUrl: TMDB_IMAGE_BASE_URL, magnet: magnet_link, magnet_links, });

  } catch (error) {
    console.error('Error fetching movie details:', error.message);
    res.status(500).send('Error fetching movie details');
  }
});

app.get('/streamtv/:tv_id/season/:season_number/episode/:episode_number', async (req, res) => {
  let magnet_link = req.query.link;
  const { tv_id, season_number, episode_number } = req.params;
  const query = `${req.query.query} s${String(season_number).padStart(2, '0')}e${String(episode_number).padStart(2, '0')}`;
  const magnet_links = await getTorrents(query, req.query.type);

  if(!magnet_link) {
    if (magnet_links[0]) {
      magnet_link = encodeURIComponent(magnet_links[0].magnetLink);
    } else {
      magnet_link = 'magnet:?xt=urn:btih:60F6F428525B7A70F499526798DED544398AF0C7&dn=2024%20FIM%20World%20Supercross%20Rd%202%20Australian%20GP%20Night%201%201080p%20x265.mkv&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2Ftracker.bittor.pw%3A1337%2Fannounce&tr=udp%3A%2F%2Fpublic.popcorn-tracker.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.dler.org%3A6969%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969&tr=udp%3A%2F%2Fopen.demonii.com%3A1337%2Fannounce';
    }
  }

  // console.log(magnet_links);
  // console.log(query);

  try {
    // Fetch the episode details
    const episodeResponse = await axios.get(`${TMDB_BASE_URL}/tv/${tv_id}/season/${season_number}/episode/${episode_number}`, {
      params: { api_key: TMDB_API_KEY },
    });

    const episode = episodeResponse.data;

    // Fetch the TV show details for the header (optional)
    const tvResponse = await axios.get(`${TMDB_BASE_URL}/tv/${tv_id}`, {
      params: { api_key: TMDB_API_KEY },
    });

    const tvshow = tvResponse.data;

    // Fetch details for the selected season
    const seasonResponse = await axios.get(`${TMDB_BASE_URL}/tv/${tv_id}/season/${season_number}`, { params: { api_key: TMDB_API_KEY }, });

    const season = seasonResponse.data;

    // Render movie details page
    res.render('streamtv', { episode, tvshow, season, imageBaseUrl: TMDB_IMAGE_BASE_URL, magnet: magnet_link, availableSeasons: tvshow.seasons, magnet_links, });

  } catch (error) {
    console.error('Error fetching movie details:', error.message);
    res.status(500).send('Error fetching movie details');
  }
});

app.get('/torrent_id', (req, res) => {
  const magnetLink = decodeURIComponent(req.query.magnet);
  const infoHash = extractInfoHash(magnetLink); // Extract the infoHash from the magnet link

  // Check if the torrent is already added by infoHash
  let curr_torrent;
  const existingTorrent = client.torrents.some((torrent) => {
    curr_torrent = torrent;
    return torrent.infoHash.toLowerCase() === infoHash.toLowerCase();
  });
  console.log(infoHash);
  console.log(existingTorrent);

  if (existingTorrent) {
    console.log(`Torrent already added: ${curr_torrent.infoHash}`);
    return handleTorrent(curr_torrent, res);
  }

  client.add(magnetLink, (torrent) => {
    console.log(`Torrent added: ${torrent.infoHash}`);
    handleTorrent(torrent, res);
  });

  function handleTorrent(torrent, res) {
    // print name of each file in torrent
    torrent.files.forEach(file => {
      console.log(file.name);
    });
  

    // get video file from torrent
    const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.flv', '.wmv', '.webm', '.vob', '.mpg', '.mpeg', '.m4v', '.3gp', '.ts', '.m2ts', '.f4v', '.rm', '.rmvb', '.divx', '.ogv', '.asf', '.mxf', '.bik', '.drc', '.qt'];
    const file = torrent.files.find(file => videoExtensions.some(ext => file.name.endsWith(ext)));
    let filetype;
    if (file) {
      filetype = file.name.split('.').pop();
      console.log(`File type: .${filetype}`);
    } else {
      return res.status(404).send("No matching video file found.");
    }
  
    res.setHeader('Content-Type', `video/${filetype}`);
  
    // Get the Range header
    const range = req.headers.range;
    if (!range) {
      return res.status(400).send("Requires Range header");
      // const stream = file.createReadStream();
      // stream.pipe(res);
    }
    
    console.log('Range request received:', range);
    
    const matches = range.replace(/bytes=/, "").split("-");
    const start = parseInt(matches[0], 10);
    const fileSize = file.length;
    const end = matches[1] ? parseInt(matches[1], 10) : fileSize - 1;
  
    // ensure range is valid
    if (start >= fileSize || end >= fileSize) {
      return res.status(416).send('Requested Range Not Satisfiable');
    }
  
    const chunkSize = end - start + 1;
    if (!res.headersSent) {
      console.log("sending headers...");
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": `video/${filetype}`
      });
    }
  
    // stream content in range
    console.log(start, end);
    const stream = file.createReadStream({ start, end });
    stream.pipe(res);
  
  
    // Handle stream events
    stream.on('open', () => {
      console.log('Streaming data now...');
    });
  
    stream.on('end', () => {
      console.log('Stream ended.');
    });
  
    stream.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).send('Internal Server Error');
      }
    });
  
    res.on('close', () => {
      console.log('Client closed the connection.');
      stream.destroy();  // Clean up the stream if client disconnects
    });
  
  
  
    // Handle stream progress
    torrent.on('download', (bytes) => {
      // console.log(`Downloaded ${bytes} bytes`);
    });
  
    torrent.on('done', () => {
      console.log('Download complete');
    });
  }
});

// Helper function to extract infoHash from the magnet link
function extractInfoHash(magnetLink) {
  const regex = /xt=urn:btih:([a-f0-9]{40})/i;
  const match = magnetLink.match(regex);
  return match ? match[1] : null;
}








// idea for TV: (use title and IMDB id?)
//    search for season first s0
//    if there is a season
//      search through for specific ep file
//    if there is no season
//      search for s01e01

// OR

// USE SONARR
// add series (to specific folder)
// query season/episode
// get top ten results
// remove series

async function getTorrents(query, type) {
  let category;

  if (type == 'movie') {
    category = '2000,2010,2020'; // Movies category
  } else if (type == 'tv') {
    category = '5000,5020,5050' // TV category
  }

  try {
      const response = await axios.get(JACKETT_URL, {
          params: {
              apikey: JACKETT_KEY,
              Query: query,
              Category: category
          }
      });


      const results = response.data.Results
          .filter(result => result.MagnetUri) // Keep only results with a magnet link
          .sort((a, b) => (b.Seeders || 0) - (a.Seeders || 0)) // Sort by seeders in descending order
          .slice(0, 10) // Keep the top 10 results
          .map(result => ({
              title: result.Title,
              magnetLink: result.MagnetUri,
              seeders: result.Seeders || 0,
              leechers: result.Leechers || 0,
              tracker: result.Tracker
          }));

      return results;
      
  } catch (error) {
      console.error('Error fetching data from Jackett:', error.message);
      return json({ error: 'Failed to fetch data from Jackett' });
  }
}








// listening on port 3000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

