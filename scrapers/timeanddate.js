
const BaseLoklakScrapper = require('./base');

class LocationAndDateScrapper extends BaseLoklakScrapper {

  constructor() {
    super('LocationAndDate', 'http://www.timeanddate.com/worldclock/results.html?query=');
  }

  argumentSanityCheck(args) {
    super.argumentSanityCheck(args);

	if (args.length <= 2) {
      console.error('Atleast one argument required.');
      process.exit(-1);
    }

    return true;
  }

  onInit() {
    this.REQUEST_URL = this.BASE_URL + this.SLICED_PROC_ARGS[0];
    this.request();
  }

  scrape($) {
    const locationwisetime = [];
    let loc_list = {};
    let loc_array = [];
    let tag, location, time, loc;
    let htmlTime = $("table").find('tr');

    htmlTime.each(function (index, element) {
    tag = $(element).find("td");
    if (tag.text() != "") {
      loc = {};

      location = tag.text();
      tag = tag.next();
      time = tag.text();
      location = location.replace(time,"");

      loc["location"] = location;
      loc["time"] = time;
      loc_array.push(loc);
    } else {
      tag = tag.next();
    }

    });

    loc_list["search"] = loc_array;
    loc_list["url"] = this.REQUEST_URL;
    locationwisetime.push(loc_list);

    console.log(locationwisetime);
    this.JSON = locationwisetime;
    return this.JSON;
  }
}

module.exports = LocationAndDateScrapper;

new LocationAndDateScrapper();
