/**
 * Get time difference from 2 date objects
 * @param t1 
 * @param t0 
 * @returns diff (string): The time diff in hh:mm:ss format
 */
export const getTimeDiff = (t1, t0 = new Date()) => {
    let secondDiff = Math.floor((t1 - t0) / 1000);
    let hour = Math.floor(secondDiff / 3600);
    secondDiff %= 3600;
    let minute = Math.floor(secondDiff / 60);
    secondDiff %= 60;

    if (hour === 0)
        return `${minute} minutes`;
    return `${hour} hours ${minute} minutes`;
}