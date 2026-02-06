var map1 = L.map('map1').setView([21.48, -158], 10.1);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map1);


var map2 = L.map('map2').fitBounds([
    [0.98, -90.31],
    [36.68, -81.65]
]);
map2.setView([37.0902, -95.7129], 4);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map2);


var cityLayer;

function getColorFromPopulation(population) {
    if (population < 2000) return 'blue';
    if (population < 5000) return 'cyan';
    if (population < 10000) return 'green';
    if (population < 25000) return 'yellow';
    if (population < 100000) return 'orange';
    return 'red';
}

fetch('hawaiiCDP_points.geojson')
    .then(r => r.json())
    .then(data => {

        if (cityLayer) map1.removeLayer(cityLayer);

        cityLayer = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {

                const population = Number(feature.properties.pop20);
                const radius = Math.max(2, Math.sqrt(population) * 0.038);
                const color = getColorFromPopulation(population);

                return L.circleMarker(latlng, {
                    radius: radius,
                    fillColor: color,
                    fillOpacity: 0.65,
                    color: '#111',
                    weight: 1.5
                }).bindPopup(
                    `<b>${feature.properties.name20}</b><br>
                     Population: ${population.toLocaleString()}`
                );
            }
        }).addTo(map1);

        // map1.fitBounds(cityLayer.getBounds());
    })
    .catch(err => console.error(err));


fetch('https://leafletjs.com/examples/choropleth/us-states.js')
      .then(response => response.json())
      .then(data => {
        L.geoJson(data).addTo(map2);
      })
      .catch(error => console.error('Error:', error));
    
    L.geoJson(statesData).addTo(map2);
    
    function getColor(d) {
        return d > 1000 ? '#1b5e20' :
               d > 500  ? '#2e7d32' :
               d > 200  ? '#388e3c' :
               d > 100  ? '#43a047' :
               d > 50   ? '#66bb6a' :
               d > 20   ? '#a5d6a7' :
               d > 10   ? '#c8e6c9' :
                          '#e8f5e9';
    }
    
    function style(feature) {
        return {
            fillColor: getColor(feature.properties.density),
            weight: 2,
            opacity: 1,
            color: 'black',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }
    
    L.geoJson(statesData, {style: style}).addTo(map2);
    
    function highlightFeature(e) {
        var layer = e.target;
    
        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });
    
        layer.bringToFront();
    
        info.update(layer.feature.properties);
    
    }
    function resetHighlight(e) {
        geojson.resetStyle(e.target);
        info.update();
    
    }
    var geojson;
    geojson = L.geoJson(statesData);
    
    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }
    
    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }
    
    geojson = L.geoJson(statesData, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map2);
    
    var info = L.control();
    
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); 
        this.update();
        return this._div;
    };
    
    info.update = function (props) {
        this._div.innerHTML = '<h4>US Population Density</h4>' +  (props ?
            '<b>' + props.name + '</b><br />' + props.density + ' people / mi<sup>2</sup>'
            : 'Hover over a state');
    };
    
    info.addTo(map2);
    
    
    var legend = L.control({position: 'bottomright'});
    
    legend.onAdd = function (map) {
    
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 10, 20, 50, 100, 200, 500, 1000],
            labels = [];
    
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    
        return div;
    };
    
    legend.addTo(map2);


    var legend1 = L.control({ position: 'bottomright' });
    legend1.onAdd = function () {
        var div = L.DomUtil.create('div', 'info legend');
    
        var grades = [0, 2000, 5000, 10000, 25000, 100000];
    
        div.innerHTML = '<h4>CDP Population</h4>';
    
        for (var i = 0; i < grades.length; i++) {
            var from = grades[i];
            var to = grades[i + 1];
    
            div.innerHTML +=
            '<div class="legend-row">' +
              '<i class="legend-swatch" style="background:' + getColorFromPopulation(from + 1) + ';"></i>' +
              '<span class="legend-label">' +
                from.toLocaleString() +
                (to ? '&ndash;' + (to - 1).toLocaleString() : '+') +
              '</span>' +
            '</div>';
        }
      
    
        return div;
    };
    
    legend1.addTo(map1);
    
