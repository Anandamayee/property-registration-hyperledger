'use strict';
const { ContractCommon } = require('../models/ContractCommon.js');



class UsersList {
	constructor(ctx) {
		this.ctx = ctx;
		this.name = 'org.property-registration-network.regnet.lists.user';
	}
	/**
	 * Returns the User model stored in blockchain identified by this key
	 * @param userKey
	 * @returns {Promise<User>}
	 */
	async getUser(userKey) {
		let userCompositeKey = this.ctx.stub.createCompositeKey(this.name, userKey.split('::'));
		let userBuffer = await this.ctx.stub.getState(userCompositeKey);
		return ContractCommon.fromBuffer(userBuffer, 'user');
	}
	/**
	 * Adds a User model to the blockchain
	 * @param userObject {User}
	 * @returns {Promise<void>}
	 */
	async addUser(userObject) {
		let userCompositeKey = this.ctx.stub.createCompositeKey(this.name, userObject.UserID.split('::'));
		let userBuffer = ContractCommon.toBuffer(userObject);
		await this.ctx.stub.putState(userCompositeKey, userBuffer);
	}
	/**
	 * Updates a user model on the blockchain
	 * @param userObject {User}
	 * @returns {Promise<void>}
	 */
	async updateUser(userObject) {
		let userCompositeKey = this.ctx.stub.createCompositeKey(this.name, userObject.UserID.split('::'));
		let userBuffer = ContractCommon.toBuffer(userObject);
		await this.ctx.stub.putState(userCompositeKey, userBuffer);
	}
	/**
	 * Return  user CompositeKey
	 * @param userKey 
	 * @returns string
	 */
	getCompositeKey(userKey) {
		return this.ctx.stub.createCompositeKey(this.name, userKey.split('::'));
	}
	/**
	 * Return  user CompositeKey
	 * @param userKey 
	 * @returns string[]
	 */
	getSplitedCompositeKey(userKey) {
		return this.ctx.stub.splitCompositeKey(userKey).attributes.map(attribute=>attribute.replace(/"/g, ""));
	}
	/**
	 * Get All registered  users  from the blockchain
	 * @returns Array<{key,value}>
	 */
	async getAllUsers(){
		let iterator=await this.ctx.stub.getStateByPartialCompositeKey(this.name,[]);		
		let result;
		let allUsers=[]
		do{
			result=await iterator.next();
			console.log(result);
			if(result && result.value && result.value.value.toString()) 
			{
				const key=this.ctx.stub.splitCompositeKey(result.value.key).attributes[0];
				const value=result.value.value.buffer.toString('utf-8');
				allUsers.push({key:key,value:value})
			}
		}
		while(!result.done);
		return allUsers;
	}
}
module.exports = UsersList;