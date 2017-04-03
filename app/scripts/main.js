console.log('\'Allo \'Allo!');
var map, marker, refreshIntervalId ;
var lat,lon;
var loadByFile = true;

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
}

function addMarker(lat, lng) {
  var latitude = new Number(lat).valueOf();
  var longitude = new Number(lng).valueOf();
  var flag = false;
  for (var index = 0; index < markers.length; index++) {
    var marker = markers[index];
    
    if(latitude.toFixed(8) == marker.getPosition().lat().toFixed(8) && longitude.toFixed(8) == marker.getPosition().lng().toFixed(8)){
      flag = true;
      break;
    }
  }
  if(!flag){
    var marker = new google.maps.Marker({
      label: ""+(markers.length + 1),
      position: new google.maps.LatLng({lat:latitude, lng:longitude}),
      map: map
    });
    markers.push(marker);
    addDisplayMarker(lat, lng)
  }
}

function addDisplayMarker(lat, lng) {
  var index = markers.length - 1;

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
    center: {lat:lat, lng:lon},
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

function parserCoordinate(text, coordRegExp, sepRegExp){
  if(coordRegExp.test(text)){
    var token;
    var tokens = text.split(coordRegExp);
    token = tokens[tokens.length-1];
    return new Number(token.split(sepRegExp)[0]);
  }
  return null;
}

function processMarker(lines){
  $("#showPreview > tbody").empty();
  var latLabl = $("#latitudeLabel").val();
  var lngLabl = $("#longitudeLabel").val();

  var assignator = $("#assignator").val();
  var latRegexp = new RegExp("("+latLabl+")("+assignator+")");
  var lngRegexp = new RegExp("("+lngLabl+")("+assignator+")");

  var separator = $("#separator").val();
  var sepRegExp = new RegExp("("+separator+")");
  var latitude, longitude;

  for (var index = 0; index < lines.length; index++) {
    var line = lines[index];
    latitude = parserCoordinate(line, latRegexp, sepRegExp);
    longitude = parserCoordinate(line, lngRegexp, sepRegExp);
    if(latitude && longitude){
      addPreloadCoordinateToView(latitude, longitude);
    } else {
      console.log("NOT Latitude or Longitude in line"+ index);
    }

  }
  $('#showPreview').show();
}

function addPreloadCoordinateToView(lat, lng){
    var tmp = '<tr><td>'+lat+'</td><td>'+lng+'</td></tr>';
    $("#showPreview > tbody").append(tmp);
}

$(function() {
  $.ajaxSetup({ cache: false });
  $("#showPeriod").hide();
  $('#showPreview').hide();
  if(loadByFile){
    $("#markerByFile").show();
    $("#markerByUrL").hide();
  }else{
    $("#markerByFile").hide();
    $("#markerByUrL").show();
  }

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
    addMarker(lat,lng);
    $("#latNewMarker").val("");
    $("#lngNewMarker").val("");
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

  $("#makersFile").change(function(){
    var reader = new FileReader();
    reader.onload = function(event){
      var file = event.target.result;
      var allLines = file.split(/\r\n|\n/);
      processMarker(allLines);    
    };
    reader.onerror = function(evt){
      console.log(evt.target.error.name);
    };
    var file = this.files[0]
    reader.readAsText(file);
  })

  $("#markerByUrL").submit(function(event) {
    event.preventDefault();
    var url = $("#markerUrl").val();
    $.get(url, function(text) {
      var allLines = text.split(/\r\n|\n/);
      processMarker(allLines);
    });
  })

  $("#showLoadByFile").click(function(){
    loadByFile = true;
    $("#showLoadByFile").addClass("btn-primary");
    $("#showLoadByFile").removeClass("btn-default");
    $("#showLoadByUrl").removeClass("btn-primary");
    $("#showLoadByUrl").addClass("btn-default");
    $("#markerByFile").show();
    $("#markerByUrL").hide();
  })

  $("#showLoadByUrl").click(function(){
    loadByFile = false;
    $("#showLoadByFile").removeClass("btn-primary");
    $("#showLoadByFile").addClass("btn-default");
    $("#showLoadByUrl").addClass("btn-primary");
    $("#showLoadByUrl").removeClass("btn-default");
    $("#markerByFile").hide();
    $("#markerByUrL").show();
  })

  $("#markerSingleUse").change(function(event){
    $("#showPeriod").toggle();
  })

  $("#loadMarkers").click(function(){
    var singleUse = $("#markerSingleUse").prop('checked');
    if(loadByFile || singleUse){
      $("#showPreview > tbody > tr").each(function (indx, element) {
        var latitude = $(element).find("td").eq(0).html();
        var longitude = $(element).find("td").eq(1).html(); 
        addMarker(latitude, longitude);        
      });
    } else {
      if(!singleUse){
        var period = new Number($("#markerLoadPeriod").val());
        refreshIntervalId = setInterval(function(){
          console.log("Interval Call");
          var url = $("#markerUrl").val();
          $.get(url, function(text) {
            var latitude, longitude;
            var latLabl = $("#latitudeLabel").val();
            var lngLabl = $("#longitudeLabel").val();

            var assignator = $("#assignator").val();
            var latRegexp = new RegExp("("+latLabl+")("+assignator+")");
            var lngRegexp = new RegExp("("+lngLabl+")("+assignator+")");

            var separator = $("#separator").val();
            var sepRegExp = new RegExp("("+separator+")");

            var allLines = text.split(/\r\n|\n/);
            for (var index = 0; index < allLines.length; index++) {
              var line = allLines[index];
              latitude = parserCoordinate(line, latRegexp, sepRegExp);
              longitude = parserCoordinate(line, lngRegexp, sepRegExp);
              if(latitude && longitude){
                console.log("lat:"+latitude+",lng:"+longitude);
                addMarker(latitude, longitude);
              }
            }
          });
        },  period);
      }
    }
  })

});