'use strict'

class User {
    /**
	 * Constructor function
	 * @param userObject {Object}
	 */
    constructor(userObject) {
        Object.assign(this, userObject);
    }
    /**
    * Get class of this model
    * @returns {string}
    */
    static getClass() {
        return 'org.property-registration-network.regnet.models.user';
    }
}
module.exports = User;