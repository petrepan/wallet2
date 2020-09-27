// const taskForm = document.getElementById("taskForm");
// const taskStatus = document.getElementById("taskStatus");

// const submitForm = () => {
//     taskStatus.innerText = "Task submitted";
// }

// taskForm.addEventListener("submit", submitForm)
const searchBar = document.getElementById("searchBar");


function searchAll() {
    const searchValue = document.getElementById("searchBar").value;
    const tableBody = document.getElementById("tableBody");
    const tableRow = tableBody.querySelectorAll(".tableRow");
    for (let i = 0; i < tableRow.length; i++){
        let username = tableRow[i].getElementsByClassName("userName")[0];

        if (username.innerHTML.indexOf(searchValue) > -1) {
            tableRow[i].style.display = '';
        } else { 
            tableRow[i].style.display = "none";
        }
    }
}

searchBar.addEventListener("input", searchAll)
