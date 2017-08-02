const BaseLoklakScraper = require('./base');

const cheerio = require("cheerio");
const request = require('request-promise-native');
const Rx = require('rxjs/Rx');

const YOUTUBE_SEARCH_URL = "https://www.youtube.com/results?search_query=";
const YOUTUBE_URL = "https://www.youtube.com";
const USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 " + 
    "(KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36";

class YoutubeLoklakScraper extends BaseLoklakScraper {

  constructor() {
    super('Youtube', 'https://www.youtube.com');
  }

  argumentSanityCheck(args) {
    super.argumentSanityCheck(args);
    return true;
  }

  onInit() {

  }

  /**
   * Creates Promise object with User-Agent for sending GET requests.
   * @param {*string} url URL to send GET request 
   */
  createRequestPromise(url) {
    let options = {
      uri: url,
      'User-Agent': USER_AGENT
    };
    return request(options);
  }

  /**
   * Return promise object of video search url
   * @param {*string} query video search query
   */
  getSearchQueryPromise(query) {
    let searchQuery = query.split(" ").join("+");
    let videoSearchUrl = YOUTUBE_SEARCH_URL + searchQuery;
    return this.createRequestPromise(videoSearchUrl);
  }

  /**
   * Parses url of Youtube videos from search of HTML and returns back an array of promise of
   * youtube video urls.
   * @param {*string} searchMatchHtml HTML of Youtube search result
   */
  getVideoLinkPromises(searchMatchHtml) {
    let videoUrls = [];
    let $ = cheerio.load(searchMatchHtml);

    $("a.yt-uix-tile-link").each((i, elem) => {
      let text = $(elem).next().text();
      // checks whether it is a video or not, can also be a playlist or a channel
      if (text.includes("Duration")) {
        let videoUrl = this.BASE_URL + $(elem).attr("href");
        videoUrls.push(videoUrl);
      }
    });
    return videoUrls.map(elem => this.createRequestPromise(elem));
  }

  /**
   * A cheerio object is passed containing parsed html to extract meta attribute.
   * @param {*Cheerio} cheerioFunction parsed HTML DOM.
   * @param {*string} metaAttribute attribute of meta tag, name of metadata
   * @param {*string} metaAttributeValue value of metadata
   */
  extractMetaAttribute(cheerioFunction, metaAttribute, metaAttributeValue) {
    let selector = 'meta[' + metaAttribute + '="' + metaAttributeValue + '"]';
    return cheerioFunction(selector).attr("content");
  }

  /**
   * Scrapes the matching meta properites.
   * @param {*Cheerio} cheerioObj parsed HTML DOM
   * @param {*string} metaProperty attribute of meta tag, name of metadata
   */
  extractMetaProperties(cheerioObj, metaProperty) {
    let properties = [];
    let selector = 'meta[property="' + metaProperty + '"]';
    cheerioObj(selector).each(function (i, element) {
      properties.push(cheerioObj(element).attr("content"));
    });
    return properties;
  }

