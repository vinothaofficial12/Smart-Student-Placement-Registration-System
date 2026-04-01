const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/login",(req,res)=>{

const {email,password}=req.body;

const sql="SELECT * FROM students WHERE email=? AND password=?";

db.query(sql,[email,password],(err,result)=>{

if(result.length>0){
res.json({message:"Login success",user:result[0]});
}else{
res.json({message:"Invalid credentials"});
}

});

});

module.exports=router;