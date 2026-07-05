const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb://localhost:27017/';
const dbName = 'ALKJ-Interns';
const collectionName = 'employees';

let client;
let db;
let employeesCollection;

async function connectToDatabase() {
  if (client) {
    return { client, db, employeesCollection };
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  employeesCollection = db.collection(collectionName);

  return { client, db, employeesCollection };
}

async function getEmployeesCollection() {
  const connection = await connectToDatabase();
  return connection.employeesCollection;
}

module.exports = {
  connectToDatabase,
  getEmployeesCollection,
  ObjectId,
};