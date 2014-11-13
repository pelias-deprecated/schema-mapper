var converter = require("./lib/converter");

function handleUserArgs(args){
	var helpMessage = "todo: help message.";

	if(args.length == 0){
		console.error(helpMessage);
		process.exit(1);
	}

	for(var ind = 0; ind < args.length; ind++){
		var dataConverter = converter(require("./" + args[ind]));
		if(dataConverter === null){
			console.error("todo: error message.");
			process.exit(1);
		}
		dataConverter.pipe(require("through")(function write(rec){
			console.log(JSON.stringify(rec, undefined, 2));
		}))
	}
}

handleUserArgs(process.argv.slice(2));
