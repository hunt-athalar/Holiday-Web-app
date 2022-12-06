"use strict"
/*
* Purpose: Contains all back end codes to selectPOI.html. This document will control the system from filtering the POIs and displaying the starting location
* to taking in the inputs and selections from users and displaying it back to the page.
* Author: Chow Khin Nyp, Sohail Singh, Lee Jia Jing
* Last Modified: 14-Oct-2021
*/


/** on function 
*  Overlay appears upon clicking confirm button that prompts user to enter name and date of planned vacation
*  turns on overlay
*/
function on() 
{
  if (allPlaces.length <2)
  {
    alert("Please add at least one POI!");
  }
  else
  {
    document.getElementById("overlay").style.display = "block";
  }
}

/** off function 
*  Overlay closes upon clicking confirm button that prompts user to enter name and date of planned vacation
*  turns off overlay
*/
function off() 
{
  document.getElementById("overlay").style.display = "currentPOINumberne";
}

// Adds dialog containing the inputs for name and date of planned vacation
let dialog = document.querySelector('dialog');
let showDialogButton = document.querySelector('#show-dialog');
if (!dialog.showModal) 
{
  dialogPolyfill.registerDialog(dialog);
}

dialog.showModal(); // opens dialog

// Closes overlay itself
dialog.querySelector('.close').addEventListener('click', function () 
{
  off();
});

// Sets the available range to the value selected in the first step
let newestList = bookinglist._list.length - 1; // global varianble that stores the booking list index of the newest vacation


// Adds a map for POI selection
mapboxgl.accessToken = MAPBOX_KEY;
let map = new mapboxgl.Map(
  {
  container: 'map2',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [101.60097, 3.06444],
  zoom: 13
});

/* Global variable currentPOINumber to store number of POIs planned
*  this will reflect on the page itself as a means to track the number of POIs added.
*/
let currentPOINumber; // stores the position of POI in the table
let startingLocationName = bookinglist._list[newestList].startingLocation; // global variable that stores the starting location name

// Temporary starting location array to store object to prevent local storage problem.
let tempStartObj = {
  startLocationCoords: [],
}

let markerArray = []; // stores all generated markers

// Creates a marker at the starting location previously selected
let markerStart = new mapboxgl.Marker({"color" : "red"})
let popup = new mapboxgl.Popup(
{
  offset: 30,
  closeOnClick: true, // closes popup when map is clicked
  closeOnMove: true // closes popup when map is moved
})

// Prints a popup when the marker is clicked, showing the address of starting location
  .setHTML(`<center><p>Starting Location: ${bookinglist._list[bookinglist._list.length - 1].startingLocation}</p></center>`);
markerStart.setPopup(popup);
markerArray.push(markerStart);

// Using the address selected from previous page, run a forward geocoding to convert it into coordinates
sendWebServiceRequestForForwardGeocoding(bookinglist._list[newestList].startingLocation, "showStart");

/** showStart function
 *  Callback function for starting location from starting location forward geocoding
 *  @param {object} data stores data from the API 
*/
let showStart = (data) => 
{
  console.log(data)
  let StartingLocationCoords = data.results[0].geometry; // extracts starting location from saved local storage
  // Move map to selected area
  map.panTo(StartingLocationCoords);
  // Add marker at coordinates
  markerStart.setLngLat(StartingLocationCoords);
  markerStart.addTo(map);
}

// Adding map controls and features
map.addControl(new mapboxgl.FullscreenControl());
map.addControl(new mapboxgl.NavigationControl());



let lngCurrentCoords;
let latCurrentCoords;

/** searchLocation function
*   Extracts and converts typed address into coordinates using open cage API.
*/
let searchLocation = () => 
{
  let input = document.getElementById("searchBox").value;
  sendWebServiceRequestForForwardGeocoding(input, `panToAreaOfInterest`);
  document.getElementById("areaSearch").value = "";
}

/** panToAreaOfInterest function
 *  Callback function from above function to pan to area of address
 *  @param {object} data stores data from the API 
*/
let panToAreaOfInterest = (data) => 
{
  // marker.remove(); // Remove all prior markers on map
  let coordinate = data.results[0].geometry;
  console.log(coordinate);
  map.panTo([coordinate.lng, coordinate.lat]);
  lngCurrentCoords = coordinate.lng;
  latCurrentCoords = coordinate.lat;
}

// Global variable to state all arrays of markers to be listed according to categories (food, gas, accomodation, attraction)
let POILocations = [];
let HotelMarkers = [];
let FuelMarkers = [];
let FoodMarkers = [];
let AttractionMarkers = [];
let poiName; // a temporary variable that stores the name of the selected POI

