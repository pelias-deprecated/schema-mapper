var through = require("through");

function createMapper(mapper){
	function write(record){
		var mapped = {};
		for(var prop in mapper){
			if(mapper.hasOwnProperty(prop)){
				if(mapper[prop] !== null && mapper[prop].length > 0){
					mapped[prop] = eval("record" + mapper[prop])
				}
			}
		}
		this.push(mapped);
	}

	return through(write);
}

module.exports = createMapper;
