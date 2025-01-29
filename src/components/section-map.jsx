/* eslint-disable */

import { useEffect, useState, useRef } from "react";
import Select from "react-select";
import "leaflet-search/dist/leaflet-search.min.css";
import "leaflet-search";

import Logo from "./../assets/pin.png";
import VernonLogo from "./../assets/vernon-logo.svg";

import parkingData from "./../data/parking";
// import trailsData from "./../data/trails";
// import tempData from "./../data/temp";
import { fetchTrailsData } from "./../data/trails"; // Import the async fetch function

const SectionMap = ({}) => {
    const geojsonLayerRef = useRef(null); // Ref to store the GeoJSON layer

    // let trails = tempData // import data
    const [trails, setTrailsData] = useState(null); // State to manage trails data

    /**
     * Fetch trails data asynchronously
     * use useEffect() to run only once on component mount
     */ 
    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchTrailsData();
            setTrailsData(data); // Update state with fetched data
        };
        fetchData();
    }, []);

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

        // Function to add parking markers to the map
        function addParkingMarkers() {
            parkingMarkers = parkingData.map((marker) => 
                L.marker(marker.latLng, { icon: carParkIcon })
                    .bindPopup(marker.popupContent)
                    .addTo(map) // Add to map only when function is called
            );
        }

        // Function to remove parking markers from the map
        function removeParkingMarkers() {
            parkingMarkers.forEach(marker => map.removeLayer(marker));
            parkingMarkers = []; // Clear the array
        }

        // Function to toggle parking markers
        function toggleParkingMarkers() {
            if (parkingVisible) {
                removeParkingMarkers();
            } else {
                addParkingMarkers();
            }
            parkingVisible = !parkingVisible; // Toggle visibility state
        }

        // Add event listener to the button
        document.querySelector(".control--parking").addEventListener("click", toggleParkingMarkers);

        // Do NOT call addParkingMarkers() initially – they stay hidden by default

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
            
                    // Get the bounds of the feature
                    const bounds = layer.getBounds ? layer.getBounds() : layer.getLatLng();
                    let center;
                    if (layer instanceof L.Marker) {
                        center = layer.getLatLng();
                    } else if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
                        center = bounds.getCenter();
                    }
            
                    popup.setContent(`
                        <h3 class="t-c-teal">${feature.properties.Name}</h3>
                        <div class="card-props t-c-teal">
                            <span class="distance d-flex ai-center">${JSON.stringify(feature.properties.Distance)} km</span>
                            <span class="difficulty d-flex ai-center ${feature.properties.Difficulty.toLowerCase().replace(
                                /\s+/g,
                                "-"
                            )}">${feature.properties.Difficulty}</span>
                        </div>
                        <span class="link t-c-teal" data-name="${
                            feature.properties.Name
                        }" data-distance="${JSON.stringify(feature.properties.Distance)}" data-difficulty="${feature.properties.Difficulty}" data-description="${feature.properties.Description}" data-access="${feature.properties.Access}" data-elevation="${elevationArray}" data-imagery="${feature.properties.Images}">More details</span>
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
            
                    // Open a popup at the clicked location
                    const popupContent = `
                        <h3 class="t-c-teal">${feature.properties.Name}</h3>
                        <div class="card-props t-c-teal">
                            <span class="distance d-flex ai-center">${JSON.stringify(
                                feature.properties.Distance
                            )} km</span>
                            <span class="difficulty d-flex ai-center ${feature.properties.Difficulty.toLowerCase().replace(
                                /\s+/g,
                                "-"
                            )}">${feature.properties.Difficulty}</span>
                        </div>
                        <span class="link t-c-teal" data-name="${
                            feature.properties.Name
                        }" data-distance="${JSON.stringify(
                        feature.properties.Distance
                    )}" data-difficulty="${feature.properties.Difficulty}" data-access="${feature.properties.Access}" data-description="${
                        feature.properties.Description
                    }" data-elevation="${elevationArray}" data-imagery="${feature.properties.Images}">More details</span>
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

                const matchesActivity =
                    selectedActivity.current.value === "All" || 
                    feature.properties["Optimized Type"] === selectedActivity.current.value;

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
              imagery,
            } = event.target.dataset;
      
            setTrailDetails({
              name,
              distance,
              difficulty,
              description,
              access,
              elevation,
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
              {trailDetails.description && <p>{trailDetails.description}</p>}
              {trailDetails.access && (
                <div className={"access d-flex flex-direction-column"} style={{ marginTop: "2rem" }}>
                  <h3 className="t-c-teal">Access</h3>
                  <p>{trailDetails.access}</p>
                </div>
              )}
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
            var loader = document.querySelector(".c-loader");
            var controls = document.querySelector(".c-controls");
            var filters = document.querySelector(".c-filter");

            setTimeout(function () {
                loader.classList.add("hide");
            }, 1000);
            setTimeout(function () {
                controls.classList.add("in");
            }, 1350);
            setTimeout(function () {
                filters.classList.add("in");
            }, 1500);
            setTimeout(function () {
                loader.classList.add("visually-hidden");
            }, 2000);
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
            // mobile controls functionality
            const filterControl = document.querySelector(".control--filters");
            const filterEl = document.querySelector(".c-filter");
            filterControl.addEventListener("click", function () {
                filterEl.classList.toggle("in");
            });

             // Function to handle click events
            function searchClick(event) {
                if (event.target.matches(".control--search")) {
                    const searchEl = document.querySelector(".leaflet-control-search");
                    searchEl.classList.add("in");
                    filterEl.classList.remove("in");
                }

                if (event.target.matches(".control--filters")) {
                    const searchEl = document.querySelector(".leaflet-control-search");
                    searchEl.classList.remove("in");
                }
            }
            document.addEventListener("click", searchClick);
        });

        return (
            <div className={"c-controls pos-absolute d-flex"}>
                <div
                    id="controls-internal"
                    className={"c-controls__internal body-copy bg--white d-flex flex-direction-column"}
                >
                    <a
                        class="control control--home"
                        href="https://www.tourismvernon.com"
                    >
                        Home
                    </a>
                    <a class="control control--search">Open search</a>
                    <a class="control control--parking">Toggle parking markers</a>
                    <a class="control control--filters">Open filters</a>
                </div>
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
            <Loader />
        </div>
    );
};

export default SectionMap;
