(
    function() {
 
    var zoomLevel = 14,
        mapCenter = [43.47, -80.548];
    
    var options = {
        center: mapCenter,
        zoom: zoomLevel
    };
    
    
    
    var sqlQuery = 'SELECT * FROM stations';
    
    var stations = points;
    var $body = $('body'),
        $locate = $('#locate'),
        $findNearest = $('#find-nearest'),
        $status = $('#status');
    
    $.getJSON('https://rgdonohue.carto.com/api/v2/sql?format=GeoJSON&q=' + sqlQuery, function(data) {
  
        //$('#loader').fadeOut();
        $body.addClass('loaded');
        

        $locate.fadeIn().on('click', function(e) {
            
            $status.html('Finding your location'+'<br><br><img src="toiletloader.png"  height="120" width="120"><img src="toiletloader1.png"  height="120" width="120">');
            
            if (!navigator.geolocation){
                alert("<p>Sorry, your browser does not support Geolocation</p>");
                return;
            }
            
            $body.removeClass('loaded');
              
            navigator.geolocation.getCurrentPosition(success, error);
            
           $locate.fadeOut();
            
        });   
    });
        
    var greenIcon = L.icon({
    iconUrl: 'm_icon.png',
    iconSize:     [32, 37], // size of the icon   
    });

    function success(position) {
        
        $body.addClass('loaded');
        
        var currentPos = [position.coords.latitude,position.coords.longitude];
        
        map.setView(currentPos, zoomLevel);

        var myLocation = L.marker(currentPos,{icon: greenIcon})
                            .addTo(map)
                            .bindTooltip("You are here")
                            .openTooltip();
        
            
        $findNearest.fadeIn()
            .on('click', function(e) {
                
                $findNearest.fadeOut();
                
                $status.html('Finding your nearest locations')
            
                queryFeatures(currentPos, 3);
            
                myLocation.unbindTooltip();
            
                
        });

    };

    function error() {
        alert("Unable to retrieve your location");
    };
     
    function queryFeatures(currentPos, numResults) {
        
        var distances = [];
        
        stations.eachLayer(function(l) {
            
            var distance = L.latLng(currentPos).distanceTo(l.getLatLng());
            
            distances.push(distance);

        });
        
        distances.sort(function(a, b) {
            return a - b;
        });
        
        var stationsLayer = L.featureGroup();
            

        stations.eachLayer(function(l) {
            
            var distance = L.latLng(currentPos).distanceTo(l.getLatLng());
            
            if(distance < distances[numResults]) {
                
                l.bindTooltip(distance.toLocaleString() + ' m from current location.');
                
                L.polyline([currentPos, l.getLatLng()], {
                    color : 'blue',
                    weight : 2,
                    opacity: 1,
                    //dashArray : "5, 10"
                }).addTo(stationsLayer);
                
            }
        });
        
        map.flyToBounds(stationsLayer.getBounds(), {duration : 3, easeLinearity: .1 });
        
        map.on('zoomend', function() {
          
            map.addLayer(stationsLayer);
        })
      
    }

})();