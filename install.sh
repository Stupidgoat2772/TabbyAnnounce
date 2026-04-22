#!/bin/bash

# TabbyAnnounce Automatic Installer
echo "🐾 Starting TabbyAnnounce installation..."

# 1. Install Dependencies
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install it first."
    exit 1
fi

npm install

# 2. Setup Environment File
if [ ! -f .env ]; then
    echo "📄 Creating .env from example..."
    cp .env.example .env
else
    echo "ℹ️  .env already exists, skipping copy."
fi

# 3. Setup absolute paths in start-bot.sh
FULL_PATH=$(pwd)
NODE_PATH=$(which node)

cat <<EOF > start-bot.sh
#!/bin/bash
cd $FULL_PATH
$NODE_PATH index.js >> tabby.log 2>&1
EOF

chmod +x start-bot.sh

# 3. Add to Crontab for start-on-boot
CRON_JOB="@reboot $FULL_PATH/start-bot.sh"
(crontab -l 2>/dev/null | grep -v "$FULL_PATH/start-bot.sh" ; echo "$CRON_JOB") | crontab -

echo "✅ Dependencies installed."
echo "✅ Startup script generated."
echo "✅ Crontab entry added for boot-start."
echo ""
echo "Next steps:"
echo "1. Fill out your .env file."
echo "2. Add your google-credentials.json."
echo "3. Run 'node index.js' to test, or reboot to see it start automatically!"
