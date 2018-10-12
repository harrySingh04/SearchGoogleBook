$(document).ready(function () {

    $("#searchForm").submit(() => {

        $('#list').empty();
        const bookName = $("#bookname").val();
        if (bookName == '') {

            alert("Please enter the Book Name !!")
        }
        else {
            let authors = "", content, counter = 1, thumbnail = "", title="", publisher="", infoLink="";

            $.get("https://www.googleapis.com/books/v1/volumes?q=" + bookName, (response) => {

                if (response.items != undefined) {
                    content = '<h3>List of Books</h3><table class="table table-bordered" id="table">';

                    for (let i = 0; i < response.items.length; i++) {

                        if (response.items[i].volumeInfo.authors != undefined) {
                            authors = response.items[i].volumeInfo.authors[0];
                            for (let j = 1; j < response.items[i].volumeInfo.authors.length; j++)
                                authors = authors + "," + response.items[i].volumeInfo.authors[j];
                        }
                        if (response.items[i].volumeInfo.imageLinks != undefined)
                            thumbnail = response.items[i].volumeInfo.imageLinks.thumbnail;
                        if (response.items[i].volumeInfo.title != undefined)
                            title = response.items[i].volumeInfo.title;
                        if (response.items[i].volumeInfo.publisher != undefined)
                            publisher = response.items[i].volumeInfo.publisher;
                        if (response.items[i].volumeInfo.infoLink != undefined)
                            infoLink = response.items[i].volumeInfo.infoLink;

                        content = `${content} 
                        <tr>
                        <th scope="row">${counter}</th>
                        <td><img class="img-thumbnail" id="image" src=${thumbnail}>
                        <h5 class="">${title}</h5>
                        <p>Authors : ${authors}</p>
                        <div>
                        <p id="publish">Published By:${publisher}</p>
                        <input type="button" class="btn btn-info" onclick="location.href='${infoLink}';" value="READ MORE"/>
                        </div>
                        </td>
                        </tr>`;
                        counter = counter + 1;
                    }

                    $('#list').append(`${content} </table>`);
                }
                else {
                    $('#list').append(`<div><p>No Books found with name = ${bookName}</p></div>`);
                }
            })

        }
        return false;
    })

    

});