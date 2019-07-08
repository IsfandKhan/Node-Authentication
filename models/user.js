var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost/nodeauth',{
    useNewUrlParser: true,
    useCreateIndex:true
});

var userSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    name: {
        type: String
    },
    profileimage: {
        type: String
    }
});

var User = mongoose.model('User', userSchema);

User.createUser = function (newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
};

User.getUserByUsername = function (username, callback) {
    var query = {
        username: username
    };
    User.findOne(query, callback);
};

User.getUserByEmail = function (email, callback) {
    var query = {
        email: email
    };
    User.findOne(query, callback);
};

User.comparePassword = function (password, hash, callback) {
    bcrypt.compare(password, hash, function (err, ismatch) {
        callback(null, ismatch);
    });
};

User.getUserById = function (id, callback) {
    module.exports.findById(id, callback);
};

module.exports = User;