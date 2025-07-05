const express = require("express");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const SALTROUNDS = 5;
const SECRET = "lifeisbad";
const PORT = 10000;

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public")); // js files
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

let connection;
app.listen(PORT, async function (){
  connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "todo_listSSR",
    password: "see++17sql",
  });
  console.log(`Server started on Port ${PORT}`);
});

function AuthMiddleware(req, res, next)
{
  try{
    const token = req.cookies.token ;
    const payload = jwt.verify(token, SECRET) ;
    req.unique_id = payload.unique_id ;
    req.isAuth = true ;
    next() ;
  }catch(err){
    console.log("User not logged in") ;
    req.isAuth = false ;
    next() ;
  }
}

app.get("/", AuthMiddleware, async function(req,res){
  try{
    const isAuth = req.isAuth ;
    if(isAuth)
    {
      let unique_id = req.unique_id ;
      const show_task = await connection.query(`select * from tasks where unique_id = ?`, [unique_id]) ;
      res.render("home", {isAuth, arr : show_task[0]}) ;
    }else{
      res.render("home", {isAuth, arr : []}) ;
    }
  }catch(err){
    console.log("home Route isn't working") ;
    res.status(500).send("Server error") ;
  }
})

app.get("/signin", async function (req, res, next){
  res.render("signin");
});

app.get("/signup", async function (req, res, next){
  res.render("signUp");
});

app.post("/signUp", async function(req,res){
  try{
      if(req.body.name && req.body.pass)
      {  
        const username = req.body.name ;
        const password = req.body.pass ;
        const email = req.body.gmail ;
        const gender = req.body.sex ;
        const unique_id = username + "-" + new Date().getTime() ;
        await connection.query(`insert into users(username, password, email, gender, unique_id) values(?,?,?,?,?)`,
          [username, bcrypt.hashSync(password, SALTROUNDS), email, gender, unique_id]) ;
        res.status(200).send("User created") ;
      }else{
          throw{
            message : "Please provide neccessary details."
          }
      }
  }catch(err){
      console.log("Server Error") ;
      res.status(401).send({
        message : err.message ? err.message : "Something went wrong"
      })
  }
})

app.post("/signin", async function(req,res){
  try{
      if(req.body.gmail && req.body.pass)
      {
        const email = req.body.gmail ;
        const password = req.body.pass ;
        let matched_user = await connection.query(`select * from users where Email = ?`, [email]) ;
        if(matched_user[0].length > 0)
        {
          const dbUser = matched_user[0][0] ;     
          const hashPwrd = dbUser.Password ;
          console.log("Email is correct") ;
          if(bcrypt.compareSync(password, hashPwrd))
          {
              console.log("password is correct") ;
              const token = jwt.sign(
                    {
                      email : dbUser.Email,
                      unique_id : dbUser.Unique_id
                    },
                    SECRET
                  )
              res.cookie("token", token, { httpOnly: true }) ;
              res.status(200).send({
                  message : "Login successfull",
              })
          }else{
              console.log("incorrect password") ;
              throw{
                message : "Password incorrect"
              }
          }
      }else{
          console.log("incorrect Email") ;
          throw{
            message : "Email incorrect" 
          }
      }
      }else{
          throw{
          message : "Provide necessary credentials"
          }
      }
  }catch(err){
      console.log("Server Error") ;
      res.status(401).send({
        message : err.message ? err.message : "something went wrong"
      })
  }
})

app.post("/logout", async function(req,res){
  res.clearCookie("token");
  // How clearCookie works
  // res.setHeader('Set-Cookie','token=5000;Expires=Thu, 01 Jan 1970 00:00:00 GMT')
  res.send({
    message: "Logout successfull"
  });
})

app.post("/tasks", AuthMiddleware, async function(req, res){
  try{
      if(req.body.task_title) 
      {
        const unique_id = req.unique_id ;
        const title = req.body.task_title ;
        const discription = req.body.task_discription ;
        const created_at = req.body.taskCreated_at ;
        console.log("insert k pehle") ;
        await connection.query("insert into tasks(title, discription, created_at, unique_id) values(?,?,?,?)",
          [title, discription, created_at, unique_id,]);
        console.log("insert k baad") ;
        res.status(200).send({
            message: "Task Added successfully",
        });
      }else{
          throw {
            message: "Please provide neccessary details.",
          };
      }
  }catch(err){
    console.log("Server Error") ;
    res.status(500).send({
        message : err.message ? err.message : "Something went wrong, working on it buddy"
    })
  }
})

app.delete("/tasks", AuthMiddleware, async function(req, res){
  try{
      const unique_id = req.unique_id ;
      const task_id = req.query.id ;
      if(unique_id && task_id){
          await connection.query(`delete from tasks where unique_id = ? && task_id = ?`, [unique_id, task_id]) ;
      }else{
          // delete all task of that particular user
          await connection.query(`delete from tasks where unique_id = ? `, [unique_id]) ;
      }
      res.status(200).send("Task deleted") ;
  }catch(err){
    console.log("Server started") ;
    res.status(404).send({
        message : err.message ? err.message : "Task not found"
    })
  }
})

app.put("/tasks", AuthMiddleware, async function(req,res)
{
  try{
      let unique_id = req.unique_id ;
      let title = req.body.task_title ;
      let discription = req.body.task_discription ;
      let created_at = req.body.taskCreated_at ;
      let task_id = req.body.selected_taskid ;
      let matched_task = await connection.query(`select * from tasks where unique_id = '${unique_id}' && task_id = ${task_id}`) ;
      if(matched_task[0].length > 0)
      {
        console.log("select query pe pahuch gye") ;
        let updated_task = await connection.query(`update tasks set Title = '${title}', Discription = '${discription}', Created_at = '${created_at}'
            where unique_id = '${unique_id}' && task_id = ${task_id}`) ;
            console.log("update query chl rhi h") ;
        if(updated_task[0].affectedRows > 0){
            console.log(`Task of ${unique_id} and ${task_id} updated`) ;
            res.status(200).send("Task updated") ; 
        }else{
            console.log("Task not updated") ;
            throw{
                message : "Task not updated, update query issue"
            };
        }
      }else{
          console.log("Task not found") ;
          throw{
              message : "Task not found wrong credentials"
          };
      }
    }catch(err){
      console.log(err) ;
      res.status(500).send({
          message : err.message ? err.message : "Something went wrong, working on it buddy"
      }) ;
    }
})

app.patch("/resetPassword", async function(req,res){
  try{
      const {email, newPassword} = req.body ; 
      let existing_user = await connection.query(`select * from users where Email = ?`, [email]) ;
      console.log(existing_user) ;
      if(existing_user[0].length > 0)
      {
        let dbUser = existing_user[0][0] ;
        let update_pass = await connection.query(`update users set Password = ? where user_id = ?`,
          [bcrypt.hashSync(newPassword, SALTROUNDS), dbUser.user_id]) ;
        console.log(update_pass) ;
        res.status(200).send({
          message : "Reset Password successfully"
        })
        // if(update_pass.affectedRows > 0){
        // }else{
        //     res.status(404).send("Password cant be Reset") ;
        // }
      }else{
        throw {
            message : "Email/user not found in DB"
        }
      }
  }catch(error){
      res.status(500).send({
        message : error.message ? error.message : "Something went wrong" 
      })
  }
})