// Boolean states of POI filter 
let attractionsPOI = true;
let hotelPOI = true;
let foodPOI = true;
let fuelPOI = true;


let category; // variable that stores the current category of POI selected

/** Fuel function
 *  POI filter for Fuel
 *  Displays and hides Fuel POI markers on the map when the filter button is clicked
*/
function Fuel() 
{
  if (fuelPOI == true) 
  {
    sendXMLRequestForPlaces("gas station", lngCurrentCoords, latCurrentCoords, FuelPOIData);
    for (let i = 0; i < HotelMarkers.length; i++) 
    {
      HotelMarkers[i].remove();
    }
    for (let i = 0; i < FoodMarkers.length; i++) 
    {
      FoodMarkers[i].remove();
    }
    for (let i = 0; i < AttractionMarkers.length; i++) 
    {
      AttractionMarkers[i].remove();
    }
    attractionsPOI = true;
    hotelPOI = true;
    foodPOI = true;
    fuelPOI = false;
  }
  else 
  {
    for (let i = 0; i < FuelMarkers.length; i++) 
    {
      FuelMarkers[i].remove();
    }
    fuelPOI = true;
  }
}

/** FuelPOIData function
 *  Callback function that runs the logic for POI categories with the category "Fuel"
 *  @param {object} data stores data from the API 
*/
function FuelPOIData(data) 
{
  console.log(data);
  category = "Fuel";
  fuelDistArray = [];
  for (let i = 0; i < data.features.length; i++) 
  {
    POILocations[i] = data.features[i];
    FuelMarkers[i] = new mapboxgl.Marker({ "color": "yellow" });
    let POIcoordinates = data.features[i].geometry.coordinates;
    FuelMarkers[i].setLngLat(POIcoordinates);
    FuelMarkers[i].addTo(map);
    poiName = data.features[i].place_name;
    let popup = new mapboxgl.Popup()
      .setHTML(`<center><p>${data.features[i].place_name}</p><button onclick = "POIorderSelector(${i}, ${'category'},${'poiName'})">select POI</button></center>`);
    FuelMarkers[i].setPopup(popup);
    if (allPlaces.length > 1) 
    {
      poiLat = data.features[i].geometry.coordinates[1];
      poiLng = data.features[i].geometry.coordinates[0];
      fuelPOICalculateDist(poiLat, poiLng, CurrentMarkerCoordinates.lat, CurrentMarkerCoordinates.lng);
    }
  }
}


let poiLat;
let poiLng;
let fuelDist;
let fuelDistArray;

/** fuelPOICalculateDist function
 *  A haversine function that calculates distances between all shown fuel POI markers
 *  and the previous selected location marker 
 *  @param {object} lat1 latitude of the previous selected location marker
 *  @param {object} lon1 longitude of the previous selected location marker
 *  @param {object} lat2 latitude of the next fuel POI shown on map
 *  @param {object} lon2 longitude of the next fuel POI shown on map
*/
function fuelPOICalculateDist(lat1, lon1, lat2, lon2) 
{
  let delta_lat = Math.abs(lat1 - lat2);
  let delta_long = Math.abs(lon1 - lon2);

  let a = Math.sin(delta_lat / 2 * Math.PI / 180) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(delta_long / 2 * Math.PI / 180) ** 2;

  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let R = 6371;
  fuelDist = R * c;
  console.log(fuelDist);
  fuelDistArray.push(fuelDist);
}


/** Food function
 *  POI filter for Food
 *  Displays and hides Food POI markers on the map when the filter button is clicked
*/
function Food() 
{
  if (foodPOI == true) 
  {
    sendXMLRequestForPlaces("Food", lngCurrentCoords, latCurrentCoords, FoodPOIData);
    for (let i = 0; i < AttractionMarkers.length; i++) 
    {
      AttractionMarkers[i].remove();
    }
    for (let i = 0; i < HotelMarkers.length; i++) 
    {
      HotelMarkers[i].remove();
    }
    for (let i = 0; i < FuelMarkers.length; i++) 
    {
      FuelMarkers[i].remove();
    }
    attractionsPOI = true;
    hotelPOI = true;
    foodPOI = false;
    fuelPOI = true;
  }
  else 
  {
    for (let i = 0; i < FoodMarkers.length; i++) 
    {
      FoodMarkers[i].remove();
    }
    foodPOI = true;
  }
}

