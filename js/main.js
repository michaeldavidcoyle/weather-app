"use strict";
$(document).ready(function () {
    var coordinates = {
        lat: 29.423017,
        lon: -98.48527
    }

    function getForecast(coords) {
        $.get("https://api.openweathermap.org/data/2.5/onecall", {
            appid: OPEN_WEATHER_API_KEY,
            lat: coords.lat,
            lon: coords.lon,
            units: 'imperial'
        }).done(displayForecast);
    }

    function displayForecast(data) {
        var forecast = $('#forecast'),
            card,
            today,
            high,
            low,
            chancePrecipitation,
            windDirection,
            windSpeed;

        forecast.html('');

        data.daily.slice(0, 5).forEach(function (day) {
            today = new Date(day.dt * SEC).toDateString().slice(0, 10);
            high = Math.round(day.temp.max);
            low = Math.round(day.temp.min);
            chancePrecipitation = Math.round(day.pop * 100);
            windDirection = compassDirections[Math.round(day.wind_deg / 22.5)];
            windSpeed = Math.round(day.wind_speed);

            card = `<div class="card text-center">
                            <div class="card-header">
                                <h5>${today}</h5>
                            </div>
                            <div class="card-body">
                                <h3 class="card-title">${high}&deg; 
                                    <span class="h4">/ ${low}&deg;</span>
                                </h3>
                                <img src="http://openweathermap.org/img/w/${day.weather[0].icon}.png" alt="Weather Conditions">
                                <span>${day.weather[0].description}</span>
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item">
                                        <i class="fas fa-cloud-rain text-primary"></i> ${chancePrecipitation}%
                                    </li>
                                    <li class="list-group-item">
                                        <span class="text-primary">Humidity: </span>${day.humidity}%
                                    </li>
                                    <li class="list-group-item">
                                        <i class="fas fa-wind text-primary"></i> ${windDirection} ${windSpeed} mph
                                    </li>
                                    <li class="list-group-item">
                                        <span class="text-primary">Pressure: </span>${day.pressure} hPa
                                    </li>
                                </ul>
                            </div>
                        </div>`;

            forecast.append(card);
        });
    }

    function humanReadableCoordinates(coords) {
        var latDir = coords.lat > 0 ? 'N' : 'S';
        var lngDir = coords.lng > 0 ? 'E' : 'W';

        var long = Math.abs(coords.lng).toFixed(5);
        var latt = Math.abs(coords.lat).toFixed(5);

        return `${latt}&deg; ${latDir}, ${long}&deg; ${lngDir}`;
    }

    getForecast(coordinates);

    const compassDirections = [
        'N', 'NNE', 'NE', 'ENE',
        'E', 'ESE', 'SE', 'SSE',
        'S', 'SSW', 'SW', 'WSW',
        'W', 'WNW', 'NW', 'NNW',
        'N'
    ];

    const SEC = 1000;

    var place = 'San Antonio',
        zoomLevel = 7.5,
        mouseCoords;

    $('#place').html(place);

    mapboxgl.accessToken = MAPBOX_API_KEY;
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9',
        zoom: zoomLevel,
        center: [coordinates.lon, coordinates.lat]
    });

    var marker = new mapboxgl.Marker()
    // .setLngLat([coordinates.lon, coordinates.lat])
    // .addTo(map);

    geocode(place, MAPBOX_API_KEY).then(function (coords) {
        console.log(coords);
        map.setCenter(coords);
        map.setZoom(zoomLevel);
    });

    $('#search-btn').click(function (event) {
        // console.log($(this).prev().val());
        place = $('#search-input').val();
        geocode(place, MAPBOX_API_KEY).then(function (coords) {
            console.log(coords);
            map.setCenter(coords);
            map.setZoom(zoomLevel);

            coordinates.lon = coords[0];
            coordinates.lat = coords[1];

            $('#place').html(place);
            getForecast(coordinates);
        });
    });

    map.on('mousemove', function (event) {
        // console.log(event.lngLat);
        mouseCoords = event.lngLat;
    });

    map.on('click', function (event) {
        marker.setLngLat(mouseCoords)
            .addTo(map);

        coordinates.lon = mouseCoords.lng;
        coordinates.lat = mouseCoords.lat;
        // console.log(event);
        // console.log(mouseCoords);
        getForecast(coordinates);
        // $('#place').html(humanReadableCoordinates(mouseCoords));
        map.setCenter(mouseCoords);

        reverseGeocode(mouseCoords, MAPBOX_API_KEY).then(function(results) {
            /*
             * This function returns an address, so the regular expression below
             * should match city names of 1 or 2 words that are followed by a state
             * and zip code.
             */
            place = results.match(/(?:\w+ *\w*)(?=, \w+ \d{5})/);
            if (place === null) place = humanReadableCoordinates(mouseCoords);

            $('#place').html(place);
        });
    });

    $('#select-zoom').change(function() {
        map.setZoom($(this).val());
    });
});