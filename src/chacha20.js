function encrypt( )
{
    // Performs ChaCha20 encryption.

    // TODO:
    // 1. getElements()
    const [key, nonce, message] = getElements( )
    console.log(key)
    // 2. hexToInt()
    // 3. initState()
    // 4. Peform encryption (? show changes during encryption)
    // 5. postElements()
    postElements(key, nonce, message)
}

function decrypt( )
{
    // Peforms ChaCha20 decryption.

    // TODO:
    // 1. Retrieve input
    const [key, nonce, message] = getElements( )
    // 2. hexToInt()
    // 3. initState()
    // 4. Peform decyrption (? show changes during decryption)
    // 5. Post output
    postElements(key, nonce, message)
}

function hexToInt( )
{
    // Convert hex strings to byte arrays.
}

function getElements( ) 
{
    // Retrieves algorithm input.
    const ids = ["key", "nonce", "message"] 
    return ids.map(id => document.getElementById(id).value)
}

function postElements(key, nonce, message)
{
    // Posts algorithm output.
    const outputElement = document.getElementById("output");
    outputElement.innerText = `Chacha20 Result: \nKey: ${key}\nNonce: ${nonce}\nMessage: ${message}`;
}

function initState( )
{
    // Initializes the state matrix, as shown below:
    //
    // [ "expa" ][ "nd 3" ][ "2-by" ][ "te K" ]
    // [   Key  ][   Key  ][   Key  ][   Key  ]
    // [   Key  ][   Key  ][   Key  ][   Key  ]
    // [ Counter][ Counter][  Nonce ][  Nonce ]
    // 
    // [   0    ][   1    ][   2    ][   3    ]
    // [   4    ][   5    ][   6    ][   7    ]
    // [   8    ][   9    ][   10   ][   11   ]
    // [   12   ][   13   ][   14   ][   15   ]
}

function chacha20Block( )
{
    // 20 rounds with 2 rounds per loop = 10 loops.
    for(let i = 0; i < 20; i += 2)
    {
        // Odd round.
        quarterRound(state, 0, 4, 8,  12) // Column 1
        quarterRound(state, 1, 5, 9,  13) // Column 2
        quarterRound(state, 2, 6, 10, 15) // Column 3
        quarterRound(state, 3, 7, 11, 15) // Column 4
        // Even round.
        quarterRound(state, 0, 5, 10, 15) // Diagonal 1
        quarterRound(state, 1, 6, 11, 12) // Diagonal 2
        quarterRound(state, 2, 7, 8,  13) // Diagonal 3
        quarterRound(state, 3, 4, 9,  14) // Diagonal 4
    }
}

function quarterRound(state, a, b, c, d)
{
    // The quarter round takes 4 32-bit words
    // (a, b, c, d) and state, the current state
    // matrix of the algorithm. It tries to diffuse as much
    // as possible, via adds, bitwise XORs, and left shifts.
    // 16, 12, 8, and 7 are predefined shifts.
    state[a] += state[b]; 
    state[b] ^= state[a]; 
    state[d] = rotateLeft(state[d], 16);
    state[c] += state[d]; 
    state[b] ^= state[c]; 
    state[b] = rotateLeft(state[b], 12);
    state[a] += state[b]; 
    state[d] ^= state[a]; 
    state[d] = rotateLeft(state[d],  8);
    state[c] += state[d]; 
    state[b] ^= state[c]; 
    state[b] = rotateLeft(state[b],  7);
}

function rotateLeft(val, shift)
{
    // Rotate left performs a left (circular) rotation
    // on a 32-bit word (val) by some number of bits (shift).
    let leftShifted = val << shift;
    let rightShifted = val >>> (32 - shift);
    let rotatedValue = leftShifted | rightShifted;
    return rotatedValue >>> 0;
}