//  OpenShift sample Node application
var express = require("express"),
  app = express(),
  morgan = require("morgan");

Object.assign = require("object-assign");
const pug = require("pug");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const Board = require("./models/board");

var playerTurn = 0;
var playArray = [];
var currentPlayer;

//app.engine("pug", require("pug").__express);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(__dirname + "/public"));
app.use(
  "/static",
  express.static(path.join(__dirname, "/public/stylesheets/"))
);

app.use(morgan("combined"));

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
  ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0",
  mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
  mongoURLLabel = "";

if (mongoURL == null) {
  var mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
  // If using plane old env vars via service discovery
  if (process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
    mongoHost = process.env[mongoServiceName + "_SERVICE_HOST"];
    mongoPort = process.env[mongoServiceName + "_SERVICE_PORT"];
    mongoDatabase = process.env[mongoServiceName + "_DATABASE"];
    mongoPassword = process.env[mongoServiceName + "_PASSWORD"];
    mongoUser = process.env[mongoServiceName + "_USER"];

    // If using env vars from secret from service binding
  } else if (process.env.database_name) {
    mongoDatabase = process.env.database_name;
    mongoPassword = process.env.password;
    mongoUser = process.env.username;
    var mongoUriParts = process.env.uri && process.env.uri.split("//");
    if (mongoUriParts.length == 2) {
      mongoUriParts = mongoUriParts[1].split(":");
      if (mongoUriParts && mongoUriParts.length == 2) {
        mongoHost = mongoUriParts[0];
        mongoPort = mongoUriParts[1];
      }
    }
  }

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = "mongodb://";
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ":" + mongoPassword + "@";
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ":" + mongoPort + "/" + mongoDatabase;
    mongoURL += mongoHost + ":" + mongoPort + "/" + mongoDatabase;
  }
}

mongoose.connect(mongoURL);
mongoose.Promise = Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error"));

app.use(cookieParser());

app.post("/newgame", function (req, res, next) {
  if (!req.session) {
    console.log(req.body.playArray);
    var board = new Board({ board: req.body.playArray, id: req.session.id });
    db.collection("board")
      .insertOne(board)
      .then(function (result) {
        console.log(result);
      });
  } else {
    const query = { _id: req.session.id };
    var cursor = db.collection("board").find(query);
  }
});

app.use(
  session({
    secret: "test",
    cookie: { maxAge: 60000 },
    store: new MongoStore({ url: mongoURL, db: "test" })
  })
);

/*app.use(function (req, res, next) {
  if (req.session) {
    db.once("open", function () {
      var result = db.collection("sessions").findOne({ _id: req.session.id });
      if (result) {
        console.log(result);
      } else {
        console.log("Ei");
      }
    });
  }
});*/

/*db.createCollection("board", function (err, res) {
  if (err) throw err;
  console.log("Collection created!");
});*/

// error handling
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something bad happened!");
});

app.listen(port, ip);
console.log("Server running on http://%s:%s", ip, port);

var indexRouter = require("./routes/index");
//var postRouter = require("./routes/post");

app.use("/", indexRouter);
//app.use("/", postRouter, { player: player() });
app.use("/client", express.static(path.join(__dirname, "")));

app.post("/populate", (req, res) => {
  res.sendStatus(201);
});

function player() {
  if (playerTurn % 2 === 0) {
    playerTurn = playerTurn + 1;
    currentPlayer = "x";
    return "x";
  } else {
    playerTurn = playerTurn + 1;
    currentPlayer = "y";
    return "y";
  }
}

app.get("/populate", (req, res) => {
  res.json(player());
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/winner", (req, res) => {
  playArray = req.body;
  var winner = checkWinner(currentPlayer);
  res.json({ winner: winner });
});

function checkWinner(player) {
  var winningCombos = [
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
    [0, 6, 12, 18, 24],
    [20, 16, 12, 8, 4]
  ];
  for (var win of winningCombos) {
    var count = 0;
    for (var index of win) {
      if (playArray[index] !== player) {
        break;
      } else {
        count++;
      }
    }
    if (count === 5) {
      return currentPlayer;
    }
  }
}

app.post("/post/create", (req, res, next) => {
  //TODO
  next();
});

module.exports = app;
