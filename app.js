

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




// setup WebTorrent client & handle errors
const client = new WebTorrent();





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
  const magnet_link = encodeURIComponent("magnet:?xt=urn:btih:B26C545F17BCFCF0303A653E6F08318C39A373DD&dn=Gladiator%20II%202024%201080p%20TELESYNC%20x264%20AC3-AOC&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2Ftracker.bittor.pw%3A1337%2Fannounce&tr=udp%3A%2F%2Fpublic.popcorn-tracker.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.dler.org%3A6969%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969&tr=udp%3A%2F%2Fopen.demonii.com%3A1337%2Fannounce");
  res.render('stream', { magnet: magnet_link });
});

app.get('/torrent_id', (req, res) => {
  const magnetLink = decodeURIComponent(req.query.magnet);
  const infoHash = extractInfoHash(magnetLink); // Extract the infoHash from the magnet link

  // Check if the torrent is already added by infoHash
  const existingTorrent = client.torrents.find(torrent => torrent.infoHash === infoHash);

  if (existingTorrent) {
    console.log(`Torrent already added: ${existingTorrent.infoHash}`);
    return handleTorrent(existingTorrent, res);
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
  
    // You can access files within the torrent
    const file = torrent.files.find(file => file.name.endsWith('.mkv')); // Adjust based on the file type 
  
    if (!file) {
      return res.status(404).send("No matching video file found.");
    }
  
    res.setHeader('Content-Type', 'video/mkv');
  
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
    // res.writeHead(206, {
    //   "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    //   "Accept-Ranges": "bytes",
    //   "Content-Length": chunkSize,
    //   "Content-Type": "video/mkv"
    // });
  
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








// listening on port 3000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

