'use strict';

var _ = require("lodash");
var async = require("async");

/**
 * Default model configuration
 * (sails.config.models)
 *
 * Unless you override them, the following properties will be included
 * in each of your models.
 *
 * For more info on Sails models, see:
 * http://sailsjs.org/#/documentation/concepts/ORM
 */
module.exports.models = {
    /***************************************************************************
     *                                                                          *
     * Your app's default connection. i.e. the name of one of your app's        *
     * connections (see `config/connections.js`)                                *
     *                                                                          *
     ***************************************************************************/
    // connection: process.env.DB_ADAPTER || 'default',
    migrate: 'alter',

    // These settings make the .update(), .create() and .createEach()
    // work like they did in 0.12, by returning records in the callback.
    // This is pretty ineffecient, so if you don't _always_ need this feature, you
    // should turn these off and instead chain `.meta({fetch: true})` onto the
    // individual calls where you _do_ need records returned.
    fetchRecordsOnUpdate: true,
    fetchRecordsOnCreate: true,
    fetchRecordsOnCreateEach: true,

    // Fetching records on destroy was experimental, but if you were using it,
    // uncomment the next line.
    // fetchRecordsOnDestroy: true,

    // The former `connection` model setting is now `datastore`.  This sets the datastore
    // that models will use, unless overridden directly in the model file in `api/models`.
    // It defaults to a datastore called `default`, which (unless otherwise configured in
    // the `config/datastores.js` file) uses the built-in `sails-disk` adapter.
    // datastore: 'localDiskDb',

    // Because you can't have the old `connection` setting at the same time as the new
    // `datastore` setting, we'll set it to `null` here.  When you merge this file into your
    // existing `config/models.js` file, just remove any reference to `connection`.
    // connection: null,

    // These attributes will be added to all of your models.  When you create a new Sails 1.0
    // app with "sails new", a similar configuration will be generated for you.
    attributes: {
        // In Sails 1.0, the `autoCreatedAt` and `autoUpdatedAt` model settings
        // have been removed.  Instead, you choose which attributes (if any) to use as
        // timestamps.  By default, "sails new" will generate these two attributes as numbers,
        // giving you the most flexibility.  But for compatibility with your existing project,
        // we'll define them as strings.
        createdAt: { type: 'string', autoCreatedAt: true, },
        updatedAt: { type: 'string', autoUpdatedAt: true, },
        // In Sails 1.0, the primary key field is no longer created for you, and `autoPK` is
        // not a valid model option.  Instead, you define it yourself and tell Sails which
        // attribute to use as the primary key by setting the `primaryKey` setting on the model.
        // That setting defaults to `id`.
        id: { type: 'number', autoIncrement: true, }
    },


    /******************************************************************************
    *                                                                             *
    * The set of DEKs (data encryption keys) for at-rest encryption.              *
    * i.e. when encrypting/decrypting data for attributes with `encrypt: true`.   *
    *                                                                             *
    * > The `default` DEK is used for all new encryptions, but multiple DEKs      *
    * > can be configured to allow for key rotation.  In production, be sure to   *
    * > manage these keys like you would any other sensitive credential.          *
    *                                                                             *
    * > For more info, see:                                                       *
    * > https://sailsjs.com/docs/concepts/orm/model-settings#?dataEncryptionKeys  *
    *                                                                             *
    ******************************************************************************/
    dataEncryptionKeys: {
        default: 'nZ/YrKnyEvr9Yf2FWSj5cscoqxtgRsWCMiJFHd/looE='
    },

    updateOrCreate: function(criteria, values, cb){
        var self = this; // reference for use by callbacks
        // If no values were specified, use criteria
        if (!values) values = criteria.where ? criteria.where : criteria;

        this.findOne(criteria, function (err, result){
            if(err) return cb(err, false);

            if(result){
                self.update(criteria, values, cb);
            }else{
                self.create(values, cb);
            }
        });
    },

    /**
     * This method adds records to the database
     *
     * To use add a variable 'seedData' in your model and call the
     * method in the bootstrap.js file
     * @param {string} callback what is there to say its a callback
     */
    seed: function (callback) {
        var self = this;
        var modelName = self.adapter.identity.charAt(0).toUpperCase() + self.adapter.identity.slice(1);
        if (!self.seedData) {
            sails.log.debug('No data available to seed ' + modelName);
            callback();
            return;
        }
        self.count().exec(function (err, count) {

            if(err) {
                sails.log.error("Failed to seed " + modelName, err);
                return callback();
            }

            if(count === 0) {
                sails.log.debug('Seeding ' + modelName + '...');
                if (self.seedData instanceof Array) {
                    self.seedArray(callback);
                } else {
                    self.seedObject(callback);
                }
            }else{
                if(modelName === 'Emailtransport') {
                    // Update records
                    self.updateRecords(callback);
                }else{
                    sails.log.debug(modelName + ' had models, so no seed needed');
                    return callback();
                }
            }
        });
    },

    updateRecords : function (callback) {
        var self = this;
        var modelName = self.adapter.identity.charAt(0).toUpperCase() + self.adapter.identity.slice(1);
        self.find({}).exec(function (err, results) {
            if (err) {
                sails.log.debug(err);
                callback();
            } else {



                var data = [];

                self.seedData.forEach(function (seed) {

                    const updateItem = _.find(results, (item) => {
                        return item.name === seed.name;
                    });

                    if (updateItem) data.push(_.merge(seed, updateItem));
                });

                var fns = [];

                data.forEach(function (item) {
                    fns.push(function (cb) {
                        self.update({
                            id: item.id
                        }, _.omit(item, ["id"])).exec(cb);
                    });
                });

                async.series(fns, function (err, data) {
                    if (err) {
                        sails.log.debug(err);
                        callback();
                    } else {
                        sails.log.debug(modelName + ' seeds updated');
                        callback();
                    }
                });
            }
        });
    },

    seedArray: function (callback) {
        var self = this;
        var modelName = self.adapter.identity.charAt(0).toUpperCase() + self.adapter.identity.slice(1);
        self.createEach(self.seedData).exec(function (err, results) {
            if (err) {
                sails.log.debug(err);
                callback();
            } else {
                sails.log.debug(modelName + ' seed planted');
                callback();
            }
        });
    },
    seedObject: function (callback) {
        var self = this;
        var modelName = self.adapter.identity.charAt(0).toUpperCase() + self.adapter.identity.slice(1);
        self.create(self.seedData).exec(function (err, results) {
            if (err) {
                sails.log.debug(err);
                callback();
            } else {
                sails.log.debug(modelName + ' seed planted');
                callback();
            }
        });
    }
};