/** FoodPOIData function
 *  Callback function that runs the logic for POI categories with the category "Food"
 *  @param {object} data stores data from the API 
*/
function FoodPOIData(data) 
{
  console.log(data);
  category = "Food";
  for (let i = 0; i < data.features.length; i++) 
  {
    POILocations[i] = data.features[i];
    FoodMarkers[i] = new mapboxgl.Marker({ "color": "blue" });
    let POIcoordinates = data.features[i].geometry.coordinates;
    FoodMarkers[i].setLngLat(POIcoordinates);
    FoodMarkers[i].addTo(map);
    poiName = data.features[i].place_name
    let popup = new mapboxgl.Popup()
      .setHTML(`<center><p>${data.features[i].place_name}</p><button onclick = "POIorderSelector(${i}, ${'category'},${'poiName'})">select POI</button></center>`);
    FoodMarkers[i].setPopup(popup);
  }
}

/** Hotel function
 *  POI filter for Hotel
 *  Displays and hides Hotel POI markers on the map when the filter button is clicked
*/
function Hotel() 
{
  if (hotelPOI == true) 
  {
    sendXMLRequestForPlaces("hotel", lngCurrentCoords, latCurrentCoords, HotelPOIData);
    for (let i = 0; i < AttractionMarkers.length; i++) 
    {
      AttractionMarkers[i].remove();
    }
    for (let i = 0; i < FoodMarkers.length; i++) 
    {
      FoodMarkers[i].remove();
    }
    for (let i = 0; i < FuelMarkers.length; i++) 
    {
      FuelMarkers[i].remove();
    }
    attractionsPOI = true;
    hotelPOI = false;
    foodPOI = true;
    fuelPOI = true;
  }
  else 
  {
    for (let i = 0; i < HotelMarkers.length; i++) 
    {
      HotelMarkers[i].remove();
    }
    hotelPOI = true;
  }
}

/** HotelPOIData function
 *  Callback function that runs the logic for POI categories with the category "Hotel"
 *  @param {object} data stores data from the API 
*/
function HotelPOIData(data) 
{
  console.log(data);
  category = "Hotel"
  for (let i = 0; i < data.features.length; i++) 
  {
    POILocations[i] = data.features[i];
    HotelMarkers[i] = new mapboxgl.Marker({ "color": "#violet" });
    let POIcoordinates = data.features[i].geometry.coordinates;
    HotelMarkers[i].setLngLat(POIcoordinates);
    HotelMarkers[i].addTo(map);
    poiName = data.features[i].place_name;
    let popup = new mapboxgl.Popup()
      .setHTML(`<center><p>${data.features[i].place_name}</p><button onclick = "POIorderSelector(${i}, ${'category'},${'poiName'})">select POI</button></center>`);
    HotelMarkers[i].setPopup(popup);
  }
}


/** Attraction function
 *  POI filter for Attraction
 *  Displays and hides Attraction POI markers on the map when the filter button is clicked
*/
function Attractions() 
{
  if (attractionsPOI == true) 
  {
    sendXMLRequestForPlaces("tourism", lngCurrentCoords, latCurrentCoords, AttractionsPOIData);
    for (let i = 0; i < HotelMarkers.length; i++) 
    {
      HotelMarkers[i].remove();
    }
    for (let i = 0; i < FoodMarkers.length; i++) 
    {
      FoodMarkers[i].remove();
    }
    for (let i = 0; i < FuelMarkers.length; i++) 
    {
      FuelMarkers[i].remove();
    }
    attractionsPOI = false;
    hotelPOI = true;
    foodPOI = true;
    fuelPOI = true;
  }
  else 
  {
    for (let i = 0; i < AttractionMarkers.length; i++) 
    {
      AttractionMarkers[i].remove();
    }
    attractionsPOI = true;
  }
}

/** AttractionsPOIData function
 *  Callback function that runs the logic for POI categories with the category "Attraction"
 *  @param {object} data stores data from the API 
*/
function AttractionsPOIData(data) 
{
  category = "Attractions";
  for (let i = 0; i < data.features.length; i++) 
  {
    POILocations[i] = data.features[i];
    AttractionMarkers[i] = new mapboxgl.Marker({ "color": "aquamarine" });
    let POIcoordinates = data.features[i].geometry.coordinates;
    AttractionMarkers[i].setLngLat(POIcoordinates);
    AttractionMarkers[i].addTo(map);
    poiName = data.features[i].place_name;
    let popup = new mapboxgl.Popup()
      .setHTML(`<center><p>${data.features[i].place_name}</p><button onclick = "POIorderSelector(${i}, ${'category'},${'poiName'})">select POI</button></center>`);
    AttractionMarkers[i].setPopup(popup);
  }
}

let allPlaces = []; // a global array that contains all details of starting locations and subsequent POIs
let untouchedAllPlaces = []; // retains the number of POIs even if an adjacent marker is removed


