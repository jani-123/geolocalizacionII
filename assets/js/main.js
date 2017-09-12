'use strict';
var mapas = {
    item: {
        map: undefined,
        autocompletarOrigen: undefined,
        detalleUbicacionOrigen: undefined,
        autocompletarDestino: undefined,
        detalleUbicacionDestino:undefined,
        Servicio_direccion: undefined,
        Render_direccion: undefined,
        markerOrigen: undefined,
        latitud: undefined,
        longitud: undefined
    },
    init: function(){
        let mapObj = $('#map');
        mapas.item.map = new google.maps.Map(mapObj[0],{// inicializa mapa
            zoom: 10,
            center: {lat: -33.4724728, lng: -70.9100251},
            mapTypeControl: false,
            zoomControl: false,
            streetViewControl:false
        });
     
        let Origen = document.getElementById('origen');//asocia el o autocomplete
            mapas.item.autocompletarOrigen = new google.maps.places.Autocomplete(Origen);//pasa como parametro el o dom d
            mapas.item.autocompletarOrigen.bindTo('bounds', mapas.item.map);   
            mapas.item.detalleUbicacionOrigen = new google.maps.InfoWindow();
            mapas.item.markerOrigen = mapas.crearMarcador(mapas.item.map);

            mapas.crearListas(mapas.item.autocompletarOrigen, mapas.item.detalleUbicacionOrigen, mapas.item.markerOrigen);
    
        let Destino = document.getElementById('destino');
            mapas.item.autocompletarDestino = new google.maps.places.Autocomplete(Destino);
            mapas.item.autocompletarDestino.bindTo('bounds', mapas.item.map);
            mapas.item.detalleUbicacionDestino = new google.maps.InfoWindow();
            mapas.item.markerDestino = mapas.crearMarcador(mapas.item.map);

            mapas.crearListas(mapas.item.autocompletarDestino, mapas.item.detalleUbicacionDestino, mapas.item.markerDestino);

            mapas.item.Servicio_direccion = new google.maps.DirectionsService;
            mapas.item.Render_direccion = new google.maps.DirectionsRenderer;
            mapas.item.Render_direccion.setMap(mapas.item.map);
            mapas.setup();
    },
    setup: function(){
        $('#encuentrame').click (mapas.buscarMiUbicacion) ;
        $('#ruta').click (function(){mapas.dibujarRuta(mapas.item.Servicio_direccion, mapas.item.Render_direccion)}) ;
    },
    crearListas: function(autocompleta, detalleUbicacion, marker) {
        autocompleta.addListener('place_changed', function() {
            detalleUbicacion.close();
            marker.setVisible(false);
            let place = autocompleta.getPlace();// da toda la direccion exacta de lo q se autocompleta
            mapas.marcarUbicacion(place, detalleUbicacion, marker);
        });
    },

    buscarMiUbicacion: function() {
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(mapas.marcarUbicacionAutomatica,mapas.funcionError);
        }
    },

    funcionError: function(error) {
        alert("Tenemos un problema para encontrar tu ubicación");
    },

    marcarUbicacionAutomatica: function(posicion) {
        mapas.item.latitud = posicion.coords.latitude;
        mapas.item.longitud = posicion.coords.longitude;
        mapas.item.markerOrigen.setPosition(new google.maps.LatLng(mapas.item.latitud,mapas.item.longitud));
        mapas.item.map.setCenter({lat:mapas.item.latitud,lng:mapas.item.longitud});
        mapas.item.map.setZoom(17);
        //inputOrigen.value = new google.maps.LatLng(latitud,longitud); //CON ESTO LOGRO QUE EN EL INPUT ORIGEN SALGA LAS COORDENADAS DE MI UBICACION
        mapas.item.markerOrigen.setVisible(true);
        mapas.item.detalleUbicacionOrigen.setContent('<div><strong>Mi ubicación actual</strong><br>');
        mapas.item.detalleUbicacionOrigen.open(mapas.item.map, mapas.item.markerOrigen);
    },

    marcarUbicacion: function(place, detalleUbicacion, marker) {
        if (!place.geometry) {
            window.alert("No encontramos el lugar que indicaste: '" + place.name + "'");
            return;
        }
        if (place.geometry.viewport) {
            mapas.item.map.fitBounds(place.geometry.viewport);
        } else {
            mapas.item.map.setCenter(place.geometry.location);
            mapas.item.map.setZoom(17);
        }
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);
        let direccion = '';
        if (place.address_components) {
            direccion = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }
        detalleUbicacion.setContent('<div><strong>' + place.name + '</strong><br>' + direccion);
        detalleUbicacion.open(mapas.item.map, marker);
    },

    crearMarcador: function(map) {
        let icono = {
            url: 'http://icons.iconarchive.com/icons/sonya/swarm/128/Bike-icon.png',
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        };
        let marker = new google.maps.Marker({
            map: mapas.item.map,
            animation: google.maps.Animation.DROP,
            icon: icono,
            anchorPoint: new google.maps.Point(0, -29)
        });
        return marker;
    },

    dibujarRuta: function (directionsService, directionsDisplay) {
        let origin = document.getElementById("origen").value;
        let destination = document.getElementById('destino').value;

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
                        mapas.funcionErrorRuta();
                    }
                });
        }
    },

    funcionErrorRuta: function() {
        alert("No ingresaste un origen y un destino validos");
    }
}
