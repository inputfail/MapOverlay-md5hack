// app/socket.js

module.exports = function (io, twit)  
{
    /**
    * Returns a new Twit stream for the passed keyword with the events attached
    **/

    function createStream (keyword)
    {
        var stream = twit.stream('statuses/filter', {track : keyword}); // Defines a new stream tracked by the keyword

        stream.on('tweet', function (data) // When the stream gets a tweet
        {
            if (data.coordinates && data.coordinates !== null) // If the tweet has geolocation information
            {
                var tweet = {"text" : data.text, "name" : data.user.screen_name, "lat": data.coordinates.coordinates[0],"lng": data.coordinates.coordinates[1]}; // Define a new object with the information we want to pass to the client

                io.sockets.emit('twitter-stream', tweet); // Emit our new tweet to ALL connected clients
            }
        });

        stream.on('connect', function () // Log a new connection to the stream
        {
            console.log('Connected to twitter stream using keyword => ' + keyword);
        });

        stream.on('disconnect', function () // Log a disconnection from the stream
        {
            console.log('Disconnected from twitter stream using keyword => ' + keyword);
        });

        return stream; // Return the stream
    }
}
