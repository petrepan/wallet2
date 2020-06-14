const searchFree = document.getElementById("searchFree");

function searchFreeuser() {
  const searchValue = document.getElementById("searchFree").value.toUpperCase();
  console.log(searchValue);
  const tableFree = document.getElementById("tableFree");
  const tableRow = tableFree.querySelectorAll(".tableFreeRow");
  for (let i = 0; i < tableRow.length; i++) {
    let username = tableRow[i].getElementsByClassName("freeUser")[0];

    if (username.innerHTML.toUpperCase().indexOf(searchValue) > -1) {
      tableRow[i].style.display = "";
    } else {
      tableRow[i].style.display = "none";
    }
  }
}

searchFree.addEventListener("input", searchFreeuser);
