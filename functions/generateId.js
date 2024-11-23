const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

module.exports = (length=16) => {
    let id = '';
    for (let i = 0; i < 20; i += 1) id += chars.charAt(Math.floor(Math.random() * chars.length));
    return id;
};