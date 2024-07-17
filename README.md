
# Data Miner Discord Bot

Logs and scrapes channels for message content and stores everything on a CSV file.

I made this bot as a tool to make an unlabeled dataset for myself.

I put a whole day into this mini tool so I would like to keep it for whoever needs it.
# Features

## Message Scraping

- `/fetch-channel <channel> <optional: message_id>`
Scrapes a channel for messages until 50.000 or the very first message on that channel.

Optional: Starts from the message ID provided.

- `/ignorelist`
The ability to ignore specific channels from being auto logged.

- `/botinfo`
Showing some info about the bot and its specs.

- MessageCreate Event
Handles the sending of a message by logging all channels that are not on the ignore list
## How To Use

Clone the project:
```bash
git clone https://github.com/rootblind/dataminer-bot.git
```
Go to the project directory
```bash
cd dataminer-bot
```
Install dependencies
```bash
npm install
```
I don't recommand using nodemon since the bot will restart every time the `data.csv` is updated.

Run:
```bash
node ./source/main.js
```
## Create folders
Ignore list is stored inside the `/dataminer-bot/objects/ignorelist.json`

Dataset is stored inside MessageLogging folder.

Create the folder, the file will be automatically created if it doesn't exist.

The format:
```json
{
   "channel": ["channel_id"]
}
```

## Environment Variables
```
BOT_TOKEN= <your bot token>
CLIENT_SECRET= <the client secret> - not really needed
CLIENT_ID= <bot user id> - not really needed
OWNER= <your user id> - commands are owner only in my repo
HOME_SERVER_ID= <your server id>
VERSION="1.0"
```
Easy to copy:
```
BOT_TOKEN=
CLIENT_SECRET=
CLIENT_ID=
OWNER=
HOME_SERVER_ID=
VERSION="1.0"
```


## Other info
Had a lot of headache with EMFILE error from `fs` so I replaced it with `greceful-fs` library for the CSV file handling since for some reason fs couldn't close its streams and files before reaching the OS's file limit. If you encounter this problem, replace fs with graceful-fs everywhere.

Also, I am not sure what's causing it, but `/fetch-channel` has a chance to crash the bot with errors  about the Discord API:
```js
node:internal/process/promises:289
            triggerUncaughtException(err, true /* fromPromise */);
            ^

ConnectTimeoutError: Connect Timeout Error (attempted addresses: ...)
    at onConnectTimeout (C:\...\dataminer-bot\node_modules\undici\lib\core\connect.js:190:24)
    at C:\...\dataminer-bot\node_modules\undici\lib\core\connect.js:133:46
    at Immediate._onImmediate (C:\...\dataminer-bot\node_modules\undici\lib\core\connect.js:172:33)
    at process.processImmediate (node:internal/timers:478:21) {
  code: 'UND_ERR_CONNECT_TIMEOUT'
}
```
And
```js
C:\...\dataminer-bot\node_modules\@discordjs\rest\dist\index.js:730
      throw new DiscordAPIError(data, "code" in data ? data.code : data.error, status, method, url, requestData);
            ^

DiscordAPIError[10062]: Unknown interaction
    at handleErrors (C:\...\dataminer-bot\node_modules\@discordjs\rest\dist\index.js:730:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async BurstHandler.runRequest (C:\...\dataminer-bot\node_modules\@discordjs\rest\dist\index.js:835:23)
    at async _REST.request (C:\...\dataminer-bot\node_modules\@discordjs\rest\dist\index.js:1278:22)
    at async ChatInputCommandInteraction.deferReply (C:\...\dataminer-bot\node_modules\discord.js\src\structures\interfaces\InteractionResponses.js:71:5)
    at async Object.execute (C:\...\...\dataminer-bot\Commands\Server\fetch-channel.js:67:9) {
  requestBody: { files: undefined, json: { type: 5, data: { flags: undefined } } },
  rawError: { message: 'Unknown interaction', code: 10062 },
  code: 10062,
  status: 404,
  method: 'POST',
  url: 'https://discord.com/api/v10/interactions/.../callback'
}
```

If you wait like 10-20s before using the command again, seems to make this error less often. For me it didn't create enough inconvenience to figure it out, but I will mention it just so anyone that uses it knows.

Might be only Discord API related.

## Documentation
All the code is commented.

