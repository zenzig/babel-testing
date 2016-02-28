var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SportSchema   = new Schema({
	name: { type: String, required: true },
});

module.exports = mongoose.model('Sport', SportSchema);