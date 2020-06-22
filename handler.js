const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql");

const app = express();

app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "toDoApplication",
});

//lists routes
app.get("/lists", function (req, res) {
  const getListQuery = "SELECT * FROM Lists;";
  const getTasksQuery = "SELECT * FROM Tasks;";

  connection.query(getListQuery, function (error, listData) {
    if (error) {
      console.log("Error fetching lists", error);
      res.status(500).json({
        error: error,
      });
    } else {
      connection.query(getTasksQuery, function (error, taskData) {
        if (error) {
          console.log("Error fetching tasks", error);
          res.status(500).json({
            error: error,
          });
        } else {
          const data = listData.map((list) => {
            const tasks = taskData.filter((task) => task.listId === list.listId);
            list.tasks = tasks;
            return list;
          });
          res.status(200).json({
            lists: data,
          });
        }
      });
    }
  });
});

app.delete("/lists/:listId", function (req, res) {
  const id = req.params.listId;

  const listQuery = "DELETE FROM Lists where listId = ?";
  const tasksQuery = "DELETE FROM Tasks where listId = ?";

  connection.query(tasksQuery, [id], function (error, data) {
    if (error) {
      console.log("Error deleting list", error);
      res.status(500).json({
        error: error,
      });
    } else {
      connection.query(listQuery, [id], function (error, data) {
        if (error) {
          console.log("Error deleting list", error);
          res.status(500).json({
            error: error,
          });
        } else {
          res.status(200).json({
            listId: id,
            message: "You successfully deleted List with ID: " + id,
          });
        }
      });
    }
  });
});

app.post("/lists", function (req, res) {
  const query = "INSERT INTO Lists (title, dateCreated) VALUES (?, ?);";
  const querySelect = "SELECT * FROM Lists where listId = ?";

  connection.query(query, [req.body.title, req.body.dateCreated], function (error, data) {
    if (error) {
      console.log("Error adding a list", error);
      res.status(500).json({
        error: error,
      });
    } else {
      connection.query(querySelect, [data.insertId], function (error, data) {
        if (error) {
          console.log("Error adding a list", error);
          res.status(500).json({
            error: error,
          });
        } else {
          res.status(200).json({
            lists: data,
          });
        }
      });
    }
  });
});

app.put("/lists/:listId", function (req, res) {
  const putQuery = "UPDATE Lists SET title = ? WHERE (listId = ?)";

  connection.query(putQuery, [req.body.title, req.params.listId], function (error) {
    if (error) {
      console.log("Error updating lists", error);
      res.status(500).json({
        error: error,
      });
    } else {
      res.status(200).json({
        listId: req.params.listId,
        message: `You successfully updated List with ID: "${req.params.listId}" to title: "${req.body.title}"`,
      });
    }
  });
});

//tasks routes
app.delete("/tasks/:taskId", function (req, res) {
  const taskId = req.params.taskId;
  const taskQuery = "DELETE FROM Tasks where taskId = ?";

  connection.query(taskQuery, [taskId], function (error, data) {
    if (error) {
      console.log("Error deleting task", error);
      res.status(500).json({
        error: error,
      });
    } else {
      res.status(200).json({
        taskId: taskId,
        message: "You successfully deleted Task with ID: " + taskId,
      });
    }
  });
});

app.post("/tasks", function (req, res) {
  const taskAdd = "INSERT INTO Tasks (text, dateCreated, listId) VALUES (?, ?, ?);";
  const addedTask = "SELECT * FROM Tasks where taskId = ?";

  connection.query(taskAdd, [req.body.text, req.body.dateCreated, req.body.listId], function (error, data) {
    if (error) {
      console.log("Error adding a task", error);
      res.status(500).json({
        error: error,
      });
    } else {
      connection.query(addedTask, [data.insertId], function (error, data) {
        if (error) {
          console.log("Error adding a task", error);
          res.status(500).json({
            error: error,
          });
        } else {
          res.status(200).json({
            task: data[0],
            message: `You successfully added task ${req.body.text} on date ${req.body.dateCreated}`,
          });
        }
      });
    }
  });
});

app.put("/tasks/:taskId", function (req, res) {
  const query = "UPDATE Tasks SET text = ? WHERE (taskId = ?)";

  connection.query(query, [req.body.text, req.params.taskId], function (error) {
    if (error) {
      console.log("Error updating task", error);
      res.status(500).json({
        error: error,
      });
    } else {
      res.status(200).json({
        taskId: req.params.taskId,
        message: `You successfully updated ${req.body.text} with Task ID ${req.params.taskId}`,
      });
    }
  });
});

module.exports.lists = serverless(app);
module.exports.tasks = serverless(app);
