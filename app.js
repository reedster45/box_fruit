

import express from 'express';
import WebTorrent from 'webtorrent';
import path from 'path';
import { fileURLToPath } from 'url';


const app = express();
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

app.get('/favs', (req, res) => {
  res.render('favorites');
});

// page for streaming media
app.get('/stream', (req, res) => {
  const magnet_link = "magnet:?xt=urn:btih:2150DBD1E4CD9B64F217D78AEDB71116B3C098E0&dn=Gladiator%202%202024%201080p%20WEB-DL%20ENGLiSH%20x264-BAUCKLEY&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2Ftracker.bittor.pw%3A1337%2Fannounce&tr=udp%3A%2F%2Fpublic.popcorn-tracker.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.dler.org%3A6969%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969&tr=udp%3A%2F%2Fopen.demonii.com%3A1337%2Fannounce";
  res.render('stream', { magnet: magnet_link });
});

// Stream the video via WebTorrent
app.get('/torrent_id', (req, res) => {
  const torrentMagnet = req.query.magnet;
  
  if (!torrentMagnet) {
    return res.status(400).send("Magnet link is required");
  }

  // error listener for loading webtorrent magnet link
  client.on('error', (err) => {
    console.error('WebTorrent error:', err.message);
  });

  client.add(torrentMagnet, (torrent) => {
    // Find the video file (filter out non-video files)
    const videoFile = torrent.files.find(file => file.name.match(/\.(mp4|webm|mkv)$/i)); // Choose mp4, webm, or mkv

    if (!videoFile) {
      return res.status(404).send('Video file not found in the torrent.');
    }

    // Set appropriate headers for streaming the video
    res.setHeader('Content-Type', videoFile.mime || 'video/mp4'); // Default to video/mp4 if MIME is not provided
    res.setHeader('Content-Length', videoFile.length);

    // Pipe the video file to the response (streaming the video)
    videoFile.createReadStream().pipe(res); 
  });
});


// listening on port 3000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


