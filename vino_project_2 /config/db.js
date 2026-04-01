const mysql = require("mysql2");

const db = mysql.createConnection({
host:"localhost",
user:"root",
password:"vinotha@2125",
database:"platform_System_2"
});

db.connect((err)=>{
if(err){
console.log("DB Connection Failed");
}else{
console.log("MySQL Connected");
}
});

module.exports=db;