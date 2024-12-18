

import { fileURLToPath } from 'url';
import { readFile } from 'fs' // Async version of readFile
import express from 'express';
import WebTorrent from 'webtorrent';
import path from 'path';
import bodyParser from 'body-parser'
import sqlite3 from 'sqlite3';


const app = express();
const db_path = 'database/database.db'
const port = 3000;

const client = new WebTorrent();

// Convert the current module URL to a file path and derive __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (like CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(bodyParser.json());





// Open SQLite database (it will create the database file if it doesn't exist)
const db = new sqlite3.Database(db_path, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Function to initialize the database by executing the create_database.sql file
function initializeDatabase() {
  // Asynchronously read the SQL statements from the create_database.sql file
  readFile('./src/create_database.sql', 'utf-8', (err, sql) => {
    if (err) {
      console.error('Error reading the SQL file:', err.message);
      return;
    }

    // Execute the SQL to create tables (if not already created)
    db.exec(sql, (err) => {
      if (err) {
        console.error('Error executing SQL from file:', err.message);
      } else {
        console.log('Database tables checked/created from SQL file.');
      }
    });
  });
}

// init database - should I leave it here?
initializeDatabase();





// Routes for pages
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/movie', (req, res) => {
  res.render('movie');
});

app.get('/tvshow', (req, res) => {
  res.render('tv_show');
});

app.get('/browse', (req, res) => {
  res.render('browse');
});

app.get('/favs', (req, res) => {
  res.render('favorites');
});







// page for streaming media
app.get('/stream', (req, res) => {
  const magnet_link = "magnet:?xt=urn:btih:2150DBD1E4CD9B64F217D78AEDB71116B3C098E0&dn=Gladiator%202%202024%201080p%20WEB-DL%20ENGLiSH%20x264-BAUCKLEY&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2Ftracker.bittor.pw%3A1337%2Fannounce&tr=udp%3A%2F%2Fpublic.popcorn-tracker.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.dler.org%3A6969%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969&tr=udp%3A%2F%2Fopen.demonii.com%3A1337%2Fannounce";
  //  const magnet_link = "magnet:?xt=urn:btih:2150DBD1E4CD9B64F217D78AEDB71116B3C098E0";
  const encoded_magnet_link = encodeURIComponent(magnet_link);
  res.render('stream', { magnet: encoded_magnet_link });
});

app.get('/torrent_id', (req, res) => {
  const magnetLink = decodeURIComponent(req.query.magnet);

  if (!magnetLink) {
    return res.status(400).send("Magnet link is required");
  }

  client.add(magnetLink, (torrent) => {
    const videoFile = torrent.files.find(file => file.name.endsWith('.mp4') || file.name.endsWith('.mkv'));

    if (!videoFile) {
      return res.status(404).send('Video file not found');
    }

    const range = req.headers.range;
    let stream;

    if (range) {
      const [start, end] = range.replace(/bytes=/, "").split("-").map(Number);
      const startByte = Math.min(start, videoFile.length - 1);
      const endByte = Math.min(end || videoFile.length - 1, videoFile.length - 1);

      if (startByte >= videoFile.length || endByte >= videoFile.length) {
        return res.status(416).send('Requested range not satisfiable');
      }

      res.status(206);
      res.setHeader('Content-Range', `bytes ${startByte}-${endByte}/${videoFile.length}`);
      res.setHeader('Content-Length', endByte - startByte + 1);
      res.setHeader('Content-Type', videoFile.mime || 'video/mkv');

      stream = videoFile.createReadStream({ start: startByte, end: endByte });
    } else {
      res.setHeader('Content-Type', videoFile.mime || 'video/mkv');
      res.setHeader('Content-Length', videoFile.length);

      stream = videoFile.createReadStream();
    }

    // handle errors?
    client.on('error', (err) => {
      console.error('Error:', err);
      if (!res.headersSent) {
        res.status(500).send('Error streaming video');
      }
    });

    stream.pipe(res);
  });

  client.on('error', (err) => {
    console.error('Error:', err);
    if (!res.headersSent) {
      res.status(500).send('Error processing torrent');
    }
  });
});








// listening on port 3000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

