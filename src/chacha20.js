// Example Key 0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF
//             (64 chars of hex == 256 bits)
// Example Nonce 0123456789ABCDEF
//               (16 chars of hex == 64 bits)


////////// ChaCha20 Functions //////////
var counter = new Uint32Array(2);

function encrypt( )
{
    // Performs ChaCha20 encryption.
    clearOutput( )
    // 1. getElements()
    const [key, nonce, message] = getElements( )
    // 2. hexToInt()
    const bytesKey   = hexToInt(key);
    const bytesNonce = hexToInt(nonce);
    postIntermediate("Hex to Int Conversion", ["\nKey:", bytesKey, "\nNonce:", bytesNonce])
    // 3. initState()
    const state = initState(bytesKey, bytesNonce)
    // 4. Peform encryption
    // 5. postElements()
    postResults("Ciphertext:", message)
}

function decrypt( )
{
    // Peforms ChaCha20 decryption.
    clearOutput( )
    // 1. Retrieve input
    const [key, nonce, message] = getElements( )
    // 2. hexToInt()
    const bytesKey   = hexToInt(key);
    const bytesNonce = hexToInt(nonce);
    postIntermediate("Hex to Int Conversion", ["\nKey:", bytesKey, "\nNonce:", bytesNonce])
    // 3. initState()
    const state = initState(bytesKey, bytesNonce)
    // 4. Peform decyrption
    // 5. Post output
    postResults("Plaintext:", message)
}

function hexToInt(hex)
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

function initState( key, nonce )
{
    // Initializes the state matrix, as shown below.
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

    // Spaces here to align formatting with non-monospaced font.
    const matrixVisual =
    `
    [   "expa"  ][    "nd 3"  ][    "2-by"  ][    "te K"  ]
    [      Key     ][      Key     ][      Key      ][      Key    ]
    [      Key     ][      Key     ][      Key      ][      Key    ]
    [ Counter][ Counter][   Nonce  ][   Nonce  ]
    `
    postIntermediate("Initializing the State Matrix", [matrixVisual])

    // 4x4 matrix of 32-bit words.
    const state = new Uint32Array(16) 

    // Add the nothing-up-my-sleeve constants,
    // "expand 32-byte K".
    state[0] = 0x65787061; // "expa"
    state[1] = 0x6E642033; // "nd 3"
    state[2] = 0x322D6279; // "2-by"
    state[3] = 0x7465206B; // "te k"
    postIntermediate("Initializing the State Matrix", ["\nAdd Constants (in 32-bit):", state[0], state[1], state[2], state[3]])

    // Add the key.
    for (let i = 0; i < 8; i++)
    {
        state[4 + i] = (key[i * 4]) | (key[i * 4 + 1] << 8) | (key[i * 4 + 2] << 16) | (key[i * 4 + 3] << 24);
    }
    postIntermediate("Initializing the State Matrix", ["\nAdd Key (in 32-bit):", ...state.slice(4, 11)])

    // Add the counter. Starts at 0 during init.,
    // and increments in successive blocks. 
    state[12] = 0
    state[13] = 0
    postIntermediate("Initializing the State Matrix", ["\nAdd Counter (in 32-bit):", state[12], state[13]])

    // Add the 64-bit nonce into state[14] and state[15].
    state[14] = (nonce[0]) | (nonce[1] << 8) | (nonce[2] << 16) | (nonce[3] << 24);
    state[15] = (nonce[4]) | (nonce[5] << 8) | (nonce[6] << 16) | (nonce[7] << 24);
    postIntermediate("Initializing the State Matrix", ["\nAdd Nonce (in 32-bit):", state[14], state[15]])    

    postIntermediate("Initializing the State Matrix", ["\nFinal State Matrix (in 32-bit):", ...state])    

    return state
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

////////// HTML Functions //////////
function getElements( ) 
{
    // Retrieves algorithm input.
    const ids = ["key", "nonce", "message"] 
    return ids.map(id => document.getElementById(id).value)
}

function postIntermediate(section, input)
{
    // Posts intermediate algorithm output (e.g., round output).
    const newPre = document.createElement("pre");
    newPre.className = "output";
    const outputGroup = document.querySelector(".output_group");

    let sectionContent = `${section}:`;
    for (let i = 0; i < input.length; i++) 
    {
        sectionContent += `\n${input[i]}`;
    }
    newPre.innerText = sectionContent;

    // Insert new <pre> element after last one.
    const prevPre = outputGroup.querySelector("pre:last-of-type");
    prevPre.insertAdjacentElement("afterend", newPre);
}


function postResults(preface, message)
{
    // Posts final algorithm output.
    const newPre = document.createElement("pre");
    newPre.className = "output";
    newPre.id = "result";
    const resultsHeader = document.querySelector(".output_group h3:nth-of-type(2)");

    // Insert new <pre> element after final results header.
    newPre.innerText = `${preface}\n${message}`;
    resultsHeader.insertAdjacentElement("afterend", newPre);
}

function clearOutput( )
{
    // Clears HTML output section; removes
    // all <pre> elements (except placeholder).
    document.querySelectorAll(".output_group pre").forEach
    (
        element => 
        {
            if(!element.classList.contains("placeholder"))
            {
                element.remove();
            }
        }
    );
}

function clearInput( )
{
    // Clears HTML input section (textareas).
    document.querySelectorAll("textarea").forEach
    (
        textarea => 
        {
            textarea.value = "";
        }
    );
}