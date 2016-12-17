
console.log('\n-----------------------------');
console.log('--- Web clicker v 0.0.1 ---');
console.log('-----------------------------');


//############################################
//Configuration du run
//############################################

var fs = require('fs');
var system = require('system');

var hitDomains = new Array();
hitDomains['DoubleClick_Event'] = 'http://ad.doubleclick.net/activity' ;
hitDomains['DoubleClick_Page'] = 'https://2229883.fls.doubleclick.net/activityi' ;



//var hitDomain = 'https://2229883.fls.doubleclick.net/activityi';
//var hitDomain = 'http://ad.doubleclick.net/activity' ;
var splitChar1 = ';';
var splitChar2 = ';';



// ###################################
// Définition de la fonction qui gère les requêtes sortantes
// ###################################

function manageHitRequest(request){
	
	for (var x in hitDomains){



		//console.log('Request ' + JSON.stringify(request, undefined, 4));	
			// On ne traite que les hits du domaine configuré
		if(request.url.split(splitChar1)[0] === hitDomains[x]){	
			//console.log('Request ' + JSON.stringify(request, undefined, 4));	
			var hitUrl = request.url ;
			//console.log(hitUrl);
			var ref = request.headers[0].value ;
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
			
			hitParams['Domain'] = hitDomains[x];


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
			  	var content = page.url
			  				+ ','
			  				+ x
			  				+ ',' 
			  			//	+ hitUrl

			  				+ k
			  				+ ','
			  				+ hitParams[k]
			  				;
				console.log(content);

			}	

		}
	}	
}




// ###################################
// Définition de la fonction qui gère les réponses
// ###################################

function manageHitResponse(response){
	//console.log(JSON.stringify(response, undefined, 4));
}





// ###################################
// Fonctions de sortie s
// ###################################

function exit(page){
	//page.close();
	console.log('-----------------------------');
	console.log('Run closed.');
	console.log('-----------------------------\n');
	phantom.exit();
}


function exitOnFail(page){
	console.log('-----------------------------');
	console.log('Major error in run. No output created.');
	console.log('-----------------------------\n');
	exit(page);
}




// ###################################
// Fonction de parcours de la pagination pour les sites, tour à tour
// ###################################

function openURL(page, requestURL) {

	var customRequest = requestURL ;
	page.open(customRequest, function(status) {
    
		//console.log(page.url);
		// Gestion du cas où la requête n'aboutit pas
		if (status !== 'success') {	    	
	    	console.log('FAILED to load the address. Retrying...');

	  	} else {


		    // Gestion d'une page de résultats
		    setTimeout(function(){

		    	page.evaluate(function(){

					//var element = page.querySelector("a[textContent='Consulter les prix']");
					var element = page.querySelector("a[class='btn btn-green animateBtn doubleclick']");
					//var element = page.querySelector("li[class='bouton-1']").innerHTML;
					//console.log(element);
					var xPos = console.log(element.offsetLeft);
					var yPos = console.log(element.offsetTop);
					
					var event = document.createEvent( 'MouseEvents' );
					event.initMouseEvent( 'click', true, true, window, 1, 0, 0, xPos, yPos);
					element.dispatchEvent(event);


		    	});
				

		    },100);


		    setTimeout(function(){
		    	//console.log(page.url);
			    exit();
		    },3000);



		}



	});		

}


// ###################################
// Lancer le run
// ###################################

var page = require('webpage').create();


// Activer le logging les logs de la page
page.onConsoleMessage = function(msg) {
  console.log(msg);
};

// Activer le logging des requetes dans la page
page.onResourceRequested = function(request) {
  manageHitRequest(request);
};

// Activer le logging des reponses dans la page
page.onResourceReceived = function(response) {
	manageHitResponse(response);
};


var screenSize = { width: 1920, height: 1080 };
page.viewportSize = screenSize ;





// Aller à la page et effectuer les actions
var requestURL = 'https://www.edf.fr/entreprises/electricite-gaz/gaz/offre-gaz-naturel-a-prix-garanti-3-ans' ;

openURL(page, requestURL);










