
//############################################
//Configuration du run
//############################################


// Nom du run
var fs = require('fs');
var system = require('system');

// Activer les screeshots
var screenshot = false ;
var screenSize = { width: 1920, height: 1080 };

// Temps de chargement des pages prévu
var pageLoadTimeOut = 2500 ;



// ###################################
// Utilisation de l'input
// ###################################


var filePath =  system.args[1];
//console.log(filePath);

var runConf = fs.read(filePath);
var runConf_parse = JSON.parse(runConf);

//console.log(runConf);
//console.log(runConf_parse.owner);
//console.log(runConf_parse.journey[0].url);

var urlList = new Array();
urlList = JSON.parse(JSON.stringify(runConf_parse.journey)) ;


var tags = new Array();
tags = JSON.parse(JSON.stringify(runConf_parse.tags)) ;
for (tag in tags){
		console.log(tags[tag].name) ;
		console.log(tags[tag].url) ;
		console.log(tags[tag].splitChar1) ;
		console.log(tags[tag].splitChar2) ;
}



// ###################################
// Initialisation du fichier d'output
// ###################################
var outputString ="sep=,\n";
//var outputFileName = run + '_' + Date.now() + '.' + outputType ;
//var outputPath = localWorkspacePath + outputFileName ;
//var outputStream = fs.open(outputPath, 'w');
var columns = 'URL' 
			+ ',' 
			+ 'Tag'
			+ ','
			+ 'Timing'
			+ ','
			+ 'Index'
			+ ','			
			+ 'Hit'
			+ ','
			+ 'RedirectURL'
			+ ','	
			+ 'Status'
			+ ','						
			+ 'Parameter'
			+ ','
			+ 'Value'
			;
console.log(columns);
outputString += columns ;
outputString += "\n";
//outputStream.write(columns+'\n');





// ###################################
// Définition de la fonction qui gère les requêtes/réponses 
// ###################################

function manageHit(request){


	// Pour tout voir passer
	//console.log('Request ' + JSON.stringify(request, undefined, 4));	
	
	// On ne traite que les hits du domaine configuré
	for (tag in tags){
		//console.log(tags[tag].name);
		var name = tags[tag].name ;
		//console.log(name);
		
		var hitDomain = tags[tag].url ;
		//console.log(hitDomain);
		
		var splitChar1 = tags[tag].splitChar1 ;
		//console.log(splitChar1);
		
		var splitChar2 = tags[tag].splitChar2 ;
		//console.log(splitChar2);

		//console.log(request.url.split(splitChar1)[0]);
		if(request.url.split(splitChar1)[0]===hitDomain){	
			//console.log('Request ' + JSON.stringify(request, undefined, 4));	
			var hitIndex = hitNumber++;
			var hitUrl = request.url ;
			//console.log(hitUrl);
			//var ref = request.headers[0].value ;
			var ref = urlList[refCounter].url;
			//console.log(ref);

			
			// On isole la partie après splitChar1
			var hitUrlParams = hitUrl.substring(hitUrl.indexOf(splitChar1)+1);
			//console.log(hitUrlParams);

			// On crée un tableau contenant les sous-chaines séparées par splitChar2
			var splitted = hitUrlParams.split(splitChar2); 
			//console.log(splitted.length); 

			// On crée une table qui contient les clefs et valeurs de paramètres
			var hitParams = new Array();
			var i;
			var chain;
			var key;
			var value;
			
			for(i=0; i<splitted.length; i++){
				chain = splitted[i];
				assignerIndex = chain.indexOf('=');
				key = chain.substring(0,assignerIndex);
				value = chain.substring(assignerIndex+1);
				hitParams[key] = value;		
			}

		  	var url = ref;
		  	var tag = name;
		  	var hit = hitUrl;
		  	console.log(hit);
		  	var redirection = "" ;
		  	if(request.redirectURL){
		  		redirection =  request.redirectURL;
		  	}

			outputString += url
						+ ','
						+ tag
						+ ','
		  				+ (Date.now()-startTime)
		  				+ ','
		  				+ hitIndex
		  				+ ','		  				 						
						+ hit
						+ ','
						+ redirection						
						+ ','
						+ request.status
						+ ',,\n' ;

			for(var k in hitParams){
			  	var param = k;
			  	var value = hitParams[k];
			  	var content = url 
			  				+ ',' 
			  				+ tag
			  				+ ',,' 
			  				+ hitIndex
			  				+ ',' 
			  				+ hit
			  				+ ',,,'
			  				+ k
			  				+ ','
			  				+ value
			  				;

				outputString += content + "\n" ;

			}

		}
	}		
}






// ###################################
// Définition de la fonction qui manipule les pages
// ###################################

function handlePage(pPage, pUrl){

	pUrl = pUrl.url;
	hitNumber = 1 ;

	// Ouvrir l'URL dans la page	
	pPage.open(pUrl, function(status) {

		if (status !== 'success') {
	    	
	    	console.log('FAIL to load the address: ' + pUrl);

	    	handleNext(pPage);
	  	
	  	} else {


		    setTimeout(function(){

     			
     			// Screenshot
				if (screenshot){
					strongUrl = pUrl.replace(/\//gm, '_').replace(/:/gm ,'_');
					//console.log(strongUrl);
					var renderPath = localWorkspacePath + '/screenshots/' + strongUrl + '.png' ;
					pPage.render(renderPath);
				}

				handleNext(pPage);

  		    },pageLoadTimeOut)	;

		}

	});		

}


function handleNext(pPage){

	counter++;

	if (counter  === urlList.length){
		pPage.close();
	    filePath = filePath.split(".")[0] + "_output.csv" ;
	    console.log(filePath);
	    fs.write(filePath, outputString, 'w');
		phantom.exit();
	
	} else {
		refCounter++;
		handlePage(pPage, urlList[counter]);	
	}


}


// ###################################
// Parcourir la liste des URLs
// ###################################

var counter = 0 ;
var refCounter = 0;
//var occurence = 0;
var startTime ;
var hitNumber = 1;

var outputJson = new Array();
//outputJson.push("toto");

var page = require('webpage').create();

// Activer le logging les logs de la page
page.onConsoleMessage = function(msg) {
  //console.log(msg);
};
//console.log('logs activated');

// Activer le logging des requetes dans la page
page.onResourceRequested = function(request) {
  //////////manageHitRequest(request);
};

// Activer le logging des reponses dans la page
page.onResourceReceived = function(response) {
	//////////manageHitResponse(response);

	if(response.stage == 'start') return;
	manageHit(response);
};

page.onLoadStarted = function() {
  startTime = Date.now();
};

page.viewportSize = screenSize ;

handlePage(page, urlList[counter]);	

			


