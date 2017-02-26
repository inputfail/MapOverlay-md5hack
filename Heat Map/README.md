twitter-stream-heat-map
========================

Shows how to stream real time twitter data to Google Maps using NodeJS.

The original project can be found here <a href="https://github.com/safesoftware/twitter-streaming-nodejs" target="_blank">here</a>

A detailed explanation of the original project can be found <a href="http://blog.safe.com/2014/03/twitter-stream-api-map/" target="_blank">here</a>. 

Steps to run the project:

1) Install Node.js <br>
2) Download this GitHub project <br>
3) Create application on Twitter to get these values: <br>
	API key > consumer_key <br>
	API secret > consumer_secret <br>
	Access token > access_token_key <br>
	Access token secret > access_token_secret <br>
4) Install the dependencies (defined in package.json). From the terminal, cd to the project directory you downloaded so you are in the same folder as server.js. Then do: <br>
	npm install <br>
5) Run the server: <br>
	node server.js <br>

You should then be able to open a browser and access http://localhost:8081.
