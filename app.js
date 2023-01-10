//IMPORT EXPRESS JS AND CREATE INSTANCE
const express = require("express");
const app = express();
app.use(express.json());

//MAKE A PATH
const path = require("path");
const dbPath = path.join(__dirname, "twitterClone.db");

//IMPORT SQLITE
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

//IMPORT BCRYPT
const bcrypt = require("bcrypt");

//IMPORT JWT
const jwt = require("jsonwebtoken");

//MAKE A DB VARIABLE
let dbConnection;

//CONNECT SERVER TO DB
const connectToDb = async () => {
  try {
    dbConnection = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("SERVER RUNNING..........");
    });
  } catch (error) {
    console.log(`DB ERROR : ${error.message}`);
    process.exit(1);
  }
};

//VERIFY TOKEN
const verifyToken = (request, response, nextFunc) => {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "Gani_Key", (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        request.username = payload.username;
        nextFunc();
      }
    });
  }
};

//USER LOGIN API1
app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const getUserQuery = `
    SELECT *
    FROM 
        user 
    WHERE 
        username = "${username}";    
  `;

  const dbUser = await dbConnection.get(getUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isSamePassword = await bcrypt.compare(password, dbUser.password);
    if (isSamePassword) {
      const payload = {
        username: username,
      };
      const jwtToken = jwt.sign(payload, "Gani_Key");
      response.send({ jwtToken });
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});
