const express = require("express");
const requireRouter = express.Router();
const uuid = require("uuid").v4;
const db = require("./db.cjs").pool;
const sendMail = require("./nodemailer.cjs")


function makeToken(length) {
    var result = "";
    var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
console.log("in req")
requireRouter.post("/read", (req, res) => {
    var token = req.headers.accesstoken
    if (token) {
        db.execute(
            `SELECT * FROM requirements `
        ).then((sqlRes) => {
            console.log(sqlRes[0])
            if (sqlRes[0].length > 0) {

                res.send({
                    "status": "OKAY",
                    "message": "JOBS_FOUND",
                    "data": {
                        "jobData": sqlRes[0]
                    }
                });
            } else {
                res.send({
                    "status": "ERROR",
                    "message": "JOBS_NOT_FOUND",
                    "data": {
                        "user": {}
                    }
                });
            }
        });
    } else {
        res.send({
            "status": "ERROR",
            "message": "INVALID_REQUEST_BODY",
            "data": {

            }
        });
    }
});

requireRouter.post("/write", (req, res) => {
    console.log(req)
    let jobid = makeToken(10);
    let body = req.body
    var todayDate = new Date().toISOString().replace("T", " ").replace("Z", "")//"1970-01-01 00:00:01"
    let sql = `INSERT INTO requirements VALUES ('${jobid}','${todayDate}','${body.userId}','${body.positionTitle}','${body.jobType}','${body.workLocation}',${body.openingCount},'${body.skills}',${body.roundCount},'${body.roundInArray}',"")`;

    db.execute(sql).then((results) => {
        res.send({
            "status": "OKAY",
            "message": "new job added",
            "data": {

            }
        });

    });



})

requireRouter.post("/live", (req, res) => {
    var body = req.body
    let jobid = body.jobId;
    let origin=req.headers.origin
    console.log(origin)
    let sql1 = `select * from requirements where jobID="${jobid}"`
    db.execute(sql1).then((sqlres) => {
        if (sqlres[0].length > 0) {
                var sql2=`CREATE TABLE pooran (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), address VARCHAR(255))`;

            let sql = `CREATE TABLE sme_${jobid} (gigid  VARCHAR(45)  PRIMARY KEY, name VARCHAR(45), email VARCHAR(45),mobileNum INT,laptop VARCHAR(5),wifi_connection VARCHAR(5),experience FLOAT,pan_tap VARCHAR(5),subject VARCHAR(45),video_links VARCHAR(400),status VARCHAR(45)) `;

            db.execute(sql).then((results) => {
                res.send({
                    "status": "OKAY",
                    "message": "TABLE CREATED",
                    "data": {
                        formLink:`${origin}/form.html?sme_${jobid}`
                    }
                });

            });
        }else{
            res.send({
                "status": "ERROR",
                "message": "Job not found",
                "data": {

                }
            });
        }
    })




})



requireRouter.post("/", (req, res) => {
    res.send({
        status: "ERROR",
        message: "PAGE_NOT_FOUND",
        data: {},
    });
});

module.exports = requireRouter;