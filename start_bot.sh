#!/bin/bash

SESSION_NAME="radio-bot"

BOT_SCRIPT="/home/radio-bot/build/index.js"

if screen -list | grep -q "$SESSION_NAME"; then
    echo "Die screen Sitzung '$SESSION_NAME' läuft bereits."
else
    echo "Starte die screen Sitzung '$SESSION_NAME'..."
    screen -dmS "$SESSION_NAME" bash -c "node $BOT_SCRIPT"
    echo "Die screen Sitzung '$SESSION_NAME' wurde gestartet."
fi