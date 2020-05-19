'use strict';
const { Contract } = require('fabric-contract-api');
const { ContractCommon, transactionIDs, propertyStatus } = require('./lib/models/ContractCommon.js');
const ListContext = require('./lib/models/ListContext.js');

class UsersContract extends Contract {
    constructor() {
        // Provide a custom name to refer to this smart contract
        super('org.property-registration-network.regnet.user');
    }
    // Built in method used to build and return the context for this smart contract on every transaction invoke
    createContext() {
        return new ListContext();
    }
    /* ****** All custom functions are defined below ***** */
    // This is a basic user defined function used at the time of instantiating the smart contract
    // to print the success message on console
    async instantiate(ctx) {
        console.log('User Smart Contract Instantiated');
    }
    /**
         * Request a new user on the network
         * @param ctx - The transaction context object
         * @param AadharNumber - Aadhar Number to be used for registering a new user 
         * @param name - Name of the user
         * @param email_ID - Email ID of the user
         * @param phoneNumber - Phone Number of the user
         * @returns
         */
    async requestNewUser(ctx, name, email_ID, phoneNumber, AadharNumber) {
        if (ctx.clientIdentity.getMSPID() !== "usersMSP") throw new Error("Only users can apply for registrations");
        //create a newcomposite key for the user
        let userKey = ContractCommon.makeKey([name, AadharNumber]);

        //check if user already exist or not
        let userBuffer = await ctx.registerList.getRegisteredData(userKey, 'user')
            .catch(error => {
                console.log(error);
            });
        if (!userBuffer) {
            let userDetails = {
                UserID: userKey,
                AadharNumber: AadharNumber,
                Name: name,
                Email_ID: email_ID,
                PhoneNumber: phoneNumber,
                CreatedAt: new Date()
            }
            // Create a new instance of user model and save it to blockchain
            let newUserObject = ContractCommon.createInstance(userDetails, 'user');
            //Make new user registration request to send in ledger
            await ctx.registerList.registerData(newUserObject, 'UserID');
            ctx.stub.setEvent('requestNewUser', ContractCommon.toBuffer(newUserObject));
            return userDetails;
        }
        else {
            throw new Error("User already exist");
        }
    }
    /**
         * Request a recharge user account user on the network
         * @param ctx - The transaction context object
         * @param AadharNumber - Aadhar Number to be used for registering a new user 
         * @param name - Name of the user
         * @param bank_Transaction_ID - Bank Transaction ID of the user
         * @returns
         */
    async rechargeAccount(ctx, name, bank_Transaction_ID, AadharNumber) {
        if (ctx.clientIdentity.getMSPID() !== "usersMSP") throw new Error("Only users can apply for registrations");
        if (!transactionIDs.hasOwnProperty(bank_Transaction_ID)) throw new Error("Invalid Bank Transaction ID");
        //create a newcomposite key for the user
        let userKey = ContractCommon.makeKey([name, AadharNumber]);
        //check if user already exist or not
        let userDetails = await ctx.userList.getUser(userKey)
            .catch(error => {
                console.log(error);
            });
        if (userDetails) {
            userDetails['upgradCoins'] = transactionIDs[bank_Transaction_ID];
            userDetails['updatedAt'] = new Date();
            // Create a new instance of user model and save it to blockchain
            let newUserObject = ContractCommon.createInstance(userDetails, 'user');
            //Make new user registration request to send in ledger
            await ctx.userList.updateUser(newUserObject);
            ctx.stub.setEvent('rechargeAccount', ContractCommon.toBuffer(newUserObject));
            return userDetails;
        }
        else {
            throw new Error("Not a reregistered user.");
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
  * Register a new property on the network
  * @param ctx - The transaction context object
  * @param AadharNumber - Aadhar Number to be used for registering a new user 
  * @param name - Name of the user
  * @param property_ID - Property ID of the property
  * @param price - Price of the property
  * @param status - Status of the property
  * @returns
  */
    async propertyRegistrationRequest(ctx, name, AadharNumber, property_ID, price, status) {
        if (ctx.clientIdentity.getMSPID() !== "usersMSP") throw new Error("Only users can apply for registrations");
        if (!propertyStatus.includes(status)) throw new Error("Please enter a valid status as 'registered' or 'onSale'");
        // create a newcomposite key for the user
        const userKey = ContractCommon.makeKey([name, AadharNumber]);
        // create a newcomposite key for the property
        const propertyKey = ContractCommon.makeKey([property_ID]);
        //fetch user details from world state 
        let userDetails = await ctx.userList.getUser(userKey)
            .catch(error => { console.log(error) });
        //validate if property already registered or not
        let propertyRegistrationDetails = await ctx.registerList.getRegisteredData(propertyKey, 'property')
            .catch(error => { console.log(error) });
        if (userDetails) {
            if (!propertyRegistrationDetails) {
                let propertyDetails = {
                    Property_ID: propertyKey,
                    Owner: ctx.userList.getCompositeKey(userKey),
                    Price: price,
                    Status: status,
                    CreatedAt: new Date()
                }
                // Create a new instance of propertyDetails model and save it to blockchain
                let newPropertyObject = ContractCommon.createInstance(propertyDetails, 'property');
                //Make new propertyDetails registration request to send in ledger
                await ctx.registerList.registerData(newPropertyObject, 'Property_ID')
                ctx.stub.setEvent('propertyRegistrationRequest', ContractCommon.toBuffer(newPropertyObject));
                return propertyDetails;
            }
            else {
                throw new Error("Property already registered with some other user")
            }
        }
        else {
            throw new Error("User hasn't registered yet...")
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
    /**
    * Update a  property on the network
    * @param ctx - The transaction context object
    * @param AadharNumber - Aadhar Number to be used for registering a new user 
    * @param name - Name of the user
    * @param property_ID - Property ID of the property
    * @param price - Price of the property
    * @param status - Status of the property
    * @returns
    */
    async updateProperty(ctx, name, AadharNumber, property_ID, status) {
        if (ctx.clientIdentity.getMSPID() !== "usersMSP") throw new Error("Only users can apply for registrations");
        if (!propertyStatus.includes(status)) throw new Error("Please enter a valid status as 'registered' or 'onSale'");
        // create a newcomposite key for the property
        const userKey = ContractCommon.makeKey([name, AadharNumber]);
        // create a newcomposite key for the user
        const propertyKey = ContractCommon.makeKey([property_ID]);
        //fetch user details from world state 
        let propertyDetails = await ctx.propertyList.getProperty(propertyKey)
            .catch(error => { console.log(error) });
        if (propertyDetails) {
            if (propertyDetails.Owner === ctx.userList.getCompositeKey(userKey)) {
                propertyDetails['Status'] = status
                propertyDetails['UpdatedAt'] = new Date();
                // Create a new instance of propertyDetails model and save it to blockchain
                let newPropertyObject = ContractCommon.createInstance(propertyDetails, 'property');
                //Make new propertyDetails registration request to send in ledger
                await ctx.propertyList.updateProperty(newPropertyObject);
                ctx.stub.setEvent('updateProperty', ContractCommon.toBuffer(newPropertyObject));
                return propertyDetails;
            }
            else {
                throw new Error("Only owner can update the property details.")
            }
        }
        else {
            throw new Error("Property hasn't registered yet..")
        }
    }
    /**
* Purchase a  property on the network
* @param ctx - The transaction context object
* @param AadharNumber - Aadhar Number to be used for registering a new user 
* @param name - Name of the user
* @param property_ID - Property ID of the property
* @returns
*/
    async purchaseProperty(ctx, property_ID, name, AadharNumber) {
        if (ctx.clientIdentity.getMSPID() !== "usersMSP") throw new Error("Only users can apply for registrations");
        //Check minimum number of users
        let allusers = await ctx.userList.getAllUsers()
            .catch(error => console.log(error));
        if (!allusers && allusers.length < 2) throw new Error("No seller available..")

        // create a newcomposite key for the user
        const propertyKey = ContractCommon.makeKey([property_ID]);
        //fetch user details from world state 
        let propertyDetails = await ctx.propertyList.getProperty(propertyKey)
            .catch(error => { console.log(error) });
        // create a newcomposite key for the user
        const buyerKey = ContractCommon.makeKey([name, AadharNumber]);
        //fetch user details from world state 
        let buyerDetails = await ctx.userList.getUser(buyerKey)
            .catch(error => { console.log(error) });
        if (buyerDetails) {
            if (propertyDetails && propertyDetails.Status == 'onSale' && buyerDetails.upgradCoins >= propertyDetails.Price) {
                //update seller information
                let keyAttributes = ctx.userList.getSplitedCompositeKey(propertyDetails.Owner);
                let sellerDetails = await ctx.userList.getUser(ContractCommon.makeKey(keyAttributes))
                    .catch(error => { console.log(error) });
                sellerDetails['upgradCoins'] = sellerDetails['upgradCoins'] + propertyDetails.Price;
                sellerDetails['updatedAt'] = new Date();
                let newsellerObject = ContractCommon.createInstance(sellerDetails, 'user');
                await ctx.userList.updateUser(newsellerObject);
                ctx.stub.setEvent('purchasePropertySeller', ContractCommon.toBuffer(newsellerObject));

                //update Buyer information
                buyerDetails['upgradCoins'] = buyerDetails['upgradCoins'] - propertyDetails.Price;
                buyerDetails['updatedAt'] = new Date();
                let newBuyerObject = ContractCommon.createInstance(buyerDetails, 'user');
                console.log(newBuyerObject);
                await ctx.userList.updateUser(newBuyerObject);
                ctx.stub.setEvent('purchasePropertyBuyer', ContractCommon.toBuffer(newBuyerObject));

                // update Property
                propertyDetails['Owner'] = ctx.userList.getCompositeKey(buyerKey);
                propertyDetails['Status'] = 'registered';
                propertyDetails['UpdatedAt'] = new Date();
                // Create a new instance of propertyDetails model and save it to blockchain
                let newPropertyObject = ContractCommon.createInstance(propertyDetails, 'property');
                //Make new propertyDetails registration request to send in ledger
                await ctx.propertyList.updateProperty(newPropertyObject);
                ctx.stub.setEvent('purchaseProperty', ContractCommon.toBuffer(newPropertyObject));


            }
            else {
                throw new Error("Property not in sale or please recharge your account ")
            }
        }
        else {
            throw new Error("Please register to buy property");
        }
    }
}
module.exports = UsersContract;