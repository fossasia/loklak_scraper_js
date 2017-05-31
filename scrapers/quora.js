var request = require("request");
var cheerio = require("cheerio");

var profile = null;
var QUORA_URL_BASE = "https://www.quora.com/profile/";
var html = "";
var quoraProfile = {};
var $ = null;

if (process.argv.length <= 2) {
  console.log("Atleast one argument required");
  process.exit(-1);
}

if (process.argv.length === 3) {
  profile = process.argv[2];
}

function scrapeQuora() {
  $ = cheerio.load(html);

  var bio = $(".ProfileDescription").text();
  quoraProfile["bio"] = bio;

  var profileImage = $(".profile_photo_img").attr("src");
  quoraProfile["profileImage"] = profileImage;

  var userName = $(".profile_photo_img").attr("alt");
  quoraProfile["user"] = userName;

  var rssFeed = QUORA_URL_BASE + profile + "/rss";
  quoraProfile["rss_feed_link"] = rssFeed;

  var stats = $(".list_count");
  
  for (var i = 0;i < stats.length; i++) {
    var stat=stats[i];
    quoraProfile[stat.prev.data.toLowerCase().trim() + "Url"] = "https://www.quora.com" + stat.parent.attribs.href;
    quoraProfile[stat.prev.data.toLowerCase().trim() + "Count"] = stat.children[0].data; 
  }
  console.log(quoraProfile);
}

request(QUORA_URL_BASE + profile, function(error, response, body) {
  if(error) {
    console.log("Error: " + error);
    process.exit(-1);
  }
  html = body;
  scrapeQuora();
});
