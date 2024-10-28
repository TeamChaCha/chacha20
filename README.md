# Infosec II - ChaCha20
- An implementation of ChaCha 20 for Information Security II, Fall 2024.
- 11/19: 15 min. presentation due.
- 12/03: report due.

## Tasks
- [ ] Frontend (React, Github Pages)
- [ ] Backend (Python)
- [ ] Presentation
- [ ] Report

## Context (Why is it useful, where can it be applied?)
- Used (alongside Poly1305) in Google's QUIC protocol for HTTP/3 <br/>
  header protection ([src](https://datatracker.ietf.org/doc/html/rfc9001#section-5.4.4)).
- Used (alongside Poly1305) in OpenSSH 
  ([src](https://github.com/openssh/openssh-portable/blob/master/PROTOCOL.chacha20poly1305)).

## How does it work?
- Parameters include a 128-bit constant, 256-bit key, <br/>
  64-bit counter, and 64-bit nonce (random, one-time-use num.) <br/>
  arranged as a 4x4 matrix of 16 32-bit words,
  <pre>
  [ "expa" ][ "nd 3" ][ "2-by" ][ "te K" ]
  [   Key  ][   Key  ][   Key  ][   Key  ]
  [   Key  ][   Key  ][   Key  ][   Key  ]
  [ Counter][ Counter][  Nonce ][  Nonce ]
  </pre>
  where "expa" = 0x61707865, "nd 3" = 0x6e646320, etc.

- ...

- ## To run website, go to
- https://teamchacha.github.io/my-chacha20-site/

## Why does it work?
- ...

## Implementation
- Python 3.14
- React
- GitHub Pages

## Pros
- Allows constant time access to any position in the key-stream.
- Utilized in popular protocols and toolings.

## Cons
- Overhead from generating new nonce (cannot be reused).

## Work done by each member
Arian - 
Rumaysa - 
Richard - 
Ian - (Created Github, first draft psuedocode )
