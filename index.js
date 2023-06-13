const express = require("express");
const path = require("path");
const app = express();
app.use(express.static('public'));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "kakaomapcafe.html"));
});

app.get("/marker", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "kakaomapcafe.html"));
});

app.listen(3000, () => console.log("Server listening on port 3000"));
