function runChaCha20() {
    const key = document.getElementById("key").value;
    const nonce = document.getElementById("nonce").value;
    const message = document.getElementById("message").value;

    const outputElement = document.getElementById("output");
    outputElement.innerText = `Key: ${key}\nNonce: ${nonce}\nMessage: ${message}\n(ChaCha20 result goes here)`;
}
