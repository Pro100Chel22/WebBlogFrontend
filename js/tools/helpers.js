export { dateConvertToUTCWithSmooth }

function dateConvertToUTCWithSmooth(dateStr, dH = 0, dM = 0, dS = 0) {
    const date = new Date(dateStr);

    const currentDate = new Date(); 
    date.setHours(currentDate.getHours() - dH, currentDate.getMinutes() - dM, currentDate.getSeconds() - dS);

    return date.toISOString();
}