const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload'); 
require('dotenv').config()

const port = 5000
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vfsjf.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri)


const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(express.static('doctors'));
app.use(fileUpload());


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("doctorPortals").collection("appointments");
  const doctorCollection = client.db("doctorPortals").collection("doctors");

  app.post('/addAppointment', (req, res) => {
    const appointment = req.body;
    collection.insertOne(appointment)
    .then(result =>{
      res.send(result.insertedCount)
      console.log(result)
    })
  })
  app.post('/appointmentList',(req,res)=>{
    const date = req.body;
    const email = req.body.email;
    doctorCollection.find({email : email})
    .toArray((err,doctors)=>{
      const filter = {date: date.date}
      if(doctors.length === 0){
          filter.email = email;
      }
      collection.find(filter)
      .toArray((err,documents)=>{
        res.send(documents)
      })
    })
  })

  app.post('/isDoctor',(req,res)=>{
    const email = req.body.email;
    doctorCollection.find({email : email})
    .toArray((err,doctors)=>{
      res.send(doctors.length >0)
    
    })
  })



  app.get('/appointments',(req,res)=>{
    collection.find({})
    .toArray((err,documents)=>{
      res.send(documents)
    })
  })

  app.post('/addDoctor', (req,res)=>{
    const file = req.files.file
    const name = req.body.name
    const email = req.body.email
    const newImg = file.data
    const encImg = newImg.toString('base64')
     
    const image = {
      contentType :file.mimetype,
      size : file.size,
      img : Buffer.from(encImg,'base64')
    }

     doctorCollection.insertOne({name,email,image})
     .then(result=>{
       res.send(result.insertedCount >0 )
     })
 
  })

  app.get('/doctors',(req,res)=>{
    doctorCollection.find({})
    .toArray((err,documents)=>{
      res.send(documents)
    })
  })


});





app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.listen(process.env.PORT || port)