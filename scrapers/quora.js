const BaseLoklakScrapper = require('./base');

const cheerio = require('cheerio');
const request = require('request-promise-native');
const Rx = require('rxjs/Rx');

class QuoraProfileLoklakScraper extends BaseLoklakScrapper {

  constructor() {
    super('Quora', 'https://www.quora.com');
  }

  argumentSanityCheck(args) {
    super.argumentSanityCheck(args);
    return true;
  }

  onInit() {
    this.REQUEST_URL = this.BASE_URL + "/profile/" + this.SLICED_PROC_ARGS[0];
  }

  /**
   * Returns promise object of profile search url.
   * @param {*string} query profile search query
   */
  getSearchQueryPromise(query) {
    let profileSearchUrl = `${this.BASE_URL}/search?q=${query}&type=profile`;
    return request(profileSearchUrl);
  }

  /**
   * Parses links of Quora profile from search HTML and returns back an array of promise of profile
   * urls.
   * @param {*string} searchMatchHtml HTML of Quora profile search page
   */
  getProfileLinkPromises(searchMatchHtml) {
    let profileLinks = [];
    let $ = cheerio.load(searchMatchHtml);
    $("a.user").each((i, elem) => {
      let relativeLink = $(elem).attr("href");
      let profileLink = `${this.BASE_URL}/${relativeLink}`;
      profileLinks.push(profileLink);
    })
    return profileLinks.map(elem => request(elem));
  }

  /**
   * Parses the HTML of an individual Quora profile and returns back JSONObject containing parsed
   * data.
   * @param {*CheerioStatic}  $ HTML parsed DOM
   */
  scrape($) {
    const quoraProfile = {};
    const feed = {};
    const topics = [];

    quoraProfile["profile_url"] = $('link[rel="canonical"]').attr("href");
    quoraProfile["bio"] = $(".ProfileDescription").text();
    quoraProfile["profile_image"] = $(".profile_photo_img").attr("src");
    quoraProfile["user_name"] = $(".profile_photo_img").attr("alt");
    const rssFeedLink = this.BASE_URL + "/profile/" + this.SLICED_PROC_ARGS[0] + "/rss";
    quoraProfile["rss_feed_link"] = rssFeedLink;

    var stats = $(".list_count");
    for (var i = 0; i < stats.length; i++) {
      var stat = stats[i];
      feed[stat.prev.data.toLowerCase().trim() + "_url"] = this.BASE_URL + stat.parent.attribs.href;
      feed[stat.prev.data.toLowerCase().trim() + "_count"] = stat.children[0].data;
    }
    quoraProfile["feed"] = feed;

    $(".IdentityCredential").each((i, elem) => {
      var infoText = $(elem).text();
      if (infoText.substring(0, 5) === "Studi") {
        quoraProfile[infoText.split(" ")[0].toLowerCase().trim() + "_at"] = infoText;
      } else if (infoText.substring(0, 5) === "Lives") {
        quoraProfile["lives_in"] = infoText;
      } else {
        quoraProfile["works_at"] = infoText;
      }
    });

    $(".TopicName").each((i, elem) => {
      topics.push($(elem).text());
    });
    quoraProfile["knows_about"] = topics;
    return quoraProfile;
  }

  /**
   * Uses the scrape method to scrape Quora profiles from quora and passed the data
   * to callback function.
   * @param {*string} query quora profile search query
   * @param {*function} callback callback function to be invoked after completion
   */
  getScrapedData(query, callback) {
    Rx.Observable.fromPromise(this.getSearchQueryPromise(query))
      .flatMap((t, i) => {
        let profileLinkPromises = this.getProfileLinkPromises(t);
        let obs = profileLinkPromises.map(elem => Rx.Observable.fromPromise(elem));

        // each Quora profile is parsed
        return Rx.Observable.zip(
          ...obs,
          (...profileLinkObservables) => {
            let scrapedProfiles = [];
            for (let i = 0; i < profileLinkObservables.length; i++) {
              let $ = cheerio.load(profileLinkObservables[i]);
              scrapedProfiles.push(this.scrape($));
            }
            return scrapedProfiles;
          }
        )
      })
      .subscribe(
        scrapedData => callback({profiles: scrapedData}),
        error => callback(error)
      );
  }
}

module.exports = QuoraProfileLoklakScraper;

// Use of QuoraProfileLoklakScraper
// let quoraProfiles = new QuoraProfileLoklakScraper();

// quoraProfiles.getScrapedData("Rahul", (data) => {
//   console.log(data);
// });