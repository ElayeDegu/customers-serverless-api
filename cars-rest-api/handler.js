const serverless = require('serverless-http');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const { v4: uuid4 } = require('uuid');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/cars', async (req, res) => {
  const data = req.body;
  const params = {
    TableName: 'customersTable',
    Item: {
      id: uuid4(),
      name: data.name,
      make: data.make,
      model: data.model,
      year: data.year,
    },
  };

  try {
    await db.put(params).promise();
    res.status(201).json({ car: params.Item });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/cars', async (req, res) => {
  const params = {
    TableName: 'customersTable',
  };

  const result = await db.scan(params).promise();
  res.status(200).json({ cars: result });
});

app.patch('/cars/:id', async (req, res) => {
  const data = req.body;
  const params = {
    TableName: 'customersTable',
    Item: {
      id: data.id,
      name: data.name,
      make: data.make,
      model: data.model,
      year: data.year,
    },
  };
  await db.put(params).promise();
  res.status(200).json({ car: params.Item });
});

app.delete('/cars/:id', async (req, res) => {
  const params = {
    TableName: 'customersTable',
    key: {
      id: req.params.id,
    },
  };

  await db.delete(params).promise();
  res.status(200).json({ success: true });
});

module.exports.app = serverless(app);
