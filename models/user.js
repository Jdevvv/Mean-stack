const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

let emailLengthChecker = (email) => {
    if (!email) {
        return false;
    } else if (email.length < 5) {
        return false;
    } else {
        return true;
    }
};

let validEmailChecker = (email) => {
    if (!email) {
        return false;
    } else {
        const regExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        return regExp.test(email);
    }
}

const emailValidators = [{
        validator: emailLengthChecker,
        message: 'L\'email doit avoir au moins 5 caractères'
    },
    {
        validator: validEmailChecker,
        message: 'Email invalide'
    }
];

let usernameLengthChecker = (username) => {
    if (!username) {
        return false;
    } else if (username.length < 3 || username.length > 15) {
        return false;
    } else {
        return true;
    }
};

let validUsername = (username) => {
    if (!username) {
        return false;
    } else {
        const regExp = new RegExp(/^[a-zA-Z0-9]+$/); // Pas de caractères spéciaux
        return regExp.test(username);
    }
};

const usernameValidators = [{
        validator: usernameLengthChecker,
        message: 'Le pseudo doit comporter au minimum 3 caractères et maximum 15'
    },
    {
        validator: validUsername,
        message: 'Le pseudo ne doit pas comporter de caractères spéciaux'
    }
];

let passwordLengthChecker = (password) => {
    if (!password) {
        return false;
    } else if (password.length < 8) {
        return false;
    } else {
        return true;
    }
};

let validPassword = (password) => {
    if (!password) {
        return false;
    } else {
        const regExp = new RegExp(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/); // Au moins 1 majuscule, 1 minuscule, 1 chiffre, 1 carac. spécial
        return regExp.test(password);
    }
};

const passwordValidators = [{
        validator: passwordLengthChecker,
        message: 'Le mot de passe doit comporter au moins 8 caractères'
    },
    {
        validator: validPassword,
        message: 'Le mot de passe doit avoir au moins une lettre majuscule, minuscule, un caractère spécial et un chiffre'
    }
];

// Schéma

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: emailValidators
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: usernameValidators
    },
    password: {
        type: String,
        required: true,
        validate: passwordValidators
    },
});





userSchema.pre('save', function (next) {
    if (!this.isModified('password'))
        return next();

    bcrypt.hash(this.password, null, null, (err, hash) => {
        if (err) return next(err);
        this.password = hash;
        next();
    });
});

userSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model('User', userSchema);