
/**
 * Converts a value to an array of n bytes. Big-endian format is used.
 */
module.exports.valueToNBytes = function(value, n) {
    var bArray    = new Buffer(n);
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
module.exports.bufferToValue = function(bArray) {
    var value = 0;

    for (var i = 0; i < bArray.length; i++)
        value = (value * 256) + bArray[i];

    return value;
}