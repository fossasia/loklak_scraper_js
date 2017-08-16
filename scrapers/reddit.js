const BaseLoklakScrapper = require('./base');

const cheerio = require('cheerio');
const request = require('request-promise-native');
const Rx = require('rxjs/Rx');

class RedditLoklakScrapper extends BaseLoklakScrapper {

    constructor() {
        super('Reddit', 'https://www.reddit.com');
    }

    argumentSanityCheck(args) {
        super.argumentSanityCheck(args);
        return true;
    }

    onInit() {
        
    }

    /**
     * Return promise object of subreddit search url.
     * @param {*stirng} query subreddit search query
     */
    getSearchQueryPromise(query) {
        let url = `${this.BASE_URL}/search?q=${query}`;
        return request(url);
    }

    /**
     * Parses links of subreddit from search HTML and returns back an array of promise of
     * subreddit urls.
     * @param {*string} searchMatchHtml HTML of Subreddit search
     */
    getSubredditPromises(searchMatchHtml) {
        let subredditLinks = [];
        let $ = cheerio.load(searchMatchHtml);
        let contents = cheerio.load($("div.contents").html());
        contents("a.search-title").each((i, elem) => {
            let link = contents(elem).attr("href");
            link = link.substr(0, link.indexOf("?"));
            subredditLinks.push(link);
        })
        return subredditLinks.map(elem => request(elem));
    }

    /**
     * Parses the HTML of an individual Subreddit and return the JSONObject containing parsed
     * data.
     * @param {*CheerioStatic} $ HTML parsed DOM
     */
    scrape($) {
        const redditObj = {};
        const redditEntries = [];
        
        redditObj["redditname"] = $(".side").find(".redditname").find(".hover").text();
        redditObj["url"] = $(".side").find(".redditname").find(".hover").attr("href");
        let subscribersCount = $(".side").find(".subscribers").children().text();
        redditObj["subscribers_count"] = subscribersCount.substring(0, subscribersCount.indexOf("readers"));
        let readersOnlineCount =  $(".side").find(".users-online").children().text();
        redditObj["readers_online_count"] = readersOnlineCount.substring(0, readersOnlineCount.indexOf("users"));
        let entries = $(".thing");

        entries.each( (i, elem) => {
            let redditEntry = {};
            let url = "";
            redditEntry["title"] = $(elem).find(".title").find(".title").text();
            redditEntry["author"] = $(elem).attr("data-author");
            url = $(elem).attr("data-url");
            url = url.indexOf("http") === -1 ? this.BASE_URL + url : url;
            redditEntry["url"] = url;
            let commentsUrl = $(elem).find(".entry").find(".first").find(".bylink").attr("href");
            redditEntry["comments_url"] = commentsUrl;
            redditEntry["comments_count"] = $(elem).attr("data-comments-count");
            if ($(elem).find('.thumbnail').children().attr("src") !== undefined) {
                redditEntry["thumbnail_url"] = "https:" + $(elem).find('.thumbnail').children().attr("src");
            }
            redditEntry["score"] = $(elem).find(".midcol").find(".score").eq(1).text();
            redditEntries.push(redditEntry);
        });
        
        redditObj["entries"] = redditEntries;
        return redditObj;
    }

    /**
     * Uses scrape method to scrape a subreddit and pass the scraped data to a callback function.
     * @param {*string} query subreddit search query 
     * @param {*function} callback callback function to be invoked after completion
     */
    getScrapedData(query, callback) {
        Rx.Observable.fromPromise(this.getSearchQueryPromise(query))
            .flatMap((t, i) => {
                let subredditLinkPromises = this.getSubredditPromises(t);
                let obs = subredditLinkPromises.map(elem => Rx.Observable.fromPromise(elem));

                // each subreddit is parsed
                return Rx.Observable.zip(
                    ...obs,
                    (...subredditLinkObservables) => {
                        let scrapedSubreddit = [];
                        for (let i = 0; i < subredditLinkObservables.length; i++) {
                            let $ = cheerio.load(subredditLinkObservables[i]);
                            scrapedSubreddit.push(this.scrape($));
                        }
                        return scrapedSubreddit;
                    }
                )
            })
            .subscribe(
                scrapedData => callback({subreddits: scrapedData}),
                error => callback(error)
            );
    }
}

module.exports = RedditLoklakScrapper;

// Use of RedditLoklakScraper
// let reddit = new RedditLoklakScrapper();
// reddit.getScrapedData("python", data => console.log(JSON.stringify(data)));
