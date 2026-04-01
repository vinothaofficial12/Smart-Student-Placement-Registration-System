const express = require("express");
const router = express.Router();
const db = require("../config/db");

const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");


// ================= ADMIN LOGIN =================
router.post("/login",(req,res)=>{

const {username,password}=req.body;

db.query(
"SELECT * FROM admin WHERE username=? AND password=?",
[username,password],
(err,result)=>{

if(err){
console.log(err);
return res.status(500).send("DB Error");
}

if(result.length>0){
res.json({message:"Admin Login Success"});
}else{
res.json({message:"Invalid Login"});
}

});

});


// ================= INTERVIEW ELIGIBLE =================
router.get("/eligible",(req,res)=>{

db.query(
"SELECT * FROM students WHERE cgpa>=7",
(err,result)=>{

if(err){
console.log(err);
return res.status(500).send("DB Error");
}

res.json(result);

});

});


// ================= SEND CALL LETTER TO EMAIL =================
router.get("/callletter/:id",(req,res)=>{

const id=req.params.id;

db.query(
"SELECT * FROM students WHERE id=?",
[id],
(err,result)=>{

if(err){
console.log(err);
return res.status(500).send("DB Error");
}

const student=result[0];

if(!student){
return res.send("Student not found");
}

// -------- CREATE PDF IN MEMORY --------
const doc=new PDFDocument();
let buffers=[];

doc.on("data", buffers.push.bind(buffers));

doc.on("end", async ()=>{

const pdfData = Buffer.concat(buffers);

// -------- EMAIL CONFIG --------
const transporter = nodemailer.createTransport({
service:"gmail",
auth:{
user:"vinothaofficial12@gmail.com",
pass:"nnyt spjq gsls itao"
}
});

// -------- MAIL CONTENT --------
const mailOptions = {
from:"vinothaofficial12@gmail.com",
to:student.email,
subject:"Interview Call Letter",
text:"Congratulations! You are shortlisted for the interview.",
attachments:[
{
filename:"Call_Letter.pdf",
content:pdfData
}
]
};

try{

await transporter.sendMail(mailOptions);

res.send(" Call letter sent to student email");

}catch(error){

console.log(error);
res.status(500).send(" Email sending failed");

}

});

// -------- PDF CONTENT --------
doc.fontSize(20).text("Interview Call Letter", {align:"center"});

doc.moveDown();

doc.text(`Name : ${student.name}`);
doc.text(`Email : ${student.email}`);
doc.text(`College : ${student.college}`);
doc.text(`Skills : ${student.skills}`);

doc.moveDown();

doc.text("You are shortlisted for the interview.");
doc.text("Interview Date: 30 March 2026");
doc.text("Location: VelTech University ");

doc.end();

});

});

module.exports = router;