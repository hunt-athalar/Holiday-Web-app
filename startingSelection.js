"use strict"
/*
* Purpose: Contains all back end code to startingSelection.html. This document takes in the input from users (address, current location, car selection)
* and display it back on the page whilst saving all the necessary datas in local storage to be used and reflected in other pages.
* Author: Lee Jia Jing, Chow Khin Nyp
* Last Modified: 14-Oct-2021
*/
// This variable stores the current vacationIndex 
let currentVacationIndex = bookinglist._list.length;

// Information on vehicle details 
let vehicleDetails = 
{
    Sedan: 1000,
    SUV: 850,
    Van: 600,
    Minibus: 450
}

let markerFromSearch = []; // stores markers placed down by the searchbox method
let markerFromMapClick = []; // stores markers placed down by the mapclick method

mapboxgl.accessToken = MAPBOX_KEY;
const map = new mapboxgl.Map(
{
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [101.60097, 3.06444],
    zoom: 13
});

// Makes the marker draggable
let marker = new mapboxgl.Marker({draggable: true})
// Creates a popup for the marker
let popup = new mapboxgl.Popup(
{
    offset: 30,
    closeOnClick: true, // closes popup when map is clicked
    closeOnMove: true // closes popup when map is moved
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

/** searchLocation function
 * Extracts address from searchbox and sends it for forward geocoding
 * @param {object} input contains the address/keywords typed in the searchbox
 * @param {object} panToLocation serves as the callback function to the forward geocoding
*/
let searchLocation = () =>
{
    let input = document.getElementById("searchBox").value;
    sendWebServiceRequestForForwardGeocoding(input, `panToLocation`)
    document.getElementById("searchBox").value = "";
    marker.addTo(map); //set a marker at the coordinate
}

/** Pans to the searched location
 * @param {object} data stores the data from the API
*/
let panToLocation = (data) => 
{
    let coordinate = data.results[0].geometry;
    console.log(coordinate);

    // If the check is false (a marker already exists on the map), just pan to the searched location
    // If the check is true (currently no markers on the map), add a marker to the map and add that location's details to the temporary storage array
    if (check == false) 
    {
        map.panTo([coordinate.lng, coordinate.lat])
    }
    else 
    {
        let popup = new mapboxgl.Popup()
            .setHTML(`<br><button onclick="selectStartingLocation()">Select</button>`); // TBD: There is a bug with the code written here! Jasper will resolve this in a bit :D 
        marker.setLngLat([coordinate.lng, coordinate.lat])
        marker.setPopup(popup)
        marker.addTo(map)
        markerFromSearch.push(marker)
        console.log(markerFromSearch)

        map.panTo([coordinate.lng, coordinate.lat])
        check = false;
    }
    console.log(tempStartObj)
}

// Temporary object to store Starting Location Name, Starting Location Coordinates, Selected Vehicle Type and Selected Vehicle Range
// Information is stored here before being saved into the Local Storage
let tempStartObj = 
{
    startingLocationName: "",
    startLocationCoords: [],
    selectedVehicleType: "",
    selectedVehicleRange: 0
}

// When the select button is clicked, the current coordinates of the marker is obtained
// Runs the sendWebServiceRequestForReverseGeocoding wrapper function 
let selectedMarkerName = ""; // stores the selected marker's name
let selectedMarker = []; // temporarily stores the selected Marker's location; array will be cleared and uploaded with new coordinates 
function selectStartingLocation() 
{
    let markerCoordinates;
    let lat;
    let lng;
    if (markerFromSearch.length > 0) 
    {
        markerCoordinates = markerFromSearch[0].getLngLat();
        lat = markerCoordinates.lat;
        lng = markerCoordinates.lng;
        markerFromSearch[0].remove();
        console.log(markerFromSearch)
        markerFromSearch = []; // clear the temporary array
    }
    else 
    {
        console.log(bookinglist);
        markerCoordinates = marker.getLngLat();
        console.log(markerCoordinates);
        lat = markerCoordinates.lat;
        lng = markerCoordinates.lng;
        marker.remove();

    }
    let selected = new mapboxgl.Marker(
    {
        color: "red",
    })
        .setLngLat([lng, lat])
        .addTo(map)

    popup.setHTML(`<center>${selectedMarkerName}<br><button onclick="removeStartLocation()">Remove</button></center>`); // adds a button to the popup 
    selected.setPopup(popup); // adds the popup to the marker
    popup.addTo(map); // adds the popup to the map
    sendWebServiceRequestForReverseGeocoding(lat, lng, "addStartingLocation")
    selectedMarker.push(selected)
}

/**
 * addStartingLocation function
// Callback function after selectStartingLocation is ran
// Adds the name of the starting location to the array in the Booking List 
* @param {object} data stores the data from the API
 */
function addStartingLocation(data) 
{
    let startLocationName = data.results[0].formatted;
    let lng = data.results[0].geometry.lng;
    let lat = data.results[0].geometry.lat;
    console.log(data)
    console.log(startLocationName)
    tempStartObj.startLocationCoords = [lng, lat];
    tempStartObj.startingLocationName = startLocationName;
    console.log(tempStartObj);
}

/**
 * removeStartLocation function
// Removes the selected starting location marker from the map
// Allows the user to place another starting marker to select the starting location 
 */
function removeStartLocation() 
{
    selectedMarker[0].remove()
    popup.remove()
    check = true;
    selectedMarker = [];
    tempStartObj.startLocationCoords = []; // clear the temporary coordinate storage
    tempStartObj.startingLocationName = ""; // clear the temporary starting location name 
    // bookinglist._list[0].startingLocation = "";
    console.log(tempStartObj)
}

/**
 * selectVehicle function
// Changes the selected vehicles button appearance to indicate vehicle is selected
// Saves the selected vehicle 
* @param {object} clicked the on/off state of the button
* @param {object} id the id of the html button
 */
function selectVehicle(clicked, id) 
{
    const NUM_OF_BUTTONS = 4; // number of vehicle select buttons

    // Logic to check activation of buttons
    if (clicked == "false") 
    {
        for (let i = 1; i < NUM_OF_BUTTONS + 1; i++) 
        {
            document.getElementById("button" + i + "style").style.color = "black";
            // console.log("button"+i)
            document.getElementById("button" + i).value = "false"
        }
        console.log("Button is now on")
        document.getElementById(id).value = "true"
        let vehicle = document.getElementById(id + "style");
        tempStartObj.selectedVehicleType = vehicle.innerHTML;
        tempStartObj.selectedVehicleRange = vehicleDetails[vehicle.innerHTML];
        console.log(vehicle)
        console.log(tempStartObj)
    }
    else if (clicked == "true") 
    {
        console.log("Button is now off")
        document.getElementById(id).value = "false";
    }

    // Highlighting the selected text
    if (document.getElementById(id).value == "true") 
    {
        document.getElementById(id + "style").style.color = "red";
    }
    else if (document.getElementById(id).value == "false") 
    {
        document.getElementById(id + "style").style.color = "black";
    }
}

/**
 * proceedToSelectLocations function
// Saves all the selected inputs into the Local Storage 
// Redirects the user to the POI selection page
 */
function proceedToSelectLocations() 
{
    // Checking if all conditions are met to proceed to next page
    if (confirm("Proceed to the next step?") && tempStartObj.selectedVehicleRange > 0 && tempStartObj.selectedVehicleType != "" && tempStartObj.startLocationCoords != [] && tempStartObj.startingLocationName != "") 
    {
        let startLocation = tempStartObj.startingLocationName;
        let vehicleType = tempStartObj.selectedVehicleType;
        let vehicleRange = tempStartObj.selectedVehicleRange;
        bookinglist.addVacation("", startLocation, "", vehicleType, 0, vehicleRange)
        updateLSData(BOOKINGLIST_KEY, bookinglist)
        window.location = "selectPOI.html";
    }
    else 
    {
        alert("Please select both your Starting Location and a Vehicle")
    }
}

/**
 * currentLocation function
// Gets user current location
* @param {object} latitude the latitude of the current coordinates
* @param {object} longitude the longitude of the current coordinates
 */
function currentLocation(latitude, longitude) 
{
    // Get coordinates from getUserLocationUsingGeoLocation()
    let coordinate = 
    {
        lng: longitude,
        lat: latitude
    }

    // Move map to selected area
    map.panTo(coordinate);

    // Set a marker at the coordinate
    marker.setLngLat(coordinate);
    marker.addTo(map);
    sendWebServiceRequestForReverseGeocoding(coordinate.lat, coordinate.lng, "address");
}

// Generates a marker when clicked
// Only one marker will be generated at a time
/**
 * @param {object} click generates the function upon clicking
 */
let check = true; // true if there are no markers on the map
map.on('click', function (e) 
{
    while (check) 
    {
        sendWebServiceRequestForReverseGeocoding(e.lngLat.lat, e.lngLat.lng, "address"); // reverse geocoding to extract the address
        marker.setLngLat([e.lngLat.lng, e.lngLat.lat]);
        marker.addTo(map);
        check = false;
    }
})

/**Reverse geocoding to extract the address when marker is dragged
 * @param {object} dragend states that the fucntion will only activate after the marker stops upon dragging
 * @param {object} data stores the data from API
 */
marker.on('dragend', function (data) 
{
    sendWebServiceRequestForReverseGeocoding(data.target._lngLat.lat, data.target._lngLat.lng, "address")
})

/**
 * Prints out the address in popup
 * @param {object} data stores the data from API
*/
let address = (data) => 
{
    popup.setHTML(`<center>${data.results[0].formatted}<br><button onclick="selectStartingLocation()">Select</button></center>`);
    marker.setPopup(popup); // adds the popup to the marker
    popup.addTo(map); // adds the popup to the map
    selectedMarkerName = data.results[0].formatted;
}