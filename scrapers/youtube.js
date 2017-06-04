var request = require('sync-request');
var cheerio = require("cheerio");

const USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36";
const REQUEST_HEADER = {
  headers: { "User-Agent": USER_AGENT }
};
const ENCODING = "UTF-8";
const YOUTUBE_SEARCH_URL = "https://www.youtube.com/results?search_query=";
const YOUTUBE_URL = "https://www.youtube.com";

function getHtml(url) {
  var result = request("GET", url, REQUEST_HEADER);
  return result.body.toString(ENCODING);
}

function getSearchMatch(query) {
  var url = YOUTUBE_SEARCH_URL + query.split(" ").join("+");
  return getHtml(url);
}

function getSearchMatchVideos(html) {
  var matchedVideoUrl = "";
  var $ = cheerio.load(html);
  $("a.yt-uix-tile-link").each(function (i, element) {
    var text = $(element).next().text();
    // checks whether it is a video or not, can also be a playlist or a channel
    if (text.indexOf("Duration") > 0) {
      matchedVideoUrl = $(this).attr("href");
      return false;
    }
  });
  return matchedVideoUrl;
}

function extractMetaAttribute(cheerioFunction, metaAttribute, metaAttributeValue) {
  var selector = 'meta[' + metaAttribute + '="' + metaAttributeValue + '"]';
  return cheerioFunction(selector).attr("content");
}

function extractMetaProperties(cheerioObj, metaProperty) {
  var properties = [];
  var selector = 'meta[property="' + metaProperty + '"]';
  cheerioObj(selector).each(function (i, element) {
    properties.push(cheerioObj(element).attr("content"));
  });
  return properties;
}

function getVideoDetails(matchedVideoUrl) {
  var finalObj = {};

  var url = YOUTUBE_URL + matchedVideoUrl;
  var html = getHtml(url);
  var $ = cheerio.load(html);
  var head = cheerio.load($("head").html());

  // html_title
  finalObj.html_title = head("title").text();

  // youtube_next
  finalObj.youtube_next = [];
  $("a.content-link").each(function (i, element) {
    finalObj.youtube_next.push($(element).attr("href"));
  });

  // og_site_name, og_url
  finalObj.og_site_name = extractMetaAttribute(head, "property", "og:site_name");
  finalObj.og_url = extractMetaAttribute(head, "property", "og:url");

  // og_title, og_image, og_description, og_type
  finalObj.og_title = extractMetaAttribute(head, "property", "og:title");
  finalObj.og_image = extractMetaAttribute(head, "property", "og:image");
  finalObj.og_description = extractMetaAttribute(head, "property", "og:description");
  finalObj.og_type = extractMetaAttribute(head, "property", "og:type");

  // og_url, og_video_type
  finalObj.og_video_url = extractMetaProperties(head, "og:video:url");
  finalObj.og_video_type = extractMetaProperties(head, "og:video:type");

  // og_video_width, og_video_height
  finalObj.og_video_width = extractMetaAttribute(head, "property", "og:video:width");
  finalObj.og_video_height = extractMetaAttribute(head, "property", "og:video:height");

  // og_video_tag
  finalObj.og_video_tag = extractMetaProperties(head, "og:video:tag");

  // paid, channel_id, videoId, duration, unlisted
  finalObj.youtube_paid = extractMetaAttribute($, "itemprop", "paid");
  finalObj.youtube_channelId = extractMetaAttribute($, "itemprop", "channelId");
  finalObj.youtube_videoId = extractMetaAttribute($, "itemprop", "videoId");
  finalObj.youtube_duration = extractMetaAttribute($, "itemprop", "duration");
  finalObj.youtube_unlisted = extractMetaAttribute($, "itemprop", "unlisted");

  // schema_org values: Person_Author_Url, ImageObject_thumbnail_url
  finalObj.schema_org_Person_author_url = [];
  $('span[itemtype="http://schema.org/Person"]').each(function (i, element) {
    finalObj.schema_org_Person_author_url
      .push($(element).children("link[itemprop=url]").attr("href"));
  });

  finalObj.schema_org_ImageObject_thumbnail_url = $("link[itemprop=thumbnailUrl]").attr("href");

  // playerType, familyFriendly, regionsAllowed, interactionCount, datePublished, genre
  finalObj.youtube_playerType = extractMetaAttribute($, "itemprop", "playerType");
  finalObj.youtube_isFamilyFriendly = extractMetaAttribute($, "itemprop", "isFamilyFriendly");
  finalObj.youtube_regionsAllowed = extractMetaAttribute($, "itemprop", "regionsAllowed");
  finalObj.youtube_interactionCount = extractMetaAttribute($, "itemprop", "interactionCount");
  finalObj.youtube_datePublished = extractMetaAttribute($, "itemprop", "datePublished");
  finalObj.youtube_genre = extractMetaAttribute($, "itemprop", "genre");

  // name, subscriber, view-count, likes, dislikes
  finalObj.youtube_subscriber = $("span.yt-short-subscriber-count").text();
  finalObj.youtube_viewcount = $("div.watch-view-count").text();

  $("span.yt-uix-button-content").each(function (i, element) {
    if (i === 17) { // for likes
      finalObj.youtube_likes = $(element).text();
    } else if (i === 20) { // for dislikes
      finalObj.youtube_dislikes = $(element).text();
    }
  });

  // category, license
  var categoryAndLicense = $("ul.watch-info-tag-list").text().split("\n");
  finalObj.youtube_category = categoryAndLicense[1].trim();
  finalObj.youtube_license = categoryAndLicense[3].trim();

  return finalObj;
}

function getScrapedVideoDetails(query) {
  var queryHtml = getSearchMatch(query);
  var matchedVideoUrls = getSearchMatchVideos(queryHtml);
  return getVideoDetails(matchedVideoUrls);
}

// uncomment for testing, use $node youtube.js "query_parameter"
// const QUERY_PARAM = process.argv[2];
// console.log(getScrapedVideoDetails(QUERY_PARAM));
