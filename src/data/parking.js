const parkingDataRaw = [
    {
        latLng: [50.27436363, -119.24115646],
        name: "Mutrie Dog Park",
    },
    {
        latLng: [50.35063805, -119.10789724],
        name: "Lower parking Lot to access the Sovereign Lake Bike Trails via the My Way or the Highway climb Trail._x000D_ Also some parking in the winter, but is limited depending on Snow plowing, plenty of parking at the Nordic Center in the Winter time.",
    },
    {
        latLng: [50.25047851, -119.281391279999],
        name: "Commonage Parking",
    },
    {
        latLng: [50.24098573, -119.33766967],
        name: "Marhsall Fields parking",
    },
    {
        latLng: [50.24941404, -119.34863475],
        name: "Kin Beach Park Parking",
    },
    {
        latLng: [50.26496165, -119.31563801],
        name: "<Null>",
    },
    {
        latLng: [50.18106702, -119.39891477],
        name: "Longspoon Drive Parking",
    },
    {
        latLng: [50.2372578, -119.3358383],
        name: "Apollo Road Parking",
    },
    {
        latLng: [50.36144381, -119.094747889999],
        name: "Snowmobile Parking Lot (Usually Locked). This upper snowmobile parking lot is generally locked in the summer. Can only be accessed by vehicle if someone has gotten the key from BC Parks.",
    },
    {
        latLng: [50.22108016, -119.28822445],
        name: " Kal Lookout Parking",
    },
    {
        latLng: [50.26473953, -119.27016557],
        name: "32 Ave and 30 Street Parking",
    },
    {
        latLng: [50.25053107, -119.274726329999],
        name: "DND Fields Parking",
    },
    {
        latLng: [50.2578409, -119.34503235],
        name: "Vineyard Way Parking",
    },
    {
        latLng: [50.29340422, -119.27233041],
        name: "<Null>",
    },
    {
        latLng: [50.24186418, -119.3345],
        name: "Marhsall Fields parking",
    },
    {
        latLng: [50.18653574, -119.34957355],
        name: "Bailey Road Parking",
    },
    {
        latLng: [50.23965362, -119.28997174],
        name: "Allan Brooks Nature Centre Parking",
    },
    {
        latLng: [50.22743046, -119.25466389],
        name: "Braeburn Place Pkg",
    },
    {
        latLng: [50.26507564, -119.22018162],
        name: "Gray Canal Parking. Parking Access from McLeish Rd. This Rd has been extend but is currently not shown on any Maps",
    },
    {
        latLng: [50.35457818, -119.09363891],
        name: "Upper BX Creek Parking",
    },
    {
        latLng: [50.24719278, -119.30719129],
        name: "Fulton Road Parking",
    },
    {
        latLng: [50.23749337, -119.26697374],
        name: "Kal Lake Road Multi-Use Path Parking",
    },
    {
        latLng: [50.17420728, -119.20330764],
        name: "Head up King Edward FSR and turn left twice to get onto CJ Express FSR, then the clearing for a parking lot will be on your left shortly after you pass through the cattle gate.",
    },
    {
        latLng: [50.35489257, -119.09740101],
        name: "Lower Sovereign Lake Parking Lot. A somewhat rugged/primitive parking area.",
    },
    {
        latLng: [50.25727688, -119.34475376],
        name: "Pinto Place Parking",
    },
    {
        latLng: [50.15154094, -119.37065328],
        name: "<Null>",
    },
    {
        latLng: [50.17758418, -119.43215515],
        name: "Biking and hiking parking ",
    },
    {
        latLng: [50.27169066, -119.22723412],
        name: "East Vernon Road",
    },
    {
        latLng: [50.19238172, -119.39741939],
        name: "Birdie Lake Parking",
    },
    {
        latLng: [50.22943284, -119.247839189999],
        name: "Middleton Way Neumann Connector Parking",
    },
    {
        latLng: [50.24030718, -119.202416029999],
        name: "Cypress Dr SE Parking",
    },
    {
        latLng: [50.33767972, -119.23048083],
        name: "Glenhayes Road Parking",
    },
    {
        latLng: [50.29880453, -119.23366922],
        name: "Cools Pond Parkk, Reimer Rd Parking",
    },
    {
        latLng: [50.27279856, -119.22181376],
        name: "Grey Canal: E Vernon-DeRoo Road Parking",
    },
    {
        latLng: [50.18288248, -119.3496616],
        name: "Bailey Road West - Kal Crystal Waters Parking",
    },
    {
        latLng: [50.30014308, -119.21679952],
        name: "Grey Canal Trail - Star Road to Blackcomb Way",
    },
    {
        latLng: [50.27027898, -119.29118547],
        name: "Turtle Mountain Parking South",
    },
    {
        latLng: [50.21601778, -119.267536539999],
        name: "Kidston Rd Parking Lot",
    },
    {
        latLng: [50.25188899, -119.27925896],
        name: "Jack Schratter Way parking",
    },
    {
        latLng: [50.33906705, -119.23934051],
        name: "Baker Hogg Road Parking",
    },
    {
        latLng: [50.24951855, -119.30400305],
        name: "Okanagan Ave Parking",
    },
    {
        latLng: [50.31198455, -119.18858527],
        name: "<Null>",
    },
    {
        latLng: [50.18777976, -119.39027991],
        name: "Please use this parking lot when parking at Predator Ridge._x000D_ DO NOT PARK IN RESIDENTIAL AREAS.",
    },
    {
        latLng: [50.1715152, -119.22206923],
        name: "Parking to access Tombstone.",
    },
    {
        latLng: [50.35841686, -119.06004559],
        name: "Main Parking Lot",
    },
    {
        latLng: [50.32030826, -119.23149887],
        name: "Mclennan Road Parking",
    },
    {
        latLng: [50.21143824, -119.27077552],
        name: "Red Gate Parking/Entrance ",
    },
    {
        latLng: [50.18060867, -119.20938421],
        name: "<Null>",
    },
    {
        latLng: [50.23374148, -119.24219321],
        name: "Middleton Way parking",
    },
    {
        latLng: [50.17806074, -119.44018469],
        name: "This parking lot is at the end of the Ellison campground and is frequently used by beach users who take the steep hike down to the beach. It is also located next to an open grassy area and playground for the campground. Most importantly for mountain bikers, it is at the bottom of Nature Trail, and can be used as an alternative to the more commonly used biker/hiker parking lot just off the road.",
    },
    {
        latLng: [50.26725882, -119.225803369999],
        name: "Welker Road",
    },
    {
        latLng: [50.26981078, -119.2774481],
        name: "Curling Club/Becker Park Parking",
    },
    {
        latLng: [50.1416604, -119.2700588],
        name: "Damer Lake Recreation Site Parking. Park here and ride Southwest down the road a couple hundred meters until you can veer off to the right onto the High Rim Trail.",
    },
    {
        latLng: [50.27028707, -119.29066195],
        name: "Turtle Mountain Parking N",
    },
    {
        latLng: [50.29802837, -119.231309569999],
        name: "Cools Pond Pk, L&A Rd Parking",
    },
    {
        latLng: [50.29604743, -119.28634296],
        name: "Blue Jay Parking",
    },
    {
        latLng: [50.23837917, -119.25473323],
        name: "Mt Ida N Middleton Mountain",
    },
    {
        latLng: [50.30010034, -119.22574036],
        name: "<Null>",
    },
    {
        latLng: [50.30904518, -119.22946788],
        name: "<Null>",
    },
    {
        latLng: [50.28719463, -119.25708957],
        name: "BX Creek Wetland: Deleenheer Road Parking",
    },
    {
        latLng: [50.23958109, -119.410946139999],
        name: "Tronson Road Parking",
    },
    {
        latLng: [50.20454062, -119.28060871],
        name: "<Null>",
    },
    {
        latLng: [50.20929417, -119.23262088],
        name: "Cosens Gate",
    },
    {
        latLng: [50.2357251, -119.28140659],
        name: "Okanagan College Parking",
    },
    {
        latLng: [50.23466917, -119.35867152],
        name: "Paddlewheel Park Parking",
    },
    {
        latLng: [50.23155157, -119.265237029999],
        name: "<Null>",
    },
    {
        latLng: [50.19437557, -119.39833458],
        name: "Predator Ridge requests that you use this parking lot when accessing the mountain biking and hiking trails.",
    },
    {
        latLng: [50.29322493, -119.21181609],
        name: "Grey Canal: E Vernon-Malim Rd Parking",
    },
    {
        latLng: [50.35798777, -119.056971],
        name: "<Null>",
    },
    {
        latLng: [50.19230236, -119.39514286],
        name: "Birdie Lake Parking",
    },
    {
        latLng: [50.2456741, -119.21100056],
        name: "Cypress Dr parking",
    },
    {
        latLng: [50.18906054, -119.26477438],
        name: "Cougar Canyon Parking Lot. A recently improved parking lot that is commonly used by climbers and hikers for access to Cougar Canyon.",
    },
    {
        latLng: [50.16543233, -119.20853194],
        name: "<Null>",
    },
    {
        latLng: [50.24824226, -119.34809987],
        name: "Canoe Beach Trail Parking",
    },
    {
        latLng: [50.25197562, -119.21494749],
        name: "Gray Canal Parking",
    },
    {
        latLng: [50.22866735, -119.28116992],
        name: "Okanagan Rail Trail Parking",
    },
    {
        latLng: [50.18115626, -119.342544649999],
        name: "Kekuli Bay Prov Park Parking",
    },
    {
        latLng: [50.18797892, -119.334253469999],
        name: "Highridge Road Parking",
    },
    {
        latLng: [50.35757357, -119.06325775],
        name: "<Null>",
    },
    {
        latLng: [50.21614157, -119.25689616],
        name: "Kidston Rd Parking Lot",
    },
    {
        latLng: [50.20386581, -119.2805426],
        name: "Main/Twin Bays Parking Lot",
    },
    {
        latLng: [50.27485173, -119.28176722],
        name: "Nel's Leap Parking",
    },
    {
        latLng: [50.22864077, -119.2558228],
        name: "Braeburn Place Pkg",
    },
    {
        latLng: [50.35797879, -119.06650817],
        name: "<Null>",
    },
    {
        latLng: [50.29726345, -119.21537316],
        name: "Star Rd Parking",
    },
    {
        latLng: [50.23107197, -119.35423144],
        name: "Bench Row Rd Parking",
    },
    {
        latLng: [50.33219604, -119.23209247],
        name: "Baker Hogg Water Plant Parking",
    },
    {
        latLng: [50.23395057, -119.25036502],
        name: "Mt Ida S Middleton Mountain Park",
    },
    {
        latLng: [50.32812656, -119.12010551],
        name: "Forsberg Road Parking",
    },
    {
        latLng: [50.23098737, -119.3232857],
        name: "Bench Row Road Parking",
    },
    {
        latLng: [50.27868931, -119.23485564],
        name: "BX Ranch Dog Park",
    },
    {
        latLng: [50.28504244, -119.25700716],
        name: "Heron Glen Park Parking",
    },
    {
        latLng: [50.26882298, -119.30107791],
        name: "Davison Road Parking",
    },
    {
        latLng: [50.24295658, -119.33096053],
        name: "Marhsall Fields parking",
    },
    {
        latLng: [50.35758251, -119.06628867],
        name: "<Null>",
    },
    {
        latLng: [50.31268319, -119.22933733],
        name: "Grey Canal Road Parking",
    },
    {
        latLng: [50.25964213, -119.26970992],
        name: "Polson Park Parking",
    },
    {
        latLng: [50.16791364, -119.23273048],
        name: "Parking at KM14 on CJ Express. Can be used to access Tombstone and Pali Gap (and other future trails to be developed in this area).",
    },
    {
        latLng: [50.16855552, -119.23050359],
        name: "Road got widened here. Room for at least 6 vehicles now.",
    },
    {
        latLng: [50.23063043, -119.24708639],
        name: "Mt Ida parking_x000D_",
    },
];

// markerData.js
const parkingData = parkingDataRaw.map((item) => ({
    latLng: item.latLng,
    popupContent: `
        <h3 class='t-c-teal'>Parking</h3>
        <a class='link--parking' href='' data-coord='${item.latLng}'>Directions</a>
    `,
}));

export default parkingData;
