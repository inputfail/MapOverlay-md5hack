var http = require('http');
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

var Twit = require('twit')

var T = new Twit({
  consumer_key:         'G0Y8G38hohOYfm8AZQkGGAmeq',
  consumer_secret:      'P5nmxOLsiQvAzQa1GaRMmHCKy6wBibhECKA5AmnWUOiRvfKT56',
  access_token:         '62069417-l3eK0lU6jWEXNTywmlaTgcddpEeVQHjjN7jmlYzga',
  access_token_secret:  'jDZ8Y7YQ4R8GBrZtXIlp5EinI74C1b5hVs0oOah4Kqej1',
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
})

var server = http.createServer(app);
server.listen(8080);

var sanFrancisco = [ '-122.75', '36.8', '-121.75', '37.8' ]

var stream = T.stream('statuses/filter', { locations: sanFrancisco })

io.sockets.on('connection', function (socket) {
  stream.on('tweet', function(tweet) {
	  if (tweet.coordinates) {
		  if(tweet.coordinates !== null) {
			  if(tweet.entities.media) {
				  if(tweet.entities.media !== null) {
					  socket.emit('info', {"lat": data.coordinates.coordinates[0],"lng": data.coordinates.coordinates[1],"pic": data.entities.media.media_url});
				  }
			  }
		  }
	  }
  });
});