// Setting starting locations
sendWebServiceRequestForForwardGeocoding(bookinglist._list[newestList].startingLocation, "getStartCoords")

/** getStartCoords function
 *  Callback function that gets the coordinates of the starting location
 *  @param {object} data stores data from the API 
*/
let getStartCoords = (data) => 
{
  console.log(data)
  let coordinatesStart = {
    lat: data.results[0].geometry.lat,
    lng: data.results[0].geometry.lng
  };

  let allPlacesObject = 
  {
    name: "",
    type: "",
    coordinates: 
    {
      lng: 0,
      lat: 0
    }
  }

  allPlacesObject.name = startingLocationName;
  allPlacesObject.type = "Starting Location";
  allPlacesObject.coordinates.lng = coordinatesStart.lng;
  allPlacesObject.coordinates.lat = coordinatesStart.lat;
  allPlaces.push(allPlacesObject);
  untouchedAllPlaces.push(allPlacesObject);

  // Get POIs based on latest selected Locations
  lngCurrentCoords = coordinatesStart.lng;
  latCurrentCoords = coordinatesStart.lat;
}

let CurrentPOICoordinates;
let CurrentMarkerCoordinates;
let untouchedMarkerArray = [];
let iter;
let number;

// Route display
let startLat;
let startLng;
let endLat;
let endLng;
let marker;
let totalDistanceDisplay = document.getElementById("totalDistanceTravelled"); // reference to the display container displaying the total distance travelled

/** POIorderSelector function
 *  Saves the information of selected POIs into the relevant arrays 
 *  @param {object} index the current index of the POI
 *  @param {object} category the current category of the POI
 *  @param {object} poiName the current name of the POI
*/
function POIorderSelector(index, category, poiName) 
{
  if (category == "Fuel") 
  {
    CurrentPOICoordinates = FuelMarkers[index].getLngLat();
  }
  if (category == "Food") 
  {
    CurrentPOICoordinates = FoodMarkers[index].getLngLat();
  }
  if (category == "Hotel") 
  {
    CurrentPOICoordinates = HotelMarkers[index].getLngLat();
  }
  if (category == "Attractions") 
  {
    CurrentPOICoordinates = AttractionMarkers[index].getLngLat();
  }
  iter = untouchedMarkerArray.length;
  number = untouchedAllPlaces.length;

  CurrentMarkerCoordinates = CurrentPOICoordinates;

  let allPlacesObject = 
  {
    name: "",
    type: "",
    coordinates: 
    {
      lng: 0,
      lat: 0
    }
  }

  allPlacesObject.name = poiName;
  allPlacesObject.type = category;
  allPlacesObject.coordinates.lng = CurrentMarkerCoordinates.lng,
  allPlacesObject.coordinates.lat = CurrentMarkerCoordinates.lat;
  allPlaces.push(allPlacesObject);
  untouchedAllPlaces.push(allPlacesObject);

  startLat = allPlaces[allPlaces.length - 2].coordinates.lat;
  startLng = allPlaces[allPlaces.length - 2].coordinates.lng;
  endLat = allPlaces[allPlaces.length - 1].coordinates.lat;
  endLng = allPlaces[allPlaces.length - 1].coordinates.lng;
  distanceCalc(startLat, startLng, endLat, endLng);

  if (routeFeasibility == true) 
  {
    if (category == "Fuel") 
    {
      FuelMarkers[index].remove();
      marker = new mapboxgl.Marker({ "color": "red" });
    }
    if (category == "Food") 
    {
      FoodMarkers[index].remove();
      marker = new mapboxgl.Marker({ "color": "red" });
    }
    if (category == "Hotel") 
    {
      HotelMarkers[index].remove();
      marker = new mapboxgl.Marker({ "color": "red" });
    }
    if (category == "Attractions") 
    {
      AttractionMarkers[index].remove();
      marker = new mapboxgl.Marker({ "color": "red" });
    }

    marker.setLngLat(CurrentPOICoordinates);
    marker.addTo(map);
    untouchedMarkerArray.push(marker);
    let popup = new mapboxgl.Popup()
      .setHTML(`<center><p>${poiName}</p><button onclick = "removeMarker(${iter},${number})" > remove POI </button></center>`);
    marker.setPopup(popup);
    markerArray.push(marker);

    updateCurrentLocation(CurrentMarkerCoordinates);
    updateTable();
    updateTotalDistance();
    processXML();
  }
  else 
  {
    
    alert("Route is unfeasible! Please add a nearby gas station to continue your journey!");
  
    updateCurrentLocation(allPlaces[allPlaces.length - 1].coordinates);
    routeFeasibility = true;
  }
}


let distance; // variable that stores the disance between 

