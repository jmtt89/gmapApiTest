console.log('\'Allo \'Allo!');
var map, marker;
var lat,lon;

var geodesicPoly,startP,endP;

var circles = [], markers = [];

function loadMap(lat,lon) {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: lat, lng: lon},
    zoom: 16
  });

  //Distance
  startP = new google.maps.Marker({
    map: null,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10
    }
  });
  endP = new google.maps.Marker({
    map: null,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10
    }
  });
  geodesicPoly = new google.maps.Polyline({
    strokeColor: '#CC0099',
    strokeOpacity: 1.0,
    strokeWeight: 3,
    geodesic: true,
    map: null
  });

  //Focus
  marker = new google.maps.Marker({
    map: null,
    position: {lat: lat, lng: lon}
  });
  marker.setAnimation(google.maps.Animation.BOUNCE);
}

function focusMap(lat,lon,zoom){
  marker.setMap(map);
  startP.setMap(null);
  endP.setMap(null);
  geodesicPoly.setMap(null);

  marker.setPosition({lat: lat, lng: lon})
  map.setCenter({lat: lat, lng: lon});
  map.setZoom(zoom);
}

function calcDistance(pointA,pointB) {
  marker.setMap(null);
  startP.setMap(map);
  endP.setMap(map);
  geodesicPoly.setMap(map);

  startP.setPosition(pointA);
  endP.setPosition(pointB);
  geodesicPoly.setPath([pointA,pointB]);
  var distance = google.maps.geometry.spherical.computeDistanceBetween(startP.getPosition(), endP.getPosition());

  console.log(distance);
  return distance;
  // body...
}

function addMarker(lat,lng) {

  var marker = new google.maps.Marker({
    position: {lat:lat,lng:lng},
    map: map
  });
  markers.push(marker);
}

function hideMarker(idx) {
  markers[idx].setMap(null);
}

function showMarker(idx){
  markers[idx].setMap(map);
}

function addCircle(lat,lon,rad,color) {
  var color = color || "#FF0000";
  var circle = new google.maps.Circle({
    strokeColor: color,
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: color,
    fillOpacity: 0.15,
    map: map,
    center: {lat:lat,lng:lon},
    radius: rad
  });
  circles.push(circle);
}

function hideCircle(idx) {
  circles[idx].setMap(null);
}

function showCircle(idx){
  circles[idx].setMap(map);
}

function initMap(argument) {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position){
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        $("#lat").val(lat);
        $("#lng").val(lon);
        loadMap(lat,lon);
      });
  } else {
    lat = 0;
    lon = 0;
    loadMap();
  }
}


$(function() {

  $("#sendFocus").click(function(event){
    event.preventDefault();
    lat = parseFloat($("#lat").val());
    lon = parseFloat($("#lng").val());
    focusMap(lat,lon,16)
  })

  $("#calcDistance").click(function(){
    event.preventDefault();

    var latLngA = {
      lat:parseFloat($("#latA").val()),
      lng:parseFloat($("#lngA").val())
    };

    var latLngB = {
      lat:parseFloat($("#latB").val()),
      lng:parseFloat($("#lngB").val())
    };

    var distance = calcDistance(latLngA,latLngB);

    //$("#distanceContainer").show();
    $("#distanceM").val(distance+"");

  })

  $("#newMarker").click(function(){
    var lat = parseFloat($("#latNewMarker").val());
    var lng = parseFloat($("#lngNewMarker").val());
    var index = markers.length;
    addMarker(lat,lng);

    $("#latNewMarker").val("");
    $("#lngNewMarker").val("");

    var tmp = '<tr id="marker-'+index+'"><td>'+lat+'</td><td>'+lng+'</td><td><input class="checkbox" index="'+index+'" type="checkbox" checked/></td></tr>';
    $("#markerTable > tbody").append(tmp);

    $("#markerTable .checkbox").change(function() {
      var index = parseInt($(this).attr("index"));
      if(this.checked) {
        showMarker(index);
      }else{
        hideMarker(index);
      }
    });

  })

  $("#newCircle").click(function(){
    var lat = parseFloat($("#latNewCircle").val());
    var lng = parseFloat($("#lngNewCircle").val());
    var rad = parseFloat($("#radNewCircle").val());
    var col = $("#colNewCircle").val();
    var index = circles.length;
    addCircle(lat,lng,rad,col);

    $("#latNewCircle").val("");
    $("#lngNewCircle").val("");
    $("#radNewCircle").val("");

    var tmp = '<tr id="circle-'+index+'"><td>'+lat+'</td><td>'+lng+'</td><td>'+rad+'</td><td><input class="checkbox" index="'+index+'" type="checkbox" checked/></td></tr>';
    $("#circleTable > tbody").append(tmp);

    $("#circleTable .checkbox").change(function() {
      var index = parseInt($(this).attr("index"));
      if(this.checked) {
        showCircle(index);
      }else{
        hideCircle(index);
      }
    });
  })

});
