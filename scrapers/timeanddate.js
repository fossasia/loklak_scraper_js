/* Usage : timeanddate.js London
           timeanddate.js 
 */

const request = require('request-promise-native');
const cheerio = require('cheerio');


var url;
var html;
var $;

if (process.argv.length === 3) {
  query = process.argv[2];
  terms = ['all'];
}

url = "http://www.timeanddate.com/worldclock/results.html?query=" + query;

request(url, function(error, response, body) {
  if(error) {
    console.log("Error: " + error);
    process.exit(-1);
  }
  html = body;
  scrapeTimeAndDate()
});


function scrapeTimeAndDate() {
  $ = cheerio.load(html);
  var loc_list = {};
  var htmlTime = $("table");
  var tag, location, time;
  var locationwisetime = [];
  var count = 0;

  $('table').find('tr').each(function (index, element) {

  tag = $(element).find("td");
  if( tag.text() != "") {
    location = tag.text();
    tag = tag.next();
    time = tag.text();
    location = location.replace(time,"");

    loc_list["location"] = location;
    loc_list["time"] = time;
    locationwisetime.push(loc_list);
    count++;
    loc_list = {};
  } else {
  tag = tag.next();
  }
    

});
  loc_list["count"] = count;
  locationwisetime.push(loc_list);
  console.log(locationwisetime);
}


