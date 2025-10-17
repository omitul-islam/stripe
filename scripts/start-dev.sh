#!/bin/bash
# =====================================================
# Industry-standard startup script for Linux/macOS
# Runs backend and frontend concurrently with cleanup
# =====================================================

set -e  # Stop on error
trap 'cleanup' EXIT

# === Colors ===
INFO='\033[1;34m[INFO]\033[0m'
SUCCESS='\033[1;32m[SUCCESS]\033[0m'
WARNING='\033[1;33m[WARNING]\033[0m'
ERROR='\033[1;31m[ERROR]\033[0m'

# === Project paths ===
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$ROOT_DIR/logs"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

# === Process IDs ===
BACKEND_PID=""
FRONTEND_PID=""

# === Cleanup function ===
cleanup() {
  echo -e "$WARNING Shutting down services..."
  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo -e "$INFO Stopping backend (PID: $BACKEND_PID)..."
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo -e "$INFO Stopping frontend (PID: $FRONTEND_PID)..."
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  echo -e "$SUCCESS All services stopped"
}

# === Setup directories ===
mkdir -p "$LOG_DIR"

# === Check directories ===
if [[ ! -d "$BACKEND_DIR" ]]; then
  echo -e "$ERROR Backend directory not found: $BACKEND_DIR"
  exit 1
fi
if [[ ! -d "$FRONTEND_DIR" ]]; then
  echo -e "$ERROR Frontend directory not found: $FRONTEND_DIR"
  exit 1
fi

# === Check dependencies ===
echo -e "$INFO Checking dependencies..."

if [[ ! -d "$BACKEND_DIR/node_modules" ]]; then
  echo -e "$WARNING Backend dependencies missing. Installing..."
  (cd "$BACKEND_DIR" && npm install)
fi

if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  echo -e "$WARNING Frontend dependencies missing. Installing..."
  (cd "$FRONTEND_DIR" && npm install)
fi

# === Check environment file ===
if [[ ! -f "$BACKEND_DIR/.env" ]]; then
  echo -e "$ERROR Backend .env file not found!"
  echo -e "$INFO Please copy .env.example to .env and configure it"
  exit 1
fi

# === Start backend ===
echo -e "$INFO Starting backend..."
(cd "$BACKEND_DIR" && npm run dev > "$LOG_DIR/backend.log" 2> "$LOG_DIR/backend-error.log") &
BACKEND_PID=$!
sleep 3

if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
  echo -e "$ERROR Backend failed to start. Check logs at $LOG_DIR/backend-error.log"
  exit 1
fi
echo -e "$SUCCESS Backend started (PID: $BACKEND_PID)"
echo -e "$INFO Backend logs: $LOG_DIR/backend.log"

# === Start frontend ===
echo -e "$INFO Starting frontend..."
(cd "$FRONTEND_DIR" && npm run dev > "$LOG_DIR/frontend.log" 2> "$LOG_DIR/frontend-error.log") &
FRONTEND_PID=$!
sleep 3

if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
  echo -e "$ERROR Frontend failed to start. Check logs at $LOG_DIR/frontend-error.log"
  cleanup
  exit 1
fi
echo -e "$SUCCESS Frontend started (PID: $FRONTEND_PID)"
echo -e "$INFO Frontend logs: $LOG_DIR/frontend.log"

# === Display summary ===
echo -e "\n$SUCCESS ✨ Development environment started successfully!"
echo -e "$INFO Services running:"
echo -e "  → Backend:  http://localhost:5000"
echo -e "  → Frontend: http://localhost:3000"
echo -e "\n$INFO Logs:"
echo -e "  → Backend:  tail -f $LOG_DIR/backend.log"
echo -e "  → Frontend: tail -f $LOG_DIR/frontend.log"
echo -e "\n$WARNING Press Ctrl+C to stop all services"

# === Monitor processes ===
while true; do
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo -e "$ERROR Backend process died unexpectedly!"
    exit 1
  fi
  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo -e "$ERROR Frontend process died unexpectedly!"
    exit 1
  fi
  sleep 5
done
