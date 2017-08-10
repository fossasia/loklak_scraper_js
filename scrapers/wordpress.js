const BaseLoklakScraper = require('./base');


const cheerio = require('cheerio');
const request = require('request-promise-native');
const Rx = require('rxjs/Rx');

class WordpressLoklakScraper extends BaseLoklakScraper {

  constructor() {
    super('Wordpress', 'http://blog.fossasia.org');
  }

  argumentSanityCheck(args) {
    super.argumentSanityCheck(args);
    return true;
  }

  onInit() {

  }

  scrape($) {
    let data = {}
    let blogPosts = [];

    let authorName = $(".page-title").text().split(":")[1];
    let aboutAuthor = $(".taxonomy-description").text();

    $("article").each(function(i, elem) {
      let article = {};

      let url = $(this).find(".entry-title").children().first().attr("href");
      article["blog_url"] = url;

      let title = $(this).find(".entry-title").text().trim();
      article["title"] = title;

      let postedOn = $(this).find(".posted-on").text().trim();
      article["posted_on"] = postedOn;

      let author = $(this).find(".byline").text().trim();
      article["author"] = author.substring(author.indexOf(" ") + 1);

      let content = $(this).find(".entry-content").text().trim();
      article["content"] = content;

      blogPosts.push(article);
    });

    let postsNumber = blogPosts.length;

    data["authorName"] = authorName;
    data["aboutAuthor"] = aboutAuthor;
    data["numberOfPosts"] = postsNumber;
    data["posts"] = blogPosts;

    return data;

  }

  getRequestPromise(requestUrl) {
    let options = {
        uri: requestUrl,
        headers: {'User-Agent': this.USER_AGENT},
        json: true
    };
    return request(options);
  }

  getScrapedData(profile, callback) {
    Rx.Observable.fromPromise(this.getRequestPromise(this.BASE_URL + "/author/" + profile))
      .flatMap((t, i) => {
        let $ = cheerio.load(t);
        let data = this.scrape($);
        return Rx.Observable.of(data);
      })
      .subscribe(
        data => callback(data),
        error => callback(error)
      );
  }
}

module.exports = WordpressLoklakScraper;

//Uncomment to test the scraper
//let w = new WordpressLoklakScraper();
//w.getScrapedData("djmgit", data => {console.log(data)});
