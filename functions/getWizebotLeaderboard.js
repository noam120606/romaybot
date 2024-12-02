module.exports = async (twitchId=487543581) => {

    const endpoints = {
        bits: 'bits/month',
        subs: 'subs/top_months',
        gifts: 'subs/top_gifts',
        message: 'message/month',
        uptime: 'uptime/month',
    }

    const data = await Promise.all(Object.keys(endpoints).map(async (category) => {
        const base_uri = `https://wapi.wizebot.tv/api/extensions/${twitchId}/leaderboard_list`;
        const response = await fetch(`${base_uri}/${endpoints[category]}`, {});
        return ({ category, data: await response.json() });
    }));

    return data.reduce((acc, { category, data }) => {
        if (acc.category) acc = {bits: acc.data.list}; 
        acc[category] = data.list;
        return acc;
    })

}


// https://wapi.wizebot.tv/api/extensions/487543581/leaderboard_list/bits/month
// https://wapi.wizebot.tv/api/extensions/487543581/leaderboard_list/subs/top_months
// https://wapi.wizebot.tv/api/extensions/487543581/leaderboard_list/subs/top_gifts
// https://wapi.wizebot.tv/api/extensions/487543581/leaderboard_list/message/month
// https://wapi.wizebot.tv/api/extensions/487543581/leaderboard_list/uptime/month
