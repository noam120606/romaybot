module.exports = async (bot, message, allowedDomains) => {

    return new Promise((resolve, reject) => {

        const regex = /https?:\/\/[^\s]+/g;
        const links = message.match(regex) || [];

        if (links.length === 0) {
            resolve(false)
            return;
        }

        for (const link of links) {

            const parsedUrl = new URL(link);
            const hostname = parsedUrl.hostname;
            const splithostname = hostname.split('.');
            const domain = `${splithostname[splithostname.length-2]}.${splithostname[splithostname.length-1]}`

            if (!allowedDomains.includes(domain)) resolve(true);
    
        }

        resolve(false)

    })

}