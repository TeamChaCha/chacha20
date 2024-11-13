// Using little-endian order.
// Example Key 0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF
//             (64 chars of hex == 256 bits)
// Example Nonce 0123456789ABCDEF
//               (16 chars of hex == 64 bits)


////////// ChaCha20 Functions //////////
/**
 * Performs ChaCha20 encryption and handles sub-functions.
 */
function encrypt( )
{
    clearOutput( )

    // Retrieve input and convert to bytes.
    const [key, nonce, message] = getElements( )
    const bytesKey   = hexToInt(key);
    const bytesNonce = hexToInt(nonce);
    postIntermediate("Hex to Int Conversion", ["\nKey:", bytesKey, "\nNonce:", bytesNonce])

    const state = initState(bytesKey, bytesNonce)

    // Perform encryption.
    {
        const bytesMessage = new TextEncoder( ).encode(message);
        let ciphertext = new Uint8Array(bytesMessage.length);
        let blockCounter = 0;

        for (let i = 0; i < bytesMessage.length; i += 64) 
        {
            // Preserve original state matrix to added back at end,
            // since workingState gets modified in chacha20Block( ).
            const workingState = new Uint32Array(state);
            workingState[12] = blockCounter & 0xffffffff; // Get lower 32-bits.
            workingState[13] = (blockCounter >> 32) & 0xffffffff; // Get upper 32-bits.
            
            chacha20Block(workingState, blockCounter);
            
            // Add the original state back to the result.
            for (let j = 0; j < 16; j++) 
            {
                workingState[j] += state[j];
            }

            // Convert the state to bytes for keystream.
            const keyStream = new Uint8Array(64);
            for (let j = 0; j < 16; j++) 
            {
                const word = workingState[j];
                keyStream[j * 4] = word & 0xff;
                keyStream[j * 4 + 1] = (word >> 8) & 0xff;
                keyStream[j * 4 + 2] = (word >> 16) & 0xff;
                keyStream[j * 4 + 3] = (word >> 24) & 0xff;
            }
            
            // XOR keystream with message (plaintext).
            const blockSize = Math.min(64, bytesMessage.length - i);
            for (let j = 0; j < blockSize; j++) 
            {
                ciphertext[i + j] = bytesMessage[i + j] ^ keyStream[j];
            }
            
            blockCounter++;
        }

        ciphertext = btoa(String.fromCharCode.apply(null, ciphertext));
        postResults("Ciphertext:", ciphertext)
    }
}

/**
 * Performs ChaCha20 decryption and handles sub-functions.
 */
function decrypt( )
{
    // Peforms ChaCha20 decryption.
    clearOutput( )

    // Retrieve input and convert to bytes.
    const [key, nonce, message] = getElements( )
    const bytesKey   = hexToInt(key);
    const bytesNonce = hexToInt(nonce);
    postIntermediate("Hex to Int Conversion", ["\nKey:", bytesKey, "\nNonce:", bytesNonce])

    const state = initState(bytesKey, bytesNonce)

    // Perform decryption.
    {
        const bytesMessage = new Uint8Array
        (
            atob(message).split("").map(char => char.charCodeAt(0))
        );

        let plaintext = new Uint8Array(bytesMessage.length);
        let blockCounter = 0;

        for (let i = 0; i < bytesMessage.length; i += 64) 
        {
            // Preserve original state matrix to add back at end,
            // since workingState gets modified in chacha20Block( ).
            const workingState = new Uint32Array(state);
            workingState[12] = blockCounter & 0xffffffff; // Get lower 32-bits.
            // workingState[13] = (blockCounter >> 32) & 0xffffffff;
            workingState[13] = blockCounter >> 0; // Get upper 32-bits.
            
            chacha20Block(workingState, blockCounter);
            
            // Add the original state back to the result.
            for (let j = 0; j < 16; j++) 
            {
                workingState[j] += state[j];
            }

            // Convert the state to bytes for keystream.
            const keyStream = new Uint8Array(64);
            for (let j = 0; j < 16; j++) 
            {
                const word = workingState[j];
                keyStream[j * 4] = word & 0xff;
                keyStream[j * 4 + 1] = (word >> 8) & 0xff;
                keyStream[j * 4 + 2] = (word >> 16) & 0xff;
                keyStream[j * 4 + 3] = (word >> 24) & 0xff;
            }
            
            // XOR keystream with message (ciphertext).
            const blockSize = Math.min(64, bytesMessage.length - i);
            for (let j = 0; j < blockSize; j++) 
            {
                plaintext[i + j] = bytesMessage[i + j] ^ keyStream[j];
            }
            
            blockCounter++;
        }


    plaintext = new TextDecoder().decode(plaintext);
    postResults("Plaintext:", plaintext)
    }
}

/**
 * Converts hex strings to byte arrays.
 * @param {hex} hex The hex string to convert.
 */
