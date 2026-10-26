'use strict';

/**
 * Extracts and normalizes the client IP address from an Express request.
 * Relies on Express's trusted proxy configuration (req.ip).
 * Normalizes IPv4-mapped IPv6 addresses (::ffff:1.2.3.4 -> 1.2.3.4).
 * Handles localhost ::1 and 127.0.0.1 cleanly.
 *
 * @param {import('express').Request} req
 * @returns {string|null}
 */
function extractClientIp(req) {
  if (!req) return null;

  let rawIp = req.ip || (req.socket && req.socket.remoteAddress) || null;
  if (!rawIp || typeof rawIp !== 'string') return null;

  rawIp = rawIp.trim();

  // Normalize IPv4-mapped IPv6 (::ffff:192.168.0.1 -> 192.168.0.1)
  if (rawIp.startsWith('::ffff:')) {
    rawIp = rawIp.slice(7);
  }

  // Normalize IPv6 loopback
  if (rawIp === '::1') {
    rawIp = '127.0.0.1';
  }

  return rawIp;
}

module.exports = { extractClientIp };
