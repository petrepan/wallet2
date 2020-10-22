const tableBody = document.getElementById("tableBody");
const tableLength = tableBody.rows.length;
if (tableLength != 0) {
  for (let i = 0; i < 300; i++) {
    tableBody.rows[i].style.display = "none";
    // for (let j = 0; j < valArr.length; j++) {
    //   if (
    //     tableBody.rows[i].textContent.toLowerCase().indexOf(valArr[j]) === -1
    //   ) {
    //     tableBody.rows[i].style.display = "none";
    //   }
    // }
  }
}