function hexToInt(hex)
{
    // Convert hex strings to byte arrays, since each 
    // element in state is a 32-bit word (4 bytes).

    // 256-bit key = 32 bytes = 64 hex chars.
    // 64-bit nonce = 8 bytes = 16 hex chars.
    // 1 hex value = 4 bits; 2 hex values = 1 byte.

    // Given a 256-bit key (64 hex chars), this 
    // creates a Uint8Array of size 32 (64 / 2),
    // e.g.,
    //      with 0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF,
    //      
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

/**
 * Initializes the ChaCha20 state matrix.
 * @param {Uint8Array} key The private key, to add to state.
 * @param {Uint8Array} nonce The random nonce, to add to state.
 * @returns {Uint32Array} The ChaCha20 state matrix.
 */
function initState(key, nonce)
{
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

    // 4x4 matrix of 16 32-bit words.
    const state = new Uint32Array(16) 

    // Add the nothing-up-my-sleeve constants,
    // "expand 32-byte K". These are the same
    // across all implementations of the program.
    // Little-endian order, lsb stored in lowest mem. address.
    state[0] = 0x65787061; // "expa"
    state[1] = 0x6E642033; // "nd 3"
    state[2] = 0x322D6279; // "2-by"
    state[3] = 0x7465206B; // "te k"
    postIntermediate("Initializing the State Matrix", ["\nAdd Constants (in 32-bit):", state[0], state[1], state[2], state[3]])

    // Add the key. The left shifts and bitwise ORs ensure that the final result
    // e.g.,
    //      with 0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF converted into
    //      1, 35, 69, 103, 137, 171, 205, 239, 1, 35, 69, 103, 137, 171, 205, 239, 1, 35, 69, 103,
    //      137, 171, 205, 239, 1, 35, 69, 103, 137, 171, 205, 239
    //
    //      the first group of 4 bytes (key[0] to key[3]) -> state[4]
    //      state[4] = (key[0]) | (key[1] << 8) | (key[2] << 16) | (key[3] << 24);
    //      state[4] = 0000 0001| 0010 0011 << 8| 0100 0101 << 16| 0100 0101 << 24
    //               = 0000 0001| 0010 0011 0000 0000 | 0100 0101 0000 0000 0000 0000 | etc.
    //               = 0110 0111 0100 0101 0010 0011 0000 0001 = 1732584193 = 0x67452301 
    //                 (which is first 4 bytes of 01234567...) in little-endian order.
    for (let i = 0; i < 8; i++)
    {
        state[4 + i] = (key[i * 4]) | (key[i * 4 + 1] << 8) | (key[i * 4 + 2] << 16) | (key[i * 4 + 3] << 24);
    }
    postIntermediate("Initializing the State Matrix", ["\nAdd Key (in 32-bit):", ...state.slice(4, 12)])

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

/**
 * Performs 20 rounds of ChaCha20.
 * @param {Uint8Array} state The ChaCha20 state matrix.
 * @param {Uint8Array} count The current block.
 */
function chacha20Block(state, count)
{
    postIntermediate(`ChaCha20 Block ${count + 1}`, ["\nBefore:", ...state])
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
    postIntermediate(`ChaCha20 Block ${count + 1}`, ["\nAfter:", ...state])
}

/**
 * Performs a quarter round of ChaCha20.
 * @param {Uint8Array} state The ChaCha20 state matrix.
 * @param {Uint8Array} a An element of state.
 * @param {Uint8Array} b An element of state.
 * @param {Uint8Array} c An element of state.
 * @param {Uint8Array} d An element of state.
 */
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

/**
 * Performs bitwise rotation.
 * @param {Uint8Array} val The value to shift.
 * @param {Uint8Array} shift The amount to shift by.
 */
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
/**
 * Retrieves HTML algorithm input
 * @returns {string} The private key.
 * @returns {string} The random nonce.
 * @returns {string} The message.
 */
function getElements( ) 
{
    const ids = ["key", "nonce", "message"] 
    return ids.map(id => document.getElementById(id).value)
}

/**
 * Posts intermediate algorithm ouptut.
 * @param {string} section The output heading.
 * @param {list} input The output to print.
 */
function postIntermediate(section, input)
{
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

/**
 * Posts final algorithm ouptut.
 * @param {string} preface The output preface.
 * @param {string} message The output to print.
 */
function postResults(preface, message)
{
    const newPre = document.createElement("pre");
    newPre.className = "output";
    newPre.id = "result";
    const resultsHeader = document.querySelector(".output_group h3:nth-of-type(2)");

    // Insert new <pre> element after final results header.
    newPre.innerText = `${preface}\n${message}`;
    resultsHeader.insertAdjacentElement("afterend", newPre);
}

/**
 * Clears all HTML output.
 */
function clearOutput( )
{
    document.querySelectorAll(".output_group pre").forEach
    (
        element => 
        {
            if(!element.classList.contains("placeholder"))
            {
                element.remove( );
            }
        }
    );
}

/**
 * Clears all HTML input.
 */
function clearInput( )
{
    document.querySelectorAll("textarea").forEach
    (
        textarea => 
        {
            textarea.value = "";
        }
    );
}