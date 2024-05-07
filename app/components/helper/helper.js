import {toZonedTime} from 'date-fns-tz'

export function convertToTitleCase(str) {
    return str.replace(/_/g, ' ').replace(/\b\w/g, function(char) {
        return char.toUpperCase();
    });
}
export function getTimeZone(date, timezone) {
    return toZonedTime(date, timezone);
}
export function generateRandomString(length, prefix) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return prefix + result;
}
