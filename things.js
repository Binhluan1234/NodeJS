var express = require('express');
var router = express.Router();

const bodyParser= require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));

router.get('/', (req, res) => {
  //  res.send('GET route on things. ad');
   res.sendFile(__dirname + '/index.html');
});
router.post('/', (req, res) => {
   res.send('POST route on things.');
});
router.post('/quotes', (req, res) => {
  // res.send('POST route on things - quotes');
  res.send(req.body);
})

//export this router to use in our index.js
module.exports = router;
