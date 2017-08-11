/* Usage : node instagram.js <profile_name>
*/

const BaseLoklakScrapper = require('./base');

var profile = null;

class instagramScrapper extends BaseLoklakScrapper
{
	constructor()
	{
		super('Instagram','http://www.instagram.com/');
	}

	argumentSanityCheck(args) 
	{
		super.argumentSanityCheck(args);

		if (args.length <= 2) 
		{
			console.error('Atleast one argument required.');
			process.exit(-1);
		}

		return true;
	}

	onInit() {
		this.REQUEST_URL = this.BASE_URL + this.SLICED_PROC_ARGS[0];
		this.request();
	}

	scrape($)
	{
		profile=this.REQUEST_URL;
		var instaBody=this.HTML;
		var pos1=instaBody.indexOf("window._sharedData = ");
		var pos2=instaBody.indexOf("</script>",pos1);
		var finalContent=instaBody.slice(pos1+21,pos2-1);
		var jsonParsedContent=JSON.parse(finalContent); 
		this.JSON=jsonParsedContent;
		var keys=Object.keys(jsonParsedContent);
		//uncomment the line below to display JSON keys
		//console.log(keys); 
		//uncomment the function below to display some common details
		this.display(jsonParsedContent); 
		return this.JSON;
	}

	display(jsonParsedContent)
	{
		console.log(jsonParsedContent["activity_counts"]);
		console.log(jsonParsedContent["country_code"]);
		console.log(jsonParsedContent["language_code"]);
		var profileDetails=jsonParsedContent["entry_data"]["ProfilePage"];
		console.log(profileDetails[0]["user"]);
	}
}

module.exports=instagramScrapper;
new instagramScrapper();
