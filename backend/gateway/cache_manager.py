"""
Cache Manager with In-Memory TTL for FutStats Gateway.
Provides thread-safe caching (<3ms retrieval) to serve high-frequency read queries
and reduce remote round-trips according to Tier-1 proxy defense specifications.
"""

import time
import threading
from typing import Any, Optional, Dict, List


class CacheManager:
    def __init__(self, default_ttl: int = 1800, max_entries: int = 1000):
        """
        Initialize TTL cache.
        Args:
            default_ttl: Default time-to-live in seconds (default: 1800s / 30m).
            max_entries: Soft capacity limit before automatic pruning.
        """
        self._cache: Dict[str, tuple[Any, float]] = {}
        self._lock = threading.RLock()
        self._default_ttl = default_ttl
        self._max_entries = max_entries
        self._hits = 0
        self._misses = 0

    def get(self, key: str) -> Optional[Any]:
        """
        Retrieve value by key if present and not expired.
        Returns None on miss or expiration.
        """
        with self._lock:
            item = self._cache.get(key)
            if item is None:
                self._misses += 1
                return None

            value, expires_at = item
            if time.time() > expires_at:
                del self._cache[key]
                self._misses += 1
                return None

            self._hits += 1
            return value

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        Store key-value pair with designated TTL in seconds.
        """
        with self._lock:
            # Prune if exceeding capacity
            if len(self._cache) >= self._max_entries:
                self._prune_expired()
                # If still at capacity, evict oldest 10%
                if len(self._cache) >= self._max_entries:
                    keys_to_remove = list(self._cache.keys())[: max(1, self._max_entries // 10)]
                    for k in keys_to_remove:
                        self._cache.pop(k, None)

            effective_ttl = ttl if ttl is not None else self._default_ttl
            expires_at = time.time() + effective_ttl
            self._cache[key] = (value, expires_at)

    def delete(self, key: str) -> bool:
        """
        Delete key from cache. Returns True if deleted, False if not present.
        """
        with self._lock:
            return self._cache.pop(key, None) is not None

    def clear(self) -> None:
        """
        Flush all entries from cache.
        """
        with self._lock:
            self._cache.clear()
            self._hits = 0
            self._misses = 0

    def size(self) -> int:
        """
        Return the number of unexpired entries currently in cache.
        """
        with self._lock:
            self._prune_expired()
            return len(self._cache)

    def _prune_expired(self) -> None:
        """
        Internal cleanup of expired keys. Caller must hold lock.
        """
        now = time.time()
        expired_keys = [k for k, (_, exp) in self._cache.items() if now > exp]
        for k in expired_keys:
            del self._cache[k]

    def stats(self) -> Dict[str, Any]:
        """
        Telemetry statistics of cache efficiency.
        """
        with self._lock:
            total = self._hits + self._misses
            hit_ratio = round((self._hits / total) * 100, 2) if total > 0 else 0.0
            return {
                "active_entries": len(self._cache),
                "hits": self._hits,
                "misses": self._misses,
                "hit_ratio_percent": hit_ratio,
                "default_ttl_sec": self._default_ttl,
            }

    def __len__(self) -> int:
        return self.size()


# Backward-compatible alias for existing imports
TTLCache = CacheManager

# Global singleton cache instance for gateway responses
gateway_cache = CacheManager(default_ttl=1800)
