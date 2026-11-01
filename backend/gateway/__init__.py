"""
FutStats Remote API Gateway & Resilient Proxy Module.
Milestone 1 Architecture: Database Decoupling & Resilient Proxy Gateway.
"""

from .circuit_breaker import CircuitBreaker
from .cache_manager import CacheManager, TTLCache, gateway_cache
from .proxy_client import (
    ProxyClient,
    proxy_client,
    default_circuit_breaker,
    default_cache_manager,
    dispatch_with_fallback,
)

__all__ = [
    "CircuitBreaker",
    "CacheManager",
    "TTLCache",
    "gateway_cache",
    "ProxyClient",
    "proxy_client",
    "default_circuit_breaker",
    "default_cache_manager",
    "dispatch_with_fallback",
]