/** distanceCalc function
 *  A haversine function that calculates the distances between 2 POI markers 
 *  @param {object} lat1 latitude of the previous selected location marker
 *  @param {object} lon1 longitude of the previous selected location marker
 *  @param {object} lat2 latitude of the next selected location POI shown on map
 *  @param {object} lon2 longitude of the next selected location POI shown on map
*/
function distanceCalc(lat1, lon1, lat2, lon2) 
{
  let delta_lat = Math.abs(lat1 - lat2);
  let delta_long = Math.abs(lon1 - lon2);

  let a = Math.sin(delta_lat / 2 * Math.PI / 180) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(delta_long / 2 * Math.PI / 180) ** 2;

  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let R = 6371;
  distance = R * c;

  if (removalProcess == false)
  {
    rangeCalcs(distance);
  }
  else
  {

  }
}

// Initializing the range calculation variables
let rangeUpdate = document.getElementById("rangeUpdate");
let vehicleRangeInitial = bookinglist._list[newestList].range.toFixed(2);
rangeUpdate.innerText = vehicleRangeInitial;


let vehicleRange = vehicleRangeInitial;
let distanceArray = []; // stores all temporary distance array that resets to zero after every iteration of calculation
let rangeArray = [Number(vehicleRangeInitial)];

// True: POIs can be added as currentPOINumberrmal (route is still feasible)
let routeFeasibility = true;

/** rangeCalcs function
 *  This function runs the calculations for distances between POIs 
 *  @param {object} distance the distance between 2 POI markers
*/
function rangeCalcs(distance) 
{
  distanceArray.push(distance);
  vehicleRange = vehicleRange - distance;
  rangeUpdate.innerText = vehicleRange.toFixed(2);
  if (category == "Fuel" && vehicleRange >= 0) 
  {
    vehicleRange = Number(vehicleRangeInitial);
    rangeUpdate.innerText = vehicleRange;
  }
  rangeArray.push(vehicleRange)
  if (vehicleRange <= 0) 
  {
    routeFeasibility = false;

    allPlaces.splice(allPlaces.length - 1, 1);

    distanceArray.splice(distanceArray.length - 1, 1);
    
    rangeArray.splice(rangeArray.length-1,1);

    vehicleRange = rangeArray[rangeArray.length-1];

    rangeUpdate.innerText = vehicleRange;

  } 
}

/** updateCurrentLocation function
 *  This function updates the newly added markers on the map and pans to the 
 * location of that added marker
 *  @param {object} Coordinates the coordinates of the newly added marker
*/
function updateCurrentLocation(Coordinates)
{
  for (let i = 0; i < HotelMarkers.length; i++) 
  {
    HotelMarkers[i].remove();
  }
  for (let i = 0; i < FoodMarkers.length; i++) 
  {
    FoodMarkers[i].remove();
  }
  for (let i = 0; i < AttractionMarkers.length; i++) 
  {
    AttractionMarkers[i].remove();
  }
  for (let i = 0; i < FuelMarkers.length; i++)
  {
    FuelMarkers[i].remove();
  }
  attractionsPOI = true;
  hotelPOI = true;
  foodPOI = true;
  fuelPOI = true;
  lngCurrentCoords = Coordinates.lng;
  latCurrentCoords = Coordinates.lat;
  HotelMarkers = [];
  FoodMarkers = [];
  AttractionMarkers = [];
  FuelMarkers = [];
  map.panTo(Coordinates);
}

/** processXML function
 *  This function processes two coordinates and sends the xml data to be stored in makeCoordArray
*/
function processXML()
{
  startLat = allPlaces[allPlaces.length - 2].coordinates.lat;
  startLng = allPlaces[allPlaces.length - 2].coordinates.lng;
  endLat = allPlaces[allPlaces.length - 1].coordinates.lat;
  endLng = allPlaces[allPlaces.length - 1].coordinates.lng;
  sendXMLRequestForRoute(startLat, startLng, endLat, endLng, makeCoordArray);
}

let coordArray = []; // the array that stores the coordinates from the penultimate POI to the latest added POI 
let routeLineArray = []; // the array that stores the long list of coordinates to draw the array
let journeyArray = []; // contains the sendXMLRequestForRoute coordinates within an array in a larger array 

let removalProcess = false;

let tempRangeArray = [];

let distanceTravelled = [];

