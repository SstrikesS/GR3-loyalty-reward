import {toZonedTime} from 'date-fns-tz'

export function convertToTitleCase(str) {
    return str.replace(/_/g, ' ').replace(/\b\w/g, function(char) {
        return char.toUpperCase();
    });
}
export function convertSnakeString(str) {
    return str.replace(/_/g, ' ').trim();
}
export function isStringInteger(str) {
    if(/^\d+$/.test(str)){
        const number = parseInt(str);
        return number > 0;
    }
    return false;
}
export function isPositiveFloat(str) {
    if (/[^0-9.]/.test(str)) {
        return false;
    }

    const number = parseFloat(str);

    return !Number.isNaN(number) && number > 0;
}

export function isUnsignedFloat(str) {
    if (/[^0-9.]/.test(str)) {
        return false;
    }

    const number = parseFloat(str);

    return !Number.isNaN(number) ;
}

export function getTimeZone(date, timezone) {
    return toZonedTime(date, timezone);
}
export function generateRandomString(length, prefix = "") {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return prefix + result;
}

export function escapeJsonString(jsonString) {
    return jsonString.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}
