{
	"translatorID": "22d17fb9-ae32-412e-bcc4-7650ed3359bc",
	"label": "Musee du Louvre",
	"creator": "Adam Crymble",
	"target": "^https?://www\\.louvre\\.fr/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-12-27 14:54:34"
}

function detectWeb(doc, url) {
	if (doc.location.href.match("recherche")) {
		return "multiple";
	} else if (url.indexOf('oeuvre')>-1) {
		return "artwork";
	}
	
}

//Translator Musee du Louvre. Code by Adam Crymble

function scrape(doc, url) {

	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;	
	
	var dataTags = new Object();
	var tagsContent = new Array();
	
	var newItem = new Zotero.Item("artwork");

	//tags	
		var metaTagHTML = doc.getElementsByTagName("meta");
		for (var i = 0 ; i < metaTagHTML.length ; i++) {
			dataTags[metaTagHTML[i].getAttribute("name")] = Zotero.Utilities.cleanTags(metaTagHTML[i].getAttribute("content"));
		}
		
		newItem.abstractNote = dataTags["description"];
		
		if (dataTags["keywords"]) {
			if (dataTags["keywords"].match(", ")) {
				tagsContent = tagsContent = dataTags["keywords"].split(", ");
			} else if (dataTags["keywords"].split("、")) {
				tagsContent = dataTags["keywords"].split("、");
			}
		}
		
		for (var i = 0; i < tagsContent.length; i++) {
			newItem.tags[i] = tagsContent[i];
		}
		
	//date	
		var xPathDate = '//td[@class="txtContent"]/span[@class="txtContentSmall"]';
		
		if (doc.evaluate(xPathDate, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
			
			newItem.date = doc.evaluate(xPathDate, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		}
	
	//creator	
		var xPathCreator = '//td[@class="txtContent"]/strong';
		if (doc.evaluate(xPathCreator, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
			var creator = doc.evaluate(xPathCreator, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent.toLowerCase();
		
			var comma = 0;
			var parenthesis = 0;
			var commaSpot;
			var parenthesisSpot;
			
			if (creator.match(", ")) {
				comma = 1;
				commaSpot = creator.indexOf(",");
			}
			
			if (creator.match(/\(/)) {
				parenthesis = 1;
				parenthesisSpot = creator.indexOf(" (");
			} 
			
			if (comma == 1 && parenthesis == 1) {
				if (commaSpot < parenthesisSpot) {
					creator = creator.substr(0, commaSpot);
				} else {
					creator = creator.substr(0, parenthesisSpot);
				}
			} else if (comma == 1 && parenthesis == 0) {
				creator = creator.substr(0, commaSpot);	
			} else if (comma == 0 && parenthesis == 1) {
				creator = creator.substr(0, parenthesisSpot);
			}
		
			var words = creator.split(" ");
			
			for (var j in words) {
				if (words[j] != "" && words[j] != ' ') {
					if (words[j].match("-")) {
						Zotero.debug(words[j]);
						var hyphen = words[j].split("-");
						hyphen[0] = hyphen[0][0].toUpperCase() + hyphen[0].substr(1).toLowerCase() + "-";
						hyphen[1] = hyphen[1][0].toUpperCase() + hyphen[1].substr(1).toLowerCase();
						words[j] = hyphen[0] + hyphen[1];
					} else {
						words[j] = words[j][0].toUpperCase() + words[j].substr(1).toLowerCase();
					}
				}
			}
			creator = words.join(" ");
			newItem.creators.push(Zotero.Utilities.cleanAuthor(creator, "artist"));
		}
		
	
	//title
		var title1 = doc.title.split(" |");
		Zotero.debug(title1[0]);
		newItem.title = title1[0];	
		
	//extra
		if (doc.evaluate('//h1', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
		
			var collection1 = doc.evaluate('//h1', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
			newItem.extra = collection1.replace(/^\s*|\s*$/g, '');
		}
		
		newItem.repository = "Musée du Louvre";
		newItem.url = doc.location.href;
	
		newItem.complete();
}

function doWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	
	var articles = new Array();
	
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();

		var links = doc.evaluate('//h4/a[@class="lien"]', doc, nsResolver, XPathResult.ANY_TYPE, null);
		var titles = doc.evaluate('//h4/a/@title', doc, nsResolver, XPathResult.ANY_TYPE, null);
		
		var next_title;
		while (next_title = titles.iterateNext()) {
			items[links.iterateNext().href] = next_title.textContent;
		}
		items = Zotero.selectItems(items);
		for (var i in items) {
			articles.push(i);
		}
	} else {
		articles = [url];
	}
	Zotero.Utilities.processDocuments(articles, scrape, function() {Zotero.done();});
	Zotero.wait();	
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.louvre.fr/oeuvre-notices/stele-figurant-la-deesse-ishtar",
		"items": [
			{
				"itemType": "artwork",
				"title": "Stèle figurant la déesse Ishtar",
				"creators": [],
				"abstractNote": "Stèle : déesse Ishtar . Provenance : Tell Ahmar, antique Til Barsip. Epoque néo-assyrienne, VIIIe siècle av. J.-C. - Département des Antiquités orientales",
				"extra": "Œuvre Stèle figurant la déesse Ishtar",
				"libraryCatalog": "Musée du Louvre",
				"url": "http://www.louvre.fr/oeuvre-notices/stele-figurant-la-deesse-ishtar",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.louvre.fr/en/oeuvre-notices/stele-warrior-god",
		"items": [
			{
				"itemType": "artwork",
				"title": "Stele with warrior god",
				"creators": [],
				"extra": "Work Stele with warrior god",
				"libraryCatalog": "Musée du Louvre",
				"url": "http://www.louvre.fr/en/oeuvre-notices/stele-warrior-god",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.louvre.fr/en/oeuvre-notices/mona-lisa-portrait-lisa-gherardini-wife-francesco-del-giocondo?sous_dept=1",
		"items": [
			{
				"itemType": "artwork",
				"title": "Mona Lisa – Portrait of Lisa Gherardini, wife of Francesco del Giocondo",
				"creators": [],
				"extra": "Work Mona Lisa – Portrait of Lisa Gherardini, wife of Francesco del Giocondo",
				"libraryCatalog": "Musée du Louvre",
				"url": "http://www.louvre.fr/en/oeuvre-notices/mona-lisa-portrait-lisa-gherardini-wife-francesco-del-giocondo?sous_dept=1",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/