/** makeCoordArray function
 *  Callback function that creates an array that stores all the coordinates required to form
 *  the route lines on the map
 *  @param {object} data stores the information from the API
*/
function makeCoordArray(data) 
{
  // Adding POI
  if (removalProcess == false) 
  { 
    // console.log(data)
    coordArray = data.routes[0].geometry.coordinates
    for (let i = 0; i < coordArray.length; i++) 
    {
      routeLineArray.push(coordArray[i]);
    }
    journeyArray.push([coordArray]);
    createRoute(routeLineArray);
  }

  // Removing POI
  else 
  {
  console.log(index)
    coordArray = data.routes[0].geometry.coordinates
    for (let i = 0; i < coordArray.length; i++) 
    {
      newRouteLineArray.push(coordArray[i]);
    }
    journeyArray.splice(beforeCoordsIndex, ROUTEREMOVE);
    journeyArray.splice(beforeCoordsIndex, 0, [coordArray]);
    newRouteLineArray = [];
    for (let i = 0; i < journeyArray.length; i++) 
    {
      tempArray = journeyArray[i][0];

      for (let j = 0; j < tempArray.length; j++) 
      {
        newRouteLineArray.push(tempArray[j]);
      }
    }
    routeLineArray = newRouteLineArray;
    allPlaces.splice(index,1);
    markerArray.splice(index,1);
    newRouteLineArray = [];
    CurrentMarkerCoordinates = allPlaces[allPlaces.length - 1].coordinates;
     
    distanceArray.splice(beforeCoordsIndex,ROUTEREMOVE);
    distanceCalc(startLat, startLng, endLat, endLng);
    distanceArray.splice(beforeCoordsIndex,0,distance);
    for (let i = 0; i<index; i++)
    {
      tempRangeArray[i] = rangeArray[i];
    }
    rangeArray = tempRangeArray;
    for (let i = index; i<allPlaces.length; i++)
    { 
      if (allPlaces[i].type == "Fuel")
      {
        rangeArray[i] = Number(vehicleRangeInitial);
      }
      else
      {
        rangeArray[i] = rangeArray[i-1] - distanceArray[i-1];
      }
    }
    vehicleRange = rangeArray[rangeArray.length-1];
    rangeUpdate.innerText = vehicleRange;
    tempRangeArray = [];

    removalProcess = false;
    updateCurrentLocation(CurrentMarkerCoordinates);
    updateTable();
    createRoute(routeLineArray);
  
  updateTotalDistance();
  } 
}

let layer; // a global variable that stores the details of the layer
let layerPresent // a global variable that checks if a layer is present on the map
let layerObject; // a global variable that stores the data of the layer


/** createRoute function
 *  Callback function that creates an array that stores all the coordinates required to form
 *  the route lines on the map
 *  @param {object} routeLineArray stores the information from the API
*/
function createRoute(routeLineArray) 
{
  if (layerPresent == true) 
  {
    map.removeLayer("routes");
    map.removeSource("routes");
    layerPresent = false;
  }
  layerObject = 
  {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: routeLineArray
      }
    }
  }
  layer = (
    {
      id: "routes",
      type: "line",
      source: layerObject,
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "green",
        "line-width": 5
      }
    }
  )
  map.addLayer(layer);
  layerPresent = true;
}


// Gets POI added coords when remove button of that POI is clicked
let currentXML;
let checkXML;
let index; // index of marker removed 

let newRouteLineArray = [];
let beforeCoordsIndex; // Global variable which stores the index of the marker before the deleted marker
let afterCoordsIndex; // Global variable which stores the index of the marker after the deleted marker

const ROUTEREMOVE = 2; // Number of routes to remove when a marker to be removed is situated between 2 POIs
let tempArray = []; // Contains the selected index of the XML coordinates within the journey array

