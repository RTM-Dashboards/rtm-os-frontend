// lib/ghl/webhook-keys.ts
//
// GHL public keys used to verify inbound webhook signatures.
//
// Source: GHL webhook integration guide (copied by Fe from a browser session,
// because the guide page is JavaScript-rendered and cannot be machine-fetched).
// These are PUBLIC keys published by GHL for all customers.  They are NOT
// secrets and must NOT be put in environment variables — they belong in the
// code and are the same for every GHL installation.
//
// GHL ROTATES THESE KEYS periodically.  If verification starts failing with
// "signature invalid" on every request (outcome "sig-fail" in ghl_webhook_logs),
// the key listed here is stale.  To detect rotation:
//
//   SELECT received_at, outcome, outcome_detail
//   FROM   ghl_webhook_logs
//   WHERE  outcome = 'sig-fail'
//   ORDER  BY received_at DESC
//   LIMIT  20;
//
// When rotation is confirmed, update GHL_ED25519_PUBLIC_KEY or
// GHL_RSA_PUBLIC_KEY (or both) below and redeploy.

// Ed25519 key — used with the X-GHL-Signature header (preferred scheme).
export const GHL_ED25519_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAi2HR1srL4o18O8BRa7gVJY7G7bupbN3H9AwJrHCDiOg=
-----END PUBLIC KEY-----`;

// RSA-4096 key — used with the X-WH-Signature header (legacy scheme, still
// sent by GHL during the transition to Ed25519).
export const GHL_RSA_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAokvo/r9tVgcfZ5DysOSC
Frm602qYV0MaAiNnX9O8KxMbiyRKWeL9JpCpVpt4XHIcBOK4u3cLSqJGOLaPuXw6
dO0t6Q/ZVdAV5Phz+ZtzPL16iCGeK9po6D6JHBpbi989mmzMryUnQJezlYJ3DVfB
csedpinheNnyYeFXolrJvcsjDtfAeRx5ByHQmTnSdFUzuAnC9/GepgLT9SM4nCpv
uxmZMxrJt5Rw+VUaQ9B8JSvbMPpez4peKaJPZHBbU3OdeCVx5klVXXZQGNHOs8gF
3kvoV5rTnXV0IknLBXlcKKAQLZcY/Q9rG6Ifi9c+5vqlvHPCUJFT5XUGG5RKgOKU
J062fRtN+rLYZUV+BjafxQauvC8wSWeYja63VSUruvmNj8xkx2zE/Juc+yjLjTXp
IocmaiFeAO6fUtNjDeFVkhf5LNb59vECyrHD2SQIrhgXpO4Q3dVNA5rw576PwTzN
h/AMfHKIjE4xQA1SZuYJmNnmVZLIZBlQAF9Ntd03rfadZ+yDiOXCCs9FkHibELhC
HULgCsnuDJHcrGNd5/Ddm5hxGQ0ASitgHeMZ0kcIOwKDOzOU53lDza6/Y09T7sYJ
PQe7z0cvj7aE4B+Ax1ZoZGPzpJlZtGXCsu9aTEGEnKzmsFqwcSsnw3JB31IGKAyk
T1hhTiaCeIY/OwwwNUY2yvcCAwEAAQ==
-----END PUBLIC KEY-----`;
