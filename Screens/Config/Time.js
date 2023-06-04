export const getCurrentDate = () => {
    const date = new Date();
    return `${date.getFullYear()}-${(date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1)}-${(date.getUTCDate() < 10 ? '0' : '') + date.getUTCDate()}`;
}

export const getCurrentTime = () => {
    const date = new Date();
    return `${(date.getHours() < 10 ? '0' : '') + date.getHours()}:${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}:${(date.getSeconds() < 10 ? '0' : '') + date.getSeconds()}`;
}
