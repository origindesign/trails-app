/* eslint-disable */

import { useEffect, useState, useRef } from "react";
import Select from "react-select";
import "leaflet-search/dist/leaflet-search.min.css";
import "leaflet-search";

import Logo from "./../assets/pin.png";
import VernonLogo from "./../assets/vernon-logo.svg";
import TCLogo from "./../assets/trails-capital-oval.png";

// import parkingData from "./../data/parking";
// import trailsData from "./../data/trails";
// import tempData from "./../data/temp";
import { fetchParkingData } from "./../data/parking"; // Import the async fetch function
import { fetchTrailsData } from "./../data/trails"; // Import the async fetch function

const SectionMap = ({}) => {
    const geojsonLayerRef = useRef(null); // Ref to store the GeoJSON layer

    // let trails = tempData // import test data
    const [trails, setTrailsData] = useState(null); // State to manage trails data
    const [parkingData, setParkingData] = useState(null); // Separate state for parking data

    const [loading, setLoading] = useState(true); // State to track loading status

    /**
     * Fetch trails data asynchronously
     * use useEffect() to run only once on component mount
     */ 
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Set loading to true before fetching

            // Fetch both trails and parking data concurrently
            const [trailsResponse, parkingResponse] = await Promise.all([
                fetchTrailsData(),
                fetchParkingData()
            ]);

            setTrailsData(trailsResponse); // Store trails data separately
            setParkingData(parkingResponse); // Store parking data separately

            setLoading(false); // Set loading to false once data is fetched
        };

        fetchData();
    }, []);


    // Update classes when loading finishes
    useEffect(() => {
        if (!loading) {
            setTimeout(() => {
                document.querySelector(".c-controls")?.classList.add("in");
            }, 1000);
            if (window.innerWidth > 740) {
                setTimeout(() => {
                    document.querySelector(".c-filter")?.classList.add("in");
                }, 1100);
            }
            // setTimeout(() => {
            //     document.querySelector(".c-loader")?.classList.add("visually-hidden");
            // }, 2000);
        }
    }, [loading]);

    useEffect(() => {
        if (!trails) return; 

        // Creating map options
        const mapOptions = {
            center: [50.27179, -119.276505],
            zoom: 11.4,
        };

        const JAWG_API_KEY =
            "UlhmB9TdxEsUaPuIVrKDpmk5oM2qRX3IsK3hdoLnBDgkztJS86cE1GxVofqZWZmu"; // custom map style here https://www.jawg.io/lab/
        const map = L.map("map", mapOptions);

        // Define Light Mode Tile Layer (Default)
        const lightModeLayer = L.tileLayer(
            "https://{s}.tile.jawg.io/jawg-terrain/{z}/{x}/{y}.png?access-token=" + JAWG_API_KEY,
            {
                attribution: `
                    <a href="https://www.jawg.io" target="_blank">© Jawg Maps</a>, 
                    <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>`,
            }
        );

        // Define Dark Mode Tile Layer
        const darkModeLayer = L.tileLayer(
            "https://{s}.tile.jawg.io/jawg-dark/{z}/{x}/{y}.png?access-token=" + JAWG_API_KEY,
            {
                attribution: `
                    <a href="https://www.jawg.io" target="_blank">© Jawg Maps</a>, 
                    <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>`,
            }
        );

        // Start with Light Mode
        map.addLayer(lightModeLayer);

        L.control
            .zoom({
                position: "bottomright",
            })
            .addTo(map);

        const carParkIcon = L.icon({
            iconUrl: Logo,
            iconSize: [21, 31],
        });

        const DarkModeControl = L.Control.extend({
            options: { position: "bottomleft" },
        
            onAdd: function (map) {
                const container = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-mode");
        
                container.classList.add('dm');

                const app = document.querySelector('#map');
        
                let darkModeEnabled = false;
        
                container.onclick = function () {
                    if (darkModeEnabled) {
                        map.removeLayer(darkModeLayer);
                        map.addLayer(lightModeLayer);
                        container.classList.add('dm');
                        app.classList.remove('dark-mode');
                    } else {
                        map.removeLayer(lightModeLayer);
                        map.addLayer(darkModeLayer);
                        container.classList.remove('dm');
                        app.classList.add('dark-mode');
                    }
                    darkModeEnabled = !darkModeEnabled;
                };
        
                return container;
            }
        });
        
        // Add Dark Mode Control to Map
        map.addControl(new DarkModeControl());

        /**
         * Parking markers layer
         */
        let parkingMarkers = [];
        let parkingVisible = false; // Markers should be hidden by default

        const customIcon = L.divIcon({
            className: "parking-marker", // Class for styling
            html: "<div class='parking-content'></div>", // Custom HTML inside marker
            iconSize: [30, 30], // Size of the marker
            iconAnchor: [15, 15] // Center it correctly
        });

        // Function to add parking markers to the map
        function addParkingMarkers() {
            parkingMarkers = parkingData.map((marker) => {
                console.log(marker);

                const { latLng } = marker; // Destructure marker object
                const lat = latLng[0];
                const lng = latLng[1];

                return L.marker(latLng, { icon: customIcon })
                    .bindPopup(`
                        <span class="temp">${marker.unique_id}</span>
                        <h3 class='t-c-teal'>${marker.name}</h3>
                        <p class='t-c-teal'>
                            ${marker.description}
                        </p>
                        <a class='link' href='http://maps.google.com/maps?z=12&t=m&q=loc:${lat}+${lng}' 
                           data-coord='${lat},${lng}' target="_blank">
                            Directions
                        </a>
                    `)
                    .addTo(map);
            });
        }

        // Function to remove parking markers from the map
        function removeParkingMarkers() {
            parkingMarkers.forEach(marker => map.removeLayer(marker));
            parkingMarkers = []; // Clear the array
        }

        // Function to toggle parking markers
        function toggleParkingMarkers() {
            let parkingControl = document.querySelector(".control--parking");
            if (parkingVisible) {
                removeParkingMarkers();
                parkingControl.classList.remove('control--active');
            } else {
                addParkingMarkers();
                parkingControl.classList.add('control--active');
            }
            parkingVisible = !parkingVisible; // Toggle visibility state
        }

        // Add event listener to the button
        document.querySelector(".control--parking").addEventListener("click", toggleParkingMarkers);

        // Do NOT call addParkingMarkers() initially – they stay hidden by default
        addParkingMarkers();

        let geojsonLayer = L.geoJSON(trails.features, {
            style(feature) {
                const colorMap = {
                    Difficult: "#1A2A33",
                    "Most Difficult": "#1A2A33",
                    Easy: "#88AD38",
                    Moderate: "#0BB1D6",
                };

                return {
                    color: colorMap[feature.properties.Difficulty] || "#88AD38",
                    weight: 2.25,
                    opacity: 1,
                    interactive: true
                };
            },
            onEachFeature(feature, layer) {
                // Initialize elevationArray at the top of onEachFeature
                let elevationArray = [];
            
                // Populate elevationArray based on feature.geometry.type
                let coords = feature.geometry.coordinates;
                let trailType = feature.geometry.type;
            
                if (trailType === 'LineString') {
                    for (let i = 0; i < coords.length; i++) {
                        elevationArray.push(coords[i][2]); // Push the elevation (3rd value)
                    }
                } else if (trailType === 'MultiLineString') {
                    for (let i = 0; i < coords.length; i++) {
                        let subCoords = coords[i];
                        for (let j = 0; j < subCoords.length; j++) {
                            elevationArray.push(subCoords[j][2]); // Push elevation
                        }
                    }
                }
            
                layer.bindPopup("");
                layer.on("popupopen", function (e) {
                    var popup = e.popup;

                    const trailDetail = document.querySelector('.c-trail-detail');
                    if (trailDetail.classList.contains('open')) {
                        trailDetail.classList.remove('open');
                    }

                    // Active trail style
                    map.eachLayer(function (l) {
                        if (l instanceof L.Polyline) {
                            l.setStyle({ weight: 2.25 }); // Reset weight
                            const el = l.getElement();
                            if (el) {
                                el.classList.remove("trail-active"); // Remove active class
                                el.classList.add("trail"); // Reset to default
                            }
                        }
                    });
                    if (layer instanceof L.Polyline) {
                        layer.setStyle({ weight: 5 }); // Highlight weight
                        const el = layer.getElement();
                        if (el) {
                            el.classList.remove("trail"); // Remove default class
                            el.classList.add("trail-active"); // Add active class
                        }
                    }

                    // Get the bounds of the feature
                    const bounds = layer.getBounds ? layer.getBounds() : layer.getLatLng();
                    let center;
                    if (layer instanceof L.Marker) {
                        center = layer.getLatLng();
                    } else if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
                        center = bounds.getCenter();
                    }

                    console.log(feature.properties, 'sss');
            
                    popup.setContent(`
                        <span class="temp">${feature.properties['Unique ID']}</span>
                        <h3 class="t-c-teal">${feature.properties.Name}</h3>
                        <div class="card-props t-c-teal">
                            <span class="distance d-flex ai-center">${JSON.stringify(feature.properties.Distance)} km</span>
                            <span class="difficulty d-flex ai-center ${feature.properties.Difficulty.toLowerCase().replace(
                                /\s+/g,
                                "-"
                            )}">${feature.properties.Difficulty}</span>
                            <!--<span class="type d-flex ai-center ${feature.properties['Optimized Type'].toLowerCase().replace(/\s+/g, '-').replace(/"/g, '')}">${feature.properties['Optimized Type'].replace(/"/g, '')}</span>-->
                        </div>
                        <span class="link t-c-teal" data-name="${
                            feature.properties.Name
                        }" data-distance="${JSON.stringify(feature.properties.Distance)}" data-difficulty="${feature.properties.Difficulty}" data-description="${feature.properties.Description}" data-access="${feature.properties.Access}" data-elevation="${elevationArray}" data-imagery="${feature.properties.Images}" data-parkingname="${feature.properties.Parking.name}" data-parkingdescription="${feature.properties.Parking.description}" data-area="${feature.properties['Trail Area']}" data-areaurl="${feature.properties['Trail Area URL']}" data-typehiking="${feature.properties['Hiking']}" data-typebiking="${feature.properties['Biking']}" data-typesnowmobile="${feature.properties['Snowmobile']}" data-typexcski="${feature.properties['XC Ski']}" data-typealpineski="${feature.properties['Alpine Ski']}" data-typesnowshoe="${feature.properties['Snowshoe']}" data-typewinterbike="${feature.properties['Winter Bike']}">More details</span>
                    `);

                    // Pan the map
                    map.setView(center, map.getZoom(), { animate: true, duration: 1 });
                });
            
                // Generate a buffer polygon
                const bufferDistance = 0.02; // Buffer distance in kilometers
                const buffered = turf.buffer(feature, bufferDistance, { units: "kilometers" });
            
                // Add the buffer layer
                const bufferLayer = L.geoJSON(buffered, {
                    style: {
                        color: "transparent",
                        weight: 0,
                        fillOpacity: 0.3,
                    },
                }).addTo(map);
            
                bufferLayer.on("click", function (e) {
                    // Get the location of the click
                    const clickLatLng = e.latlng;

                    const trailDetail = document.querySelector('.c-trail-detail');
                    if (trailDetail.classList.contains('open')) {
                        trailDetail.classList.remove('open');
                    }

                     // Active trail style
                     map.eachLayer(function (l) {
                        if (l instanceof L.Polyline) {
                            l.setStyle({ weight: 2.25 }); // Reset weight
                            const el = l.getElement();
                            if (el) {
                                el.classList.remove("trail-active"); // Remove active class
                                el.classList.add("trail"); // Reset to default
                            }
                        }
                    });
                    if (layer instanceof L.Polyline) {
                        layer.setStyle({ weight: 5 }); // Highlight weight
                        const el = layer.getElement();
                        if (el) {
                            el.classList.remove("trail"); // Remove default class
                            el.classList.add("trail-active"); // Add active class
                        }
                    }

                    // Open a popup at the clicked location
                    const popupContent = `
                        <h3 class="t-c-teal"><span style="color:purple;">${feature.properties['Unique ID']}</span><br>${feature.properties.Name}</h3>
                        <div class="card-props t-c-teal">
                            <span class="distance d-flex ai-center">${JSON.stringify(
                                feature.properties.Distance
                            )} km</span>
                            <span class="difficulty d-flex ai-center ${feature.properties.Difficulty.toLowerCase().replace(
                                /\s+/g,
                                "-"
                            )}">${feature.properties.Difficulty}</span>
                            <!--<span class="type d-flex ai-center ${feature.properties['Optimized Type'].toLowerCase().replace(/\s+/g, '-').replace(/"/g, '')}">${feature.properties['Optimized Type'].replace(/"/g, '')}</span>-->
                        </div>
                        <span class="link t-c-teal" data-name="${
                            feature.properties.Name
                        }" data-distance="${JSON.stringify(
                        feature.properties.Distance
                    )}" data-difficulty="${feature.properties.Difficulty}" data-access="${feature.properties.Access}" data-description="${
                        feature.properties.Description
                    }" data-elevation="${elevationArray}" data-imagery="${feature.properties.Images}" data-parkingname="${feature.properties.Parking.name}" data-parkingdescription="${feature.properties.Parking.description}" data-area="${feature.properties['Trail Area']}" data-areaurl="${feature.properties['Trail Area URL']}" data-typehiking="${feature.properties['Hiking']}" data-typebiking="${feature.properties['Biking']}" data-typesnowmobile="${feature.properties['Snowmobile']}" data-typexcski="${feature.properties['XC Ski']}" data-typealpineski="${feature.properties['Alpine Ski']}" data-typesnowshoe="${feature.properties['Snowshoe']}" data-typewinterbike="${feature.properties['Winter Bike']}">More details</span>
                    `;

                    L.popup()
                        .setLatLng(clickLatLng)
                        .setContent(popupContent)
                        .openOn(map);

                         // Get the bounds of the feature
                    const bounds = layer.getBounds ? layer.getBounds() : layer.getLatLng();
                    let center;
                    if (layer instanceof L.Marker) {
                        center = layer.getLatLng();
                    } else if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
                        center = bounds.getCenter();
                    }

                    // Pan the map
                    map.setView(center, map.getZoom(), { animate: true, duration: 1 });

                });
            },
        }).addTo(map);

        geojsonLayerRef.current = geojsonLayer; // Store the GeoJSON layer in the ref

        // Add the Leaflet Search control
        const searchControl = new L.Control.Search({
            layer: geojsonLayer,
            propertyName: "Name",
            initial: false,
            zoom: 16,
            marker: false,
            textPlaceholder: "Search by trail name",
            collapsed: false,
        });

        map.addControl(searchControl);

        // Move the search control's HTML to a specific container after adding it to the map
        const searchElement = document.querySelector(".leaflet-control-search");
        const customContainer = document.getElementById("controls-internal");
        if (searchElement && customContainer) {
            customContainer.appendChild(searchElement);
        }

        // Listen for the search:locationfound event
        searchControl.on("search:locationfound", function (e) {
            // Access the found layer
            const layer = e.layer;

            if (layer) {
                // Open the popup on the found layer
                layer.openPopup();
            }
        });

        // Call the URL param function
        selectTrailFromURL(map);

        /**
         * Open trail popup based on URL parameters
         * @param {*} map 
         */
        function selectTrailFromURL(map) {
            const params = new URLSearchParams(window.location.search);
            const trailName = params.get("trail"); // URL Pattern: ?trail=<trail-name>
        
            if (trailName) {
                let popupOpened = false;
        
                map.eachLayer((layer) => {
                    // Check if the layer has a popup and matches the trail name
                    if (layer.getPopup && layer.feature && layer.feature.properties.Name === trailName) {

                        // Get the bounds of the feature
                        const bounds = layer.getBounds ? layer.getBounds() : layer.getLatLng();
                        let center;
                        if (layer instanceof L.Marker) {
                            center = layer.getLatLng();
                        } else if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
                            center = bounds.getCenter();
                        }
                
                        map.setView(center, map.getZoom(), { animate: true, duration: 1 });

                        // Open the popup
                        layer.openPopup();
                        popupOpened = true;
                    }
                });
        
                if (!popupOpened) {
                    console.warn(`No trail found with the name: ${trailName}`);
                }
            }
        }
    }, [trails]);

    /**
     * Filters() function returns html for the UI filters.
     * @returns 
     */
    const Filters = () => {

        const activityOptions = [
            { value: "All", label: "All Activities" },
            { value: "Alpine Ski", label: "Alpine Ski" },
            { value: "Biking", label: "Biking" },
            { value: "Hiking", label: "Hiking" },
            { value: "XC Ski", label: "XC Ski" },
            { value: "Snowmobile", label: "Snowmobile" },
            { value: "Snowshoe", label: "Snowshoe" },
            { value: "Winter Fatbike", label: "Winter Fatbike" },
        ];

        const difficultyOptions = [
            { value: "All", label: "All Difficulties" },
            { value: "Easy", label: "Easy" },
            { value: "Moderate", label: "Moderate" },
            { value: "Difficult", label: "Difficult" },
            { value: "Most Difficult", label: "Most Difficult" },
        ];

        const customStyles = {
            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isSelected ? '#346d7a' : state.isFocused ? '#f1f1f1' : 'white',
              color: state.isSelected ? 'white' : '#346d7a',
              cursor: 'pointer',
            }),
          };

        const selectedDifficulty = useRef({ value: 'All' }); // State for difficulty dropdown
        const selectedActivity = useRef({ value: 'All' });// State for activity dropdown

        const filterGeoJsonLayer = () => {
            // console.log('DIFFICULTY:', selectedDifficulty.current.value);
            // console.log('ACTIVITY:', selectedActivity.current.value);
    
            geojsonLayerRef.current.clearLayers();

            // Filter features based on selected difficulty and activity
            const filteredFeatures = trails.features.filter((feature) => {
                const matchesDifficulty =
                    selectedDifficulty.current.value === "All" || 
                    feature.properties["Difficulty"] === selectedDifficulty.current.value;

                    const matchesActivity = selectedActivity.current.value === "All" || (
                        Object.keys(feature.properties).some((key) => {
                            // Check if the key matches the selected activity and the value is "true"
                            return key === selectedActivity.current.value && feature.properties[key] === "true";
                        })
                    );

                // Return true if both conditions are met
                return matchesDifficulty && matchesActivity;
            });

            // Add the filtered features back to the GeoJSON layer
            geojsonLayerRef.current.addData(filteredFeatures);

            // console.log('Filtered Features:', filteredFeatures);// debug

        };

        // Handle changes in the difficulty dropdown
        const handleDifficultyChange = (selectedOption) => {
            selectedDifficulty.current = selectedOption;
            filterGeoJsonLayer();
        };

        // Handle changes in the activity dropdown
        const handleActivityChange = (selectedOption) => {
            selectedActivity.current = selectedOption;
            filterGeoJsonLayer();
        };

        return (
            <div className={"c-filter pos-absolute d-flex jc-flex-end"}>
                <div className={"c-filter__internal bg--white d-flex flex-direction-column"}>
                    <Select
                        id="filter"
                        options={activityOptions}
                        defaultValue={activityOptions[0]}
                        className="filter filter-activity"
                        onChange={handleActivityChange}
                        styles={customStyles}
                        isSearchable={false}
                    />
                    <Select
                        id="filter2"
                        options={difficultyOptions}
                        defaultValue={difficultyOptions[0]}
                        className="filter filter-difficulty"
                        onChange={handleDifficultyChange}
                        styles={customStyles}
                        isSearchable={false}
                    />
                </div>
            </div>
        );
    };

    /**
     * TrailDetail() function returns html for the trail modal.
     * @returns 
     */
    function TrailDetail() {
        const [trailDetails, setTrailDetails] = useState({
          name: "",
          distance: "",
          difficulty: "",
          description: "",
          access: "",
          elevation: "",
          parkingname: "",
          parkingdescription: "",
          area: "",
          areaurl: "",
          typehiking: "",
          typebiking: "",
          typesnowmobile: "",
          typexcski: "",
          typealpineski: "",
          typesnowshoe: "",
          typewinterbike: "",
          imagery: [],
        });
        const [isModalOpen, setIsModalOpen] = useState(false);
      
        const chartRef = useRef(null);
        const splideRef = useRef(null);
      
        useEffect(() => {
          // Initialize Splide whenever imagery changes
          if (
            Array.isArray(trailDetails.imagery) &&
            trailDetails.imagery.filter((image) => image.trim() !== "").length > 0
          ) {
            if (splideRef.current) {
              splideRef.current.destroy();
            }
            splideRef.current = new Splide(".splide", {
              type: "fade",
              perPage: 1,
              autoplay: true,
              arrows: true,
              pagination: true,
            });
            splideRef.current.mount();
          }
        }, [trailDetails.imagery]);
      
        // Function to handle click events
        function handleClick(event) {
          if (event.target.matches(".link")) {
            const {
              name,
              distance,
              difficulty,
              description,
              access,
              elevation,
              parkingname,
              parkingdescription,
              area,
              areaurl,
              typehiking,
              typebiking,
              typesnowmobile,
              typexcski,
              typealpineski,
              typesnowshoe,
              typewinterbike,
              imagery,
            } = event.target.dataset;
      
            setTrailDetails({
              name,
              distance,
              difficulty,
              description,
              access,
              elevation,
              parkingname,
              parkingdescription,
              area,
              areaurl,
              typehiking,
              typebiking,
              typesnowmobile,
              typexcski,
              typealpineski,
              typesnowshoe,
              typewinterbike,
              imagery: imagery.split(", "),
            });
      
            setIsModalOpen(true); // Ensure the modal opens on the first click
          }
      
          if (event.target.matches(".control--close")) {
            setIsModalOpen(false); // Close the modal
            if (splideRef.current) {
              splideRef.current.destroy();
              splideRef.current = null;
            }
          }
        }
      
        // Add the event listener when the component mounts
        useEffect(() => {
          document.addEventListener("click", handleClick);
      
          // Clean up the event listener when the component unmounts
          return () => {
            document.removeEventListener("click", handleClick);
          };
        }, []);
      
        useEffect(() => {
          // scroll trail detail to top each time re-opened
          const trailDetailInt = document.querySelector('.c-trail-detail__internal');
          trailDetailInt.scrollTo({ top: 0, behavior: 'smooth' });

          const ctx = document.getElementById("elevationChart");
      
        //   console.log('elevation: ', trailDetails.elevation);//debug
          let elevationArray = trailDetails.elevation.split(",");
      
          chartRef.current = new Chart(ctx, {
            type: "line",
            data: {
              datasets: [
                {
                  data: elevationArray.map(Number),
                  pointRadius: 0,
                  borderColor: "black",
                  borderWidth: 2,
                },
              ],
              labels: elevationArray.map((_, index) => `Point ${index + 1}`),
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  ticks: {
                    display: false,
                    color: "#346d7a"
                  },
                  grid: {
                    display: false, // Disable vertical grid lines
                    color: "#88AD38",
                  },
                },
                y: {
                  ticks: {
                    callback: function (value) {
                      return `${value}m`; // Add 'm' suffix for meters
                    },
                    stepSize: 30,
                    color: "#346d7a",
                    maxTicksLimit: 5,
                  },
                  grid: {
                    color: "#88AD38",
                  },
                  border: {
                    color: "#88AD38",
                  },
                },
              },
            },
          });
      
          // Cleanup: Destroy the chart when the component unmounts
          return () => {
            if (chartRef.current) {
              chartRef.current.destroy();
            }
          };
        }, [trailDetails.elevation]);
      
        return (
          <div
            className={`c-trail-detail bg--white d-flex flex-direction-column pos-absolute scrollable ${
              Array.isArray(trailDetails.imagery) &&
              trailDetails.imagery.filter((image) => image.trim() !== "").length > 0
                ? "has-gallery"
                : ""
            } ${isModalOpen ? "open" : ""}`}
          >
            {Array.isArray(trailDetails.imagery) &&
              trailDetails.imagery.filter((image) => image.trim() !== "").length >
                0 && (
                <div
                  className="splide"
                  role="group"
                  aria-label="Splide Basic HTML Example"
                >
                  <div className="splide__track">
                    <ul className="splide__list">
                      {trailDetails.imagery
                        .filter((image) => image.trim() !== "")
                        .map((imageUrl, index) => (
                          <li className="splide__slide" key={index}>
                            <img src={imageUrl} alt={`Trail image ${index + 1}`} />
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              )}
            <div className={"c-trail-detail__internal d-flex flex-direction-column"}>
              <a className="control control--close">Close trail detail modal</a>

              <h2 className="t-c-teal">{trailDetails.name}</h2>

              {trailDetails.area && (
                    <p className="c-area d-flex ai-center">
                        <strong>Area: </strong>
                        {trailDetails.areaurl ? (
                            <a href={trailDetails.areaurl} target="_blank" rel="noopener noreferrer">
                                {trailDetails.area}
                            </a>
                        ) : (
                            <span>{trailDetails.area}</span>
                        )}
                    </p>
                )}

              <div className={"c-trail-types d-flex flex-direction-row flex-wrap-wrap"}>
                {trailDetails.typehiking === "true" && (
                    <span className="type d-flex ai-center hiking">Hiking</span>
                )}
                {trailDetails.typebiking === "true" && (
                    <span className="type d-flex ai-center biking">Biking</span>
                )}
                {trailDetails.typesnowmobile === "true" && (
                    <span className="type d-flex ai-center snowmobile">Snowmobile</span>
                )}
                {trailDetails.typexcski === "true" && (
                    <span className="type d-flex ai-center xcski">XC Ski</span>
                )}
                {trailDetails.typealpineski === "true" && (
                    <span className="type d-flex ai-center alpineski">Alpine Ski</span>
                )}
                {trailDetails.typesnowshoe === "true" && (
                    <span className="type d-flex ai-center snowshoe">Snowshoe</span>
                )}
                {trailDetails.typewinterbike === "true" && (
                    <span className="type d-flex ai-center winterbike">Winter Bike</span>
                )}
              </div>

              <div className="c-trail-props d-flex t-c-teal">
                <span className="distance d-flex ai-center">
                  {trailDetails.distance} km
                </span>
                <span
                  className={`difficulty d-flex ai-center ${trailDetails.difficulty
                    ?.toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {trailDetails.difficulty}
                </span>
              </div>

              {trailDetails.description && <p>{trailDetails.description}</p>}

              {trailDetails.access && (
                <div className={"access d-flex flex-direction-column"}>
                  <h3 className="t-c-teal">Access</h3>
                  <p>{trailDetails.access}</p>
                </div>
              )}

              {trailDetails.parkingname && (
                <div className="parking d-flex flex-direction-column">
                    <h3 className="t-c-teal">Parking</h3>
                    <div class={"parking-item"}>
                        <span>{trailDetails.parkingname}</span>
                        {trailDetails.parkingdescription && (
                            <p>{trailDetails.parkingdescription}</p>
                        )}
                    </div>
                </div>
              )}

              <div className={"chart-container"}>
                <canvas id="elevationChart"></canvas>
              </div>
            </div>
          </div>
        );
    }

    /**
     * Loader() function returns html for the loader element.
     * @returns 
     */
    function Loader() {
        useEffect(() => {
            // var loader = document.querySelector(".c-loader");
            // var controls = document.querySelector(".c-controls");
            // var filters = document.querySelector(".c-filter");

            // setTimeout(function () {
            //     loader.classList.add("hide");
            // }, 1000);
            // setTimeout(function () {
            //     controls.classList.add("in");
            // }, 1350);
            // if (window.innerWidth > 740) {
            //     setTimeout(() => {
            //         filters.classList.add("in");
            //     }, 1500);
            // }
            // setTimeout(function () {
            //     loader.classList.add("visually-hidden");
            // }, 2000);
        }, []);

        return (
            <div class="c-loader">
                <div class="c-loader__wrapper">
                    <div class="c-loader__internal">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <img src={VernonLogo} alt="Vernon Logo" />
                </div>
            </div>
        );
    }

    /**
     * ControlsPrimary() function returns html for the app controls.
     * @returns 
     */
    const ControlsPrimary = () => {
        useEffect(() => {
    
            function searchClick(event) {
                const searchEl = document.querySelector(".leaflet-control-search");
                const filterEl = document.querySelector(".c-filter");
            
                if (event.target.matches(".control--search")) {
                    const isSearchOpen = searchEl.classList.contains("in");
                    searchEl.classList.toggle("in");
                    filterEl.classList.remove("in");
                }

                if (event.target.matches(".control--filters")) {
                    const isFilterOpen = filterEl.classList.contains("in");
                    filterEl.classList.toggle("in");
                    searchEl.classList.remove("in");
                }
            }

            function handleResize() {
                if (window.innerWidth < 960) {
                    document.querySelector(".leaflet-control-search")?.classList.remove("in");
                    document.querySelector(".c-filter")?.classList.remove("in");
                }
                else if (window.innerWidth > 960) {
                    document.querySelector(".leaflet-control-search")?.classList.remove("in");
                    document.querySelector(".c-filter")?.classList.add("in");
                }
            }

            // Add event listeners
            document.addEventListener("click", searchClick);
            window.addEventListener("resize", handleResize);
    
            // Cleanup function to remove event listeners
            return () => {
                document.removeEventListener("click", searchClick);
                window.removeEventListener("resize", handleResize);
            };
        }, []); // Empty dependency array ensures effect runs only once
    
        return (
            <div className={"c-controls pos-absolute d-flex"}>
                <div
                    id="controls-internal"
                    className={"c-controls__internal body-copy bg--white d-flex flex-direction-row"}
                >
                    <a
                        className="control control--home"
                        href="https://www.tourismvernon.com"
                    >
                        Home
                    </a>
                    <a className="control control--search">Open search</a>
                    <a className="control control--parking">Toggle parking markers</a>
                    <a className="control control--filters">Open filters</a>
                </div>
            </div>
        );
    };

    const Disclaimer = () => {
        const [accepted, setAccepted] = useState(false);
        const [loading, setLoading] = useState(true);
        const [isVisible, setIsVisible] = useState(false);
    
        useEffect(() => {
            const getCookie = (name) => {
                return document.cookie.split("; ").some(cookie => cookie.startsWith(name + "="));
            };
    
            if (getCookie("accepted_terms")) {
                setAccepted(true);
            } else {
                setIsVisible(true);
            }
    
            setLoading(false);
        }, []);
    
        const acceptTerms = () => {
            document.cookie = "accepted_terms=true; path=/; max-age=" + 60 * 60 * 24 * 365;
            setIsVisible(false);
            setTimeout(() => setAccepted(true), 500); // Wait for animation before removing
        };
    
        if (loading || accepted) return null;
    
        return (
            <div className={`c-disclaimer d-flex ai-center flex-wrap-wrap ${isVisible ? "show" : "hide"}`}>
                <img src={TCLogo} alt="Trails Capital Logo" />
                <p>
                    This map is for informational purposes only. Please check with the
                    local authorities for the most up-to-date information.
                </p>
                <button onClick={acceptTerms}>Accept</button>
            </div>
        );
    };

    return (
        <div>
            <div
                id="map"
                style="width: 100%; height: 100%; top: 0; bottom: 0; position: absolute;"
            />
            <div className={"map-controls pos-absolute d-flex jc-space-between"}>
                <ControlsPrimary />
                <Filters />
            </div>
            <TrailDetail />
            {loading && <Loader />} {/* Show Loader only when loading is true */}
            <Disclaimer />
        </div>
    );
};

export default SectionMap;
