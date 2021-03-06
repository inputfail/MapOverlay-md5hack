var 
    express = require('express') 					//server side stuff
    , app = express()            					//setting up the application
    , config = require('./config.json')				//setting it up blah blah
    , hbs = require('express-hbs')
	
	/* WHY handlebars
	Nowadays the majority of the Web consists of dynamic applications in which the data keep changing frequently.
	As a result, there is a continuous need to update the data rendered on the browser. 
	This is where JavaScript templating engines come to the rescue and become so useful. 
	They simplify the process of manually updating the view and at the same time they improve the structure of the application by allowing developers to separate the business logic from the rest of the code. 
	Some of the most well-known JavaScript templating engines are Mustache, Underscore, EJS, and Handlebars. 
	
	*/
	
    , server = require('http').Server(app)
    , Twit = require('twit')
    , Twitter = new Twit(config.twitter.oauth)
    , io = require('socket.io')(server)
    , path = require('path')
    , favicon = require('serve-favicon')		//icon plugin for 
    , logger = require('morgan')				//http request logger for node.js
    , cookieParser = require('cookie-parser')	//parsing cookies
    , bodyParser = require('body-parser')		//makes it easier for interfacing
;

var routes = require('./routes/index');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//Connect to Twitter to create a stream of Twitter status updates around your configured topics
var trackTerms = null;
var streamPar = null;
var loc = null;
var radius;
var latitude;
var longitude;
var stream = null;

//Only use tweets that have geo data associated with them, so that we can draw them on the map
function isQualityTweet(tweet) {
    if (!tweet.coordinates && !tweet.place) {
        return false; 
    } else if((trackTerms !== null) && (loc !== null)){
        console.log('check text');
        var terms = trackTerms.split(",");
        var i;
        for(i=0; i<terms.length; i++) {
            if(tweet.text.indexOf(terms[i]) !== -1) {
                return true;
            }
        }
        return false;
    } else {
        return true;
    }
}

//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        console.dir(err.message);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//Listen for websocket connections from the client
//When we establish a connection with a new client, send them tweets from the stream
var univers = [ '-180', '-90', '180', '90' ]

io.on('connection', function(socket) {
    socket.emit('server socket open', { initial: 'socket opened!' });

    socket.on('keyword', function (data) {
        console.dir(data);
        trackTerms = String(data);
    });

    socket.on('input', function (data) {
        radius = Number.parseFloat(data.rad);
        latitude = Number.parseFloat(data.lat);
        longitude = Number.parseFloat(data.lng);

        var radF = radius/69;
        var leftLat = Number.parseFloat(data.lat) - radF;
        var leftLng = Number.parseFloat(data.lng) - radF;
        var rightLat = Number.parseFloat(data.lat) + radF;
        var rightLng = Number.parseFloat(data.lng) + radF;
        loc = [String(leftLng), String(leftLat), String(rightLng), String(rightLat)];
    });

    socket.on('stream', function () {

        if(stream !== null) {
            socket.emit('busy');
        }
        if((loc !== null) && (trackTerms !== null)) {
            streamPar = {locations: loc};
            console.log('both');
        }else if(trackTerms !== null){
            streamPar = {track: trackTerms};
            console.log('words');
        }else if(loc !== null) {
            streamPar = {locations: loc};
            console.log('places');
        }

        
        if(streamPar !== null) {
            stream = Twitter.stream('statuses/filter', streamPar);
            console.log('par');
            console.dir(streamPar);
        }else {
            stream = Twitter.stream('statuses/filter', {locations: univers});
            console.log('total');
        }
        stream.on('tweet', function(tweet) {
            if (isQualityTweet(tweet)) {
                //console.dir(tweet);
                socket.emit('tweet', tweet);
            }
        });

        stream.on('disconnect', function(){
            socket.emit('disconnect'); 
        }); 

    });

    socket.on('disconnect', function() {
        if(stream !== null) {
            stream.stop()
        }
        stream = null;
        console.log('client disconnected');
    });
}); 

server.listen(config.port, function(){
    console.log('Twitter visualization server running on ' + config.port);
}); 

module.exports = app;
