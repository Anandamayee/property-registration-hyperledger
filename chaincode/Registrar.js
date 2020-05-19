'use strict';
const { Contract } = require('fabric-contract-api');
const { ContractCommon } = require('./lib/models/ContractCommon.js');
const ListContext = require('./lib/models/ListContext.js');

class RegistrarContract extends Contract {
    constructor() {
        // Provide a custom name to refer to this smart contract
        super('org.property-registration-network.regnet.registrar');
    }
    createContext() {
        return new ListContext();
    }
    /* ****** All custom functions are defined below ***** */
    // This is a basic user defined function used at the time of instantiating the smart contract
    // to print the success message on console
    async instantiate(ctx) {
        console.log('Registrar Smart Contract Instantiated');
    }
    /**
        * Approve a new user on the network
        * @param ctx - The transaction context object
        * @param AadharNumber - Aadhar Number to be used for registering a new user 
        * @param name - Name of the user
        * @returns
        */
    async approveNewUser(ctx, name, AadharNumber) {
        if (ctx.clientIdentity.getMSPID() !== "registrarMSP") throw new Error("Only registrar can approve registrations");
        let approver = ctx.clientIdentity.getID();
        // create a newcomposite key for the user
        const userKey = ContractCommon.makeKey([name, AadharNumber]);
        //fetch user details from world state 
        let userDetails = await ctx.registerList.getRegisteredData(userKey, 'user')
            .catch(error => { console.log(error) });
        let registeredUserDetails = await ctx.userList.getUser(userKey)
            .catch(error => { console.log(error) });
        if (userDetails) {
            if (!registeredUserDetails) {
                userDetails['upgradCoins'] = 0;
                userDetails['approver'] = approver;
                userDetails['CreatedAt'] = new Date();
                // Create a new instance of user model and save it to blockchain
                let newUserObject = ContractCommon.createInstance(userDetails, 'user');
                //Make new user registration request to send in ledger
                await ctx.userList.addUser(newUserObject);
                ctx.stub.setEvent('approveNewUser', ContractCommon.toBuffer(newUserObject));
                return userDetails;
            }
            else {
                throw new Error("User already registered..")
            }
        }
        else {
            throw new Error("User haven't request registration yet..")
        }
    }
    /**
         * Request a view user on the network
         * @param ctx - The transaction context object
         * @param AadharNumber - Aadhar Number to be used for registering a new user 
         * @param name - Name of the user
         * @returns
         */
    async viewUser(ctx, name, AadharNumber) {
        //create a newcomposite key for the user
        let userKey = ContractCommon.makeKey([name, AadharNumber]);
        //check if user already exist or not
        let userDetails = await ctx.userList.getUser(userKey)
            .catch(error => {
                console.log(error);
            });
        if (userDetails) {
            return userDetails;
        }
        else {
            throw new Error("User doesn't exist");
        }
    }
    /**
  * Approve a new property on the network
  * @param ctx - The transaction context object
  * @param property_ID - Property ID of the property
  * @returns
  */
    async approvePropertyRegistration(ctx, property_ID) {
        if (ctx.clientIdentity.getMSPID() !== "registrarMSP") throw new Error("Only registrar can approve registrations");
        let approver = ctx.clientIdentity.getID();
        // create a newcomposite key for the property
        const propertyKey = ContractCommon.makeKey([property_ID]);
        //fetch property registration details from world state 
        let propertyRegistrationDetails = await ctx.registerList.getRegisteredData(propertyKey, 'property')
            .catch(error => { console.log(error) });
        //fetch property  details from world state 
        let propertyDetails = await ctx.propertyList.getProperty(propertyKey)
            .catch(error => { console.log(error) });
        if (!propertyDetails && propertyRegistrationDetails) {
            propertyRegistrationDetails['CreatedAt'] = new Date();
            propertyRegistrationDetails['approver'] = approver;
            // Create a new instance of propertyRegistrationDetails model and save it to blockchain
            let newPropertyObject = ContractCommon.createInstance(propertyRegistrationDetails, 'property');
            //Make new propertyDetails registration request to send in ledger
            await ctx.propertyList.addProperty(newPropertyObject);
            ctx.stub.setEvent('approvePropertyRegistration', ContractCommon.toBuffer(newPropertyObject));
            return propertyRegistrationDetails;
        }
        else {
            throw new Error("Property has not registered yet or Property already exist with some other owner.")
        }
    }
    /**
         * Request a view Property on the network
         * @param ctx - The transaction context object
         * @param property_ID - Property ID of the property
         * @returns
         */
    async viewProperty(ctx, property_ID) {
        // create a newcomposite key for the user
        const propertyKey = ContractCommon.makeKey([property_ID]);
        //fetch property  details from world state 
        let propertyDetails = await ctx.propertyList.getProperty(propertyKey)
            .catch(error => { console.log(error) });
        if (propertyDetails) {
            return propertyDetails;
        }
        else {
            throw new Error("Property doesn't exist");
        }
    }
}
module.exports = RegistrarContract;