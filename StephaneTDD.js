let db = {
    username: ["Stephane123", "Alice123", "Royce123"]
}


const validate1 = (username) => {
    if (username.length >= 1) {
        return true
    }
    return false
}

const validate2 = (username) => {
    for (const user of db.username) {
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