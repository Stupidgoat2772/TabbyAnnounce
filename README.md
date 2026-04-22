# 🐾 TabbyAnnounce

A minimalist local Discord bot that schedules announcements directly from a Google Spreadsheet. Purrfect for recurring reminders, events, and automated shoutouts.

## 🚀 Quick Start (All Platforms)

### 1. Installation & Setup
Copy and paste this into your terminal/PowerShell:
```bash
git clone <your-repo-link> && cd TabbyAnnounce && npm run setup
```
*This installs dependencies and creates your `.env` file automatically.*

### 2. Configuration
Open the newly created `.env` file and fill in your details:
- **DISCORD_TOKEN**: Your bot token.
- **SPREADSHEET_ID**: Your Google Sheet link.
- **TIMEZONE**: (Optional) Your local timezone (e.g., `America/Denver`). Defaults to UTC.

### 3. Google Credentials
Place your `google-credentials.json` file inside the `TabbyAnnounce` folder.

### 4. Spreadsheet Setup
1. **Open the Template:** [TabbyTemplate](https://docs.google.com/spreadsheets/d/1W9zbAPQiS4kV5AQj4aeXyG0w4wXopJGLl9aoUupav4M/edit?usp=sharing).
2. **Copy it:** Go to **File > Make a copy** to save it to your own Google Drive.
3. **Share it:** Copy your service account email (from step 1) and share your new sheet with it as an **Editor**.
4. **Get the Link:** Copy the URL of your new sheet and paste it into your `.env` file as the `SPREADSHEET_ID`.

## ⏰ Scheduling Patterns
TabbyAnnounce understands simple, deterministic commands in the `Schedule` column:
- `daily 9am` or `daily 09:00`
- `monday 1:30pm` or `monday 13:30`
- `1st friday 6pm`
- `2026-12-25 12:00`

### 🤖 Bot Permissions
Before the bot can post, you must:
1. **Invite the bot** to your server using the OAuth2 link from the Discord Developer Portal.
2. Ensure the bot has **View Channel** and **Send Messages** permissions in the specific channel you listed in the spreadsheet.

### 💡 Pro-Tip: Discord Developer Mode
To get channel links easily:
1. Go to Discord **User Settings > Advanced**.
2. Toggle **Developer Mode** to **ON**.
3. **Right-click** the desired text channel in the sidebar and select **Copy Link**. 
   - *It should look like: `https://discord.com/channels/123.../456...`*

## 🖥️ Platform-Specific Setup

### Linux (Arch, Fedora, Debian, etc.)
The `./install.sh` script handles everything for you. It automatically finds your `node` path and adds the `@reboot` job to `crontab`.

### macOS
1. Run `./install.sh` (this will install dependencies and create the startup script).
2. To run on boot, add the `start-bot.sh` script to your **Login Items**:
   - Open **System Settings > General > Login Items**.
   - Click the **+** and select `start-bot.sh`.

### Windows
1. Open PowerShell or Command Prompt in the folder.
2. Run `npm install`.
3. To run on boot, create a shortcut of a batch file in your **Startup** folder:
   - Create `start-bot.bat`: 
     ```batch
     cd /d %~dp0
     node index.js
     pause
     ```
   - Press `Win + R`, type `shell:startup`, and drop the shortcut to `start-bot.bat` there.

## ✨ Customization (Optional)

### Bot Profile & Description
To give your bot some personality:
1. Go to your **Discord Developer Portal > [Your App] > Bot**.
2. **Icon:** Upload the `tabby.png` file included in this repo.
3. **Description:** In the "Description" or "About Me" field, you can use:
   > 🐾 **TabbyAnnounce** — Your friendly neighborhood announcement bot. I live in a spreadsheet and post reminders so you don't have to. Powered by Node.js and a very organized cat.

## 🛠️ Troubleshooting
- **Node not found?** On Linux/macOS, run `which node`. On Windows, run `where node`. Ensure the path matches your startup scripts.
- **Bot isn't posting?** Verify the sheet is shared with the service account email.
- **Permission Denied?** Run `chmod +x *.sh` on Linux/macOS.
