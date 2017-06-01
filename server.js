const express = require('express');
const app = express();

app.get('/', function (req, res) {
  res.send(
        `
        <h3>Example usage:</h3>
        https://timestamp-prj-evandersar.c9users.io/December 15, 2015<br>
        https://timestamp-prj-evandersar.c9users.io/1450137600000
        <h3>Example output:</h3>
        { "unix": 1450137600000, "natural": "December 15, 2015" }
        `
    );
});

app.get('/:timestamp', function (req, res) {
    
    var timeObj = (+req.params.timestamp) ? new Date(+req.params.timestamp) : new Date(req.params.timestamp);
    
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
