// Dependencies
var express = require("express");
var mongoose = require("mongoose");
// Require axios,cheerio and handlebar. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");
var db = require ("./models")
// Initialize Express
var app = express();

// Database configuration
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

// Hook mongojs configuration to the db variable

app.use(express.json())
app.use(express.static("public"))
    
app.engine("handlebars", exphbs({defaultLayout:"main"}));
app.set("view engine","handlebars")
app.get("/", function(req, res) {
//   db.Headline.find({}).then(function(articles){
//       console.log (articles)
//       res.render("home");
//   })
// db.Headline.create({headline:"articles", summary:("hi"), url:("hi"),}).then(function(articles){
//     console.log (articles);
//     res.render("home");
// })
});

// Retrieve data from the db
app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
  db.Headline.find({}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(found);
    }
  });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
    var headlines = [] 
  // Make a request via axios for the news section of `ycombinator`
  axios.get("https://news.ycombinator.com/").then(function(response) {
    // Load the html body from axios into cheerio
    var $ = cheerio.load(response.data);
    // For each element with a "title" class
    $(".title").each(function(i, element) {
      // Save the text and href of each link enclosed in the current element
      var title = $(element).children("a").text();
      var link = $(element).children("a").attr("href");

      // If this found element had both a title and a link
      if (title && link) {
        // Insert the data in the scrapedData db
        var params ={
          title: title,
          link: link
        }
        console.log (params)
        headlines.push(params)
        // db.Headline.insert(params,
        // function(err, inserted) {
        //   if (err) {
        //     // Log the error if one is encountered during the query
        //     console.log(err);
        //   }
        //   else {
        //     // Otherwise, log the inserted data
        //     console.log(inserted);
        //   }
        // });
      }
    });
    res.send("Scrape Complete");
  })
  .catch(err => res.send(err))

  // Send a "Scrape Complete" message to the browser
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
