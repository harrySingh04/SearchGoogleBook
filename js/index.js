//jshint esversion:6
/* global $ */
$(document).ready(function () {
    $("#searchQuery").focus(); // Search field has been made focussed so that user can search immediately.
    $('#navigation').hide(); // Hiding the navigation before search and would be made enabled when results have been retrieved.

    //search query parameter which would hold the value entered by the user.
    let searchQuery;

    //Perform the search and display the result when clicks search button or press enter.
    $("#searchForm").submit(() => {

        //Disable the list and enable when results are retrieved
        $('#list').empty();
        //Empty the pagination so that it doesnt add same navigation (li) items same again and again.
        $(".pagination").empty();

        // Get the value of the search enter by  the user.
        searchQuery = $("#searchQuery").val();

        //If user doesn't enter anything , then we can alert the user.
        if (searchQuery == '') {

            alert("Please enter the input for searching books");
        }
        else {
            // Get the data from the Google Books API and display the result 
            getData(searchQuery);
        }
        return false;
    });
    return false;
});

function getData(searchQuery) {

    // Using the core $.ajax() method
    $.ajax({
        // The URL for the request
        url: "https://www.googleapis.com/books/v1/volumes",

        // The data to send (will be converted to a query string)
        data: {
            q: searchQuery,
            maxResults: 40
        },
        // GET request
        type: "GET",
        // The type of data we expect back
        dataType: "json",
        // Wait for 5 seconds to respond
        timeout: 5000,
    })
        // Code to run if the request succeeds (is done);
        // The response is passed to the function
        .done(function (json) {
            parseData(json,searchQuery);
        

        })
        // Code to run if the request fails; the raw request and
        // status codes are passed to the function
        .fail(function (xhr, status, errorThrown) {
            alert("Sorry, there was a problem with the server!");
        });
}


function parseData(data, searchQuery) {
    if (data.totalItems == 0) {

        $('#list').append(`<div><p>No Books found with name = ${searchQuery}</p></div>`);
        return;
    }
    let authors = "", content, counter = 1, thumbnail = "", title = "", publisher = "No Publisher Found", infoLink = "";

    //Display the navigation bar
    showNavigation(data.items.length);

    content = '<h3>List of Books</h3><table class="table table-bordered" id="table">';

    // Get each items and add them to the content.
    for (let i = 0; i < data.items.length; i++) {

        //Add all the authors of a particular book with comma seperator.
        if (data.items[i].volumeInfo.authors != undefined) {
            authors = data.items[i].volumeInfo.authors[0];
            for (let j = 1; j < data.items[i].volumeInfo.authors.length; j++)
                authors = authors + ", " + data.items[i].volumeInfo.authors[j];
        }

        // If image is present for the book then use that for display
        if (data.items[i].volumeInfo.imageLinks != undefined)
            thumbnail = data.items[i].volumeInfo.imageLinks.thumbnail;
        else
            //If no image is present then use the default image.
            thumbnail = "images/cover_book.jpg";
        //Retrieve the title for the book
        if (data.items[i].volumeInfo.title != undefined)
            title = data.items[i].volumeInfo.title;
        //Retrieve the publisher name for the book.
        if (data.items[i].volumeInfo.publisher != undefined)
            publisher = data.items[i].volumeInfo.publisher;
        // Retrieve the read more link for the book
        if (data.items[i].volumeInfo.infoLink != undefined)
            infoLink = data.items[i].volumeInfo.infoLink;

        content = `${content} 
        <tr>
        <th scope="row">${counter}</th>
        <td><img class="img-thumbnail" id="image" src=${thumbnail}>
        <h5 class="">${title}</h5>
        <p>Authors: ${authors}</p>
        <div>
        <p id="publish">Published By: ${publisher}</p>
        <input type="button" class="btn btn-info" onclick="location.href='${infoLink}';" value="READ MORE"/>
        </div>
        </td>
        </tr>`;
        counter = counter + 1;

    }
    $('#list').append(`${content} </table>`);

    // Showing only first 10 rows and hiding all the other rows
    $("table tr:gt(9)").hide();

}

