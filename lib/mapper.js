var through = require("through");

function getPropVal(obj, propPath){
	return eval("obj" + propPath)
}

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

			else if(value.hasOwnProperty("coalesce")){
				var mappedVal = null;
				for(var ind = 0; ind < value.coalesce.length; ind++){
					mappedVal = getPropVal(source, value.coalesce[ind]);
					if(mappedVal !== null){
						break;
					}
				}
			}
			break;
		case "string":
			mapped[prop] = getPropVal(source, value);
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
