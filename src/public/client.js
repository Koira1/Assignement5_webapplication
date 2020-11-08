var playerTurn = 0;
var target;
var playArray = [];
var rows = document.getElementsByClassName("row");

for (var i = 0; i < rows.length; i++) {
  rows[i].addEventListener(
    "click",
    function (e) {
      onClickTable(e);
    },
    false
  );
}
console.log(JSON.stringify(playArray));
fetch("/newgame", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8"
  },
  body: JSON.stringify(playArray)
})
  .then((res) => res.json())
  .catch((error) => {
    console.error("Error: ", error);
  })
  .then(function (data) {
    console.log(data);
  });

function restart() {
  var restart = document.getElementById("restart");
  restart.addEventListener(
    "click",
    function (e) {
      restartGame(e);
    },
    false
  );
  restart.innerHTML = "Restarted";
}

function onClickTable(event) {
  //Goal is to have this fetch data from database/server
  fetch("/populate", { method: "POST" })
    .then(function (response) {
      if (response.ok) {
        fetchData(event);
        return;
      }
      throw new Error("Request failed");
    })
    .catch(function (error) {
      console.log(error);
    });
}

function fetchData(event) {
  //Fetch information about which player's turn it is
  fetch("/populate", { method: "GET" })
    .then((res) => res.json())
    .catch((error) => {
      console.error("Error: ", error);
    })

    .then(function (data) {
      console.log(data);
      document.getElementById(event.target.id).innerHTML = data;
      var cell = event.target.id;
      cell = cell.replace("C", "");
      var rowcolumn = parseInt(cell, 10);
      playArray[rowcolumn] = data;
      checkWinner(playArray);
    });
}

function checkWinner(playArray) {
  fetch("/winner", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(playArray)
  })
    .then((res) => res.json())
    .catch((error) => {
      console.error("Error:", error);
    })
    .then(function (data) {
      console.log(data.winner);
      if (data.winner === "x") {
        alert("Player 1 won!");
      } else if (data.winner === "y") {
        alert("Player 2 won!");
      }
    });
}
