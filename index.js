const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const hostname = "http://localhost"
const port = 3000;
let mongoUrlDocker;
let mongoHost = process.env.DATABASE_HOST

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))

// Uncomment when monogo is run locally on the system otherwhise leave it commented out 
// ************************************CODE**********************************************
// mongoUrlDocker = "mongodb://username:password@localhost:27017";
// ************************************CODE END**********************************************


// Uncomment when secret has to be fetched from Vault secret manager.
// **********************************************CODE*********************************************
// Stored credentials are: `username` & `password`
// key-value secret engine version is `v1`
// let mountPath = 'secret'
// let secretName = 'mongodb'
let vaultToken = process.env.VAULT_TOKEN

let servieAccToken = fs.readFileSync(process.env.JWT_PATH).toString()
let vaultAddr = process.env.VAULT_ADDR

function getCred() {
    fetch(`${vaultAddr}/v1/secret/data/mongodb`, {
        method: "GET",
        headers: {
            "X-Vault-Request": "true",
            "X-Vault-Token": vaultToken
        },
    }).then((res) => {
        return res.json()
    }).then((resJson) => {
        const username = resJson["data"]["data"]["username"];
        const password = resJson["data"]["data"]["password"];
        mongoUrlDocker = `mongodb://${username}:${password}@${mongoHost}`;
    }).catch(err => {
        console.error(err);
    });
}
getCred();
// ******************************************CODE END**********************************************

// use when starting application as docker container
// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

// "user-account" in demo with docker. "my-db" in demo with docker-compose
let databaseName = "simple-user-profile-page-database";

app.get('/api/getData', (req, res) => {
    let response = {};
    // Connect to the db
    MongoClient.connect(mongoUrlDocker, mongoClientOptions, function (err, client) {
        if (err) throw err;

        let db = client.db(databaseName);
        console.log("Database has been connected")
        let myquery = { userid: 1 };

        db.collection("users").findOne(myquery, function (err, result) {
            if (err) throw err;
            response = result;
            client.close();

            // Send response
            res.send(response ? response : {});
        });
    });

})

app.patch('/api/updateData', (req, res) => {
    let userObj = req.body;

    MongoClient.connect(mongoUrlDocker, mongoClientOptions, function (err, client) {
        if (err) throw err;

        let db = client.db(databaseName);
        userObj['userid'] = 1;

        let myquery = { userid: 1 };
        let newvalues = { $set: userObj };

        db.collection("users").updateOne(myquery, newvalues, { upsert: true }, function (err, res) {
            if (err) throw err;
            client.close();
        });

    });
    // Send response
    res.send(userObj);

})

app.listen(port, () => {
    console.log(`Server is running on the host:-> ${hostname}:${port}`);
})
