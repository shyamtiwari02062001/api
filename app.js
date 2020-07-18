const express=require ('express')
const app=express();
const path = require('path')
const multer=require('multer')
const { Pool,Client} =require('pg')
const PORT = process.env.PORT || 5000
let photopath;
let email;
let searchData;



const storage=multer.diskStorage({
    destination:'./public/upload',
    filename:function(req,file,cb){
        cb(null,email+'-'+Date.now()+path.extname(file.originalname));
    }
})



const upload=multer({
    storage:storage
}).single('photo');



app.use(express.static('./public'))
 app .set('view engine', 'ejs')
  app.use(express.json())



const connectionString =(process.env.pg_URI ||"postgres://postgres:@Shyam02@localhost:5432")
const client = new Client({
    connectionString:connectionString
})
client.connect()


//WHERE id = (SELECT MAX(id) FROM profile)
app.get('/',(req,res)=>{
    client.query("SELECT * FROM profile WHERE id = (SELECT MAX(id) FROM profile)",function(err,result){
      if(err){
          return console.error('error running query',err);
      }
      res.send({profile:result.rows})
});
})



app.post("/api", (req, res) => {
    email=req.body.email;
    client.query("INSERT INTO profile(name,email,photourl)values($1,$2,$3);",[req.body.name,req.body.email,req.body.photoUrl],function(err,result)
      {
        if(err)
        {
            res.status(500).send(err.toString());
        }
    });
    })  



app.post("/upload",(req,res)=>{
    upload(req,res,(err)=>{
        if(err){
            res.status(500).send(err.toString());
        }
        else{
            console.log(req.file.filename);
            photopath='http://192.168.42.194:5000/upload/'+req.file.filename;
            console.log(photopath);
        }
    })
})



app.post("/details", (req, res) => {
    console.log(photopath);
    client.query("INSERT INTO post(name,email,photourl,photopath)values($1,$2,$3,$4);",[req.body.name,req.body.email,req.body.photourl,photopath],function(err,result)
      {
        if(err)
        {
            res.status(500).send(err.toString());
        }
    });
    })



    app.get('/post',(req,res)=>{
        client.query("SELECT * FROM post order by id desc ",function(err,result){
          if(err){
              return console.error('error running query',err);
          }
          res.send({post:result.rows})
    });
    })

    

app.get('/postDetails',(req,res)=>{
    let photopaths=`%${email}%`
    client.query("SELECT * FROM post WHERE photopath LIKE ($1)",[photopaths],function(err,result){
        if(err){
            return console.error('error running query',err);
        }
        res.send({post:result.rows})
    })
})



app.post("/searchData", (req, res) => {
   searchData=req.body.search;
   console.log(searchData)
    })


    
    app.get('/search',(req,res)=>{
        let search=`%${searchData}%`
        client.query("SELECT * FROM profile WHERE name LIKE ($1)  ",[search],function(err,result){
            if(err){
                return console.error('error running query',err);
            }
            res.send({profile:result.rows})
        })
    })
    
    
    
    app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
