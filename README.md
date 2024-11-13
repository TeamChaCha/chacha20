# CHA CHA 20
CSE 4381-001 Information Sec. II <br>
Demonstration of the ChaCha20 cryptographic algorithm.

## About
The ChaCha20 algorithm, a variant of Salsa20, constructs the following state, made up of <br>
16 32-bit word blocks, including a 64-bit counter, 256-bit key, 64-bit nonce, and 128-bit constant. <br>
<pre>
[ "expa" ][ "nd 3" ][ "2-by" ][ "te K" ]
[   Key  ][   Key  ][   Key  ][   Key  ]
[   Key  ][   Key  ][   Key  ][   Key  ]
[ Counter][ Counter][  Nonce ][  Nonce ]
</pre>
This state then undergoes 20 rounds (odd and even) of column mixing, <br>
adds, xors, and bit rotates to ensure optimal confusion. <br>
_This program was created for UTA's CSE 4381-001._

## Usages
- The live demonstration can be found [here](https://teamchacha.github.io/chacha20/src/index.html).

## References
- [ChaCha20 Documentation](https://cr.yp.to/chacha/chacha-20080120.pdf)

## Contributors
- Arian G.
- Rumaysa J.
- Richard O.
- Ian K.
