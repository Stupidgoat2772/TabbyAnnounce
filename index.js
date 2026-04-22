require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const schedule = require('node-schedule');
const fs = require('fs');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

if (process.env.TIMEZONE) {
  process.env.TZ = process.env.TIMEZONE;
}

// Authentication for Google Sheets
const serviceAccountAuth = new JWT({
  email: require(process.env.GOOGLE_AUTH_FILE).client_email,
  key: require(process.env.GOOGLE_AUTH_FILE).private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

function getSpreadsheetId(input) {
  // Regex to extract ID from a full Google Sheets URL
  const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : input;
}

const spreadsheetId = getSpreadsheetId(process.env.SPREADSHEET_ID);
const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);

const scheduledJobs = new Map();

function getChannelId(input) {
  // Regex to extract Channel ID from a Discord channel link
  if (typeof input !== 'string') return input;
  const match = input.match(/channels\/\d+\/(\d+)/);
  return match ? match[1] : input;
}

async function checkSheet() {
  try {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    // Verify headers exist
    const headers = sheet.headerValues.map(h => h.trim().toLowerCase());
    const required = ['channel link/id', 'schedule', 'message content'];
    const missing = required.filter(h => !headers.includes(h));

    if (missing.length > 0) {
      console.error(`❌ Error: Missing required headers: ${missing.join(', ')}`);
      console.log(`Current headers: ${sheet.headerValues.join(', ')}`);
      return;
    }

    for (const row of rows) {
      // Case-insensitive lookup helper
      const getVal = (key) => {
        const actualKey = sheet.headerValues.find(h => h.trim().toLowerCase() === key.toLowerCase());
        return row.get(actualKey);
      };

      const channelLinkOrId = getVal('channel link/id');
      const scheduleStr = getVal('schedule');
      const content = getVal('message content');
      const status = getVal('status');

      const rowId = row.rowNumber;

      if (scheduleStr && !scheduledJobs.has(rowId)) {
        scheduleRecurring(rowId, channelLinkOrId, content, row);
      }
    }
  } catch (error) {
    console.error('Error checking sheet:', error);
  }
}

function parseTime(timeStr) {
  const match = timeStr.match(/^(\d{1,2}):?(\d{2})?\s*(am|pm)?$/i);
  if (!match) return [null, null];
  
  let hours = parseInt(match[1]);
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const ampm = match[3] ? match[3].toLowerCase() : null;

  if (ampm === 'pm' && hours < 12) hours += 12;
  if (ampm === 'am' && hours === 12) hours = 0;

  return [hours, minutes];
}

function scheduleRecurring(rowId, channelLinkOrId, content, row) {
  const scheduleStr = row.get('Schedule');
  const parts = scheduleStr.toLowerCase().split(' ');
  let rule = new schedule.RecurrenceRule();

  try {
    if (parts[0] === 'daily') {
      const [hrs, mins] = parseTime(parts[1]);
      if (hrs === null) throw new Error("Invalid time format");
      rule.hour = hrs;
      rule.minute = mins;
    } 
    else if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(parts[0])) {
      const [hrs, mins] = parseTime(parts[1]);
      if (hrs === null) throw new Error("Invalid time format");
      rule.dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(parts[0]);
      rule.hour = hrs;
      rule.minute = mins;
    }
    else if (parts[0].match(/^[1-5](st|nd|rd|th)$/)) {
      const week = parseInt(parts[0]);
      const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(parts[1]);
      const [hrs, mins] = parseTime(parts[2]);
      if (hrs === null) throw new Error("Invalid time format");
      
      const job = schedule.scheduleJob(`${mins} ${hrs} * * ${day}`, async () => {
        const now = new Date();
        const currentWeek = Math.ceil(now.getDate() / 7);
        if (currentWeek === week) {
          await postMessage(channelLinkOrId, content, row);
        }
      });
      scheduledJobs.set(rowId, job);
      return;
    }
    else {
      const postTime = new Date(scheduleStr);
      if (!isNaN(postTime.getTime()) && postTime > new Date() && !row.get('Status')) {
        const job = schedule.scheduleJob(postTime, async () => {
          await postMessage(channelLinkOrId, content, row);
          scheduledJobs.delete(rowId);
        });
        scheduledJobs.set(rowId, job);
      }
      return;
    }

    console.log(`Scheduling recurring: ${scheduleStr} for row ${rowId}`);
    const job = schedule.scheduleJob(rule, async () => {
      await postMessage(channelLinkOrId, content, row);
    });
    scheduledJobs.set(rowId, job);

  } catch (e) {
    console.error(`Failed to parse schedule "${scheduleStr}" for row ${rowId}:`, e);
  }
}

async function postMessage(channelLinkOrId, content, row) {
  try {
    const channelId = getChannelId(channelLinkOrId);
    const channel = await client.channels.fetch(channelId);
    if (channel) {
      const now = new Date().toISOString();
      if (row.get('Status') && row.get('Status').startsWith(now.substring(0, 16))) {
        return;
      }

      await channel.send(content);
      row.set('Status', `Posted at ${now}`);
      await row.save();
      console.log(`Posted to ${channelId} at ${now}`);
    }
  } catch (error) {
    console.error(`Failed to post to ${channelLinkOrId}:`, error);
  }
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  
  // Check the sheet immediately, then every 30 seconds
  checkSheet();
  setInterval(checkSheet, 30 * 1000);
});

client.login(process.env.DISCORD_TOKEN);

  
  // Check the sheet immediately, then every 30 seconds
  checkSheet();
  setInterval(checkSheet, 30 * 1000);
});

client.login(process.env.DISCORD_TOKEN);
