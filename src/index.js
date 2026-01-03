import express from 'express'
import connectDB from './db/index.js';

const app =  express()
const PORT = 4000;
connectDB()

app.get("/", (req, res)=>{
    res.send("Hello dheeraj saini welcome to youtube")
})

app.listen(PORT, ()=>{
    console.log("app is listen on port 4000")
})