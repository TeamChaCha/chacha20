// Example Key 0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF
//             (64 chars of hex == 256 bits)
// Example Nonce 0123456789ABCDEF
//               (16 chars of hex == 64 bits)

function encrypt( )
{
    // Performs ChaCha20 encryption.

    // 1. getElements()
    const [key, nonce, message] = getElements( )
    // 2. hexToInt()
    const bytesKey   = hexToInt(key);
    const bytesNonce = hexToInt(nonce);
    postIntermediate("Hex to Int Conversion", ["\nKey:", bytesKey, "\nNonce:", bytesNonce])
    // 3. initState()
    const state = initState(bytesKey, bytesNonce)
    // 4. Peform encryption (? show changes during encryption)
    // 5. postElements()
    postResults(message)
}

function decrypt( )
{
    // Peforms ChaCha20 decryption.

    // 1. Retrieve input
    const [key, nonce, message] = getElements( )
    // 2. hexToInt()
    const bytesKey   = hexToInt(key);
    const bytesNonce = hexToInt(nonce);
    postIntermediate("Hex to Int Conversion", ["\nKey:", bytesKey, "\nNonce:", bytesNonce])
    // 3. initState()
    const state = initState(bytesKey, bytesNonce)
    // 4. Peform decyrption (? show changes during decryption)
    // 5. Post output
    postResults(message)
}

function hexToInt( hex )
{
    // Convert hex strings to byte arrays, since each 
    // element in state is a 32-bit word (4 bytes).

    // 256-bit key = 32 bytes = 64 hex chars.
    // 64-bit nonce = 8 bytes = 16 hex chars.
    // 1 hex value = 4 bits; 2 hex values = 1 byte.

    // e.g., given a 256-bit key (64 hex chars), this 
    // creates a Uint8Array of size 32 (64 / 2).
    const byteArray = new Uint8Array(hex.length / 2); 
    // Loop through the hex string, converting each pair
    // of characters to a byte.
    let idx = 0
    for (let i = 0; i < hex.length; i += 2)
    {
        // Extract a pair of hex chars (1 byte).
        const hexChars = hex.substr(i, 2);
        // Convert the hex charts to an int.
        const hexByte = parseInt(hexChars, 16);
        // Store in byteArray.
        byteArray[idx] = hexByte;
        idx++;
    }

    return byteArray;
}

function getElements( ) 
{
    // Retrieves algorithm input.
    const ids = ["key", "nonce", "message"] 
    return ids.map(id => document.getElementById(id).value)
}

function postIntermediate(section, input)
{
    // Posts intermediate algorithm output (e.g., round output).
    // Get HTML class and header.
    const outputGroup = document.querySelector(".output_group");
    const intermediateHeader = document.querySelector(".output_group h4");
    
    // Create new pre element, for new block
    // of intermediate output.
    const newPre = document.createElement("pre");
    newPre.className = "output";

    let sectionContent = `${section}:`;
    for (let i = 0; i < input.length; i++) 
    {
        sectionContent += `\n${input[i]}`;
    }
    newPre.innerText = sectionContent;

    // Insert new <pre> element, in between two headers.
    intermediateHeader.insertAdjacentElement("afterend", newPre);
}


function postResults(message)
{
    // Create new pre element, for new block
    // of results output.
    const newPre = document.createElement("pre");
    newPre.className = "output";
    newPre.id = "result";
    const resultsHeader = document.querySelector(".output_group h4:nth-of-type(2)");

    // Posts final algorithm output.
    newPre.innerText = `Message: \n${message}`;
    resultsHeader.insertAdjacentElement("afterend", newPre);
}

function clearOutput( )
{
    // Clear HTML output section; remove
    // all <pre> elements.
    document.querySelectorAll(".output_group pre").forEach
    (
        element => {element.remove( )}
    );
}

function initState( key, nonce )
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
    return false
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