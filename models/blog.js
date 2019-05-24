const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

let titleLengthChecker = (title) => {
    if (!title) {
        return false;
    } else if (title.length < 3) {
        return false;
    } else {
        return true;
    }
};

let alphaNumericChecker = (title) => {
    if (!title) {
        return false;
    } else {
        const regExp = new RegExp(/^[a-zA-Z0-9 ]+$/);
        return regExp.test(title);
    }
}

const titleValidators = [{
        validator: titleLengthChecker,
        message: 'Le titre doit avoir au moins 5 caractères'
    },
    {
        validator: alphaNumericChecker,
        message: 'Le titre doit être en alphanumeric'
    }
];

let bodyLengthChecker = (body) => {
    if (!body) {
        return false;
    } else if (body.length < 5 || body.length > 500) {
        return false;
    } else {
        return true;
    }
};

const bodyValidators = [{
    validator: bodyLengthChecker,
    message: 'L\'article doit être compris entre 10 et 500 caractères.'
}];

let commentLengthChecker = (comment) => {
    if (!comment[0]) {
        return false;
    } else if (comment[0].length < 1) {
        return false;
    } else {
        return true;
    }
};

const commentValidators = [{
    validator: commentLengthChecker,
    message: 'Le commentaire doit comporter au moins 1 caractère'
}];

const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
        validate: titleValidators
    },
    body: {
        type: String,
        required: true,
        validate: bodyValidators
    },
    createdBy: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    favoris: {
        type: Array
    },
    comments: [{
        comment: {
            type: String,
            validate: commentValidators

        },
        commentator: {
            type: String
        }
    }],
    image: {
        type: Object
    }
});

module.exports = mongoose.model('Blog', blogSchema);