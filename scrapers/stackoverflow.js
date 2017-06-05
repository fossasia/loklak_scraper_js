var unirest = require("unirest");
var question = "";
for (i = 2; i < process.argv.length; i++) {
    question += process.argv[i] + " ";
}
var url = "https://api.stackexchange.com/2.2/search/advanced?key=jAAMPr3uTSgYulMJ3LY5Hw((&order=desc&sort=activity&q=" + question + "&answers=1&site=stackoverflow";
unirest.get(url)
    .end((response) => {
        var response = JSON.parse(response.raw_body);
        var QandA = new Array();
        if (response.quota_remaining > 0) {
            j = 0;
            for (i = 0; i < response.items.length; i++) {

                var item = response.items[i];
                getQuestionAndAnswers(item, (data, title, link) => {
                    var obj = new Object;
                    obj['question'] = data.question;
                    obj['answers'] = data.answers;
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
    var urlAnswers = "https://api.stackexchange.com/2.2/questions/" + questionId + "/answers?key=jAAMPr3uTSgYulMJ3LY5Hw((&order=desc&sort=activity&site=stackoverflow&filter=withbody";
    var urlQuestion = "https://api.stackexchange.com/2.2/questions/" + questionId + "?key=jAAMPr3uTSgYulMJ3LY5Hw((&order=desc&sort=activity&site=stackoverflow&filter=withbody";
    unirest.get(urlQuestion)
        .end((questionBody) => {
            var questionBody = JSON.parse(questionBody.raw_body);
            obj['question'] = questionBody.items[0].body.trim();
            var arr = new Array();
            unirest.get(urlAnswers)
                .end((answersBody) => {

                    var answersBody = JSON.parse(answersBody.raw_body);
                    answersBody.items.forEach((item) => {
                        arr.push(item.body.trim());
                    });
                    obj["answers"] = arr;
                    callback(obj, item.title, item.link);
                });
        });
}

