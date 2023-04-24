const express = require('express')
let app = express()
const bodyParser = require("body-parser")

app.use(express.static('public'))
// Files are files from computer with no modifications

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }));



app.get('/', (req, res) => {
    res.render('index')
})

app.get('/', (req, res) => {
    res.render('index')
})


app.listen(8000, () => {
    console.log('server is online at port 8000')
})