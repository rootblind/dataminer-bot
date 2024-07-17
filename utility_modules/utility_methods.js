const csvWriter = require('csv-write-stream');
const fs = require('graceful-fs');
const csvParse = require('csv-parser');

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

function filterMessage(input) {
    const regex = /<[^>]*>/g;
    input = input.replace(regex, '');
    if(input.endsWith(','))
        input = input.slice(0, -1);
    return input;
}

module.exports = {
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