var Excel = require('exceljs');

// read from a file 
var workbook = new Excel.Workbook();
workbook.xlsx.readFile(input_short.xlsx)
    .then(function() {
        // use workbook 

        // fetch sheet by id 
		var worksheet = workbook.getWorksheet(1);

		console.log(worksheet.getCell('A1').value);


    });