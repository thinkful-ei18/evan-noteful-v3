'use strict';
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/audio', (req,res,next) => {
  const filePath = path.join('./resources/audio/' + 'everythingawesome.mp3');
  const stat = fs.statSync(filePath);

  res.writeHead(200, {
    'Content-Type': 'audio/mpeg',
    'Content-Length' : stat.size
  });

  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});


module.exports = router;