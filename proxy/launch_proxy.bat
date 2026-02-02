@echo off
start cmd /K "ngrok start proxy --config ngrok.yml"
start cmd /K "caddy run --config caddy.json"