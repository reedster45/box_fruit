

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


// page for streaming media
app.get('/stream', (req, res) => {
  const magnet_link = "HagFFsasHJ547IFuGFU%64tFu%$TDasdFGaKJOdIaUH9";
  res.render('stream', { magnet: magnet_link });
});

// Stream the video via WebTorrent
app.get('/torrent_id', (req, res) => {
  const torrentMagnet = req.query.magnet;
  
  if (!torrentMagnet) {
    return res.status(400).send("Magnet link is required");
  }

  client.add(torrentMagnet, (torrent) => {
    // Assuming the first file is the video file
    const videoFile = torrent.files[0];
    
    // Set appropriate headers for streaming video
    res.setHeader('Content-Type', videoFile.mime);
    res.setHeader('Content-Length', videoFile.length);

    // Pipe the file content to the response (streaming the video)
    videoFile.createReadStream().pipe(res);
  });
});


// listening on port 3000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


