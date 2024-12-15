const csvWriter = require('csv-write-stream');
const fs = require('graceful-fs');
const path = require('path');
const csvParse = require('csv-parser');
const https = require('https');

// This function takes a hexadecimal number and converts it to a string to the corresponding format
// Might be bad practice, but it's used to translate color hexcodes between embeds and database
// since colore codes in database are declared as strings (varchar) and in this code as numbers.
function hexToString(num){
    let str = '0x' + num.toString(16).padStart(6,'0');
    return str;
}

// Rather than chaining all of these methods, I chose to use one that returns the result
function getBotMember(client, interaction) {
    return interaction.guild.members.cache.get(client.user.id);
}


// Fetches the json data. Used for attachment options.
async function handleFetchFile(attachment) {
    const response = await fetch(attachment.url);
    const data = await response.json();
    return data;
}

function isAlphanumeric(str) { // check if a string is alphanumeric
    const regex = /^[a-zA-Z0-9]+$/;
    return regex.test(str);
}

function formatDate(date) {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function formatTime(date) {
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

// below are write, read, append functions for csv files
function csvWrite(data, path) {
    
    const writer = csvWriter({sendHeaders: false});
    writer.pipe(fs.createWriteStream(path, {flags: 'a'}));
    writer.write({
       Message: data
    });
    writer.end();
}

function csvRead(path) {
    return new Promise((resolve, reject) => {
        const data = [];
        fs.createReadStream(path)
            .pipe(csvParse({delimiter: ',', from_line: 2}))
            .on('data', (row) => {
                data.push(row);
            })
            .on('error', (err) => {
                console.error(err);
                reject(err);
            })
            .on('end', () => {
                resolve(data);
            });
    });
}

function csvAppend(data, path) {
    const writer = csvWriter({sendHeaders: false});
    const stream = fs.createWriteStream(path, {flags: 'a'});
    writer.pipe(stream);
    writer.write({
       Message: data
    });
    writer.end();
}

//returns if the file exists or not
async function isFileOk(path) {
    let fileExists = true;

    try{
        await fs.promises.access(path, fs.constants.R_OK);
    } catch(err) {
        fileExists = false;

    }

    return fileExists
}

function isDirOk(dirName) {
    const folderPath = path.join(dirName);
    if(!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, {recursive: true});
        return true;
    }
    return false;
    
}

function filterMessage(input) {
    const regex = /<[^>]*>/g;
    input = input.replace(regex, '');
    if(input.endsWith(','))
        input = input.slice(0, -1);
    return input;
}

// i found this code in a 4 years old unsupported library called discord-fetch-all written in  typescript
// translated it to native js and adapted to my use case
async function fetchAll(channel, interaction, lastID){
    let messages = []; // fetched messages will be stored in this array
    let editMessage = 'Still working on it.' // in order to extend discord's timeout timer, the interaction message will be edited
    // ever so often
    let batch = 0; // keeping track of how many messages were fetched so far
    while (true) {
        // fetching 100 at a time and keeping track of the last message ID in order to go back to it and continue fetching from
        //where we left
        const fetchedMessages = await channel.messages.fetch({ 
            limit: 100, 
            ...(lastID && { before: lastID }) 
          })

        if (fetchedMessages.size === 0 || batch >= 50000) {
            messages = messages.reverse(); // for chronological reasons
            messages = messages.filter(msg => !msg.author.bot); // we don't care about bot messages
            await interaction.editReply(`Fetching stopped at ID  ${lastID} - https://discord.com/channels/${interaction.guild.id}/${channel.id}/${lastID}`); // communicating the last ID in order to run the command
            // multiple times since at around 80000 messages, the discord timeout can not be extended any further
            // a clunky solution but it's the best i got
            // i limited it to 50000 instead of 80000 because of the number being more "round" and slower machines might reach
            //the timeout sooner than 80000, my machine is quite fast.
            return messages;
        }
        else if(batch % 1000 === 0 && batch > 0) {
            await interaction.editReply(editMessage); // uopdating the interaction message every 1000 messages
            editMessage += '.';
        }
        batch += fetchedMessages.size;
        messages = messages.concat(Array.from(fetchedMessages.values())); // adding every batch of fetched messages to the Array
        lastID = fetchedMessages.lastKey(); // storing the last message id
    }
}

const saveImage = (url, filePath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);

        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                return;
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close(() => resolve(filePath)); // Close after finishing
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => reject(err)); // Cleanup on error
        });
    });
};


module.exports = {
    saveImage,
    fetchAll,
    isDirOk,
    filterMessage,
    isFileOk,
    csvAppend,
    csvRead,
    csvWrite,
    getBotMember,
    hexToString,
    handleFetchFile,
    isAlphanumeric,
    formatDate,
    formatTime
};