"use strict"
/**
 * Purpose : This file contains displayVacationDetails function and upon calling the 
 *           function , it will retrieve the selected vacation to display on the page 
 *           along side with a route map           
 * Author : Nicole Ng Wei Wern 
 * Last revised on : 14/10/2021
 */

// Retrieve the selected vacation index 
let currentVacationIndex = localStorage.getItem(VACATION_KEY);
displayVacationDetails(currentVacationIndex);

/**
 * displayVacationDetails function
 * Displays the selected vacation details and displays route map 
 * with markers with a route line connecting to each POI marker 
 */
 let list = bookinglist.fromData(retrieveLSData(BOOKINGLIST_KEY));
 let vacation = list[0];
function displayVacationDetails(vacationIndex)
{
    // Code to retrieve data from local storage 
    let list = bookinglist.fromData(retrieveLSData(BOOKINGLIST_KEY));
    // Code to retrieve the selected vacation to display 
    let vacation = list[vacationIndex];
    let locations = vacation.poi; 
    let detailCoords = vacation.allCoordinates;
    
    // Code to make sure the starting location address fits into table without overflowing
    let SLarray = vacation.startingLocation.split(',');
    let frontadd =  `${SLarray[0]},${SLarray[1]}`;
    let backadd = ``;
    if (SLarray.length == 6)
    {
        backadd = `${SLarray[2]},${SLarray[3]},${SLarray[4]},${SLarray[5]}`;
    }
    else if( SLarray.length == 5 )
    {
        backadd = `${SLarray[2]},${SLarray[3]},${SLarray[4]}`; 
    }
    else if (SLarray.length ==4 )
    {
        backadd = `${SLarray[2]},${SLarray[3]}`; 
    }
    // Code to display the selected vacation details in a table format 
    let detailsContainer = document.getElementById('detailsContainer');
    let tablecontent = document.createElement('tbody');
    tablecontent.innerHTML = ``;
    tablecontent.innerHTML = `
    <tr>
       <th>Vaccation Name</th>
       <td>${vacation.vacationName}</td>
    </tr>
    <tr>
       <th>Date</th>
       <td >${vacation.date}</td>
    </tr>
    <tr>
      <th>Starting location</th>
      <td style="width: 350px; text-align: right; margin : 10px ;padding :10px;">${frontadd}<br>${backadd}</td>
    </tr>
    <tr>
      <th>Vehicle Type</th>
      <td >${vacation.vehicle}</td>
    </tr>
    <tr>
      <th>Vehicle Range</th>
      <td >${vacation.range}km</td>
    </tr>
    <tr>
      <th>Total distance</th>
      <td>${vacation.totalDistance}km</td>
    </tr>
    <tr>
      <th>Number of stops</th>
      <td>${vacation.poi.length-1}</td>
    </tr>`;
    detailsContainer.appendChild(tablecontent);

    // Code to display map
    mapboxgl.accessToken = MAPBOX_KEY;
    let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: locations[0].coordinates,
    zoom: 13 });
    // Defining a variable locationCoord to store all the POIs coordinates  
    let locationCoord = [];
    for(let i=0 ; i<locations.length ; i++)
    {
        locationCoord.push(locations[i].coordinates);
    }

    // Loop through every single POI to display a marker and popup 
    for (let i = 0; i < locations.length; i++)
    {
        // Create marker 
        let marker = new mapboxgl.Marker({ "color": "#ff0000" });
        marker.setLngLat(locationCoord[i]);
        // Create popup 
        let popup = new mapboxgl.Popup({ offset: 25});
        // Display POI address and POI type inside the popup 
        popup.setHTML(`
        <p style="font-size:11px" >${locations[i].name}</p>
        <p style="font-size:11px" >${locations[i].poiType}</p>`);
        marker.setPopup(popup);
        // Display the marker.
        marker.addTo(map);
    }
    // Code to display route line between POIs
    map.on('load', () => {
    map.addSource('route', {
    'type': 'geojson',
    'data': {
    'type': 'Feature',
    'properties': {},
    'geometry': {
    'type': 'LineString',
    'coordinates': detailCoords
    }
    }
    });    
    map.addLayer({
    'id': 'route',
    'type': 'line',
    'source': 'route',
    'layout': {
    'line-join': 'round',
    'line-cap': 'round'
    },
    'paint': {
    'line-color': 'green',
    'line-width': 5
    }
    });
    });
}