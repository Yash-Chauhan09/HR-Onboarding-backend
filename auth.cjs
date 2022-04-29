const express = require("express");
const router = express.Router();
const { v4: uuid } = require("uuid");
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
                            department:sqlRes[0][0].department,
                            resettoken:sqlRes[0][0].resettoken,
                            manager:sqlRes[0][0].managername
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

router.post("/signup", (req, res) => {
    const body = req.body;
    if (body.email && body.fullName && body.password) {
        const id = uuid();
        db.execute(
                `INSERT INTO users(id,name,email,pass) VALUES ("${id}","${body.email}","${body.password}")`
            )
            .then((data) => {
                res.send({
                    "status": "OKAY",
                    "message": "USER_REGISTERED_SUCCESSFULLY",
                    "data": {
                        id
                    }
                });
            })
            .catch((err) => {
                if (err.errno == 1062) {
                    res.send({
                        "status": "ERROR",
                        "message": "USER_ALREADY_EXIST",
                        "data": {

                        }
                    });
                } else {
                    res.send({
                        "status": "ERROR",
                        "message": "UNKNOWN_ERROR",
                        "data": {

                        }
                    });
                }
            });
    }
});
router.post("/reset", (req, res) => {
    console.log("in reset")
    const body = req.body;
    db.execute(
        `SELECT * FROM users WHERE email="${body.email}" `
    ).then((results) => {
        // console.log(results);
        if(results[0].length>0){
            var newToken=makeToken(255)
            var newpass=makeToken(10)
            db.execute(
                `UPDATE users SET resettoken="${newToken}",password="${newpass}" WHERE email="${body.email}" `
            )
            let user = {
                email: body.email,
                password: req.body.password,
                // resetLink: passwordResetLink,
              };
              sendMail(user);
            res.send({
                "status": "OKAY",
                "message": "Mail_SENT",
                "data": {
                    
                }
            });

        }else{
            res.send({
                "status": "ERROR",
                "message": "USER_NOT_EXIST",
                "data": {

                }
            });

        }
    });
});

module.exports = router;