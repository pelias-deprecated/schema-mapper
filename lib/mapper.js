var through = require("through");

function createMapper(mapper){
	function write(record){
		var mapped = {};
		for(var prop in mapper){
			if(mapper.hasOwnProperty(prop)){
				mapped[prop] = record[mapper[prop]];
			}
		}
		this.push(mapped);
	}

	return through(write);
}

module.exports = createMapper;
