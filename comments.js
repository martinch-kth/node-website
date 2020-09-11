var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentsSchema = new Schema({
    comment_id:String, // two filenames.. the path..host + module name..
    username:String,
    comment:String
});

module.exports = mongoose.model('comments', commentsSchema,'comments');
