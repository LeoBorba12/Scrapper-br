"""
Circuit Breaker Pattern Implementation for FutStats Remote API Gateway.
Provides thread-safe state management (CLOSED, OPEN, HALF-OPEN) to prevent
cascading failures when remote API gateway oscillates or becomes unreachable.
"""

import os
import time
import threading
from typing import Dict, Any


class CircuitBreaker:
    STATE_CLOSED = "closed"
    STATE_OPEN = "open"
    STATE_HALF_OPEN = "half-open"

    def __init__(self, failure_threshold: int = None, recovery_time: float = None):
        """
        Initialize Circuit Breaker with configurable threshold and recovery window.
        Defaults can be overridden via environment variables:
          - FUTSTATS_CIRCUIT_MAX_FAILURES (default: 3)
          - FUTSTATS_CIRCUIT_RESET_SEC (default: 60.0)
        """
        if failure_threshold is None:
            try:
                failure_threshold = int(os.environ.get("FUTSTATS_CIRCUIT_MAX_FAILURES", 3))
            except (ValueError, TypeError):
                failure_threshold = 3

        if recovery_time is None:
            try:
                recovery_time = float(os.environ.get("FUTSTATS_CIRCUIT_RESET_SEC", 60.0))
            except (ValueError, TypeError):
                recovery_time = 60.0

        self.failure_threshold = max(1, failure_threshold)
        self.recovery_time = max(0.1, recovery_time)

        self._state = self.STATE_CLOSED
        self._failure_count = 0
        self._last_failure_time = 0.0
        self._success_count = 0
        self._total_requests = 0
        self._lock = threading.RLock()

    @property
    def state(self) -> str:
        with self._lock:
            # Check for automatic transition from OPEN to HALF-OPEN upon expiry
            if self._state == self.STATE_OPEN:
                if (time.time() - self._last_failure_time) >= self.recovery_time:
                    self._state = self.STATE_HALF_OPEN
            return self._state

    @property
    def failure_count(self) -> int:
        with self._lock:
            return self._failure_count

    @property
    def last_failure_time(self) -> float:
        with self._lock:
            return self._last_failure_time

    def can_attempt(self) -> bool:
        """
        Determines whether an outbound request to the remote gateway can be attempted.
        Returns:
            True: If CLOSED, or if OPEN and recovery_time has elapsed (transitions to HALF-OPEN).
            False: If OPEN and still within the recovery cooldown window (fast fail).
        """
        with self._lock:
            self._total_requests += 1
            now = time.time()
            if self._state == self.STATE_OPEN:
                if (now - self._last_failure_time) >= self.recovery_time:
                    self._state = self.STATE_HALF_OPEN
                    return True
                return False
            return True

    def record_success(self):
        """
        Records a successful outbound request.
        Resets failure count to 0 and transitions state back to CLOSED.
        """
        with self._lock:
            self._success_count += 1
            self._failure_count = 0
            self._state = self.STATE_CLOSED

    def record_failure(self):
        """
        Records an outbound request failure (timeout, network error, 5xx status).
        Increments failure count and immediately trips state to OPEN if threshold reached
        or if failure occurs during HALF-OPEN trial.
        """
        with self._lock:
            self._failure_count += 1
            self._last_failure_time = time.time()
            if self._state == self.STATE_HALF_OPEN or self._failure_count >= self.failure_threshold:
                self._state = self.STATE_OPEN

    def reset(self):
        """
        Resets the circuit breaker to its pristine CLOSED state.
        Useful for testing and administrative diagnostics.
        """
        with self._lock:
            self._state = self.STATE_CLOSED
            self._failure_count = 0
            self._last_failure_time = 0.0

    def to_dict(self) -> Dict[str, Any]:
        """
        Returns telemetry snapshot of the circuit breaker for health checks and logging.
        """
        with self._lock:
            # Trigger state update if recovery time passed
            current_state = self.state
            return {
                "state": current_state,
                "failure_count": self._failure_count,
                "failure_threshold": self.failure_threshold,
                "recovery_time_sec": self.recovery_time,
                "last_failure_time": self._last_failure_time,
                "total_requests": self._total_requests,
                "success_count": self._success_count,
            }
