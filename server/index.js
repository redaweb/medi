const express = require('express');
const crypto = require('crypto');
const assert = require('assert');
//const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const mysql = require('mysql');
const session = require('express-session');
const { error } = require('console');

app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: true
}));

//var connection = mysql.createConnection(process.env.JAWSDB_URL);

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'med'
});



connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database!');
});



app.use(express.static('../client/build'));
// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
/*mongoose
  .connect('mongodb://localhost/my-database', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));*/
console.log(crypto.createHash('sha256').update("aaa").digest('hex'))

// Routes
app.post('/login', function(req, res) {
  var connecte=false
  var username = req.body.username;
  var password = req.body.password;
  console.log(username+"  "+password)
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  //assert.strictEqual(hash, 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e');
  connection.query("SELECT * FROM medecin where username='"+username+"' and password='"+hash+"'",(error,results)=>{
    if (error) throw error;
    console.log(results[0].profil)
  if(results.length>0) {
    req.session.username = username;
    req.session.profil=results[0].profil;
    req.session.nom=results[0].nom;
    req.session.prenom=results[0].prenom;
    //res.redirect('/dashboard');
    res.send(req.session);
  } else {
    res.send({erreur:"erreur"})
    //res.redirect('/login');
    console.log('erreeur')
  }  
  })
  // Vérifiez les informations d'identification de l'utilisateur ici

  
});

app.get('/testconexion', (req, res) => {
  //req.session.destroy();
  res.send(req.session);
  console.log(req.session)
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  console.log("logout")
  res.send('Logged out successfully!');
});

// route patients
app.get('/lireNvPatients',(req,res)=>{
  connection.query('SELECT * FROM patient where active',(error,results)=>{
    if (error) throw error;
    res.send(results)
  })
})

app.get('/suppPatients/:id',(req,res)=>{
  connection.query('DELETE FROM patient where id='+req.params.id,(error,results)=>{
    if (error) throw error;
    res.send(results)
  })
})

app.post('/ajoutPatient',(req,res)=>{
  const nouveauPatient=req.body
  console.log(nouveauPatient)
  connection.query('INSERT INTO patient (nom, prenom, date_naissance, etat_general, adresse, telephone,cas, inscri) VALUES (\''+nouveauPatient.nom+'\', \''+nouveauPatient.prenom+'\', \''+nouveauPatient.date_naissance+'\', \''+nouveauPatient.etat_general+'\', \''+nouveauPatient.adresse+'\', \''+nouveauPatient.telephone+'\',\''+nouveauPatient.cas+'\' , now())',(error,results)=>{
    if (error) throw error;
    res.send(results)
  })
})

app.post('/editPatient',(req,res)=>{
  const Patient=req.body
  console.log(Patient)
  connection.query('update patient set nom=\''+Patient.nom+'\', prenom=\''+Patient.prenom+'\', date_naissance=\''+Patient.date_naissance+'\', etat_general=\''+Patient.etat_general+'\', adresse=\''+Patient.adresse+'\', telephone =\''+Patient.telephone+'\', cas='+Patient.cas+' where id='+Patient.id+' ',(error,results)=>{
    if (error) throw error;
    res.send(results)
  })
})

// route medecins

app.get('/lireMedecins',(req,res)=>{
  connection.query('SELECT * FROM medecin',(error,results)=>{
    if (error) throw error;
    res.send(results)
  })
})

app.get('/suppMedecins/:id',(req,res)=>{
  connection.query('DELETE FROM medecin where id='+req.params.id,(error,results)=>{
    if (error) throw error;
    res.send(results)
  })
})

app.post('/ajoutMedecin',(req,res)=>{
  const nouveauMedecin=req.body
  console.log(nouveauMedecin)

  const hash = crypto.createHash('sha256').update(nouveauMedecin.password).digest('hex');
  connection.query('INSERT INTO medecin (nom, prenom,username, password, profil) VALUES (\''+nouveauMedecin.nom+'\', \''+nouveauMedecin.prenom+'\', \''+nouveauMedecin.username+'\', \''+hash+'\', \''+nouveauMedecin.profil+'\')',(error,results)=>{
    if (error) throw error;
    res.send(results)
  })
})

app.post('/editMedecin',(req,res)=>{
  const Medecin=req.body
  console.log(Medecin)
  const hash = crypto.createHash('sha256').update(Medecin.password).digest('hex');
  connection.query('update medecin set nom=\''+Medecin.nom+'\', prenom=\''+Medecin.prenom+'\', username=\''+Medecin.username+'\', password=\''+hash+'\', profil=\''+Medecin.profil+'\' where id='+Medecin.id+' ',(error,results)=>{
    if (error) throw error;
    res.send(results)
  })
})

//route seance

app.get('/seances',(req,res)=>{
  var requete="SELECT seance.*, medecin.nom AS medecin_nom, medecin.prenom AS medecin_prenom, patient.nom AS patient_nom, patient.prenom AS patient_prenom"+
  " FROM seance"+
  " INNER JOIN medecin ON seance.idMedecin=medecin.id"+
  " INNER JOIN patient ON seance.idPatient=patient.id;"
  connection.query(requete,(error,results)=>{
    if (error) throw error;
    console.log(results)
    res.send(results)
  })
})
app.get('/*', (req, res) => { 
    //res.send(path.join(__dirname, '../client/public', 'index.html'))
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  //console.log(path.join(__dirname, 'client/public', 'index.html'))
});



// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
