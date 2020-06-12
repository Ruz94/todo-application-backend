const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());

//lists routes
app.get("/lists", function (req, res) {
  res.send([
    {
      title: "Shopping List",
      id: 1,
      dateCreated: Date.now(),
      tasks: [
        { text: "Paint and oil outdoor furniture", completed: true, id: 1, dateCreated: Date.now() },
        { text: "Hang pictures in bedroom", completed: false, id: 2, dateCreated: Date.now() },
      ],
    },
  ]);
});

app.delete("/lists/:listId", function (req, res) {
  const id = req.params.listId;

  if (isNaN(parseInt(id, 10))) {
    res.status(404);
    res.json({
      message: id + " is not a valid ID",
    });
  }

  res.status(200);
  res.json({
    message: "You issued a delete request for ID: " + id,
  });
});

app.post("/lists", function (req, res) {
  res.status(201);
  res.json({ message: `Received a request to add list ${req.body.title} on date ${req.body.dateCreated}` });
});

app.put("/lists/:listId", function (req, res) {
  res.status(200);
  res.json({ message: `You issued a put request for ${req.body.title} list with ID ${req.params.listId} ` });
});

module.exports.lists = serverless(app);
