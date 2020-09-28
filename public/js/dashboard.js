// const taskForm = document.getElementById("taskForm");
// const taskStatus = document.getElementById("taskStatus");

// const submitForm = () => {
//     taskStatus.innerText = "Task submitted";
// }

// taskForm.addEventListener("submit", submitForm)
const searchBar = document.getElementById("searchBar");

// function searchAll() {
//     const searchValue = document.getElementById("searchBar").value.toUpperCase();
//     const tableBody = document.getElementById("tableBody");
//     const tableRow = tableBody.querySelectorAll(".tableRow");
//     for (let i = 0; i < tableRow.length; i++){
//         let username = tableRow[i].getElementsByClassName("userName")[0];
//         console.log(username.textContent)
//         console.log(searchValue)
//         console.log(tableRow)
//         if (username.innerHTML.toUpperCase().indexOf(searchValue) > -1) {
//             tableRow[i].style.display = 'block';
//         } else {
//             tableRow[i].style.display = "none";
//         }
//     }
// }

// searchBar.addEventListener("input", searchAll)

function filterList() {
  const searchValue = document.getElementById("searchBar");
  const val = searchValue.value.toLowerCase();
  const valArr = val.split(" ");
  const tableBody = document.getElementById("tableBody");
  const tableLength = tableBody.rows.length;
  if (tableLength != 0) {
    for (let i = 0; i < tableLength; i++) {
      tableBody.rows[i].style.display = "block";
      for (let j = 0; j < valArr.length; j++) {
        if (
          tableBody.rows[i].textContent.toLowerCase().indexOf(valArr[j]) === -1
        ) {
          tableBody.rows[i].style.display = "none";
        }
      }
    }
  }
}

searchBar.addEventListener("keyup", filterList);
