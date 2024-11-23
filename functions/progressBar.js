const e = require("../storage/emojis.js");

module.exports = (percent, length) => {
    let bar = "";
    for (let i = 0; i < length; i++) {
        bar += e[`progress_${i==0?"left":i==length-1?"right":"mid"}_${(i+1)/length < percent/100 ? "full" : "empty"}`];
    };
    return bar;
};