const express = require("express");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require("passport");
var GitHubStrategy = require("passport-github").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config() ;
// console.log(process.env)  ;

const SALTROUNDS = 5;
const SECRET = "lifeisbad";
const PORT = 10000;

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public")); // js files
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize()) ;
app.use(
  cors({
    origin : "*"
  })
)

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
        await connection.query(`insert into users(username, password, email, gender, unique_id, provider) values(?,?,?,?,?,?)`,
          [username, bcrypt.hashSync(password, SALTROUNDS), email, gender, unique_id, 'local']) ;
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

// locally handling user Login in our DB
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
        if(dbUser.Provider !== 'local' || dbUser.Provider !== null){
          return res.status(401).send({
            message : "Third party logged in users cant Reset their password"
          })   
        }
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

app.get("/prefilltasks", async function(req,res){
  try{
      const task_id = req.query.id ;
      let existing_task = await connection.query(`select * from tasks where task_id = ?`, [task_id]) ;
      if(existing_task[0].length > 0){
          res.status(200).send(existing_task[0]) ;
      }else{
          res.status(200).send() ;
      }
  }catch(err){
      console.log(err) ;
      res.status(500).send({
          message : err.message ? err.message : "Something went wrong"
      })
  }  
})

// Configure Passport to use Google OAuth
passport.use(new GoogleStrategy({
    clientID : process.env.GOOGLE_CLIENTID ,
    clientSecret : process.env.GOOGLE_CLIENTSECRET ,
    callbackURL : "/login/google/callback"
}, async function(accessToken, refreshToken, profile, cb) {
    try{
      console.log("passport.use() wala callback wala chl rha h") ;
      console.log(profile) ;
      let Username = profile.displayName ;
      let provider = profile.provider ;
      let email = profile.emails[0].value ;
      const user = await connection.query(`select * from users where email = ?`, [email]) ;
      if(user[0].length  > 0){
        cb(null, user[0][0]) ;
      }else{
        const unique_id = profile.name.givenName + "-" + new Date().getTime() ;
        await connection.query(`insert into users(Username, Email, Unique_id, Provider) values(?,?,?,?)`, [Username, email, unique_id, provider]) ;
        const newUser = await connection.query(`select * from users where email = ?`, [email]) ;
        cb(null, newUser[0][0]) ;
      }
    }catch(error){
        cb(error, false) ;
    }
}))

// Configure Passport to use Github
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENTID,
      clientSecret: process.env.GITHUB_CLIENTSECRET,
      callbackURL: "/login/github/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        console.log("passport.use() wala callback wala chl rha h");
        console.log("GitHub Profile:", profile);
        let Username = profile.displayName;
        let provider = profile.provider;
        let profileUrl = profile.profileUrl; //  Email k column me ye daal rhe
        const user = await connection.query(`select * from users where username = ?`,[Username]) ;
        if(user[0].length > 0) {
          cb(null, user[0][0]);
        }else {
          const unique_id = profile.username + "-" + new Date().getTime() ;
          await connection.query(`insert into users(Username, Email, Unique_id, Provider) values(?,?,?,?)`, [Username, profileUrl, unique_id, provider]);
          const newUser = await connection.query(`select * from users where username = ?`,[Username]);
          cb(null, newUser[0][0]);
        }
      } catch(error) {
        cb(error, false);
      }
    }
  )
)

// OAuth login via Google and GitHub using passport.js

// Sabse pehle ye route chalega → ye Google ki login screen pr redirect karega phir passport config ka verify callback fnc chlega
app.get('/login/google', passport.authenticate('google',{
    scope : ['profile', 'email'],
    prompt: 'consent select_account' // forces account selection on Google ka login screen + re-consent
}))

// Jab Google login complete ho jata hai, to Google yahan redirect karta hai
app.get('/login/google/callback', passport.authenticate('google',{
    session : false
}), function(req,res,next) {
    const user = req.user ; 
    console.log(user) ;
    const token = jwt.sign(
      {
        email : user.Email,
        unique_id : user.Unique_id
      },SECRET, {expiresIn: '1h'})
    res.cookie("token", token, {httpOnly : true}) ;
    res.redirect('/') ;
})


// Sabse pehle ye route chalega → ye Github ki login screen pr redirect karega phir passport config ka verify callback fnc chlega
app.get('/login/github', passport.authenticate('github',{
    // scope : ['profile']
    // OR
    scope: ['user:email']
    // only FB & google gives you account selection ka login screen
}))

// Jab github login complete ho jata hai, to Github yahan reFB & googlect karta hai
app.get('/login/github/callback', passport.authenticate('github',{
    session : false
}), function(req,res,next) {
    const user = req.user ; 
    console.log(user) ;
    const token = jwt.sign(
      {
        email : user.Email,
        unique_id : user.Unique_id
      },SECRET, {expiresIn: '1h'})
    res.cookie("token", token, {httpOnly : true}) ;
    res.redirect('/') ;
})