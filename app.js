// Modules
const path = require("path");
const busboy = require('connect-busboy');
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require('cors');

// DotEnv
require('dotenv').config();

// Middleware
const File = require("./server/routes/File");
const Server = require("./server/routes/Server");
const Authentication = require("./server/routes/Authentication");
const User = require("./server/routes/User");

// App Initialisation
const app = express();
const router = express.Router();
const port = process.env.PORT || 3030;

// Static
app.use(express.static(path.join(__dirname, "dist")));

// Modules
app.use(cors());
app.use(busboy());

// Auth/Sessions
app.use(session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());


// Custom Routes
// TODO: Dynamically register
app.use(`${process.env.API_V1}`, new File().GetRoutes());
app.use(`${process.env.API_V1}/server`, new Server().GetRoutes());
app.use(`${process.env.API_V1}/auth`, new Authentication().GetRoutes());
app.use(`${process.env.API_V1}/user`, new User().GetRoutes());

app.disable('x-powered-by');

// Start App
(async function () {
    app.use(router);
    app.listen(port, function () {
        console.log(`Server is listening for connection.`);
        app.get("/", (req, res) => {
            res.send("Hello, world!");
        });
    });
})();