
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
var pageLoadTimeOut = 1000 ;

/*
// Configuration xiti
var hitDomain = 'https://logs.xiti.com/hit.xiti';
var splitChar1 = '?';
var splitChar2 = '&';


// Configuration DoubleClick
var hitDomain = 'https://2229883.fls.doubleclick.net/activityi';
var splitChar1 = ';';
var splitChar2 = ';';
*/

// Input (liste des URLs)
//var inputPath = '/Users/thomas/Documents/Startups/Automation/input/edf_20161219_01.csv';


// Propriétés de l'output
//var localWorkspacePath = '/Users/thomas/Documents/Startups/Automation/output/' ;
//var outputType = 'csv';



// ###################################
// Utilisation de l'input
// ###################################
/*
// Stockage de l'input dans une liste
var inputStream = fs.open(inputPath, 'r');
var urlList = new Array();
var x = 0;
while(!inputStream.atEnd()) {
    var line = inputStream.readLine();
    //console.log(line);
    urlList[x] = line ;
    //console.log(urlList[x]);
    x++;
}
inputStream.close();
*/

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
var outputString ="";
//var outputFileName = run + '_' + Date.now() + '.' + outputType ;
//var outputPath = localWorkspacePath + outputFileName ;
//var outputStream = fs.open(outputPath, 'w');
var columns = 'URL' 
			+ ',' 
			+ 'Tag'
			+ ',' 
			+ 'Hit'
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
// Définition de la fonction qui gère les requêtes sortantes
// ###################################

function manageHitRequest(request){


	// Pour tout voir passer
	//console.log('Request ' + JSON.stringify(request, undefined, 4));	
	
	// On ne traite que les hits du domaine configuré
	for (tag in tags){
		//console.log(tags[tag].name);
		var name = tags[tag].name ;
		var hitDomain = tags[tag].url ;
		var splitChar1 = tags[tag].splitChar1 ;
		var splitChar2 = tags[tag].splitChar2 ;
		//console.log(request.url.split(splitChar1)[0]);
		if(request.url.split(splitChar1)[0]===hitDomain){	
			//console.log('Request ' + JSON.stringify(request, undefined, 4));	
			var hitUrl = request.url ;
			//console.log(hitUrl);
			//var ref = request.headers[0].value ;
			var ref = urlList[counter];
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
				//console.log(chain);
				
				assignerIndex = chain.indexOf('=');
				//console.log(assignerIndex);

				key = chain.substring(0,assignerIndex);
				//console.log(key);

				value = chain.substring(assignerIndex+1);
				//console.log(value);

				//console.log(key + ': ' + value);

				hitParams[key] = value;		

			}

			for(var k in hitParams){
			  	var url = ref;
			  	var tag = name;
			  	var hit = hitUrl;
			  	var param = k;
			  	var value = hitParams[k];
			  	var content = url 
			  				+ ',' 
			  				+ tag
			  				+ ',' 
			  				+ hit
			  				+ ','
			  				+ k
			  				+ ','
			  				+ value
			  				;
				console.log(content);
				outputString += content + "\n" ;
				//outputJson.push();
			  	//outputStream.write(content+'\n');

			}			

		}
	}		
}


// ###################################
// Définition de la fonction qui gère les requêtes entrantes
// ###################################

function manageHitResponse(response){
	//console.log('Receive ' + JSON.stringify(response, undefined, 4));
}




// ###################################
// Définition de la fonction qui manipule les pages
// ###################################

function handlePage(pPage, pUrl){

	pUrl = pUrl.url;

	// Ouvrir l'URL dans la page	
	pPage.open(pUrl, function(status) {

		//console.log(status);


		if (status !== 'success') {
	    	
	    	console.log('FAIL to load the address: ' + pUrl);
	    	counter++;
	    	//console.log('Progress: ' + Math.round(100*(counter / urlList.length)) + '%');
	    	handlePage(pPage, urlList[counter]);
	  	
	  	} else {


			//console.log('page opened: '+ pUrl);

	    	
	    	//console.log(status);
	    	//t = Date.now() - t;
	    	//console.log('Loading ' + url);
	    	//console.log('Loading time ' + t + ' msec');
		
			//page.evaluate(function() {
	  			//console.log('type:' + tC.internalvars.doubleclic_type );
	    		//console.log('cat:' + tC.internalvars.doubleclick_cat);
	 		//});
	 		

			//console.log(renderPath);
//			pPage.onLoadFinished = function() {


			    setTimeout(function(){
		            
		            //console.log("that's long enough");
         			
         			// Screenshot
					if (screenshot){
						strongUrl = pUrl.replace(/\//gm, '_').replace(/:/gm ,'_');
						//console.log(strongUrl);
						var renderPath = localWorkspacePath + '/screenshots/' + strongUrl + '.png' ;
						pPage.render(renderPath);
					}

					counter++;
	 				//console.log('Progress: ' + Math.round(100*(counter / urlList.length)) + '%');

					if (counter === urlList.length){
						pPage.close();
						//console.log('page closed: '+ pUrl);					
					//	outputStream.close();
						//console.log(outputString);
					    filePath = filePath.split(".")[0] + "_output.csv" ;
					    console.log(filePath);
					    fs.write(filePath, outputString, 'w');
					    /*
					    fs.writeFile(filePath, JSON.stringify(outputJson), function(err) {
							if(err) {
          						return console.log(err);
  							}
      						console.log("The file was saved!"); 
    					});
*/
						phantom.exit();
					
					} else {
						handlePage(pPage, urlList[counter]);	
					}


	  		    },pageLoadTimeOut)	;
				//console.log('rendered: ' + renderPath) ;
//			};

		}

	});		

}



// ###################################
// Parcourir la liste des URLs
// ###################################

var counter = 0 ;

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
  manageHitRequest(request);
};

// Activer le logging des reponses dans la page
page.onResourceReceived = function(response) {
	manageHitResponse(response);
};

page.viewportSize = screenSize ;
//var t;
//t = Date.now();
handlePage(page, urlList[counter]);	
//console.log(urlList[counter]);
			


