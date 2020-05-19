'use strict'

const { ContractCommon } = require('../models/ContractCommon.js');



class RegisterList {
    constructor(ctx) {
        this.ctx = ctx;
        this.name = 'org.property-registration-network.regnet.lists.register';
    }
	/**
	 * Returns the Data model stored in blockchain identified by this key
	 * @param key
	 * @returns {Promise<DataModel>}
	 */
    async getRegisteredData(key, className) {
        let responseCompositeKey = this.ctx.stub.createCompositeKey(this.name, key.split('::'));
        let responseBuffer = await this.ctx.stub.getState(responseCompositeKey);
        return ContractCommon.fromBuffer(responseBuffer, className);
    }
	/**
	 * Adds a Data model to the blockchain
	 * @param requestObject {User}
	 * @returns {Promise<void>}
	 */
    async registerData(requestObject, key) {
        let requestCompositeKey = this.ctx.stub.createCompositeKey(this.name, requestObject[key].split('::'));
        let requestBuffer = ContractCommon.toBuffer(requestObject);
        await this.ctx.stub.putState(requestCompositeKey, requestBuffer);
    }
}
module.exports = RegisterList;