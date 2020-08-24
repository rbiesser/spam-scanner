import { createRxDatabase, addRxPlugin } from 'rxdb/plugins/core';
import { RxDBEncryptionPlugin } from 'rxdb/plugins/encryption';
import { RxDBValidatePlugin } from 'rxdb/plugins/validate';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import {messageSchema, spamWordsSchema} from './Schema'

import defaultSpamWords from './DefaultSpamWords.json'

// https://rxdb.info/custom-build.html
addRxPlugin(RxDBEncryptionPlugin);
addRxPlugin(RxDBValidatePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBUpdatePlugin);
// addRxPlugin(require('pouchdb-adapter-memory'));
addRxPlugin(require('pouchdb-adapter-idb'));

let _getDatabase; // cached
export function getDatabase(name, adapter) {
  if (!_getDatabase) _getDatabase = createDatabase(name, adapter);
  return _getDatabase;
}

async function createDatabase(name, adapter) {
  const db = await createRxDatabase({
    name: name,                  // <- name
    adapter: adapter,            // <- storage-adapter
    password: 'myPassword',      // <- password (optional)
    multiInstance: true,         // <- multiInstance (optional, default: true)
    eventReduce: false           // <- eventReduce (optional, default: true)
  });

  console.log('creating collection..');
  await db.collection({
    name: 'messages',
    schema: messageSchema
  });

  console.log('creating collection..');
  await db.collection({
    name: 'spamwords',
    schema: spamWordsSchema,
    statics: {
      // a Promise
      countAllDocuments: async function () {
        const allDocs = await this.find().exec();
        return allDocs.length;
      }
    },
    methods: {}
  });

  Promise.resolve(db.spamwords.countAllDocuments()).then((value)=>{
    if (value === 0){
      console.log('initialize spam words')
      db.spamwords.bulkInsert(defaultSpamWords)
    }
  })
  
  // console.log(db.spamwords.countAllDocuments())
  // debugger
  // db.terms.insert({ term: 'spam' })
  // db.terms.insert({ term: 'another' })

  // console.log(db.terms.countAllDocuments)
  // console.log(db.terms.scream())

  // console.dir(db);

  return db;

}

// module.exports = {
//   getDatabase
// };