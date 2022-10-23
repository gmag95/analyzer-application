mapboxgl.accessToken = mapToken;
var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/skyteam/cl37bd4yv001h14pmkdizsajo',
center: [8.517,46.433],
zoom: 4
});

let sel_id = undefined, prevYear = undefined, selYear = undefined;

const places = json_list;

colors_used = query_colors;
 
map.on("load", () => {

    map.addSource("places", {
        "type": "geojson",
        "data": places,
        'generateId': true
        });

      for (let pos of colors_used) {
        map.addLayer(
            {
              id: `${pos[0]}-boundaries`,
              source: {
                type: "vector",
                url: "mapbox://mapbox.country-boundaries-v1",
              },
              "source-layer": "country_boundaries",
              type: "fill",
              paint: {
                "fill-color": pos[2],
                "fill-opacity": 0.5,
                "fill-opacity-transition": {duration:200}
              },
            }
          );
    
        map.setFilter(`${pos[0]}-boundaries`, [
        "in",
        "iso_3166_1_alpha_3",
        `${pos[1]}`
        ]);
        
    }

    map.addLayer({
      id: "poi-labels",
      type: "symbol",
      source: "places",
      layout: {
      "text-field": ["concat",["get", "title"]," \n ",["get", "description"], " €"],
      "text-size": 18
      },
      paint: {
        "text-color":["case", ["boolean", ["feature-state", "hover"], false], "mediumblue", "black"]
      }
      });

})

map.on("click", "poi-labels", (country) => {
    document.location.href = `/postings?glcode=&description=&startregdate=&endregdate=&starteffdate=${document.querySelector("select").value }-01-01&endeffdate=${document.querySelector("select").value }-12-31&costcenter=&docnum=&usercode=&acccenter=&ordernum=&paymode=&supplcode=&countrycode=${country.features[0].properties.code}&fs_pos=PL`;
})

map.on("mouseenter", "poi-labels", (e) => {
  sel_id = e.features[0].id;
  map.setFeatureState(
    {
      source: "places",
      id: e.features[0].id
    },
    {
      hover: true
    }
  )
})

map.on("mouseout", "poi-labels", (e) => {
  map.setFeatureState(
    {
      source: "places",
      id: sel_id
    },
    {
      hover: false
    }
  )
})

map.addControl(new mapboxgl.NavigationControl());

updateData();

function updateData () {

  document.querySelector(".btn").addEventListener("click", () => {

      selYear = document.querySelector("select").value;

      let request = new XMLHttpRequest();
      request.open('GET', `getCountryData?year=${selYear}`, true);
      request.setRequestHeader('Content-Type', 'application/json');

      request.onload = function() {

          if (JSON.parse(this.response).name=="error") {
              return window.alert("Error retrieving chart data");
          }

          let response = eval(this.response);

          if (prevYear != selYear) {

            map.getSource('places').setData(response[0]);

            for (let pos of response[1]) {

              setTimeout(() => map.setPaintProperty(`${pos[0]}-boundaries`, 'fill-opacity', 0), 200);

              map.removeLayer(`${pos[0]}-boundaries`);
              map.removeSource(`${pos[0]}-boundaries`);

              map.addLayer(
                {
                  id: `${pos[0]}-boundaries`,
                  source: {
                    type: "vector",
                    url: "mapbox://mapbox.country-boundaries-v1",
                  },
                  "source-layer": "country_boundaries",
                  type: "fill",
                  paint: {
                    "fill-color": pos[2],
                    "fill-opacity": 0,
                    "fill-opacity-transition": {duration:200}
                  }              
                }
              );

              setTimeout(() => map.setPaintProperty(`${pos[0]}-boundaries`, 'fill-opacity', 0.5), 200);
          
              map.setFilter(`${pos[0]}-boundaries`, [
              "in",
              "iso_3166_1_alpha_3",
              `${pos[1]}`
              ]);

            }

          map.moveLayer("poi-labels");

          document.querySelector("#period-result span:nth-of-type(2)").innerText = Math.round(response[2]).toLocaleString("it-IT")+" €";

          }
          
        prevYear = selYear;

      }

      request.send();
  });
  
}