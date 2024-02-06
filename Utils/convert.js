const isoConv = require('iso-language-converter');
const ms = require("ms");

module.exports = {
    convertTime: function (duration) {
        let seconds = parseInt((duration / 1000) % 60);
        let minutes = parseInt((duration / (1000 * 60)) % 60);
        let hours = parseInt((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        if (duration < 3600000) {
            return minutes + ":" + seconds ;
        } else {
            return hours + ":" + minutes + ":" + seconds ;
        }
    },
    convertNumber: function (number, decPlaces) {
        decPlaces = Math.pow(10,decPlaces);

        let abbrev = [ "K", "M", "B", "T" ];

        for (let i=abbrev.length-1; i>=0; i--) {
            const size = Math.pow(10,(i+1)*3);

            if(size <= number) {
                number = Math.round(number*decPlaces/size)/decPlaces;
                if((number == 1000) && (i < abbrev.length - 1)) {
                    number = 1;
                    i++;
                }
                number += abbrev[i];
                break;
            }
        }

        return number;
    },
    convertHmsToMs: function (hms) {
        let a = hms.split(':');
        let result;

        if (hms.length < 3) {
            result = ((+a[0]) * 1000)
        } else if (hms.length < 6) {
            const a = hms.split(':')
            result = (((+a[0]) * 60 + (+a[1])) * 1000)
        } else {
            const a = hms.split(':')
            result = (((+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2])) * 1000)
        }

        return result;
    },
    dateTime: function (timenow = new Date()) {
        let Date = timenow.getDate();
        let Month = timenow.getMonth() + 1;
        let Year = timenow.getFullYear();
        let Hours = timenow.getHours();
        let Minutes = timenow.getMinutes();
        let Seconds =  timenow.getSeconds();

        Date = (Date < 10) ? "0" + Date : Date;
        Month = (Month < 10) ? "0" + Month : Month;
        Hours = (Hours < 10) ? "0" + Hours : Hours;
        Minutes = (Minutes < 10) ? "0" + Minutes : Minutes;
        Seconds = (Seconds < 10) ? "0" + Seconds : Seconds;

        const dateTime = `${Date}-${Month}-${Year} ${Hours}:${Minutes}:${Seconds}`;
        return dateTime
    },
    convertIso: function (iso) {
        const text = isoConv(iso);

        return text;
    },
    convertTime2: function (duration) {
        const result = ms(duration, { long: true });
        return result;
    },
    randomString: function (length) {
        let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    },
    tags: function (content, member, guild) {
        if (content.includes("{user}")) {
            content = content.replace("{user}", `<@${member.id}>`)
        }
        if (content.includes("{username}")) {
            content = content.replace("{username}", `${member.user.tag}`)
        }
        if (content.includes("{server}")) {
            content = content.replace("{server}", `<@${guild.name}>`)
        }
        if (content.includes("{#")) {
            let getChannel1 = content.indexOf("{#");
            let getChannel2 = getChannel1 + 20;
            content = replaceAt(content, getChannel1, "<#");
            content = replaceAt(content, getChannel2, ">");
        }
        if (content.includes("{!#")) {
            let getChannel1 = content.indexOf("{!#") + 3;
            let getChannel2 = getChannel1 + 18;
            let getChannelId = content.substring(getChannel1, getChannel2);
            let getChannelName = guild.channels.cache.get(getChannelId).name;
            content = content.replace(`{!#${getChannelId}}`, getChannelName);
        }
        if (content.includes("{@")) {
            let getRole1 = content.indexOf("{@");
            let getRole2 = getRole1 + 20;
            content = replaceAt(content, getRole1, "<@");
            content = replaceAt(content, getRole2, ">");
        }
        if (content.includes("{!@")) {
            let getRole1 = content.indexOf("{!@") + 3;
            let getRole2 = getRole1 + 18;
            let getRoleId = content.substring(getRole1, getRole2);
            let getRoleName = guild.roles.cache.get(getRoleId).name;
            content = content.replace(`{#${getRoleId}}`, getRoleName);
        }
        if (content.includes("{:")) {
            let getEmoji1 = content.indexOf("{:") + 2;
            let getEmoji2 = getEmoji1 + 18;
            let getEmojiId = content.substring(getEmoji1, getEmoji2);
            let getEmoji = guild.emojis.cache.get(getEmojiId);
            let getEmojiName = getEmoji.name;
            if (getEmoji.animated) {
                content = content.replace(`{:${getEmojiId}}`, `<a:${getEmojiName}:${getEmojiId}>`);
            } else {
                content = content.replace(`{:${getEmojiId}}`, `<:${getEmojiName}:${getEmojiId}>`);
            }
        }
        if (content.includes("{membercount}")) {
            content = content.replace("{membercount}", `${guild.memberCount}`)
        }
        return content;
    },
    saweriaChecker: function (url) {
        let result = url.includes("saweria.co");
        return result;
    },
    hexColorCheker: function (string) {
        let reg = /^#([0-9a-f]{3}){1,2}$/i;
        let check = reg.test(string);
        return check;
    },
    arrayMove: function (arr, old_index, new_index) {
        if (new_index >= arr.length) {
            var k = new_index - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr;
    },
    capitalize: function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    },
    containsAny: function (str, substrings) {
        for (var i = 0; i != substrings.length; i++) {
            var substring = substrings[i];
            if (str.indexOf(substring) != - 1) {
                return substring;
            }
        }
        return null; 
    }
}

function replaceAt(str, index, replacement) {
    return str.substr(0, index) + replacement + str.substr(index + replacement.length);
}