/** removeMarker function
 *  Removes the marker from the map
 *  @param {object} iter the iteration of the marker
 *  @param {object} number the POI
*/
function removeMarker(iter, number) 
{
  if (confirm("Are you sure that you want to remove this POI from your route")) 
  {
    currentXML = untouchedAllPlaces[number];
    checkXML = (element) => element == currentXML;
    index = allPlaces.findIndex(checkXML);
    beforeCoordsIndex = index - 1;
    afterCoordsIndex = index + 1;

    // Scenario 1 : Removes the latest added poi
    if (index == allPlaces.length - 1) 
    { 
      untouchedMarkerArray[iter].remove();
      journeyArray.splice(index - 1, 1);
      for (let i = 0; i < journeyArray.length; i++) 
      {
        tempArray = journeyArray[i][0];
        for (let j = 0; j < tempArray.length; j++) 
        {
          newRouteLineArray.push(tempArray[j]);
        }
      }
      // Counts the cumulative number of coordinates inside the journeyArray
      routeLineArray = newRouteLineArray;
      tempArray = [];
      newRouteLineArray = [];
      distanceArray.splice(beforeCoordsIndex, 1);
      rangeArray.splice(index,1);
      vehicleRange = rangeArray[rangeArray.length-1];
      rangeUpdate.innerText = vehicleRange;
      allPlaces.splice(index, 1);
      markerArray.splice(index,1);
      CurrentMarkerCoordinates = allPlaces[allPlaces.length - 1].coordinates;
      updateCurrentLocation(CurrentMarkerCoordinates)
      updateTable();
      createRoute(routeLineArray);
    }

    // Scenario 2: Removing the middle POIs
    else 
    {  

      if(allPlaces[index].type == "Fuel")
      {  
        alert("You can't remove this Fuel POI from your route as you will  be unable to reach other POIs");
      }
      else
      {
      untouchedMarkerArray[iter].remove();
      startLat = allPlaces[beforeCoordsIndex].coordinates.lat;
      startLng = allPlaces[beforeCoordsIndex].coordinates.lng;
      endLat = allPlaces[afterCoordsIndex].coordinates.lat;
      endLng = allPlaces[afterCoordsIndex].coordinates.lng;
      removalProcess = true;
      sendXMLRequestForRoute(startLat, startLng, endLat, endLng, makeCoordArray);
      }
    }
  }
  updateTotalDistance();
} 

let tempDistanceArray = []; // A sum of all distances in the distanceArray

/** updateTotalDistance function
 *  Updates the total distance display
*/
function updateTotalDistance() 
{
  totalDist = 0;
  tempDistanceArray = [];

  for (let i = 0; i < distanceArray.length; i++) 
  {
    totalDistanceDisplay.innerHTML = 0;
    tempDistanceArray[i] = distanceArray[i];
    totalDist += tempDistanceArray[i];
    totalDistanceDisplay.innerHTML = totalDist;
  }
  totalDistanceDisplay.innerHTML = totalDist.toFixed(2); // updates the display of the total distance 
}

let popup1;
let popup2;
let tempPlace;

let coordArray1;
let coordArray2;
let coordArray3;

let indexSwap;

let afterIndexSwap;
let beforeIndexSwap;

let xmlUntil2 = false;

/** swapPOI function
 *  Runs the logic to swap POIs 
 *  @param {object} iter the iteration of the marker
*/
function swapPOI (iter)
{
  indexSwap = iter;
  beforeIndexSwap = indexSwap - 1;
  afterIndexSwap = indexSwap + 1;

  if (allPlaces[indexSwap+1] != undefined)
  {
    tempPlace = allPlaces[indexSwap];
    allPlaces[indexSwap] = allPlaces[afterIndexSwap];
    allPlaces[afterIndexSwap] = tempPlace;
    console.log(allPlaces);

    if(allPlaces.length-1 ==2)
    {
      journeyArray.splice(beforeIndexSwap,2)
      xmlUntil2 = true;
    }
    if (allPlaces.length-1 >2)
    {
      if (allPlaces[indexSwap+2] == undefined)
      {
        journeyArray.splice(beforeIndexSwap,2);
        xmlUntil2 = true;
      }
      else((allPlaces[indexSwap+2] != undefined))
      {
        journeyArray.splice(beforeIndexSwap,3);
      }
    }  
    swapXML1();
    updateTable();
  }
}


/** swapXML1 function
 *  Gets the first new route line between the newly swapped POI and the POI before that 
*/
function swapXML1()
{ 
  startLat = allPlaces[indexSwap-1].coordinates.lat;
  startLng = allPlaces[indexSwap-1].coordinates.lng;
  endLat = allPlaces[indexSwap].coordinates.lat;
  endLng = allPlaces[indexSwap].coordinates.lng;
  sendXMLRequestForRoute(startLat, startLng, endLat, endLng, swapXML2);
}


/** swapXML2 function
 *  Gets the first new route line between the newly swapped POI and the POI after that 
 *  @param {object} data1 the data from the API from callback function in swapXML1
*/
function swapXML2(data1)
{
  coordArray1 = data1.routes[0].geometry.coordinates;
  journeyArray.splice(beforeIndexSwap,0,[coordArray1]);
  startLat = allPlaces[indexSwap].coordinates.lat;
  startLng = allPlaces[indexSwap].coordinates.lng;
  endLat = allPlaces[indexSwap+1].coordinates.lat;
  endLng = allPlaces[indexSwap+1].coordinates.lng;
  sendXMLRequestForRoute(startLat, startLng, endLat, endLng, swapXML3);
}

