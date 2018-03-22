var express = require('express');
var { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

var things = require('./things.js');

var app = express();
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/things', things);

app.get('/employees', async (req, res) => {
  try {
    const db = req.app.locals.db;

    await authenticate(req, db);

    await db.collection('EMPLOYEES').find().toArray(function (err, results) {
      console.log("GET DONE ");
      res.send(results);
    });

  } catch (err) {
    return res.json({"status": "err", "message": err.message});
  }
})

app.get('/employees/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;

    await authenticate(req, db);

    let id = Number(req.param('id'));

    if (!id) {
      return res.json({"status": "err", "message": "ID: please input number only"});
    }

    console.log("PR: "+req.param('id'));

    await db.collection('EMPLOYEES').find({id: id}).toArray(function (err, results) {
      console.log(results)
      res.send(results);
    });

  } catch (err) {
    return res.json({"status": "err", "message": err.message});
  }
})

app.put('/employees', async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    await authenticate(req, db);
    
    var myobj = req.body;
    var name = myobj.name;
    var age = Number(myobj.age);
    var mail = myobj.mail;
    var id = Number(myobj.id);
    var group = Number(myobj.group);
    // console.log(myobj);
    if (!id) {
      return res.json({"status": "err", "message": "ID: please input number only"});
    }

    myobj = {
      name: name,
      age: age,
      mail: mail,
      id: id,
      group: group
    }
    
    db.collection("EMPLOYEES").insertOne(myobj, function (err, res) {
      if (err) throw err;
      // console.log("1 document inserted");
      console.log(JSON.stringify(res.ops[0]));
      myobj = res.ops[0];
    });
    return res.json(myobj);
  } catch (err) {
    console.log(err);
    return res.json({"status": "err", "message": err.message});
  }
})

app.delete('/employees', async (req, res) => {
  try {
    const db = req.app.locals.db;

    await authenticate(req, db);

    var id = Number(req.body.id);
    if (!id) {
      return res.json({"status": "err", "message": "ID: please input number only"});
    }
    var myquery = { 'id': id };
    await db.collection("EMPLOYEES").remove(myquery, function (err, obj) {
      if (err) throw err;
      console.log(obj.result.n + " document(s) deleted");
      return res.json({"status": "Done"});
    });
    return res.json({"status": "Done"});
  } catch (err) {
    return res.json({"status": "err", "message": err.message});
  }
})

app.post('/employees', async (req, res) => {
  try {
    const db = req.app.locals.db;

    await authenticate(req, db);

    var myobj = req.body;
    var name = myobj.name;
    var age = Number(myobj.age);
    var mail = myobj.mail;
    var id = Number(myobj.id);
    var group = Number(myobj.group);
    if (!id) {
      return res.json({"status": "err", "message": "ID: please input number only"});
    }
    query = { 'id': id };
    newobj = {
      name: name,
      age: age,
      mail: mail,
      id: id,
      group: group
    }
    await db.collection('EMPLOYEES').updateOne(query, newobj, (err, obj) => {
      if (err) throw err;
      console.log(obj.result.n + " document(s) updated");
    })
    return res.json({"status": "Done"});
  } catch (err) {
    return res.json({"status": "err", "message": err.message});
  }
})

authenticate = (req, db) => {
  return new Promise((resolve, reject) => {
    try {
      var token = req.headers.authorization;
      console.log("TOKEN: "+token);
      db.collection('ADMIN').findOne({
        Authorization: token
      }, (err, user) => {

        if (err) throw err;

        if (!user) {
          console.log("Authentication failed. User not found");
          reject(new Error('Authentication failed. User not found.'));
        }
        console.log('success: true, message: Authentication passed.');
        resolve({ success: true, message: 'Authentication passed.' });
      });

    } catch (err) {
      console.log("success: false, message: " + err);
      throw err
    }
  })
}

MongoClient.connect('mongodb://localhost:27017/test', { promiseLibrary: Promise }, (err, db) => {
  if (err) {
    console.log('Failed to connect to the database. ' + err.stack);
  }
  app.locals.db = db;
  app.listen(3000, () => {
  });
});
