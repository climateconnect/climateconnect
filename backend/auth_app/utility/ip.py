import ipaddress
import logging

logger = logging.getLogger(__name__)


def anonymise_ip(ip_str: str | None) -> str | None:
    """
    Anonymise an IP address for GDPR-compliant storage.

    - IPv4: zero the last octet (192.168.1.42 → 192.168.1.0)
    - IPv6: keep only the first 48 bits (zero the remaining 80 bits)

    Returns None if the input is None or cannot be parsed.
    """
    if not ip_str:
        return None
    try:
        addr = ipaddress.ip_address(ip_str)
        if isinstance(addr, ipaddress.IPv4Address):
            parts = ip_str.split(".")
            parts[3] = "0"
            return ".".join(parts)
        else:
            # IPv6: keep first 48 bits, zero the rest
            packed = addr.packed  # 16 bytes
            anonymised = packed[:6] + b"\x00" * 10
            return str(ipaddress.IPv6Address(anonymised))
    except ValueError:
        logger.warning(f"[anonymise_ip] Could not parse IP address: {ip_str!r}")
        return None
