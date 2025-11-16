import bodyParser from "body-parser";
import express from "express";
import pg from "pg";
import env from "dotenv";

var books=[];
env.config();
const app = express();
const port = 3000;
const db = new pg.Client({
    user: process.env.user ,
    host: process.env.host ,
    database: process.env.database , 
    password: process.env.password , 
    port: process.env.port 
})
db.connect();

app.use(express.static("public"));

app.listen(port,() => {
    console.log(`Listening on https://localhost:${port}`);
})

app.use(bodyParser.urlencoded({extended: true}));

app.get("/" , async (req,res) => {
    try {
        const result = await db.query("SELECT * FROM books");
        books = result.rows;
    }catch(err){
        console.log("Error fetching data",err);
    }
    console.log(books);
    res.render("index.ejs" , {books:books});
})


app.post("/submit" , async (req,res) => {
    try { 
        db.query("INSERT INTO books (title,author,rating,review,isbn) VALUES ($1,$2,$3,$4,$5)" , 
            [req.body.Title,req.body.Author,req.body.rating,req.body.Review,req.body.BookISBN]);  
    }catch(err){
        console.log("Error inserting book" , err);
    }
    try {
        const result = await db.query("SELECT * FROM books");
        books = result.rows;
    }catch(err){
        console.log("Error fetching data",err);
    }
    console.log(books);
    res.render("index.ejs" , {books:books});
})


app.post("/delete" , async (req,res) => {
    const BookISBN = req.body.isbn;

    try{
        db.query("DELETE FROM books WHERE isbn=$1" , [BookISBN]);
    }catch (err) {
        console.log("Error deleting book" , err);
    }
    try {
        const result = await db.query("SELECT * FROM books");
        books = result.rows;
    }catch(err){
        console.log("Error fetching data",err);
    }
    console.log(books);
    res.render("index.ejs" , {books:books});
})

app.post("/new" , (req,res) => {
    const isbn = req.body["isbn"];
    const coverURL = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    res.render("new.ejs",{ISBN: isbn , Cover: coverURL });
})

