var unirest = require("unirest");

if (process.argv.length <= 2) {
  console.log("Provide question as argument");
  process.exit(-1);
}

const question = process.argv[2];

const SEARCH_URL = "https://api.stackexchange.com/2.2/search/advanced?order=desc&sort=activity&q=" + question + "&answers=1&site=stackoverflow";
const QUESTIONANDANSWER_BASE_URL = "https://api.stackexchange.com/2.2/questions/";
const QUESTION_TRAILING_URL = "?order=desc&sort=activity&site=stackoverflow&filter=withbody";
const ANSWER_TRAILING_URL = "/answers?order=desc&sort=activity&site=stackoverflow&filter=withbody";

unirest.get(SEARCH_URL)
  .end((response) => {
    var response = JSON.parse(response.raw_body);
    var QandA = new Array();
    if (response.quota_remaining > 0) {
      j = 0;
      for (i = 0; i < response.items.length; i++) {
        var item = response.items[i];
        getQuestionAndAnswers(item, (data, title, link) => {
          var obj = new Object;
          obj["answersWithoutHtml"] = data.answersWithoutHtml;
          obj["answersWithHtml"] = data.answersWithHtml;
          obj['questionWithoutHtml'] = data.questionWithoutHtml;
          obj['questionWithHtml'] = data.questionWithHtml;
          obj['title'] = title;
          obj['link'] = link;
          QandA.push(obj);
          if (j == response.items.length - 1) {
            console.log(QandA);  //Final output
          }
          j++;
        });


      }
    } else {
      console.log("Request limit reached. Try after 24hrs.");
    }
    console.log("Requests Left: " + response.quota_remaining);
  });



function getQuestionAndAnswers(item, callback) {
  var obj = new Object;
  var questionId = item.question_id;
  unirest.get(QUESTIONANDANSWER_BASE_URL + questionId + QUESTION_TRAILING_URL)
    .end((questionBody) => {
      obj['questionWithoutHtml'] = JSON.parse(questionBody.raw_body).items[0].body.replace(/<\/?[^>]+(>|$)/g, "").replace(/[^\x20-\x7E]|\'|\\|\/\//gmi, "");
      obj['questionWithHtml'] = JSON.parse(questionBody.raw_body).items[0].body;
      var arr = new Array();
      var arr1 = new Array();
      unirest.get(QUESTIONANDANSWER_BASE_URL + questionId + ANSWER_TRAILING_URL)
        .end((answersBody) => {
          var answersBody = JSON.parse(answersBody.raw_body);
          answersBody.items.forEach((item) => {
            arr.push(item.body.replace(/<\/?[^>]+(>|$)/g, "").replace(/[^\x20-\x7E]|\'|\\|\/\//gmi, ""));
            arr1.push(item.body);
          });
          obj["answersWithoutHtml"] = arr;
          obj["answersWithHtml"] = arr1;
          callback(obj, item.title, item.link);
        });
    });
}

