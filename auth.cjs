const express = require("express");
const router = express.Router();
const uuid = require("uuid").v4;
const db = require("./db.cjs").pool;
const sendMail = require("./nodemailer.cjs")

console.log("in auth")
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
router.post("/signin", (req, res) => {
    const body = req.body;
    if (body.email && body.password) {
        console.log(body.email)
        db.execute(
            `SELECT * FROM users WHERE email="${body.email}" AND password="${body.password}"`
        ).then((sqlRes) => {
            console.log(sqlRes[0])
            if (sqlRes[0].length > 0) {
                const newToken = makeToken(225);
                db.execute(
                    `UPDATE users SET accesstoken="${newToken}" WHERE email="${body.email}" AND password="${body.password}"`
                );
                res.send({
                    "status": "OKAY",
                    "message": "SUCCESSFULLY_SIGNED_IN",
                    "data": {
                        "user": {
                            id: sqlRes[0][0].id,
                            email: sqlRes[0][0].email,
                            fullName: sqlRes[0][0].name,
                            token: newToken,
                            department: sqlRes[0][0].department,
                            resettoken: sqlRes[0][0].resettoken,
                            manager: sqlRes[0][0].managername
                        }
                    }
                });
            } else {
                res.send({
                    "status": "ERROR",
                    "message": "USER_NOT_FOUND",
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

router.post("/invite", (req, res) => {
    let userid = uuid();
    let userPassword = makeToken(10)
    let resetToken = makeToken(255);


    db.execute(`SELECT * FROM users WHERE email = '${req.body.email}'`).then(
        (resultt) => {
            if (resultt[0].length != 0) {
                return res.json({
                    status: "ERROR",
                    message: "this email is already used by another user",
                });
            }
            db.execute(
                `SELECT userid FROM users WHERE accessToken='${req.headers.accesstoken}'`
            ).then((result) => {
                // console.log(results, results[0], results[0][0].userid);
                let adminId = result[0][0].id;
                let sql = `INSERT INTO users VALUES ('${userid}','${req.body.name}','${req.body.email}','${userPassword}','${req.body.department}','${req.body.managername}','null','${resetToken}')`;

                db.execute(sql).then((results) => {
                    // console.log(results);
                    let user = {
                        email: req.body.email,
                        password: req.body.password,
                    };
                    sendMail(user);
                    res.send({
                        "status": "OKAY",
                        "message": "new user added",
                        "data": {

                        }
                    });
                });
            });
        }
    );
})
router.post("/reset", (req, res) => {
    console.log("in reset")
    const body = req.body;
    db.execute(
        `SELECT * FROM users WHERE email="${body.email}" `
    ).then((results) => {
        // console.log(results);
        if (results[0].length > 0) {
            var newToken = makeToken(255)
            var newpass = makeToken(10)
            db.execute(
                `UPDATE users SET resettoken="${newToken}",password="${newpass}" WHERE email="${body.email}" `
            )
            let user = {
                email: body.email,
                password: newpass,
                // resetLink: passwordResetLink,
            };
            sendMail(user);
            res.send({
                "status": "OKAY",
                "message": "Mail_SENT",
                "data": {

                }
            });

        } else {
            res.send({
                "status": "ERROR",
                "message": "USER_NOT_EXIST",
                "data": {

                }
            });

        }
    });
});


router.post("/reset-password", (req, res) => {
    var body = req.body
    let resetToken = req.headers.resettoken;
    let userPassword = body.password;
    let sql = `UPDATE users SET password = '${userPassword}', resettoken = null WHERE resettoken = '${resetToken}';`;
    db.execute(sql).then((results) => {
        console.log(results[0]);
        res.json({
            "status": "OKAY",
            "message": "User Verified And Password updated",
            "data": {

            }
        });
    });

});


router.post("/logout", (req, res) => {
    var accessToken = req.headers.accesstoken;
    let sql = `UPDATE users SET accesstoken = null WHERE accesstoken = '${accessToken}';`;
    db.execute(sql).then((sqlRes) => {
        if(sqlRes[0].affectedRows>0){
        console.log(sqlRes)
        res.json({
            "status": "OKAY",
            "message": "log-out successfully",
            "data": {

            }
        })
    }else{
        res.json({
            "status": "error",
            "message": "not found",
            "data": {

            }
        })
    }
      
    })
})

module.exports = router;