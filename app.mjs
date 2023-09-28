// app.mjs
import express from 'express';
import fetch from 'node-fetch';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname);

const app = express();
const port = process.env.PORT || 3000;

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
// Import the JSON file with the 'json' import assertion
import serviceAccount from './api key.json' assert { type: 'json' };


initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();

app.set('view engine', 'ejs');
app.use(express.static('public'));

const apiUrl = 'https://api.coingecko.com/api/v3/coins/markets';

app.get("/", function (req, res) {
    res.render('home');
});

app.get('/dashboard', async (req, res) => {
    try {
        const response = await fetch(`${apiUrl}?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false`);
        const cryptoData = await response.json();
        res.render('index', { cryptoData: Array.isArray(cryptoData) ? cryptoData : [] });
    } catch (error) {
        console.error('Error fetching crypto data:', error);
        res.render('error');
    }
});

app.get("/signup", function (req, res) {
    res.sendFile(__dirname + "/public/" + "/signup.html");
});

app.get("/signupsubmit", function (req, res) {
    console.log(req.query);
    db.collection("users").add({
        username: req.query.username,
        email: req.query.email,
        password: req.query.password,
        confirm_password: req.query.confirm_password
    });
    res.redirect("/dashboard");
});

app.get("/login", function (req, res) {
    res.sendFile(__dirname + "/public/" + "/login.html");
});

app.get("/loginsubmit", function (req, res) {
    db.collection("users")
        .where("username", "==", req.query.username)
        .where("password", "==", req.query.password)
        .get()
        .then(function (docs) {
            if (docs.size > 0) {
                res.redirect("/dashboard");
            }
            else {
                res.send("please check your password and username once or create an account");
            }
        });
});

app.get('/search', async (req, res) => {
    const searchTerm = req.query.q;
    try {
        const response = await fetch(`${apiUrl}?vs_currency=usd&ids=${searchTerm}&order=market_cap_desc&per_page=10&page=1&sparkline=false`);
        const cryptoData = await response.json();
        const cryptoArray = Array.isArray(cryptoData) ? cryptoData : [];
        res.render('index', { cryptoData: cryptoArray });
    } catch (error) {
        console.error('Error fetching crypto data:', error);
        res.render('error');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
