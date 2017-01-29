'use strict';

const app = require('./app');
const port = app.get('port');

const https = require('https');
const fs = require('fs');
const server = app.listen(port);

https.createServer({
  //DEV
  //	key: fs.readFileSync('key.pem'),
  //	cert: fs.readFileSync('cert.pem')
  //PROD
	key: fs.readFileSync('key_name.key'),
	cert: fs.readFileSync('tagzmahal-com.cer')
}, app).listen(1443);

server.on('listening', () =>
  console.log(`Feathers application started on ${app.get('host')}:${port}`)
);






////////////////////////////
////////////////////////////
// Ajout pour le POC excelJS
////////////////////////////
////////////////////////////

/*
var Excel = require('exceljs');

// read from a file 
var workbook = new Excel.Workbook();
workbook.xlsx.readFile('./src/middleware/input_short.xlsx')
    .then(function() {
        // use workbook 

        // fetch sheet by id 
		var worksheet = workbook.getWorksheet(1);

		console.log(worksheet.getCell('A1').value);


		var dobCol = worksheet.getColumn('B');

		// iterate over all current cells in this column 
		dobCol.eachCell(function(cell, rowNumber) {
		    console.log(cell.value);
		});
    });
*/
