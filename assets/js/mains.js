"use strict";
let routeMap = {
    items: {
        map: undefined,
        markerOrigin:undefined,
        ubicationDetail: undefined,
        ubicationDetailOrigin: undefined
    },

    init: function () {
        routeMap.items.map = new google.maps.Map(document.getElementById("map"), {
            zoom: 10,
            center: { lat: -33.4724728, lng: -70.9100251 },
            mapTypeControl: false,
            zoomControl: false,
            streetViewControl: false
        });
        let inputOrigin = document.getElementById('origin');
        routeMap.items.ubicationDetailOrigin = new google.maps.InfoWindow();
        let inputDestination = document.getElementById('destination');
        routeMap.autocomplete(inputOrigin);
        routeMap.autocomplete(inputDestination);

        /* Mi ubicación actual */
        document.getElementById("findMe").addEventListener("click", routeMap.find);
        let directionsService = new google.maps.DirectionsService;
        let directionsDisplay = new google.maps.DirectionsRenderer;

        document.getElementById("route").addEventListener("click", function () {
             routeMap.traceRoute(directionsService, directionsDisplay) });

        directionsDisplay.setMap(routeMap.items.map);
    },

    autocomplete: function (input){
        let autocomplete= new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', routeMap.items.map);
        routeMap.items.ubicationDetail = new google.maps.InfoWindow();
        routeMap.items.markerOrigin= routeMap.createMarker(routeMap.items.map);
        routeMap.listener(autocomplete, routeMap.items.ubicationDetail, routeMap.items.markerOrigin);
    },

    listener: function (autocomplete, infoWindows, marker) {
        autocomplete.addListener('place_changed', function () {
            infoWindows.close();
            marker.setVisible(false);
            let place = autocomplete.getPlace();
            routeMap.setUbication(place, infoWindows, marker);
        });
    },

    find: function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(routeMap.automaticUbication, routeMap.error);
        }
    },

    error: function (error) {
        alert("Tenemos un problema para encontrar tu ubicación");
    },

    automaticUbication: function (position) {
        let latitude, longitude;
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

        routeMap.items.markerOrigin.setPosition(new google.maps.LatLng(latitude, longitude));
        routeMap.items.map.setCenter({ lat: latitude, lng: longitude });
        routeMap.items.map.setZoom(17);

        routeMap.items.markerOrigin.setVisible(true);

        routeMap.items.ubicationDetailOrigin.setContent('<div><strong>My current Ubication</strong><br>');
        routeMap.items.ubicationDetailOrigin.open(routeMap.items.map, routeMap.items.markerOrigin);
    },

    setUbication: function (place, infoWindows, marker) {
        if (!place.geometry) {
            // Error si no se encuentra el lugar indicado
            window.alert("We cannot find the place: '" + place.name + "'");
            return;
        }
        if (place.geometry.viewport) {
            routeMap.items.map.fitBounds(place.geometry.viewport);
        } else {
            routeMap.items.map.setCenter(place.geometry.location);
            routeMap.items.map.setZoom(17);
        }

        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        let address = '';
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }

        infoWindows.setContent('<div><strong>' + place.name + '</strong><br>' + address);
        infoWindows.open(routeMap.items.map, marker);
    },
    createMarker: function (map) {
        let icono = {
            url: 'img/Artdesigner-Urban-Stories-Car.ico',
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        };

        let marker = new google.maps.Marker({
            map: map,
            animation: google.maps.Animation.DROP,
            icon: icono,
            anchorPoint: new google.maps.Point(0, -29)
        });

        return marker;
    },

    traceRoute: function (directionsService, directionsDisplay) {
        let origin = document.getElementById("origin").value;
        let destination = document.getElementById('destination').value;

        if (destination != "" && destination != "") {
            directionsService.route({
                origin: origin,
                destination: destination,
                travelMode: "DRIVING"
            },
                function (response, status) {
                    if (status === "OK") {
                        directionsDisplay.setDirections(response);
                    } else {
                        routeMap.errorRoute();
                    }
                });
        }
    },
    errorRoute : function(){
        alert("You didn't enter a valid origin and/or destination");
    }
}

function initMap(){
    routeMap.init();
}