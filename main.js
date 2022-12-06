"use strict"
/*
* Purpose: States all classes and local storage system that will be used in all other js files to store and transfer saved data.
* Author: Chow Khin Nyp, Sohail Singh
* Last Modified: 14-Oct-2021
*/
// Predefined keys for the Local Storage
const BOOKINGLIST_KEY = "bookinglistKey";

/**Class for point of interest 
 * @param {object} name stores the address name of the POI
 * @param {object} coordinates stores all coordinates of the POIs selected
 * @param {object} typeOfPOI indicates what type of POI is selected
*/
class PointOfInterest 
{
    constructor(name, coordinates = [], typeOfPOI)
    {
        this._name = name;
        this._coordinates = coordinates;
        this._poiType = typeOfPOI;
    }
    get name ()
    {
        return this._name;
    }
    get coordinates()
    {
        return this._coordinates;
    }
    get poiType()
    {
        return this._poiType;
    }
    fromData(data)
    {   
        this._name  = data._name;
        this._coordinates = data._coordinates;
        this._poiType = data._poiType;
    }

}

// Class for booking list 
class BookingList 
{
    constructor()
    {
        this._list = [];
    }
    get list()
    {
        return this._list;
    }

    /**Stores an entire planned vacation to be displayed
     * @param {object} vacationName states the name of the planned vacation
     * @param {object} startingLocation states the starting location selected by the user
     * @param {object} date states the date the planned vacation is saved
     * @param {object} vehicle states the vehicle selected by the user
     * @param {object} totalDistance details the total distance to be travelled in the vacation
     * @param {object} range states the vehicle range of the selected vehicle
     */

    addVacation (vacationName, startingLocation, date, vehicle, totalDistance , range)
    {
        let vacation = 
        {
            vacationName: vacationName,
            startingLocation: startingLocation,
            date: date , 
            vehicle:  vehicle , 
            totalDistance : totalDistance,
            range: range , 
            poi: [],
            allCoordinates: []
        }
        this._list.push(vacation)
    }
    addPOI (pointOfInterest, vacationIndex)
    {
        this._list[vacationIndex].poi.push(pointOfInterest);
    }
    addVacationDetails(vacationName, vacationDate, vacationIndex, totalDist, allCoords)
    {
        this._list[vacationIndex].date = vacationDate;
        this._list[vacationIndex].vacationName = vacationName;
        this._list[vacationIndex].totalDistance = totalDist;
        this._list[vacationIndex].allCoordinates = allCoords;
    }

    fromData(data)
    {
        this._list = [];
        for ( let i=0 ; i<data._list.length; i ++)
        {
            let vacation = 
            {
                vacationName: data._list[i].vacationName,
                startingLocation: data._list[i].startingLocation,
                date: data._list[i].date ,
                vehicle:  data._list[i].vehicle , 
                totalDistance: data._list[i].totalDistance,
                range: data._list[i].range , 
                poi: [],
                allCoordinates: data._list[i].allCoordinates

            }
            for ( let j=0 ; j<data._list[i].poi.length ; j++)
            {
                let newPOI = new PointOfInterest;
                newPOI.fromData(data._list[i].poi[j]);
                vacation.poi.push(newPOI);
            }
            this._list.push(vacation);
        }
        return this._list;
    }
}

/**
 * checkLSData function
 * Used to check if any data in LS exists at a specific key
 * @param {string} key LS Key to be used
 * @returns true or false representing if data exists at key in LS
 */
 function checkLSData(key)
 {
     if (localStorage.getItem(key) != null)
     {
         return true;
     }
     return false;
 } 

/**
 * retrieveLSData function
 * Used to retrieve data from LS at a specific key. 
 * @param {string} key LS Key to be used
 * @returns data from LS in JS format
 */
 function retrieveLSData(key)
 {
     let data = localStorage.getItem(key);
     try
     {
         data = JSON.parse(data);
     }
     catch(err){}
     finally
     {
         return data;
     }
 } 

/**
 * updateLSData function
 * Used to store JS data in LS at a specific key
 * @param {string} key LS key to be used
 * @param {any} data data to be stored
 */
function updateLSData(key, data)
{
    let json = JSON.stringify(data);
    localStorage.setItem(key, json);
}

// Global bookinglist variable
let bookinglist = new BookingList();
// Check if data available in Local Storage before continuing 
if (checkLSData(BOOKINGLIST_KEY))
{
    // If data exists, retrieve it
    let data = retrieveLSData(BOOKINGLIST_KEY);
    // Restore data into bookinglist 
    bookinglist.fromData(data);
}