/** swapXML3 function
 *  Gets the first new route line between the POI after the swapped one POI and the one after 
 *  @param {object} data2 the data from the API from callback function in swapXML2
*/
function swapXML3(data2)
{
  console.log(data2)
  coordArray2 = data2.routes[0].geometry.coordinates;
  journeyArray.splice(indexSwap,0,[coordArray2]);
  if (xmlUntil2 == false)
  {
    startLat = allPlaces[indexSwap+1].coordinates.lat;
    startLng = allPlaces[indexSwap+1].coordinates.lng;
    endLat = allPlaces[indexSwap+2].coordinates.lat;
    endLng = allPlaces[indexSwap+2].coordinates.lng;
    sendXMLRequestForRoute(startLat, startLng, endLat, endLng,compileData);
  }
  else
  {
    tempArray = [];
    newRouteLineArray = [];
  
    for (let i = 0; i < journeyArray.length; i++) 
      {
        tempArray = journeyArray[i][0];
  
        for (let j = 0; j < tempArray.length; j++) 
        {
          newRouteLineArray.push(tempArray[j]);
        }
      }
    xmlUntil2 = false;
    routeLineArray = newRouteLineArray;
    createRoute(routeLineArray);
  }
}

/** compileData function
 *  The newly formed journey array which contains data from swapXML1 to swapXML3 will then 
 *  be saved in the route line array 
 *  createRoute function  is callbacked which forms the new layer of route lines
 *  @param {object} data3 the data from the API from callback function in swapXML3
*/
function compileData (data3)
{ 
  coordArray3 = data3.routes[0].geometry.coordinates;
  journeyArray.splice(afterIndexSwap,0,[coordArray3]);
  tempArray = [];
  newRouteLineArray = [];
  for (let i = 0; i < journeyArray.length; i++) 
    {
      tempArray = journeyArray[i][0];

      for (let j = 0; j < tempArray.length; j++) 
      {
        newRouteLineArray.push(tempArray[j]);
      }
    }
  routeLineArray = newRouteLineArray;
  createRoute(routeLineArray);
}

/** updateTable function
 *  Updates the POI table everytime new POIs are added, swapped or remove
*/
function updateTable() 
{
  // Update the POI table
  let poiTableRef = document.getElementById("poiTableBody");
  currentPOINumber = 1;  
  poiTableRef.innerHTML = "";
  if (allPlaces.length > 1) 
  {
    for (let i = 1; i < allPlaces.length; i++) 
    {
      let list =
        `
        <tr>
         <td>${currentPOINumber}.</td>
         <td>${allPlaces[i].name}</td>
         <td><center>${(distanceArray[i-1]).toFixed(2)}</center></td>
         <td><button id="swapDown"+${i} onclick = "swapPOI(${i})" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect"><i class="material-icons">expand_more</i></button></td>
        </tr><hr>`;

      list +=
        `</table>`;

      // Adding the information to the table
      poiTableRef.innerHTML += list;
      currentPOINumber++;
    }
  }
}

let totalDist = 0; // Stores the total distance travelled



/** saveVacationDetailsToLS function
  *  Saves all the planned vacation details to the Local Storage and redirects the user
  * to the vacation details page
*/
function saveVacationDetailsToLS() 
{
  let vacationNameRef = document.getElementById("vacationName");
  let vacationDateRef = document.getElementById("vacationDate");
  let vacationNameInput = vacationNameRef.value;
  let vacationDateInput = vacationDateRef.value;
  bookinglist.addVacationDetails(vacationNameInput, vacationDateInput, newestList, totalDist.toFixed(2), routeLineArray);

  for (let i = 0; i < allPlaces.length; i++) 
  {
    let nameOfPOI = allPlaces[i].name;
    let lng = allPlaces[i].coordinates.lng;
    let lat = allPlaces[i].coordinates.lat;
    let type = allPlaces[i].type;
    let newPOI = new PointOfInterest(nameOfPOI, [lng, lat], type);
    bookinglist.addPOI(newPOI, newestList);
  }
  
  if (vacationNameInput!="" && vacationDateInput!="" && allPlaces.length > 1)
  {
      updateLSData(BOOKINGLIST_KEY, bookinglist);
      window.location = "vacationDetails.html";
      let list = bookinglist.fromData(retrieveLSData(BOOKINGLIST_KEY));
      localStorage.setItem(VACATION_KEY, list.length - 1);
  }
  else 
  {
      alert("Please input a vacation name and select a vacation date!");
  }
  
}

/** cancelBooking function
 *  Cancels the current planned vacation and redirects the uer back to the main pages
*/
function cancelBooking() 
{
  let getLSItem = localStorage.getItem(BOOKINGLIST_KEY);
  let editItem = JSON.parse(getLSItem);
  editItem._list.pop();
  updateLSData(BOOKINGLIST_KEY, editItem);
  window.location = "splashPage.html";
}