require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const { escapeXML } = require('ejs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const mongodb = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URL}:${process.env.MONGODB_PORT || '27017'}/${process.env.MONGODB_DBNAME}?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`
const ca = `${path.join(__dirname, `${ process.env.MONGODB_CERT || 'rds-combined-ca-bundle.pem'}`)}`

//connect to aws documentdb 
mongoose.connect(mongodb, {
    tlsCAFile: `${ca}`,
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to the database"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
    session({
        secret: "my secret key",
        saveUninitialized: true,
        resave: false
    })
);

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.use(express.static("uploads"));

//set template engine
app.set("view engine", "ejs");

//check running application
app.get('/check', (req, res) => {
    res.send("Hello World");
});

//get route
app.use("", require("./routes/routes"))

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});