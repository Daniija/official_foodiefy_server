
let mongoose = require('mongoose');
let bcrypt = require('bcrypt');
let userSchema = mongoose.Schema({
    
    contact: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String
    },
    blocked: {
        type: Boolean, default: false
    }
}, { timestamp: true }
)

userSchema.statics.hash = function hashPassword(password){
    return bcrypt.hashSync(password,10);
};  

userSchema.methods.isValid = function(hashedpassword){
    return  bcrypt.compareSync(hashedpassword, this.password);
};

module.exports = mongoose.model('user',userSchema);
