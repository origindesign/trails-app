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

    // Ref to store the buffer layers
    const bufferLayersRef = useRef([]);
    const mapRef = useRef(null);

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
        }
    }, [loading]);

    useEffect(() => {
        if (!trails || !parkingData) return; 

        // Creating map options
        const mapOptions = {
            center: [50.27179, -119.276505],
            zoom: 11.4,
            maxZoom: 20,
        };

        const JAWG_API_KEY =
            "UlhmB9TdxEsUaPuIVrKDpmk5oM2qRX3IsK3hdoLnBDgkztJS86cE1GxVofqZWZmu"; // custom map style here https://www.jawg.io/lab/
        const THUNDER_API_KEY = '41fd33b955ef4c3691d89f6911d5a0f9';
        const map = L.map("map", mapOptions);

        // Buffer layer clear functionality: requirement to store map as a reference, wich can then be cleared
        mapRef.current = map;

        // Define Light Mode Tile Layer (Default)
        const lightModeLayer = L.tileLayer(
            "https://api.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=" + THUNDER_API_KEY,
            {
                attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`,
                maxZoom: 20,
            }
        );

        // Define Dark Mode Tile Layer
        const darkModeLayer = L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
                attribution: `
                    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'`,
                maxZoom: 20,
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

        // Parking
        let parkingMarkers = [];
        let parkingVisible = false;

        const customIcon = L.divIcon({
            className: "parking-marker",
            html: "<div class='parking-content'></div>",
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        // Add parking markers (but don't add them to map yet)
        function createParkingMarkers() {
            return parkingData.map((marker) => {
                const { latLng } = marker;
                const lat = latLng[0];
                const lng = latLng[1];

                const parkingMarker = L.marker(latLng, { icon: customIcon })
                parkingMarker.parkingData = marker;

                return parkingMarker.bindPopup(`
                    <span class="temp">${marker.unique_id}</span>
                    <h3 class='t-c-teal'>${marker.name}</h3>
                    <p class='t-c-teal'>
                    ${marker.description}
                    </p>
                    <a class='link' href='http://maps.google.com/maps?z=12&t=m&q=loc:${lat}+${lng}' 
                    data-coord='${lat},${lng}' target="_blank">
                    Directions
                    </a>
                `);
            });
        }

        function addParkingMarkers() {
            parkingMarkers.forEach(marker => marker.addTo(map));
            parkingVisible = true;
        }

        function removeParkingMarkers() {
            parkingMarkers.forEach(marker => map.removeLayer(marker));
            parkingVisible = false;
        }

        function updateParkingMarkersVisibility() {
            const currentZoom = map.getZoom();
            const zoomThreshold = 14;

            if (currentZoom >= zoomThreshold && !parkingVisible) {
                addParkingMarkers();
            } else if (currentZoom < zoomThreshold && parkingVisible) {
                removeParkingMarkers();
            }
        }

        // Build marker array once
        parkingMarkers = createParkingMarkers();

        // Update marker visibility on zoom
        map.on('zoomend', updateParkingMarkersVisibility);

        // Optional: also trigger once on load
        updateParkingMarkersVisibility();

        let geojsonLayer = L.geoJSON(trails.features, {
            style(feature) {
                // Check if this is a Paddle trail first
                if (feature.properties['Paddle'] === "true") {
                    return {
                        color: "#9B59B6", // Purple for Paddle trails
                        weight: 2.25,
                        opacity: 1,
                        interactive: true
                    };
                }

                // Otherwise use difficulty-based colors
                const colorMap = {
                    Difficult: "black",
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
                            l.setStyle({ weight: 2.25 });
                            const el = l.getElement();
                            if (el) {
                                el.classList.remove("trail-active");
                                el.classList.add("trail");
                            }
                        }
                    });
                    if (layer instanceof L.Polyline) {
                        layer.setStyle({ weight: 5 }); // Highlight weight
                        const el = layer.getElement();
                        if (el) {
                            el.classList.remove("trail");
                            el.classList.add("trail-active");
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

                    // console.log(feature.properties, 'fp');

                    const isPaddleTrail = feature.properties['Paddle'] === "true";
                    const difficultyHtml = isPaddleTrail ? '' : `<span class="difficulty d-flex ai-center ${feature.properties.Difficulty.toLowerCase().replace(
                                /\s+/g,
                                "-"
                            )}">${feature.properties.Difficulty}</span>`;

                    popup.setContent(`
                        <span class="temp">${feature.properties['Unique_ID']}</span>
                        <h3 class="t-c-teal">${feature.properties.Name}</h3>
                        <div class="card-props t-c-teal">
                            <span class="distance d-flex ai-center">${JSON.stringify(feature.properties.Distance)} km</span>
                            ${difficultyHtml}
                            <!--<span class="type d-flex ai-center ${feature.properties['Optimized Type'].toLowerCase().replace(/\s+/g, '-').replace(/"/g, '')}">${feature.properties['Optimized Type'].replace(/"/g, '')}</span>-->
                        </div>
                        <span class="link t-c-teal" data-name="${
                            feature.properties.Name
                        }" data-distance="${JSON.stringify(feature.properties.Distance)}" data-difficulty="${feature.properties.Difficulty}" data-description="${feature.properties.Description}" data-access="${feature.properties.Access}" data-elevation="${elevationArray}" data-imagery="${feature.properties.Images}" data-parkingname="${feature.properties.Parking.name}" data-parkingdescription="${feature.properties.Parking.description}" data-parkingcoords="${feature.properties.Parking.latLng}" data-area="${feature.properties['Trail Area']}" data-areaurl="${feature.properties['Trail Area URL']}" data-typehiking="${feature.properties['Hiking']}" data-typebiking="${feature.properties['Biking']}" data-typesnowmobile="${feature.properties['Snowmobile']}" data-typexcski="${feature.properties['XC Ski']}" data-typealpineski="${feature.properties['Alpine Ski']}" data-typesnowshoe="${feature.properties['Snowshoe']}" data-typewinterbike="${feature.properties['Winter Fatbike']}" data-typepaddle="${feature.properties['Paddle']}">More details</span>
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
                            l.setStyle({ weight: 2.25 });
                            const el = l.getElement();
                            if (el) {
                                el.classList.remove("trail-active");
                                el.classList.add("trail");
                            }
                        }
                    });
                    if (layer instanceof L.Polyline) {
                        layer.setStyle({ weight: 5 }); // Highlight weight
                        const el = layer.getElement();
                        if (el) {
                            el.classList.remove("trail");
                            el.classList.add("trail-active");
                        }
                    }

                    // Open a popup at the clicked location
                    const isPaddleTrailBuffer = feature.properties['Paddle'] === "true";
                    const difficultyHtmlBuffer = isPaddleTrailBuffer ? '' : `<span class="difficulty d-flex ai-center ${feature.properties.Difficulty.toLowerCase().replace(
                                /\s+/g,
                                "-"
                            )}">${feature.properties.Difficulty}</span>`;

                    const popupContent = `
                        <h3 class="t-c-teal">${feature.properties.Name}</h3>
                        <div class="card-props t-c-teal">
                            <span class="distance d-flex ai-center">${JSON.stringify(
                                feature.properties.Distance
                            )} km</span>
                            ${difficultyHtmlBuffer}
                            <!--<span class="type d-flex ai-center ${feature.properties['Optimized Type'].toLowerCase().replace(/\s+/g, '-').replace(/"/g, '')}">${feature.properties['Optimized Type'].replace(/"/g, '')}</span>-->
                        </div>
                        <span class="link t-c-teal" data-name="${
                            feature.properties.Name
                        }" data-distance="${JSON.stringify(
                        feature.properties.Distance
                    )}" data-difficulty="${feature.properties.Difficulty}" data-access="${feature.properties.Access}" data-description="${
                        feature.properties.Description
                    }" data-elevation="${elevationArray}" data-imagery="${feature.properties.Images}" data-parkingname="${feature.properties.Parking.name}" data-parkingdescription="${feature.properties.Parking.description}" data-parkingcoords="${feature.properties.Parking.latLng}" data-area="${feature.properties['Trail Area']}" data-areaurl="${feature.properties['Trail Area URL']}" data-typehiking="${feature.properties['Hiking']}" data-typebiking="${feature.properties['Biking']}" data-typesnowmobile="${feature.properties['Snowmobile']}" data-typexcski="${feature.properties['XC Ski']}" data-typealpineski="${feature.properties['Alpine Ski']}" data-typesnowshoe="${feature.properties['Snowshoe']}" data-typewinterbike="${feature.properties['Winter Fatbike']}" data-typepaddle="${feature.properties['Paddle']}">More details</span>
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

                bufferLayersRef.current.push(bufferLayer);
            },
        }).addTo(map);

        geojsonLayerRef.current = geojsonLayer; // Store the GeoJSON layer in the ref

        // Add the Leaflet Search control
        const searchControl = new L.Control.Search({
            layer: geojsonLayer,
            propertyName: 'Name',
            initial: false,
            zoom: 16,
            marker: false,
            textPlaceholder: "Search by trail name",
            collapsed: false,
            moveToLocation: function (latlng, title, map) {
                map.setView(latlng, 16);
            },
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

        // Call the URL param functions
        selectTrailFromURL(map);
        selectParkingFromURL(map);

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

        /**
         * Open parking popup based on URL parameters
         * @param {*} map 
         */
        function selectParkingFromURL(map) {
            const params = new URLSearchParams(window.location.search);
            const parkingName = params.get("parking"); // URL Pattern: ?parking=<parking-name>

            if (parkingName) {
                const parkingMarker = parkingMarkers.find((marker) => {
                    return marker.parkingData && marker.parkingData.name === parkingName;
                });

                if (parkingMarker) {
                    addParkingMarkers();
                    map.setView(parkingMarker.getLatLng(), Math.max(map.getZoom(), 14), { animate: true, duration: 1 });
                    parkingMarker.openPopup();
                } else {
                    console.warn(`No parking lot found with the name: ${parkingName}`);
                }
            }
        }
    }, [trails, parkingData]);

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
            { value: "Paddle", label: "Paddle" },
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
            menuList: (provided) => ({
                ...provided,
                maxHeight: 'none',
            }),
          };

        const selectedDifficulty = useRef({ value: 'All' }); // State for difficulty dropdown
        const selectedActivity = useRef({ value: 'All' });// State for activity dropdown

        const filterGeoJsonLayer = () => {
            // console.log('DIFFICULTY:', selectedDifficulty.current.value);
            // console.log('ACTIVITY:', selectedActivity.current.value);
    
            geojsonLayerRef.current.clearLayers();

            // Remove old buffer layers
            bufferLayersRef.current.forEach((layer) => mapRef.current.removeLayer(layer));

            bufferLayersRef.current = [];

            // Filter features based on selected difficulty and activity
            const filteredFeatures = trails.features.filter((feature) => {
                // Check if this is a Paddle trail - they bypass difficulty filtering
                const isPaddleTrail = feature.properties['Paddle'] === "true";

                const matchesDifficulty = isPaddleTrail ||
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
          parkingcoords: "",
          area: "",
          areaurl: "",
          typehiking: "",
          typebiking: "",
          typesnowmobile: "",
          typexcski: "",
          typealpineski: "",
          typesnowshoe: "",
          typewinterbike: "",
          typepaddle: "",
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
              parkingcoords,
              area,
              areaurl,
              typehiking,
              typebiking,
              typesnowmobile,
              typexcski,
              typealpineski,
              typesnowshoe,
              typewinterbike,
              typepaddle,
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
              parkingcoords,
              area,
              areaurl,
              typehiking,
              typebiking,
              typesnowmobile,
              typexcski,
              typealpineski,
              typesnowshoe,
              typewinterbike,
              typepaddle,
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
                    <span className="type d-flex ai-center winterbike">Winter Fatbike</span>
                )}
                  {trailDetails.typepaddle === "true" && (
                      <span className="type d-flex ai-center paddle">Paddle</span>
                  )}
              </div>

              <div className="c-trail-props d-flex t-c-teal">
                <span className="distance d-flex ai-center">
                  {trailDetails.distance} km
                </span>
                {trailDetails.typepaddle !== "true" && (
                  <span
                    className={`difficulty d-flex ai-center ${trailDetails.difficulty
                      ?.toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {trailDetails.difficulty}
                  </span>
                )}
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
                        {trailDetails.parkingcoords && (() => {
                            const [lat, lng] = trailDetails.parkingcoords.split(',');
                            return (
                            <a 
                                className="link" 
                                href={`http://maps.google.com/maps?z=12&t=m&q=loc:${lat}+${lng}`} 
                                data-coord={`${lat},${lng}`} 
                                target="_blank"
                            >
                                Directions
                            </a>
                            );
                        })()}
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
                        href="https://www.tourismvernon.com/things-to-do/trails"
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

        const [isExpanded, setIsExpanded] = useState(false);

        const toggleReadMore = () => {
            setIsExpanded((prev) => !prev);
        };
    
        if (loading || accepted) return null;
    
        return (
            <div className={`c-disclaimer d-flex ${isVisible ? "show" : "hide"}`}>
                <img src={TCLogo} alt="Trails Capital Logo" />

                <div class={"c-disclaimer__internal"} aria-hidden={!isExpanded}>
                    <h3>Welcome to Greater Vernon, the official Trails Capital of BC.</h3>
                    <p>The existence and maintenance of Vernon’s impressive trail system is thanks to our incredible non-profit trail organizations: <a target="_blank" href="https://www.ribbonsofgreen.ca/">Ribbons of Green Trail Society</a>, the <a target="_blank" href="https://nocs.ca/">North Okanagan Cycling Society</a>, <a target="_blank" href="https://www.sovereignlake.com/">Sovereign Lake Nordic Club</a>, the <a target="_blank" href="https://www.vernonoutdoorsclub.org/">Vernon Outdoors Club</a>, and the <a target="_blank" href="https://okanaganrailtrail.ca/friends-of-the-trail/about-fort/">Friends of the Okanagan Rail Trail</a>. Thank you to these trail groups, as well as Predator Ridge Resort, SilverStar Mountain Resort, Destination Silver Star, BC Parks, the Regional District of North Okanagan, and the City of Vernon for their assistance in creating this map. This map is managed by <a target="_blank" href="https://www.tourismvernon.com/about-vernon/contact-us">Tourism Vernon</a> and includes trails in the jurisdiction of Greater Vernon (City of Vernon, District of Coldstream, Regional District Areas B&C).</p>
                    <div class="disclaimer-content">
                        <h3>Disclaimer</h3>
                        <p>
                            The following geographic data available from this web page is provided as a public
                            service by the City of Vernon (&#39;City&#39;) on the following terms.
                        </p>
                        <p>
                            1. The information and geographical data on this map are derived from multiple
                            sources. All rights, titles, and interest (including all copyrights, patents, and other
                            intellectual property rights) in this map and the information displayed therein
                            remain vested in the entity that is the source of the information.
                        </p>
                            <p>
                            2. The geographical data is supplied on an as is, where is basis. The City assumes
                            no obligation or liability for the use of this data by any person and makes no
                            representations or promises regarding the completeness or accuracy of the data
                            or its fitness for a particular purpose. This data represents a one-time capture of
                            information as it exists at the time the information is posted to this website and
                            the City makes no representation as to the accuracy of such information and
                            does not necessarily include the ongoing updates or corrections to the source
                            databases maintained by the City or other agencies.
                        </p>
                        <p>
                            3. Where a conflict between the information on this web site and information
                            contained in any other records of the City or documents that may be prepared by
                            or delivered to the City, the City reserves the right to rely in all cases upon the
                            record which it considers to be the most accurate and complete.
                        </p>
                        <p>
                            4. You hereby expressly waive any and all claims that you may have against the
                            City, and release from all liability and agree not to sue the City, its elected
                            officials, officers, employees and agents for any loss, damage, personal or bodily
                            injury or death sustained or suffered by you as a result of your use of the map
                            due to any cause whatsoever, including without limitation, negligence, fault or
                            breach of statutory duty and agree to indemnify the City against claims by third
                            parties arising from your use of the map. 
                            By continuing to the map, you confirm you have read, understood, and accepted the
                            terms of this disclaimer.
                        </p>
                    </div>
                </div>
                <button id={'read-more'} onClick={toggleReadMore}>{isExpanded ? "Read less" : "... Read more"}</button>
                <p><button onClick={acceptTerms}>Accept Disclaimer</button></p>
            </div>
        );
    };

    const Hero = () => {
        return (
            <div className={`c-hero`}>
                <h1 class="h3">Greater Vernon Trails Map</h1>
            </div>
        );
    };

    return (
        <div>
            <div
                id="map"
                style="width: 100%; height: 100%; top: 0; bottom: 0; position: absolute;"
            />
            <Hero />
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
