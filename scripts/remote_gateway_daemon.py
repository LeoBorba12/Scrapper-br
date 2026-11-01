#!/usr/bin/env python3
"""
FutStats Remote API Gateway Daemon.
High-performance standalone service designed for 24/7 execution on Oracle Cloud VM.
Serves master historical archive queries (unconstrained by Vercel 94.0 MB limit)
using Waitress (if available) or multi-threaded Flask WSGI server.
"""

import os
import sys
import argparse
import signal
import time
import logging

# Set daemon mode before importing backend app to prevent recursive proxying
os.environ["IS_REMOTE_GATEWAY"] = "1"

# Add project root to sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

venv_python = os.path.join(PROJECT_ROOT, ".venv", "bin", "python")
if os.path.exists(venv_python) and sys.executable != venv_python:
    os.execv(venv_python, [venv_python] + sys.argv)

from backend.app import app, DB_FUTEBOL
from backend.gateway import default_circuit_breaker, gateway_cache

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [RemoteGateway] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("futstats-gateway")


def setup_gateway_security(flask_app):
    """
    Enforces shared secret verification for incoming gateway calls if FUTSTATS_GATEWAY_SECRET is configured.
    """
    expected_secret = os.environ.get("FUTSTATS_GATEWAY_SECRET") or os.environ.get("SECRET_KEY", "")

    if not expected_secret:
        logger.warning("FUTSTATS_GATEWAY_SECRET not configured. Running without token authentication.")
        return

    from flask import request, jsonify

    @flask_app.before_request
    def verify_gateway_secret():
        # Allow internal health checks and public static routes
        if request.path in ["/api/health", "/health", "/api/gateway/status", "/"]:
            return None

        # Check secret in headers
        provided_secret = request.headers.get("X-Gateway-Secret", "")
        if not provided_secret or provided_secret != expected_secret:
            logger.warning(f"Unauthorized access attempt to {request.path} from {request.remote_addr}")
            return jsonify({"error": "Unauthorized remote gateway access: invalid or missing secret token"}), 401


def add_gateway_diagnostics(flask_app):
    """
    Registers diagnostic endpoints for gateway health and VM resource monitoring.
    """
    from flask import jsonify

    @flask_app.route("/api/gateway/status", methods=["GET"])
    def gateway_status():
        db_size_mb = 0.0
        if os.path.exists(DB_FUTEBOL):
            db_size_mb = round(os.path.getsize(DB_FUTEBOL) / (1024 * 1024), 2)

        return jsonify({
            "status": "online",
            "service": "FutStats Remote Master Database Gateway",
            "role": "tier-1-master-archive",
            "database_path": DB_FUTEBOL,
            "database_size_mb": db_size_mb,
            "circuit_breaker": default_circuit_breaker.to_dict(),
            "cache_stats": gateway_cache.stats(),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        })


def run_server(host: str, port: int, threads: int):
    """
    Starts WSGI server with Waitress (production) or Flask threaded server (development).
    """
    setup_gateway_security(app)
    add_gateway_diagnostics(app)

    db_size_mb = round(os.path.getsize(DB_FUTEBOL) / (1024 * 1024), 2) if os.path.exists(DB_FUTEBOL) else 0.0
    logger.info("==================================================================")
    logger.info("  FutStats Remote API Gateway Daemon (Milestone 1 Decoupling)     ")
    logger.info("==================================================================")
    logger.info(f"Target Master Database: {DB_FUTEBOL} ({db_size_mb} MB)")
    logger.info(f"Listening on: http://{host}:{port}")
    logger.info(f"Worker concurrency: {threads} threads")

    # Signal handlers
    def handle_signal(sig, frame):
        logger.info(f"Received shutdown signal ({sig}). Terminating gracefully...")
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    # Attempt Waitress WSGI server first
    try:
        from waitress import serve
        logger.info("Serving via production Waitress WSGI engine.")
        serve(app, host=host, port=port, threads=threads, channel_timeout=30)
    except ImportError:
        logger.info("Waitress not detected. Serving via multi-threaded Werkzeug/Flask WSGI.")
        app.run(host=host, port=port, threaded=True, debug=False)


def main():
    parser = argparse.ArgumentParser(description="FutStats Remote API Gateway Daemon")
    parser.add_argument(
        "--host",
        type=str,
        default=os.environ.get("GATEWAY_HOST", "0.0.0.0"),
        help="Host address to bind (default: 0.0.0.0)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.environ.get("GATEWAY_PORT", 8000)),
        help="Port number to listen on (default: 8000)",
    )
    parser.add_argument(
        "--threads",
        type=int,
        default=int(os.environ.get("GATEWAY_THREADS", 4)),
        help="Number of concurrent worker threads (default: 4)",
    )

    args = parser.parse_args()
    run_server(args.host, args.port, args.threads)


if __name__ == "__main__":
    main()
