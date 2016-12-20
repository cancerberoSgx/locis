
import $ from './lib/zepto'
import google from './lib/google'

function drawMap()
{
	var poly, map;
	var markers = [];
	var path = new google.maps.MVCArray;

	function getLocation(fn) 
	{
		if (navigator.geolocation) 
		{
			navigator.geolocation.getCurrentPosition(fn);
		} 
		else 
		{
			fn()
		}
	}
	function initialize() 
	{
		$('body').append('<div id="map" style="width: 480; height: 480;"></div>')
		getLocation((position)=>
		{
			var coords = position?position.coords:{latitude: -25.344, longitude: 131.036}
			drawMap(coords)
		})
	}

	function drawMap(coords)
	{
		var uluru = new google.maps.LatLng(coords.latitude, coords.longitude);

		map = new google.maps.Map(document.getElementById("map"), {
			zoom: 14,
			center: uluru,
			mapTypeId: google.maps.MapTypeId.SATELLITE
		});

		poly = new google.maps.Polygon({
			strokeWeight: 3,
			fillColor: '#5555FF'
		});
		poly.setMap(map);
		poly.setPaths(new google.maps.MVCArray([path]));

		google.maps.event.addListener(map, 'click', addPoint);
	}

	function addPoint(event) 
	{
		path.insertAt(path.length, event.latLng);

		var marker = new google.maps.Marker({
			position: event.latLng,
			map: map,
			draggable: true
		});
		markers.push(marker);
		marker.setTitle("#" + path.length);

		google.maps.event.addListener(marker, 'click', function() 
		{
			marker.setMap(null);
			for (var i = 0, I = markers.length; i < I && markers[i] != marker; ++i);
			markers.splice(i, 1);
			path.removeAt(i);
		});

		google.maps.event.addListener(marker, 'dragend', function() 
		{
			for (var i = 0, I = markers.length; i < I && markers[i] != marker; ++i);
			path.setAt(i, marker.getPosition());
		});
	}
	initialize()
}

$(document).on('ready', function()
{
	drawMap()
})
// alert($('body').html())