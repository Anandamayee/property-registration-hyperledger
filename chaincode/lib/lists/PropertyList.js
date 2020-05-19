'use strict';
const { ContractCommon } = require('../models/ContractCommon.js');

class PropertyList {
    constructor(ctx) {
        this.ctx = ctx;
        this.name = 'org.property-registration-network.regnet.lists.property';
    }
	/**
	 * Returns the User model stored in blockchain identified by this key
	 * @param propertyKey
	 * @returns {Promise<Property>}
	 */
    async getProperty(propertyKey) {
        let propertyCompositeKey = this.ctx.stub.createCompositeKey(this.name, propertyKey.split('::'));
        let propertyBuffer = await this.ctx.stub.getState(propertyCompositeKey);
        return ContractCommon.fromBuffer(propertyBuffer, 'property');
    }
	/**
	 * Adds a Property model to the blockchain
	 * @param propertybject {Property}
	 * @returns {Promise<void>}
	 */
    async addProperty(propertybject) {
        let propertyCompositeKey = this.ctx.stub.createCompositeKey(this.name, propertybject.Property_ID.split('::'));
        let propertyBuffer = ContractCommon.toBuffer(propertybject);
        await this.ctx.stub.putState(propertyCompositeKey, propertyBuffer);
    }
	/**
	 * Updates a property model on the blockchain
	 * @param propertybject {Property}
	 * @returns {Promise<void>}
	 */
    async updateProperty(propertybject) {
        let propertyCompositeKey = this.ctx.stub.createCompositeKey(this.name, propertybject.Property_ID.split('::'));
        let propertyBuffer = ContractCommon.toBuffer(propertybject);
        await this.ctx.stub.putState(propertyCompositeKey, propertyBuffer);
    }
}
module.exports = PropertyList;