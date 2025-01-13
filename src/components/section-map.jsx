/* eslint-disable */

import { useEffect, useState, useRef } from "react";
import Select from "react-select";
import "leaflet-search/dist/leaflet-search.min.css";
import "leaflet-search";

import Logo from "./../assets/pin.png";

import parkingData from "./../data/parking";
import trailsData from "./../data/trails";

const SectionMap = ({}) => {
    const geojsonLayerRef = useRef(null); // Ref to store the GeoJSON layer

    let trails = trailsData // import data

    useEffect(() => {

        // Creating map options
        const mapOptions = {
            center: [50.27179, -119.276505],
            zoom: 11.4,
        };

        const JAWG_API_KEY =
            "UlhmB9TdxEsUaPuIVrKDpmk5oM2qRX3IsK3hdoLnBDgkztJS86cE1GxVofqZWZmu"; // custom map style here https://www.jawg.io/lab/

        const map = new L.map("map", mapOptions);
        const layer = new L.TileLayer(
            "https://{s}.tile.jawg.io/jawg-terrain/{z}/{x}/{y}.png?access-token=" +
                JAWG_API_KEY,
            {
                attribution: `
					<a href="https://www.jawg.io" target="_blank">© Jawg Maps</a>, 
					<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>`,
            }
        );
        map.addLayer(layer);

        L.control
            .zoom({
                position: "bottomright",
            })
            .addTo(map);

        const carParkIcon = L.icon({
            iconUrl: Logo,
            iconSize: [21, 31],
        });

        // Loop over marker data
        parkingData.forEach((marker) => {
            L.marker(marker.latLng, { icon: carParkIcon })
                .addTo(map)
                .bindPopup(marker.popupContent);
        });

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
                };
            },
            onEachFeature(feature, layer) {
                layer.bindPopup("");
                layer.on("popupopen", function (e) {
                    var popup = e.popup;
                    popup.setContent(`
						<h3 class="t-c-teal">${feature.properties.Name}</h3>
						<div class="card-props t-c-teal">
							<span class="distance">${JSON.stringify(feature.properties.Distance)} km</span>
							<span class="difficulty ${feature.properties.Difficulty.toLowerCase().replace(
                                /\s+/g,
                                "-"
                            )}">${feature.properties.Difficulty}</span>
						</div>
						<span class="link t-c-teal" data-name="${
                            feature.properties.Name
                        }" data-distance="${JSON.stringify(feature.properties.Distance)}" data-difficulty="${feature.properties.Difficulty}" data-description="${feature.properties.Description}">More details</span>
					`);
                });
            },
        }).addTo(map);

        geojsonLayerRef.current = geojsonLayer; // Store the GeoJSON layer in the ref

        // Add the Leaflet Search control
        const searchControl = new L.Control.Search({
            layer: geojsonLayer, // Layer to search in
            propertyName: "Name",
            initial: false, // Whether to show an initial marker
            zoom: 16, // Zoom level when an item is found
            marker: false, // Disable additional marker creation
            textPlaceholder: "Search by trail name", // Placeholder text
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
    
    }, []);

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
            <div className={"c-filter d-flex jc-flex-end"}>
                <div className={"c-filter__internal bg--white d-flex"}>
                    <Select
                        id="filter"
                        options={activityOptions}
                        defaultValue={activityOptions[0]}
                        className="filter-activity"
                        onChange={handleActivityChange}
                        styles={customStyles}
                    />
                    <Select
                        id="filter2"
                        options={difficultyOptions}
                        defaultValue={difficultyOptions[0]}
                        className="filter-difficulty"
                        onChange={handleDifficultyChange}
                        styles={customStyles}
                    />
                </div>
            </div>
        );
    };

    function TrailDetail() {
        // Define state variables for trail details
        const [trailDetails, setTrailDetails] = useState({
            name: "",
            distance: "",
            difficulty: "",
            description: "",
        });

        // Function to handle click events
        function handleClick(event) {
            if (event.target.matches(".link")) {
                const { name, distance, difficulty, description } =
                    event.target.dataset;

                setTrailDetails({
                    name,
                    distance,
                    difficulty,
                    description,
                });

                const detail = document.querySelector(".c-trail-detail");
                detail.classList.add("open");

                // console.log("open");
            }

            if (event.target.matches(".control--close")) {
                const detail = document.querySelector(".c-trail-detail");
                detail.classList.remove("open");
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

        return (
            <div className={"c-trail-detail bg--white d-flex"}>
                <div className={"c-trail-detail__internal d-flex"}>
                    <a class="control control--close">
                        Close trail detail modal
                    </a>
                    <h2 class="t-c-teal">{trailDetails.name}</h2>
                    {trailDetails.description && (
                        <p>{trailDetails.description}</p>
                    )}
                    <div className="c-trail-props t-c-teal">
                        <span className="distance">
                            {trailDetails.distance} km
                        </span>
                        <span
                            className={`difficulty ${trailDetails.difficulty
                                ?.toLowerCase()
                                .replace(/\s+/g, "-")}`}
                        >
                            {trailDetails.difficulty}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    function Loader() {
        useEffect(() => {
            var loader = document.querySelector(".c-loader");
            setTimeout(function () {
                loader.classList.add("hide");
            }, 1000);
            setTimeout(function () {
                loader.classList.add("visually-hidden");
            }, 2000);
        }, []);

        return (
            <div class="c-loader">
                <div class="c-loader__internal">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        );
    }

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
                    searchEl.classList.toggle("in");
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
            <div className={"c-controls d-flex"}>
                <div
                    id="controls-internal"
                    className={"c-controls__internal bg--white d-flex"}
                >
                    <a
                        class="control control--home"
                        href="https://www.tourismvernon.com"
                    >
                        Home
                    </a>
                    <a class="control control--search">Open search</a>
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
            <div className={"map-controls"}>
                <ControlsPrimary />
                <Filters />
            </div>
            <TrailDetail />
            <Loader />
        </div>
    );
};

export default SectionMap;
