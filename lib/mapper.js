var through = require("through");

function mapProperty(source, mapped, prop, value){
	switch(typeof value){
		case "function":
			mapped[prop] = value(source);
			break;
		case "object":
			if(value === null){
				mapped[prop] = null;
			}
			else if(value.hasOwnProperty("constant")){
				mapped[prop] = value.constant;
			}
			break;
		case "string":
			mapped[prop] = eval("source" + value);
			break;
	}
}

function createMapper(mapper){
	function write(record){
		var mapped = {};
		for(var prop in mapper){
			if(mapper.hasOwnProperty(prop)){
				mapProperty(record, mapped, prop, mapper[prop]);
			}
		}
		this.push(mapped);
	}

	return through(write);
}

module.exports = createMapper;
