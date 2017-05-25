/* Usage : wordpress.js <blog_url>
 */

var request = require("request");
var cheerio = require("cheerio");

var url = null;

// blog url must be provided as a command line argument

if (process.argv.length <= 2) {
  console.log("Atleast one argument required");
  process.exit(-1);
}

if (process.argv.length === 3) {
  url = process.argv[2];
  terms = ['all'];
}

var html = null;
var blogPosts = [];
var $ = null;

// downloading the webpage

request(url, function(error, response, body) {
  if(error) {
    console.log("Error: " + error);
    process.exit(-1);
  }
  html = body;
  scrapeWordPress()
});

// function to scrape wordpress profile

function scrapeWordPress() {
  $ = cheerio.load(html);
  
  $("article").each(function(i, elem) {
  	var article = {};

  	article["blog_url"] = url;
  	
  	var title = $(this).find(".entry-title").text().trim();
  	article["title"] = title;
  	
  	var postedOn = $(this).find(".posted-on").text().trim();
  	article["posted_on"] = postedOn;

  	var author = $(this).find(".byline").text().trim();
  	article["author"] = author.substring(author.indexOf(" ") + 1);

  	var content = $(this).find(".entry-content").text().trim();
  	article["content"] = content;

  	blogPosts.push(article);
  });

  console.log(blogPosts);
}
