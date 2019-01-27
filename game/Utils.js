
/**
 * Utils functions and class
 */

/**
 * Util function to capitalize first letter in a string
 * @returns {string}
 */
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

/**
 * Game log function which only log if debug is enable and if context is enable
 * @param data data to log
 * @param context context of the data
 */
console.gameLog = function(data, context) {
    if(debug.enable == true && typeof debug.contexts[context] != 'undefined' && debug.contexts[context] == true) {
        console.log('[' + context + ']', data);
    }
};

/**
 * Utils
 */
class Utils {

    /**
     * Get % of height of the game size
     * @param percent
     */
    heightPercent(percent) {
        return $('#game').height() * percent / 100;
    }

    /**
     * Get % of width of the game size
     * @param percent
     */
    widthPercent(percent) {
        return $('#game').width() * percent / 100;
    }

}