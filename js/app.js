// Model 
var searchResults = function(placeItem) {
	this.name = ko.observable(placeItem.name);
	this.address = ko.observable(placeItem.formatted_address);
	this.position = ko.observable(placeItem.geometry.location);
	this.rating = ko.observable(placeItem.rating);
};
var input,
	map;

var viewModel = function() {
	var self = this;
	var markers = [];
	var markerClicked = [];
// Create an observable array to store search results
	self.resultList = ko.observableArray([]);
// Create a search box and store user input in input(var)
	var searchBox = new google.maps.places.SearchBox(input);
	// Once user changes input and hit enter key, and there is response, call this function
	google.maps.event.addListener(searchBox, 'places_changed', function() {
		// Store places results in places
		var places = searchBox.getPlaces();
		// Empty results array for each search
		self.resultList([]);
		// Remove all markers from the map
		for (var i = 0, marker; marker = markers[i]; i++) {
			marker.setMap(null);
		}
		markers = [];
		if (places.length === 0) {
			return;
		}
		// Create markers for each place and set bounds accordingly
		var bounds = new google.maps.LatLngBounds();
		for (var i = 0, place; place = places[i]; i++) {
			self.resultList.push(new searchResults(place));

			var image = {
				url: place.icon,
				size: new google.maps.Size(71, 71),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(17, 34),
				scaledSize: new google.maps.Size(25, 25)
			};

			// Create a marker for each place.
			var marker = new google.maps.Marker({
				index: i,
				map: map,
				icon: image,
				title: place.name,
				position: place.geometry.location
			});

			markers.push(marker);

			bounds.extend(place.geometry.location);
			// When a marker is clicked, open an infowindow
			var infowindow = new google.maps.InfoWindow();
			google.maps.event.addListener(marker, 'click', function() {
				var info = places[this.index];
				console.log(info);
				console.log(info.geometry.location.A)
				infowindow.setContent(info.name + " " + info.formatted_address);
				infowindow.open(map, this);
			});
		}
		map.fitBounds(bounds);
		// Sort the result by rating
		self.resultList.sort(function(left, right) {
				return left.rating() == right.rating() ? 0 : (left.rating() > right.rating() ? -1 : 1)
			});
	});
	google.maps.event.addListener(map, 'bounds_changed', function() {
		var bounds = map.getBounds();
		searchBox.setBounds(bounds);
	});
// When one of the listed results is clicked, drop the marker and open infowindow
	self.showAlert = function(item) {
		for (var i = 0, marker; marker = markers[i]; i++) {
			marker.setMap(null);
		}
		for (var i = 0, marker; marker = markerClicked[i]; i++) {
			marker.setMap(null);
		}
		markerClicked = [];
		var marker = new google.maps.Marker({
	    map:map,
	    draggable:true,
	    animation: google.maps.Animation.DROP,
	    position: item.position(),
	    title:item.name()
  		});
		markerClicked.push(marker);
		//Center map according to the marker
		var latLng = marker.getPosition();
		map.setCenter(latLng);
		//Get json data from four sqaure API about this place
		var La = item.position().A.toString();
		var Lo = item.position().F.toString();
		var name = item.name();
		var placeClicked;
		var URL = "https://api.foursquare.com/v2/venues/search?ll="+La+","
			+Lo+"&query="+name+
			"&client_id=YBBZOV3TPSJQNJILAFRH3KLUWL0KIAWALWWJQXKIBQPGBZJR&client_secret=JLUAGSEN5KINN04QMXEBKERM1HHPW4O3X1D3N4ZEKNRNS332&v=20150519";
  		$.getJSON( URL, 
			function(data) {
				placeClicked = data.response.venues[0];
				console.log(placeClicked);
			}
		).error(function(e) {
			alert("Oops! We can't retrive data from FourSquare now. Please try again later!");
		});
		// Open infowindow based on foursquare data
  		var infowindowNow = new google.maps.InfoWindow();
  		google.maps.event.addListener(marker, 'click', function() {	
  			var address = placeClicked.location.formattedAddress.toString();
  			var name = placeClicked.name;
  			if (placeClicked.hasMenu) {
  				var menuURL = placeClicked.menu.url;
  			};
  			var contact = placeClicked.contact.formattedPhone;
  			var URL = placeClicked.url;
  			var streetviewUrl = 'http://maps.googleapis.com/maps/api/streetview?size=200x110&location=' + address + '';	
  			var contentString = '<div>' + '<div>' + '<a href ="' + URL + '" target="_blank" >' + name + '</a>' + '</div>' + '<div class="venueContact"><span class="icon-phone"></span>' + contact 
  			+ '<a href ="' + menuURL + '" target="_blank" > See menu </a>' + '</div>' + '<div>' + address + '</div>' +'<img class="bgimg" src="' + streetviewUrl + '">' + '</div>';		
			infowindowNow.setContent(contentString);
			infowindowNow.open(map, this);
			});


	};


};
// Initialize google map
function initialize() {
	var mapOptions = {
		zoom: 10,
		center: new google.maps.LatLng(40.7127, -74.0059)
	};
	var markers = [];
	map = new google.maps.Map(document.getElementById('mapCanvas'), mapOptions);
	input = document.getElementById('pac-input');
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
};

google.maps.event.addDomListener(window, 'load', function() {
	initialize();
	ko.applyBindings(new viewModel());
});