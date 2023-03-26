const fs = require("fs")


let database = fs.readFileSync("./db.txt","utf8")
let db = database.split(",")
console.log(db)

const validate1 = (username) => {
    if (username.length >= 1) {
        return true
    }
    return false
}

const validate2 = (username) => {
    for (const user of db) {
        if (user === username) {
            return true
        }
    }
    return false
}


console.log("return true if username if not empty", validate1(""))
console.log("return true if username if not empty", validate1("Stephane123"))
console.log("return true if username is already in database", validate2("Stephane123"))

//Brett Comment: the test driven test checks for username inside database. Simple but good at this stage.

// Royce Comment:the database could have more information in it but good test for what were trying to achieve.

// Alice Comment: Good test ensures that there are no duplicate usernames in the database.