const searchBar = document.getElementById("searchBar");

const menuBar = document.querySelector(".menu-bar")
const letterX = document.querySelector(".letterx");
const navigation = document.querySelector(".navigation");


menuBar.addEventListener("click", function () {
  navigation.classList.add("activenav")
})

letterX.addEventListener("click", function () {
  navigation.classList.remove("activenav");
});

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