  /**
   * Parses the HTML of an individual Youtube video page and returns back JSONObject
   * containg parsed data.
   * @param {*CheerioStatic} $ HTML parsed DOM
   */
  scrape($) {
    let head = cheerio.load($("head").html());
    let finalObj = {};
    // html_title
    finalObj["html_title"] = head("title").text();

    // youtube_next
    finalObj["youtube_next"] = [];
    $("a.content-link").each(function (i, element) {
      finalObj["youtube_next"].push($(element).attr("href"));
    });

    // og_site_name, og_url
    finalObj["og_site_name"] = this.extractMetaAttribute(head, "property", "og:site_name");
    finalObj["og_url"] = this.extractMetaAttribute(head, "property", "og:url");

    // og_title, og_image, og_description, og_type
    finalObj["og_title"] = this.extractMetaAttribute(head, "property", "og:title");
    finalObj["og_image"] = this.extractMetaAttribute(head, "property", "og:image");
    finalObj["og_description"] = this.extractMetaAttribute(head, "property", "og:description");
    finalObj["og_type"] = this.extractMetaAttribute(head, "property", "og:type");

    // og_url, og_video_type
    finalObj["og_video_url"] = this.extractMetaProperties(head, "og:video:url");
    finalObj["og_video_type"] = this.extractMetaProperties(head, "og:video:type");

    // og_video_width, og_video_height
    finalObj["og_video_width"] = this.extractMetaAttribute(head, "property", "og:video:width");
    finalObj["og_video_height"] = this.extractMetaAttribute(head, "property", "og:video:height");

    // og_video_tag
    finalObj["og_video_tag"] = this.extractMetaProperties(head, "og:video:tag");

    // paid, channel_id, videoId, duration, unlisted
    finalObj["youtube_paid"] = this.extractMetaAttribute($, "itemprop", "paid");
    finalObj["youtube_channelId"] = this.extractMetaAttribute($, "itemprop", "channelId");
    finalObj["youtube_videoId"] = this.extractMetaAttribute($, "itemprop", "videoId");
    finalObj["youtube_duration"] = this.extractMetaAttribute($, "itemprop", "duration");
    finalObj["youtube_unlisted"] = this.extractMetaAttribute($, "itemprop", "unlisted");

    // schema_org values: Person_Author_Url, ImageObject_thumbnail_url
    finalObj["schema_org_Person_author_url"] = [];
    $('span[itemtype="http://schema.org/Person"]').each(function (i, element) {
      finalObj["schema_org_Person_author_url"]
        .push($(element).children("link[itemprop=url]").attr("href"));
    });

    finalObj["schema_org_ImageObject_thumbnail_url"] = $("link[itemprop=thumbnailUrl]").attr("href");

    // playerType, familyFriendly, regionsAllowed, interactionCount, datePublished, genre
    finalObj["youtube_playerType"] = this.extractMetaAttribute($, "itemprop", "playerType");
    finalObj["youtube_isFamilyFriendly"] = this.extractMetaAttribute($, "itemprop", "isFamilyFriendly");
    finalObj["youtube_regionsAllowed"] = this.extractMetaAttribute($, "itemprop", "regionsAllowed");
    finalObj["youtube_interactionCount"] = this.extractMetaAttribute($, "itemprop", "interactionCount");
    finalObj["youtube_datePublished"] = this.extractMetaAttribute($, "itemprop", "datePublished");
    finalObj["youtube_genre"] = this.extractMetaAttribute($, "itemprop", "genre");

    // name, subscriber, view-count, likes, dislikes
    finalObj["youtube_subscriber"] = $("span.yt-short-subscriber-count").text();
    finalObj["youtube_viewcount"] = $("div.watch-view-count").text();

    $("span.yt-uix-button-content").each(function (i, element) {
      if (i === 17) { // for likes
        finalObj["youtube_likes"] = $(element).text();
      } else if (i === 20) { // for dislikes
        finalObj["youtube_dislikes"] = $(element).text();
      }
    });

    // category, license
    let categoryAndLicense = $("ul.watch-info-tag-list").text().split("\n");
    finalObj["youtube_category"] = categoryAndLicense[1].trim();
    finalObj["youtube_license"] = categoryAndLicense[3].trim();

    return finalObj;
  }

  /**
   * Uses the scrape method to scrape Youtube video details and pass the data to
   * callback function.
   * @param {*string} query Youtube video search query
   * @param {*function} callback callback function to be invoked after completion
   */
  getScrapedData(query, callback) {
    Rx.Observable.fromPromise(this.getSearchQueryPromise(query))
      .flatMap((t, i) => {
        let videoUrlPromises = this.getVideoLinkPromises(t);
        let obs = videoUrlPromises.map(elem => Rx.Observable.fromPromise(elem));

        // each Youtube video is parsed
        return Rx.Observable.zip(
          ...obs,
          (...videoUrlObservables) => {
            let scrapedVideoDetails = [];
            for (let i = 0; i < videoUrlObservables.length; i++) {
              let $ = cheerio.load(videoUrlObservables[i]);
              scrapedVideoDetails.push(this.scrape($));
            }
            return scrapedVideoDetails;
          }
        )
      })
      .subscribe(
        scrapedData => callback({videos: scrapedData}),
        error => callback(error)
      );
  }

}

module.exports = YoutubeLoklakScraper;

// Use of YoutubeLoklakScraper
// let youtubeScraper = new YoutubeLoklakScraper();
// youtubeScraper.getScrapedData("Rahul Dravid", (data) => {
//   console.log(data);
// });