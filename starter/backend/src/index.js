// !!! IMPORTANT !!!
// Be sure to run 'npm run dev' from a
// terminal in the 'backend' directory!

import express from 'express';
import sqlite3 from 'sqlite3';
import fs from 'fs';

import { applyRateLimiting, applyLooseCORSPolicy, applyBodyParsing, applyLogging, applyErrorCatching } from './api-middleware.js'

const app = express();
const port = 53706;

const GET_POST_SQL = 'SELECT * FROM BadgerMessage;'
const INSERT_POST_SQL = 'INSERT INTO BadgerMessage(title, content, created) VALUES (?, ?, ?) RETURNING id;'
const DELETE_POST_SQL = "DELETE FROM BadgerMessage WHERE id = ?;"

const FS_DB = process.env['MINI_BADGERCHAT_DB_LOC'] ?? "./db.db";
const FS_INIT_SQL = "./includes/init.sql";

const db = await new sqlite3.Database(FS_DB, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
db.serialize(() => {
    const INIT_SQL = fs.readFileSync(FS_INIT_SQL).toString();
    INIT_SQL.replaceAll(/\t\r\n/g, ' ').split(';').filter(str => str).forEach((stmt) => db.run(stmt + ';'));
});

applyRateLimiting(app);
applyLooseCORSPolicy(app);
applyBodyParsing(app);
applyLogging(app);

app.get('/api/hello-world', (req, res) => {
    res.status(200).send({
        msg: "Hello! :)"
    })
})

applyErrorCatching(app);

// Open server for business!
app.listen(port, () => {
    console.log(`My API has been opened on :${port}`)
});
