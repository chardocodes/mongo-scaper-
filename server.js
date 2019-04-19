const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");

const axios = require("axios");
const cheerio = require("cheerio");
const db = require("./models");

const PORT = process.env.PORT || 3000;


const app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true, useCreateIndex: true });

app.get("/scrape", (req, res) => {

  axios.get("http://www.tearablepuns.org/").then(response => {
  
    const $ = cheerio.load(response.data);

    $("h3.entry-header").each(function (i, element) {
      const result = {};

      //=======================================================
      $("p.entry-body").each(function(i, element) {

        var title = $(element).text();
      
        var link = $(element).children().attr("href");
        // ====================================================
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

   
      db.Article.create(result)
        .then(dbArticle => {
        
          console.log(dbArticle);
        })
        .catch(err => {
          
          console.log(err);
        });
    });

    res.send("Scrape Complete");
  });
});
});


app.get("/articles", (req, res) => {
  
  db.Article.find({})
    .then(dbArticle => {
      res.json(dbArticle);
    }).catch(err => {
      res.json(err);
    });
});


app.get("/articles/:id", (req, res) => {
 
  db.Article
    .findOne({ _id: req.params.id })
    .populate("note")
    .then(dbArticle => {
      res.json(dbArticle);
    }).catch(err => {
      res.json(err);
    });

});

app.post("/articles/:id", (req, res) => {
  
  db.Note.create(req.body)
    .then(dbNote => {
      return db.Article.findOneAndUpdate({_id: req.params.id}, {note: dbNote._id}, {new: true});
    }).then(dbArticle => {
      res.json(dbArticle);
    }).catch(err => {
      res.json(err);
    });
});

// Listen on port 3000
app.listen(PORT, () => {
  console.log(`App running on port http://localhost:${PORT}`);
});