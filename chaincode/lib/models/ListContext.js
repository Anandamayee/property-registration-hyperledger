'use strict';


const { Context } = require('fabric-contract-api');
const UsersList = require('../lists/UserList.js');
const PropertyList = require('../lists/PropertyList.js');
const RegisterList = require('../lists/RegisterList.js');


class ListContext extends Context {
    constructor() {
        super();
        // Add various model lists to the context class object
        // this : the context instance
        this.userList = new UsersList(this);
        this.registerList = new RegisterList(this);
        this.propertyList = new PropertyList(this);
    }
}


module.exports = ListContext;