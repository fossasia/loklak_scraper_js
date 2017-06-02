var request = require("request");
var cheerio = require("cheerio");

var profile = null;
var FLICKR_URL_PROFILE_BASE = "https://www.flickr.com/people/";
var FLICKR_URL_PHOTOS_BASE = "https://www.flickr.com/photos/";
var html = "";
var flickr_profile = {};
var $ = null;

if (process.argv.length <= 2) {
  console.log("Atleast one argument required");
  process.exit(-1);
}

if (process.argv.length === 3) {
  profile = process.argv[2];
}

//Function for scraping flickr profile
function scrapeflickrprofile() {
  $ = cheerio.load(html);

  var name = $(".given-name").text() + ' ' + $(".family-name").text();
  flickr_profile["name"] = name;

  var bio = $(".note").text();
  flickr_profile["bio"] = bio;

  var photos_count = $('.statcount').find('h1').text()
  flickr_profile["photos_count"] = photos_count;

  flickr_profile["profile_url"] = FLICKR_URL_PROFILE_BASE + profile;

}


//Function for scraping photos 
function scrapflickrphotos() {
  $ = cheerio.load(html);

  flickr_profile["photos_url"] = FLICKR_URL_PHOTOS_BASE + profile;
  var followers_count = $('.followers').text().split('•');
  flickr_profile["followers"] = followers_count[0].replace(' Followers','');
  flickr_profile["following"] = followers_count[1].replace(' Following','');

  var photos_url = [];
  var photos_grid = $(".photo-list-photo-view");
  for(var i=0;i<photos_grid.length;i++) {
    photos_url[i] = photos_grid[i];
    var style = photos_url[i].attribs.style;
    var n = style.lastIndexOf(';');
    var result = style.substring(n + 1);
    photos_url[i] = result.replace('background-image: ','')
      .replace('url(','').replace(')','')
      .replace(/\"/gi, "").replace(/\/\//,"");
  }
  flickr_profile["photos"] = photos_url;

}

request(FLICKR_URL_PROFILE_BASE + profile, function(error, response, body) {
  if(error) {
    console.log("Error: " + error);
    process.exit(-1);
  }
  else if(!error && response.statusCode == 200) {
    html = body;
    scrapeflickrprofile();
  }

  request(FLICKR_URL_PHOTOS_BASE + profile, function(error, response, body) {
    if(error) {
      console.log("Error: " + error);
      process.exit(-1);
    }
    else if(!error && response.statusCode == 200) {
      html = body;
      scrapflickrphotos();
    }
    console.log(flickr_profile);
  });
});
