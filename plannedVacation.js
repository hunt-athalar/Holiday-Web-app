"use strict"
/**
 * Purpose : This file contains functions to display the summary of booked vacation 
 *           on the page           
 * Author : Nicole Ng Wei Wern 
 * Last revised on : 14/10/2021
 */

/**
 * displayVacation function
 * Displays a summary of the list of booked vacations from the latest as the first  
 */

displayVacation(bookinglist)
function displayVacation(bookinglist) 
{
    let vacationContainer = document.getElementById('vacationContainer')
    vacationContainer.innerHTML = ``;
    // Code to retrieve data from local storage 
    let list = bookinglist.fromData(retrieveLSData(BOOKINGLIST_KEY))
    if (list.length == 0 )
    {
        vacationContainer.innerHTML = `<h2> You have no bookings </h2>`;
    }
    else 
    {
        // Create table heading 
        let tablehead = document.createElement('thead')
        tablehead.innerHTML = ``
        tablehead.innerHTML = `
        <tr>
         <th style="text-align: center;">Name</th>
         <th style="text-align: center;">Date</th>
         <th style="text-align: center;">Starting Location </th>
         <th>Vehicle Type </th>
         <th>Total Distance</th>
         <th>Number of stops</th>
         <th style="text-align: center;">Details </th>
        </tr>`;
        vacationContainer.appendChild(tablehead);
        let tablebody = document.createElement('tbody');
        tablebody.className = 'scroll';

        /**
         * Use for loop to loop through every vacation in the retrieved data and display 
         * the details of each vacation in the table by creating a new row for each vacation
         */
        for(let i=list.length-1; i>-1;i--)
        {
            let tablerow = document.createElement('tr')
            tablerow.innerHTML = `
             <td class="mdl-data-table__cell--non-numeric">${list[i].vacationName}</td>
             <td>${list[i].date} </td>
             <td>${list[i].startingLocation }</td>
             <td>${list[i].vehicle}</td>
             <td>${list[i].totalDistance}</td>
             <td style="text-align: center;">${list[i].poi.length-1}</td>
             <td><button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect" onclick=details(${i})>Details</button></td>
             `
            tablebody.appendChild(tablerow);       
        }
        vacationContainer.appendChild(tablebody);   
    }   
}

/**
 * details function
 * Runs when user clicks on the "details" button on planned Vacation page 
 * Redirects user to vacationDetails.html page and store the index of the vacation in local storage 
 */
function details(vacationIndex)
{
    window.location = "vacationDetails.html"; // redirect to vacationDetails page
    localStorage.setItem(VACATION_KEY,vacationIndex);
}