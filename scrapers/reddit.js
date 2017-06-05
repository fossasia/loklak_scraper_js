const BaseLoklakScrapper = require('./base');

class RedditLoklakScrapper extends BaseLoklakScrapper {

    constructor() {
        super('Reddit', 'https://www.reddit.com');
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
        this.REQUEST_URL = this.BASE_URL + "/r/" + this.SLICED_PROC_ARGS[0];
        this.request();
    }

    scrape($) {
        const redditObj = {};
        const redditEntries = [];
        
        redditObj["redditname"] = $(".side").find(".redditname").find(".hover").text();
        redditObj["url"] = $(".side").find(".redditname").find(".hover").attr("href");
        var subscribersCount = $(".side").find(".subscribers").children().text();
        redditObj["subscribers_count"] = subscribersCount.substring(0, subscribersCount.indexOf("readers"));
        var readersOnlineCount =  $(".side").find(".users-online").children().text();
        redditObj["readers_online_count"] = readersOnlineCount.substring(0, readersOnlineCount.indexOf("users"));
        var entries = $(".thing");

        entries.each( (i, elem) => {
            var redditEntry = {};
            var url = "";
            redditEntry["title"] = $(elem).find(".title").find(".title").text();
            redditEntry["author"] = $(elem).attr("data-author");
            url = $(elem).attr("data-url");
            url = url.indexOf("http") === -1 ? this.BASE_URL + url : url;
            redditEntry["url"] = url;
            var commentsUrl = $(elem).find(".entry").find(".first").find(".bylink").attr("href");
            redditEntry["comments_url"] = commentsUrl;
            redditEntry["comments_count"] = $(elem).attr("data-comments-count");
            if ($(elem).find('.thumbnail').children().attr("src") !== undefined) {
                redditEntry["thumbnail_url"] = "https:" + $(elem).find('.thumbnail').children().attr("src");
            }
            redditEntry["score"] = $(elem).find(".midcol").find(".score").eq(1).text();
            redditEntries.push(redditEntry);
        });
        
        redditObj["entries"] = redditEntries;
        this.JSON = redditObj;

        // for testing the scraper uncomment the following line
        // console.log(redditObj);

        return this.JSON;
    }
}

module.exports = RedditLoklakScrapper;

new RedditLoklakScrapper();
