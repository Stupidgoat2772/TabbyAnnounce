# Technical Documentation: TabbyAnnounce

## Core Logic
TabbyAnnounce uses a "Poll and Schedule" model. Every 5 minutes, it fetches the Google Sheet to look for new or updated rows.

### `index.js` Overview
- **Authentication:** Uses `google-auth-library` with a Service Account JWT.
- **Scheduling:** Uses `node-schedule`. Recurring jobs are kept in a `Map` (keyed by row number) to avoid duplicate scheduling between poll intervals.
- **Status Memory:** The `Status` column in the Google Sheet is updated with a timestamp after every successful post. This prevents the bot from double-posting if it restarts within the same minute a job is scheduled.

## Scheduling System ("Tabby Talk")
The `scheduleRecurring` function parses the `Schedule` string into a `RecurrenceRule`.

### Supported Syntax
| Pattern | Example | Implementation |
| :--- | :--- | :--- |
| **Daily** | `daily HH:mm` | Sets `rule.hour` and `rule.minute`. |
| **Weekly** | `day_name HH:mm` | Sets `rule.dayOfWeek`. |
| **Monthly (Ordinal)** | `Nth day_name HH:mm` | Sets a weekly cron job; internal logic checks `Math.ceil(now.getDate() / 7) == N`. |
| **One-off** | `YYYY-MM-DD HH:mm` | Standard JS Date object. |

## Troubleshooting
- **Logs:** Check `bot.log` in the project directory if running via the startup script.
- **Invalid Date:** If a date pattern is not recognized, the bot will log an error and skip that row.
- **Channel Access:** Ensure the bot has "View Channel" and "Send Messages" permissions in the target Discord server.
