'use strict'

const { Context } = require('fabric-contract-api');
const User = require('./User.js');
const Property = require('./Property.js');


const classMapping = {
    'user': User,
    'property': Property
}
const transactionIDs = {
    upg100: 100,
    upg500: 500,
    upg1000: 1000
}
const propertyStatus = ['registered', 'onSale'];

class ContractCommon {
  
    /**
	 * Convert the buffer stream received from blockchain into an object of this model
	 * @param buffer {Buffer}
	 */

    static fromBuffer(buffer, className) {
        let json = JSON.parse(buffer.toString());
        return new classMapping[className](json);
    }
	/**
	 * Convert the object of this model to a buffer stream
	 * @returns {Buffer}
	 */
    static toBuffer(jsonObject) {
        return Buffer.from(JSON.stringify(jsonObject));
    }
    /**
	 * Create a key string joined from different key parts
	 * @param keyParts {Array}
	 * @returns {*}
	 */
    static makeKey(keyParts) {
        return keyParts.map(part => JSON.stringify(part)).join("::");
    }
    /**
	 * Create a new instance of this model
	 * @returns {ClassName}
	 * @param jsonObject {Object}
	 */
    static createInstance(jsonObject, className) {
        return new classMapping[className](jsonObject);
    }
}

module.exports = {
    ContractCommon: ContractCommon,
    transactionIDs: transactionIDs,
    propertyStatus: propertyStatus
};
