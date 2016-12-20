'use strict';

var _zepto = require('./lib/zepto');

var _zepto2 = _interopRequireDefault(_zepto);

var _google = require('./lib/google');

var _google2 = _interopRequireDefault(_google);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function drawMap() {
	var poly, map;
	var markers = [];
	var path = new _google2.default.maps.MVCArray();

	function getLocation(fn) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(fn);
		} else {
			fn();
		}
	}
	function initialize() {
		(0, _zepto2.default)('body').append('<div id="map" style="width: 480; height: 480;"></div>');
		getLocation(function (position) {
			var coords = position ? position.coords : { latitude: -25.344, longitude: 131.036 };
			drawMap(coords);
		});
	}

	function drawMap(coords) {
		var uluru = new _google2.default.maps.LatLng(coords.latitude, coords.longitude);

		map = new _google2.default.maps.Map(document.getElementById("map"), {
			zoom: 14,
			center: uluru,
			mapTypeId: _google2.default.maps.MapTypeId.SATELLITE
		});

		poly = new _google2.default.maps.Polygon({
			strokeWeight: 3,
			fillColor: '#5555FF'
		});
		poly.setMap(map);
		poly.setPaths(new _google2.default.maps.MVCArray([path]));

		_google2.default.maps.event.addListener(map, 'click', addPoint);
	}

	function addPoint(event) {
		path.insertAt(path.length, event.latLng);

		var marker = new _google2.default.maps.Marker({
			position: event.latLng,
			map: map,
			draggable: true
		});
		markers.push(marker);
		marker.setTitle("#" + path.length);

		_google2.default.maps.event.addListener(marker, 'click', function () {
			marker.setMap(null);
			for (var i = 0, I = markers.length; i < I && markers[i] != marker; ++i) {}
			markers.splice(i, 1);
			path.removeAt(i);
		});

		_google2.default.maps.event.addListener(marker, 'dragend', function () {
			for (var i = 0, I = markers.length; i < I && markers[i] != marker; ++i) {}
			path.setAt(i, marker.getPosition());
		});
	}
	initialize();
}

(0, _zepto2.default)(document).on('ready', function () {
	drawMap();
});
// alert($('body').html())