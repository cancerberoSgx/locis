// high level functions for db operations
var assert = require('assert');
var mongodb = require('mongodb');

var search = function (collectionName) {
	return function (db, data, callback) {
		return new Promise((resolve, reject) => {
			if (data._id) {
				data._id = mongodb.ObjectId(data._id);
			}
			var cursor = db.collection(collectionName).find(data);
			var docs = [];
			cursor.each((err, doc) => {
				assert.equal(err, null);
				if (err) {
					callback && callback(err);
					reject(err);
				}
				if (doc != null) {
					docs.push(doc);
				} else {
					callback && callback(null, docs);
					resolve(docs);
				}
			});
		});
	};
};

var update = function (collectionName) {
	return function (db, data, callback) {
		return new Promise((resolve, reject) => {
			var id = mongodb.ObjectId(data._id);
			delete data._id;
			db.collection(collectionName).updateOne({ _id: id }, {
				$set: data,
				$currentDate: { lastModified: true }
			}, (err, result) => {
				assert.equal(err, null);
				err ? reject(err) : resolve(result.result);
				callback && callback(err);
			});
		});
	};
};

var insert = function (collectionName) {
	return function (db, data, callback) {
		return new Promise((resolve, reject) => {
			db.collection(collectionName).insertOne(data, (err, result) => {
				assert.equal(err, null);
				err ? reject(err) : resolve();
				callback && callback(err);
			});
		});
	};
};

var deleteMany = function (collectionName) {
	return function (db, data, callback) {
		return new Promise((resolve, reject) => {
			if (data._id) {
				data._id = mongodb.ObjectId(data._id);
			}
			// console.log('dbutil deleteMany', data)
			db.collection(collectionName).deleteMany(data, (err, results) => {
				err ? reject(err) : resolve(results);
				callback && callback(err, results);
			});
		});
	};
};

module.exports = {
	search: search,
	update: update,
	insert: insert,
	delete: deleteMany
};