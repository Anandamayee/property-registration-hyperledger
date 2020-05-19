'use strict'

class Property {
    /**
	 * Constructor function
	 * @param propertyObject {Object}
	 */
    constructor(propertyObject) {
        Object.assign(this, propertyObject);
    }
    /**
    * Get class of this model
    * @returns {string}
    */
    static getClass() {
        return 'org.property-registration-network.regnet.models.property';
    }
}
module.exports = Property;