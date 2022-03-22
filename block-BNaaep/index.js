// Requiring all the core node modules
var http = require("http");
var fs = require("fs");
var path = require("path");
var url = require("url");
var qs = require("querystring");

// Creating a server
let server = http.createServer(handleRequest);

let contactPath = path.join(__dirname + "/contacts/");

function handleRequest(req, res) {
  let store = "";
  let parsedUrl = url.parse(req.url, true);

  let pathname = parsedUrl.pathname;

  req.on("data", (chunk) => {
    store += chunk;
  });

  req.on("end", () => {
    if (req.method === "GET" && req.url === "/") {
      res.setHeader("Content-Type", "text/html");
      fs.createReadStream("./home.html").pipe(res);
    } 
    else if (req.method === "GET" && req.url === "/about") {
      res.setHeader("Content-Type", "text/html");
      fs.createReadStream("./about.html").pipe(res);
    }
    else if (req.method === "GET" && req.url === "/contact") {
      res.setHeader("Content-Type", "text/html");
      fs.createReadStream("./contact.html").pipe(res);
    }
    else if (req.method === "POST" && req.url === "/form") {
      let parsedData = JSON.parse(store);
      let stringifiedData = JSON.stringify(parsedData);
      fs.open(contactPath + stringifiedData.username + ".json", "wx", (err, fd) => {
        if (err) {
          res.setHeader("Content-Type", "text/html");
          res.end("<h1>username already Exists</h1>");
        }
        fs.write(fd, stringifiedData, (err) => {
          if (err) return console.log(err);
          fs.close(fd, (err) => {
            if (err) return console.log(err);
            res.setHeader("Content-Type", "text/html");
            res.write(`<h1>${stringifiedData.username} contact saved </h1>`);
            res.end(store);
          });
        });
      });
    }
    // handle GET request on `/users?username=ANY_USERNAME_FROM_CONTACTS` which should
    else if (pathname === "/users" && req.method === "GET") {
      if (!req.url.includes("?")) {
        fs.readdir(contactPath, function (err, files) {
          //handling error
          if (err) { 
            return console.log("Unable to scan directory: " + err);
          }
          var length = files.length;
          var count = 1;
          files.forEach(function (file) {
            console.log(file);
            fs.readFile(contactPath + file, (err, content) => {
              if (err) return console.log(err);
              if (count < length) {
                count++;
                res.write(content);
              } else {
                return res.end(content);
              }
            });
          });
        });
      } 
    }
    //Handling with the  css request
    else if (req.method === "GET" && req.url.split(".").pop() === "css") {
      console.log("We have requested for css file right now");
      const cssFile = req.url;
      res.setHeader("Content-Type", "text/css");
      fs.readFile(__dirname + cssFile, "utf8", (err, content) => {
        if (err) return console.log(err);
        res.end(content);
      });
    }
    // Handling with the images requests
    else if (req.method === "GET" && req.url.split(".").pop() === "jpg") {
      console.log("We have requested for a image right now ");
      console.log(req.url);
      console.log(req.url.split(".").pop());
      const imageUrl = req.url;
      res.setHeader("Content-Type", "image/jpg");
      fs.createReadStream(__dirname + req.url).pipe(res);
    }
  });
}

//listening  the request on 5000 port or making  the server at the 5000 port
server.listen(5000, "localhost", () => {
  console.log("server is running at  the 5K port");
});
