/*
Node + Express website for MUS370-04: Music: Joy, Creativity, & Play and for the Joy Symposium during TCNJ's Spring 2026 semester
Made by Jacob Almeda

Template made by Shm Garanganao Almeda for CS160 Summer 2022

Code referenced from: 
https://www.digitalocean.com/community/tutorials/how-to-create-a-web-server-in-node-js-with-the-http-module"
https://expressjs.com/en/starter/hello-world.html
https://codeforgeek.com/render-html-file-expressjs/
https://stackoverflow.com/questions/32257736/app-use-express-serve-multiple-html

Photo Credits:
Bunny by Satyabratasm on Unsplash <https://unsplash.com/photos/u_kMWN-BWyU>
*/

//Node modules to *require*
//if these cause errors, be sure you've installed them, ex: 'npm install express'
const express = require('express');
const router = express.Router();
const app = express();
const path = require('path');


var publicPath = path.join(__dirname, 'public'); //get the path to use our "public" folder where we stored our html, css, images, etc
app.use(express.static(publicPath));  //tell express to use that folder


//here's where we specify what to send to users that connect to our web server...
//if there's no url extension, it will show "index.html"
router.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "/"));
});

//depending on what url extension the user navigates to, send them the respective html file. 
app.get('/a', function (req, res) {
    res.sendFile(publicPath + '/a.html');
});
app.get('/b', function (req, res) {
    res.sendFile(publicPath + '/b.html');
});
app.get('/c', function (req, res) {
    res.sendFile(publicPath + '/c.html');
});


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server running on port " + port);
});
