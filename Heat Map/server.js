//Setup web server and socket
var twitter = require('twitter'),
	express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	io = require('socket.io').listen(server);

//Setup twitter stream api
var twit = new twitter({
	consumer_key: 'G0Y8G38hohOYfm8AZQkGGAmeq',
	consumer_secret: 'P5nmxOLsiQvAzQa1GaRMmHCKy6wBibhECKA5AmnWUOiRvfKT56',
	access_token_key: '62069417-l3eK0lU6jWEXNTywmlaTgcddpEeVQHjjN7jmlYzga',
	access_token_secret: 'jDZ8Y7YQ4R8GBrZtXIlp5EinI74C1b5hVs0oOah4Kqej1'
}),
stream = null;

//Use the default port (for beanstalk) or default to 8081 locally
server.listen(process.env.PORT || 8081);

//Setup routing for app
app.use(express.static(__dirname + '/public'));

//Create web sockets connection.
io.sockets.on('connection', function(socket){

	socket.on("start tweets", function(){

		if(stream === null){
			
			//Connect to twitter stream passing in filter for entire world.
			twit.stream('statuses/filter', {'locations':'-180,-90,180,90'}, function(s) {
				stream = s;
				stream.on('data', function(data){
					//Does the JSON result have coordinates
					if (data.coordinates){
						if (data.coordinates !== null){
							//If so then build up some nice json and send out to web sockets
							var outputPoint = {"lat": data.coordinates.coordinates[0],"lng": data.coordinates.coordinates[1]};

							socket.broadcast.emit("twitter-stream", outputPoint);

							//Send out to web sockets channel.
							socket.emit('twitter-stream', outputPoint);
							}
						}
					});
				});
		}
	});

	// Emits signal to the client telling them that
	// they are connected and can start receiving Tweets
	socket.emit("connected");

});
