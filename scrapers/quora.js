const BaseLoklakScrapper = require('./base');

class QuoraLoklakScrapper extends BaseLoklakScrapper {

  constructor() {
    super('Quora', 'https://www.quora.com');
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
    this.REQUEST_URL = this.BASE_URL + "/profile/" + this.SLICED_PROC_ARGS[0];
    this.request();
  }

  scrape($) {
    const quoraProfile = {};
    const feed = {};
    const topics = [];

    quoraProfile["profile_url"] = this.REQUEST_URL;
    quoraProfile["bio"] = $(".ProfileDescription").text();
    quoraProfile["profile_image"] = $(".profile_photo_img").attr("src");
    quoraProfile["user_name"] = $(".profile_photo_img").attr("alt");
    const rssFeedLink = this.BASE_URL + "/profile/" + this.SLICED_PROC_ARGS[0] + "/rss";
    quoraProfile["rss_feed_link"] = rssFeedLink;

    var stats = $(".list_count");
    for (var i = 0;i < stats.length; i++) {
      var stat=stats[i];
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

    this.JSON = quoraProfile;

    // Uncomment the following line for testing
    // console.log(quoraProfile);

    return this.JSON;
  }
}

module.exports = QuoraLoklakScrapper;

new QuoraLoklakScrapper();
