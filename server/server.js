const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
app.use(express.json());
var cors = require('cors')
app.use(cors());

const port = process.env.PORT;
const mongoURI = process.env.MONGO_URI || "";

mongoose.connect(mongoURI)
    .then(() => console.log("DB Connected"))
    .catch((err) => console.log(err));

app.get('/', (req, res) => {
    res.send("Server is running");
});
app.use("/api/posts", require('./routes/post.route.js'));
app.use("/api/user", require("./routes/user.route.js"));


app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
