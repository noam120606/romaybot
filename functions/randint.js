module.exports = (a, b=0) => {
    if (!b) return Math.floor(Math.random() * a);
    return Math.floor(Math.random() * (b - a + 1)) + a;
}