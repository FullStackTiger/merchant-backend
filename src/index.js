// @flow

import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import http from 'http';
import mongoose from 'mongoose';
import uuidv4 from 'uuid/v4';

import {
  Merchant,
  Item,
} from './db';

require('dotenv').config();

const mongoDbUsername: string = process.env.DB_USER || '';
const mongoDbPassword: string = process.env.DB_PASS || '';

const CONN: string = `mongodb://${mongoDbUsername}:${mongoDbPassword}@ds137054.mlab.com:37054/swift-ordering`;

mongoose.Promise = global.Promise;
const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send({ message: 'hello world!' });
});

/**
 * Merchants CRUD
 */

/**
 * Create merchant
 */
app.post('/api/v1/merchants', async (req, res) => {
  mongoose.connect(CONN, { useMongoClient: true });

  const {
    name,
    description,
    logoUrl,
    webUrl,
    facebookUrl,
    address: {
      street,
      city,
      prov,
      postal,
      phone,
    },
  } = req.body;

  try {
    Merchant.create({
      id: uuidv4(), // we assign the ID, not the client
      name,
      description,
      logoUrl,
      webUrl,
      facebookUrl,
      address: {
        street,
        city,
        prov,
        postal,
        phone,
      },
    }, (err, merchant) => {
      if (!err) {
        res.status(200).json(merchant);
        mongoose.disconnect();
      } else {
        res.status(400).json({ error: err }); // TODO: get mongoose err object
        mongoose.disconnect();
      }
    });
  } catch (e) {
    res.status(400).json({ error: e }); // TODO: get mongoose err object
    mongoose.disconnect();
  }
});

/**
 * Get list of merchants
 */
app.get('/api/v1/merchants', async (req, res) => {
  mongoose.connect(CONN, { useMongoClient: true });

  // TODO: search near lat/lng, pagination
  const merchants = await Merchant.find().limit(50);
  res.status(200).json(merchants);
  mongoose.disconnect();
});

/**
 * Get Merchant by ID
 */
app.get('/api/v1/merchants/:merchantId', async (req, res) => {
  mongoose.connect(CONN, { useMongoClient: true });

  const merchant = await Merchant.findOne({ id: req.params.merchantId });
  res.status(200).json(merchant);
  mongoose.disconnect();
});

/**
 * Update a merchant
 */
app.put('/api/v1/merchants/:merchantId', async (req, res) => {
  mongoose.connect(CONN, { useMongoClient: true });

  const { merchantId } = req.params;
  const {
    name,
    description,
    webUrl,
    facebookUrl,
    logoUrl,
    address, // assumes the entire address is included with the update
  } = req.body;

  const changes = {};
  if (name) {
    changes.name = name;
  }

  if (description) {
    changes.name = description;
  }

  if (webUrl) {
    changes.webUrl = webUrl;
  }

  if (facebookUrl) {
    changes.facebookUrl = facebookUrl;
  }

  if (logoUrl) {
    changes.logoUrl = logoUrl;
  }

  if (address) {
    // NOTE: you will need to have supplied the entire old address first. Otherwise, you lose all address data and only have the object provided here.
    changes.address = address;
  }

  try {
    Merchant.updateOne(
      { id: merchantId },
      changes,
      { new: true },
      (err, updateOp) => {
        if (err) {
          console.error('err', err);
          res.status(400).json({ error: err });
          mongoose.disconnect();
        } else if (updateOp && updateOp.n > 0) {
          res.status(204).json();
          mongoose.disconnect();
        } else {
          res.status(404).json({});
          mongoose.disconnect();
        }
      },
    );
  } catch (e) {
    res.status(400).json({ error: e });
    mongoose.disconnect();
  }
});

/**
 * Items CRUD
 */

/**
 * Create an item for a merchant
 */
