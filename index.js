const express = require('express');
const router = express.Router();
const app = express();
const mongoose = require('mongoose');
const config = require('./config/database');
const path = require('path');
const authentification = require('./routes/authentification')(router);
const blogs = require('./routes/blogs')(router);
const bodyParser = require('body-parser');
const cors = require('cors');

mongoose.Promise = global.Promise;
mongoose.connect(config.uri, { useNewUrlParser: true }, (err) => {
    if (err) {
        console.log('Connexion à la db impossible: ', err);
    } else {
        console.log('Connecté à la db : ' + config.db);
    }
});

app.use(cors({
    origin: 'http://localhost:4200'
}));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static(__dirname + '/frontend/dist/'));
app.use('/authentification', authentification);
app.use('/blogs', blogs);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/frontend/dist/frontend/index.html'));
});

app.listen(8080, () => {
    console.log('Listening on port 8080');
});