/* Usage : node instagram.js <profile_name>
 */

var request = require("request");
var cheerio = require("cheerio");

var profile = null;

// profile name must be provided as a command line argument

if (process.argv.length <= 2) {
  console.log("Atleast one argument required");
  process.exit(-1);
}

profile = process.argv[2];

var html = null;
var blogPosts = [];
var $ = null;
var INSTAGRAM_BASE_URL = "https://www.instagram.com/";

// getting the instagram web page

request(INSTAGRAM_BASE_URL + profile, function(error, response, body) {
  if(error) {
    console.log("Error: " + error);
    process.exit(-1);
  }
  html = body;
  scrapeInstagram()
});

// function to scrape instagram profile information

function scrapeInstagram() {
  $ = cheerio.load(html);

  var instaObj = $("script").eq(3).html().trim().substring(21);
  var instaProfile = [];
  instaProfile.push(instaObj);
  console.log(instaProfile);
}