app.post('/api/v1/merchants/:merchantId/items/', async (req, res) => {
  mongoose.connect(CONN, { useMongoClient: true });

  const {
    name,
    description,
    price,
    imageUrl,
  } = req.body;
  const { merchantId } = req.params;

  try {
    await Item.create({
      id: uuidv4(),
      name,
      description,
      price,
      imageUrl,
      reviews: 0,
      stars: 0,
      merchantId,
    }, (err, item) => {
      if (err) {
        res.status(400).json({ error: err });
      } else {
        res.status(200).json({ item });
      }
    });
  } catch (e) {
    res.status(400).json({ error: e });
  }

  mongoose.disconnect();
});

/**
 * Get all items regardless of merchant
 */
app.get('/api/v1/items', async (req, res) => {
  mongoose.connect(CONN, { useMongoClient: true });
  const items = await Item.find().limit(50);
  res.status(200).json(items || []);
  mongoose.disconnect();
});

/**
 * Get just one item regardless of merchant
 */
app.get('/api/v1/items/:itemId', async (req, res) => {
  mongoose.connect(CONN, { useMongoClient: true });
  const { itemId } = req.params;

  const item = await Item.findOne({ id: itemId });

  res.status(200).json(item || {});
  mongoose.disconnect();
});

/**
 * Get items by merchant
 */
app.get('/api/v1/merchants/:merchantId/items/', async (req, res) => {
  mongoose.connect(CONN, { useMongoClient: true });

  const { merchantId } = req.params;

  const items = await Item.find({ merchantId });

  res.status(200).json(items || []);
  mongoose.disconnect();
});

/**
 * Get just one item belonging to merchantId
 */
app.get('/api/v1/merchants/:merchantId/items/:itemId', async (req, res) => {
  mongoose.connect(CONN, { useMongoClient: true });
  const { merchantId, itemId } = req.params;

  const item = await Item.findOne({ id: itemId, merchantId });

  res.status(200).json(item || {});
  mongoose.disconnect();
});

/**
 * Edit item at path
 */
app.put('/api/v1/merchants/:merchantId/items/:itemId', async (req, res) => {
  mongoose.connect(CONN, { useMongoClient: true });

  const { merchantId, itemId } = req.params;

  const {
    name,
    description,
    price,
    imageUrl,
    reviews,
    stars,
  } = req.body;

  // gotta be an easier way... stoooopid Mongoose....
  const changes = {};
  if (name) {
    changes.name = name;
  }

  if (description) {
    changes.description = description;
  }

  if (price) {
    changes.price = price;
  }

  if (imageUrl) {
    changes.imageUrl = imageUrl;
  }

  if (reviews) {
    changes.reviews = reviews;
  }

  if (stars) {
    changes.stars = stars;
  }

  try {
    Item.updateOne(
      {
        id: itemId,
        merchantId,
      },
      changes,
      {
        new: true,
      }, (err, updateOp) => {
        if (err) {
          console.error('err', err);
          res.status(400).json({ error: err });
          mongoose.disconnect();
        } else if (updateOp && updateOp.n > 0) {
          res.status(204).json();
          mongoose.disconnect();
        } else {
          res.status(404).json({});
        }
      },
    );
  } catch (e) {
    console.log('Try/catch Put', e);
    res.status(400).json({ error: e });
    mongoose.disconnect();
  }
});

/**
 * Delete item at path
 */
app.delete('/api/v1/merchants/:merchantId/items/:itemId', async (req, res) => {
  mongoose.connect(CONN, { useMongoClient: true });
  const { merchantId, itemId } = req.params;

  await Item.deleteOne({ id: itemId, merchantId }, (err, deleteOp) => {
    if (err) {
      res.status(400).json({ error: err });
    } else if (
      deleteOp
      && deleteOp.result
      && deleteOp.result.n === 0
    ) {
      res.status(404).json(deleteOp.result);
    } else {
      res.status(204).json();
    }
  });

  mongoose.disconnect();
});

const httpServer = http.Server(app);
httpServer.listen(5000, () => {
  // eslint-disable-next-line no-console
  console.info('Backend Server listening on port 5000');
});
