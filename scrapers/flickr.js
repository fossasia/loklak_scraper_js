const BaseLoklakScraper = require('./base');

const cheerio = require('cheerio');
const request = require('request-promise-native');
const Rx = require('rxjs/Rx');

const USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36";

class FlickrScraper extends BaseLoklakScraper {

    constructor() {
        super('Flickr', 'https://www.flickr.com');
    }

    argumentSanityCheck(args) {
        return super.argumentSanityCheck(args);
    }

    onInit() {

    }

    scrape($) {

    }

    //Function for scraping flickr profile
    scrapeflickrprofile(html, profile, flickr_profile) {
        let $ = cheerio.load(html);

        var name = $(".given-name").text() + ' ' + $(".family-name").text();
        flickr_profile["name"] = name;

        var bio = $(".note").text();
        flickr_profile["bio"] = bio;

        var photos_count = $('.statcount').find('h1').text()
        flickr_profile["photos_count"] = photos_count;

        flickr_profile["profile_url"] = this.BASE_URL + "/people/" + profile;
    }


    //Function for scraping photos
    scrapeflickrphotos(html, profile, flickr_profile) {
        let $ = cheerio.load(html);

        flickr_profile["photos_url"] = this.BASE_URL + "/photos/" + profile;
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

    /**
     * Creates promise object for sending GET requests
     * @param {*string} requestUrl API endpoint url
     */
    getRequestPromise(requestUrl) {
        let options = {
            uri: requestUrl,
            headers: {'User-Agent': USER_AGENT}
        };
        return request(options);
    }

    getScrapedData(profile, callback) {
        let flickr_profile = {}

        Rx.Observable.fromPromise(this.getRequestPromise(this.BASE_URL + "/people/" + profile))
            .flatMap((t, i) => {
                this.scrapeflickrprofile(t, profile, flickr_profile);
                return Rx.Observable.fromPromise(
                    this.getRequestPromise(this.BASE_URL + "/photos/" + profile));
            })
            .flatMap((t, i) => {
                this.scrapeflickrphotos(t, profile, flickr_profile);
                return Rx.Observable.of(flickr_profile);
            })
            .subscribe(
                profile => callback(profile),
                error => callback(error)
            );
    }
}

module.exports = FlickrScraper;

//Uncomment the following lines to test the scraper
//let flickr = new FlickrScraper();
//flickr.getScrapedData("achintthomas", profile => console.log(profile));
