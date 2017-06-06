const express = require('express');
const request = require('request');
const CSE_API_KEY = 'AIzaSyDShhUGzgERqqwkrkVDKVEcxdjM9CiiSuY';
const CSE_ID = '003871207418865471616:ucpidd7mpgm';
const app = express();
const mongo = require('mongodb').MongoClient;


app.get('/', function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(
            `
            <h3>How it works:</h3>
            <blockquote>
                <ul>1) You can get the image URLs, alt text and page urls for a set of images relating to a given search string.</ul>
                <ul>2) You can paginate through the responses by adding a ?offset=2 parameter to the URL.</ul>
                <ul>3) I can get a list of the most recently submitted search strings.</ul>
            </blockquote>
            <h3>Example usage:</h3>
            <code>Search for images like this: <a href="https://image-search-evandersar.c9users.io/api/imagesearch/lolcats%20funny?offset=10" target="_blank">https://image-search-evandersar.c9users.io/api/imagesearch/lolcats%20funny?offset=10</a></code><br>
            <p></p>
            <code>Browse recent search queries like this: <a href="https://image-search-evandersar.c9users.io/api/latest/imagesearch/" target="_blank">https://image-search-evandersar.c9users.io/api/latest/imagesearch/</a></code>
            `
        );
});

app.get('/api/latest/imagesearch/', function (req, res) {
    
    mongo.connect("mongodb://localhost:27017/test", function(err, db) {
            if (err) throw err;
            var coll = db.collection('history');

            coll.find({}, { term: 1, time: 1, _id: 0 })
                .toArray(function(err, documents) {
                    if (err) throw err;
                    //console.log(documents);
                    var lastQueries = (documents.length < 10) ? documents.reverse(): documents.reverse().slice(0, 10);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(lastQueries));
                    db.close();
                });
    });
    
});

app.get('/api/imagesearch/:keyword', function (req, res) {
    
    var keyword = req.params.keyword;
    var offset = req.query.offset;
    
    var url = (offset && offset != 0) ?  `https://www.googleapis.com/customsearch/v1?key=${CSE_API_KEY}&cx=${CSE_ID}&searchType=image&q=${keyword}&start=${offset}` 
                                      :  `https://www.googleapis.com/customsearch/v1?key=${CSE_API_KEY}&cx=${CSE_ID}&searchType=image&q=${keyword}`;
    
    var options = {  
        url: url,
        method: 'GET'
    };
    
    
    request(options, function(error, response, body) {  
        if (error) throw error;
        
        var date = new Date().toJSON();

        var query = {
          "term": keyword,
          "time": date
        };
        
        mongo.connect("mongodb://localhost:27017/test", function(err, db) {
            if (err) throw err;
            var coll = db.collection('history');
            
            coll.insert(query, function(err, data) {
              if (err) throw err;
              //console.log(JSON.stringify(query));
              db.close();
            });
            
            
        });
        
        var items = [];
        
        for (var item of JSON.parse(body).items){
            items.push({
                url: item.link,
                snippet: item.snippet,
                thumbnail: item.image.thumbnailLink,
                context: item.image.contextLink
            });
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(items));
        
    });
    
    
});

app.listen(8080, function () {
  console.log('App listening on port 8080!');
});
