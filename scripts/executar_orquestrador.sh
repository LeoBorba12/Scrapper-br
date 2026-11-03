#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"
exec "$DIR/.venv/bin/python3" "$DIR/scripts/orquestrador_mestre_24x7.py"