function showNavigation(totalItems) {

    // Show the navigation
    $('#navigation').show();
    let limitPerPage = 10,totalPages;
    //Total 40 results and 10 result in each page.
    if (totalItems <= 30)
        totalPages = Math.ceil(totalItems / 10);
    else
        totalPages = 4;

    // Append the navigation for the pages
    $(".pagination").append("<li class='page-item disabled' id='previous'><a class='page-link' href='javascript:void(0)' tabindex='-1'>Previous</a></li>");
    $(".pagination").append("<li class='page-item active' id='current-page'><a class='page-link ' href='javascript:void(0)'>1</a></li>");

    for (let i = 1; i < totalPages; i++)
        $(".pagination").append("<li class='page-item' id='current-page'><a class='page-link ' href='javascript:void(0)'>" + (i + 1) + "</a></li>");
    $(".pagination").append("<li class='page-item' id ='next'><a class='page-link ' href='javascript:void(0)'>Next</a></li>");


    // On page change , change the content of the pages
    $(".pagination li#current-page").on("click", function () {

        if ($(this).index() != 1)
            //Enabe the previous link when user is not on first page
            $("#previous").removeClass("disabled");
        else
            //Disable the previous link when user is at first page
            $("#previous").addClass("disabled");

        // Disable the next link if user is at the last page
        if ($(this).index() == totalPages)
            $("#next").addClass("disabled");
        else
            // Enable the next link when user is not at the last page
            $("#next").removeClass("disabled");

        // If user is the same page and click the same page then don't do anything
        if ($(this).hasClass("active"))
            return false;
        else {
            //Get the current page index
            let currentPage = $(this).index();
            let grandTotal = currentPage * limitPerPage;
            $(".pagination li").removeClass("active");
            $(this).addClass("active");
            //Hide all the table rows
            $("table tr").hide();
            //Show rows of the table with respect to current page
            for (let i = grandTotal - limitPerPage; i < grandTotal; i++) {
                $("table tr:eq(" + i + ")").show();
            }
        }

    });

    $(".pagination li#previous").on("click", function () {

        // Get the current page index
        let currentPage = $(".pagination li.active").index();

        // If user is at page 1 then dont allow user to click previous link
        if (currentPage == 1) {
            return false;
        }
        else {
            //As user is going previous so decrease the current page index
            currentPage--;
            //If user is at index 1 then disable the previous link.
            if (currentPage == 1)
                $("#previous").addClass("disabled");
            //Enable next when user moved from last page
            else if (currentPage != totalPages)
                $("#next").removeClass("disabled");
            let grandTotal = currentPage * limitPerPage;
            $(".pagination li").removeClass("active");
            $("table tr").hide();

            //Show rows of the table with respect to current page
            for (let i = grandTotal - limitPerPage; i < grandTotal; i++) {
                $("table tr:eq(" + i + ")").show();
            }
            //Active the current page link
            $(".pagination li#current-page:eq(" + (currentPage - 1) + ")").addClass("active");
        }
    });

    $(".pagination li#next").on("click", function () {

        //Get the current page index
        let currentPage = $(".pagination li.active").index();

        // If user is at the last page then dont allow user to click next link
        if (currentPage == totalPages) {
            return false;
        }
        else {
            //As user is going next so increase the current page index
            currentPage++;

            //If user is at the last page disable the next link
            if (currentPage == totalPages)
                $("#next").addClass("disabled");
            else if (currentPage != 1)
                //Enable previous link when user moves from first page
                $("#previous").removeClass("disabled");
            let grandTotal = currentPage * limitPerPage;
            $(".pagination li").removeClass("active");
            $("table tr").hide();

            //Show rows of the table with respect to current page
            for (let i = grandTotal - limitPerPage; i < grandTotal; i++) {
                $("table tr:eq(" + i + ")").show();
            }
            //Active the current page link
            $(".pagination li#current-page:eq(" + (currentPage - 1) + ")").addClass("active");
        }
    });

}

