var Client = (function() {

    var
        map, 
        ctrl, 
        disableAutoPan = false,
        geocoder, 
        socket, 
        mc, //markerclusterer, if you don't know what it is, check out https://github.com/googlemaps/js-marker-clusterer. It makes shit look pretty.
        markers = [];

    function init(mapElement, socket, controls, startLat, startLong, startZoom) {
        //Set up controls, you idiot.
        ctrl = controls;
        
		//Draw map, duh.
        map = new google.maps.Map(mapElement, { center: { lat: startLat, lng: startLong }, zoom: startZoom });
        
		//Initialize geocoder because we care about the information we parse.
        geocoder = new google.maps.Geocoder();
        
		//Initialize markerclusterer
        var mcOptions = {
            gridsize: 10,
            maxZoom: 15,
            imagePath: 'images/m'
        };
        mc = new MarkerClusterer(map, markers, mcOptions)
        socket.on('tweet', function(tweet) {
            updateMap(tweet);
        });
        socket.on('disconnect', function() {
            showDisconnectedStatus();
        });

        //Wire up nav controls handlers
        $(ctrl.jumpToggle).on('click', toggleJumpStatus);
    }

    function showDisconnectedStatus() {
        $(ctrl.statusConnected).addClass('hidden').hide();
        $(ctrl.statusDisconnected).removeClass('hidden').show();
    }

    function showConnectedStatus() {
        $(ctrl.statusDisconnected).addClass('hidden').hide();
        $(ctrl.statusConnected).removeClass('hidden').show();
    }

    function toggleJumpStatus() {
        if ($(ctrl.jumpToggle).hasClass('btn-success')) {
            $(ctrl.jumpToggle).removeClass('btn-success').addClass('btn-warning').html('Don\'t Jump');
            disableAutoPan = true;
		//Jumps and centers to latest disaster warning automatically on map based on criteria.
			
        } else if ($(ctrl.jumpToggle).hasClass('btn-warning')) {
            $(ctrl.jumpToggle).removeClass('btn-warning').addClass('btn-success').html('Jump to Latest');
            disableAutoPan = false;
		//Keeps map constant if extra analysis is needed.
        }
    }

    function updateMap(tweet) {
        var placeboi = true;
        if(tweet.coordinates) {
            if(tweet.coordinates !== null) {
                placeboi = false;
                var results = new google.maps.LatLng(tweet.coordinates.coordinates[1],tweet.coordinates.coordinates[0]);
                var marker = new google.maps.Marker({
                    map: map,
                    position: results
                });
                marker.setMap(map);
                mc.addMarker(marker);
                var infowindow = new google.maps.InfoWindow({
                    content: tweet.text,
                    disableAutoPan: disableAutoPan
                });
                infowindow.open(map, marker);
                setTimeout(function() {
                    infowindow.close();
                }, 3500);
                marker.addListener('click', function() {
                    infowindow.open(map, marker);
                });
            }
        }
        
        if(placeboi) {
            geocoder.geocode({
            'address': tweet.place.name
        }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK && typeof results[0].geometry.location != "undefined") {

                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location
                });
                marker.setMap(map);
                //Add marker to marker clusterer
                mc.addMarker(marker);
                //Set up infowindow with options                
                var infowindow = new google.maps.InfoWindow({
                    content: tweet.text,
                    disableAutoPan: disableAutoPan
                });
                
                
                //Open the infowindow to display the tweet
                //and close it after 3500 milliseconds
                infowindow.open(map, marker);
                setTimeout(function() {
                    infowindow.close();
                }, 3500);
                
                
                //Add a click event handler to marker 
                //so that user can revisit and open it later
                marker.addListener('click', function() {
                    infowindow.open(map, marker);
                });
            }
        });
        }
    }

    return {
        init: init
    }

})();