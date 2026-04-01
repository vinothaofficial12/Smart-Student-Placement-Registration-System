const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({

destination:function(req,file,cb){
cb(null,"uploads/resumes");
},

filename:function(req,file,cb){
cb(null,Date.now()+"-"+file.originalname);
}

});

/* Updating Resume */

const upload = multer({storage:storage});

router.put("/update-resume/:id", upload.single("resume"), (req, res) => {

    const id = req.params.id;

    db.query("SELECT resume FROM students WHERE id=?", [id], (err, result) => {

        const oldResume = result[0].resume;

        // delete old file
        if(oldResume){
            const filePath = path.join(__dirname, "../uploads/resumes/", oldResume);
            if(fs.existsSync(filePath)){
                fs.unlinkSync(filePath);
            }
        }

        const newResume = req.file.filename;

        db.query(
            "UPDATE students SET resume=? WHERE id=?",
            [newResume, id],
            (err) => {

                if(err){
                    console.log(err);
                    return res.status(500).send("Update failed");
                }

                res.json({message:"Resume Updated"});
            }
        );

    });

});

router.put("/update-with-resume/:id", upload.single("resume"), (req,res)=>{

const id = req.params.id;

const {
name,email,phone,college,degree,skills,cgpa,graduation_year
} = req.body;

const newResume = req.file ? req.file.filename : null;

// get old resume
db.query("SELECT resume FROM students WHERE id=?", [id], (err,result)=>{

const oldResume = result[0].resume;

// delete old file
if(newResume && oldResume){
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname,"../uploads/resumes/",oldResume);

if(fs.existsSync(filePath)){
fs.unlinkSync(filePath);
}
}

const sql = `
UPDATE students 
SET name=?, email=?, phone=?, college=?, degree=?, skills=?, cgpa=?, graduation_year=?, resume=COALESCE(?, resume)
WHERE id=?
`;

db.query(sql,
[name,email,phone,college,degree,skills,cgpa,graduation_year,newResume,id],
(err)=>{

if(err){
console.log(err);
return res.status(500).send("Update failed");
}

// send updated student
db.query("SELECT * FROM students WHERE id=?", [id], (err,result)=>{
res.json({
message:"Profile & Resume Updated Successfully",
student: result[0]
});
});

});

});

});
/* Deleting the Resume */

router.delete("/delete-resume/:id", (req,res)=>{

const id=req.params.id;

db.query("SELECT resume FROM students WHERE id=?", [id], (err,result)=>{

const file=result[0].resume;

if(file){
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname,"../uploads/resumes/",file);

if(fs.existsSync(filePath)){
fs.unlinkSync(filePath);
}
}

db.query("UPDATE students SET resume=NULL WHERE id=?", [id]);

res.json({message:"Resume Deleted"});

});

});


/* Register Student */

router.post("/register",upload.single("resume"),(req,res)=>{

const {name,email,password,phone,college,degree,skills,cgpa,graduation_year}=req.body;

const resume=req.file.filename;

const sql=`
INSERT INTO students
(name,email,password,phone,college,degree,skills,cgpa,graduation_year,resume)
VALUES(?,?,?,?,?,?,?,?,?,?)
`;

db.query(sql,[name,email,password,phone,college,degree,skills,cgpa,graduation_year,resume],
(err,result)=>{

if(err){
res.status(500).json(err);
}else{
res.json({message:"Registration Successful"});
}

});

});


/* Get All Students */

router.get("/all",(req,res)=>{

db.query("SELECT * FROM students",(err,result)=>{
res.json(result);
});

});

// UPDATE STUDENT DETAILS
router.put("/update/:id", (req, res) => {

    const id = req.params.id;

    const {
        name,
        email,
        phone,
        college,
        degree,
        skills,
        cgpa,
        graduation_year
    } = req.body;

    const sql = `
    UPDATE students 
    SET name=?, email=?, phone=?, college=?, degree=?, skills=?, cgpa=?, graduation_year=?
    WHERE id=?
    `;

    db.query(sql, 
        [name,email,phone,college,degree,skills,cgpa,graduation_year,id],
        (err,result)=>{

        if(err){
            console.log(err);
            return res.status(500).send(err.message);
        }

        res.json({message:"Profile Updated Successfully"});

    });

});


/* Filter by Skill */

router.get("/skill/:skill",(req,res)=>{

const skill=req.params.skill;

db.query(
"SELECT * FROM students WHERE skills LIKE ?",
[`%${skill}%`],
(err,result)=>{

if(err){
console.log("Skill filter error:", err);
return res.status(500).json({error: "Database error", details: err.message});
}

res.json(result);

});

});

module.exports=router;