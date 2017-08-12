/* Usage : node instagram.js <profile_name>
*/

const BaseLoklakScrapper = require('./base');

var profile = null;

class instagramScrapper extends BaseLoklakScrapper {
	
	constructor() {
		super('Instagram','http://www.instagram.com/');
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
		this.REQUEST_URL = this.BASE_URL + this.SLICED_PROC_ARGS[0];
		this.request();
	}

	scrape($) {
		profile=this.REQUEST_URL;
		var instaBody=this.HTML;
		var pos1=instaBody.indexOf("window._sharedData = ");
		var pos2=instaBody.indexOf("</script>",pos1);
		var finalContent=instaBody.slice(pos1+21,pos2-1);
		var jsonParsedContent=JSON.parse(finalContent); 
		var instaData={};
		instaData["activity_counts"]=jsonParsedContent["activity_counts"];
		instaData["country_code"]=jsonParsedContent["country_code"];
		instaData["language_code"]=jsonParsedContent["language_code"];
		instaData["entry_data"]=jsonParsedContent["entry_data"];
		instaData["profile_url"]=profile;
		this.JSON=instaData;
		return this.JSON;
	}
}

module.exports=instagramScrapper;
new instagramScrapper();
