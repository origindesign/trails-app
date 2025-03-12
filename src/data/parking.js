let parkingData = {};

// Function to fetch and populate parkingData
export const fetchParkingData = async () => {
    try {
        // const response = await fetch(
        //     "https://trails-app-tourismvernon.pantheonsite.io/trail-parking-data/data"
        // );
        const response = await fetch(
            "https://tov.lndo.site/trail-parking-data/data"
        );
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        parkingData = await response.json(); // Update parkingData with fetched GeoJSON
        console.log("Parking data fetched successfully:", parkingData);
        return parkingData; // Return the data before exporting
    } catch (error) {
        console.error("Error fetching parking data:", error);
        return null;
    }
};

export default parkingData;
