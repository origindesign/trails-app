let trailsData = {};

// Function to fetch and populate trailsData
export const fetchTrailsData = async () => {
    try {
        const response = await fetch(
            "https://trails-app-tourismvernon.pantheonsite.io/trail-data/geojson"
        );
        // const response = await fetch("trail-data/geojson");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        trailsData = await response.json(); // Update trailsData with fetched GeoJSON
        console.log("Trails data fetched successfully:", trailsData);
        return trailsData; // Return the data before exporting
    } catch (error) {
        console.error("Error fetching trails data:", error);
        return null;
    }
};

export default trailsData;
