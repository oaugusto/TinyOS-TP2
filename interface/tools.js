
var Tools = module.exports = function() {}

/**
 * Converts a value to an array of n bytes. Big-endian format is used.
 */
Tools.prototype.valueToNBytes = function(value, n) {
    var bArray = new Uint8Array(n);
    var toConvert = value;

    for (var i = n-1; i >= 0; i--) {
        bArray[i] = toConvert & 0xFF;
        toConvert = (toConvert - bArray[i]) / 256;
    }

    return bArray;
} 

/**
 * Converts a byte array (with data in big-endian format) to a value.
 */
Tools.prototype.byteArrayToValue = function(bArray) {
    var value = 0;

    for (var i = 0; i < bArray.length; i++)
        value = (value * 256) + bArray[i];

    return value;
}