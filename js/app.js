var searchResults = function(placeItem) {
	this.name = ko.observable(placeItem.name);
	this.address = ko.observable(placeItem.formatted_address);
};
var input,
	map;
var viewModel = function() {
	var self = this;
	var markers = [];
	
	self.resultList = ko.observableArray([]);
	var searchBox = new google.maps.places.SearchBox(input);
	google.maps.event.addListener(searchBox, 'places_changed', function() {
		var places = searchBox.getPlaces();
		self.resultList([]);
		for (var i = 0, marker; marker = markers[i]; i++) {
			marker.setMap(null);
		}
		markers = [];
		if (places.length === 0) {
			return;
		}
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
			var infowindow = new google.maps.InfoWindow();
			google.maps.event.addListener(marker, 'mouseover', function() {
				var info = places[this.index];
				//console.log(info);
				infowindow.setContent(info.formatted_address);
				infowindow.open(map, this);
			});
		}
		map.fitBounds(bounds);
	});
	google.maps.event.addListener(map, 'bounds_changed', function() {
		var bounds = map.getBounds();
		searchBox.setBounds(bounds);
	});
};

function initialize() {
	var mapOptions = {
		zoom: 8,
		center: new google.maps.LatLng(-34.397, 150.644)
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
	
	
