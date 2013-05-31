/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License

----------
Modified by Óscar de Arriba adding the function 
for convert a WordArray to an ArrayBuffer object.
----------
*/
(function () {
    // Check if typed arrays are supported
    if (typeof ArrayBuffer != 'function') {
        return;
    }

    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;

    // Reference original init
    var superInit = WordArray.init;

    // Augment WordArray.init to handle typed arrays
    var subInit = WordArray.init = function (typedArray) {
        // Convert buffers to uint8
        if (typedArray instanceof ArrayBuffer) {
            typedArray = new Uint8Array(typedArray);
        }

        // Convert other array views to uint8
        if (
            typedArray instanceof Int8Array ||
            typedArray instanceof Uint8ClampedArray ||
            typedArray instanceof Int16Array ||
            typedArray instanceof Uint16Array ||
            typedArray instanceof Int32Array ||
            typedArray instanceof Uint32Array ||
            typedArray instanceof Float32Array ||
            typedArray instanceof Float64Array
        ) {
            typedArray = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
        }

        // Handle Uint8Array
        if (typedArray instanceof Uint8Array) {
            // Shortcut
            var typedArrayByteLength = typedArray.byteLength;

            // Extract bytes
            var words = [];
            for (var i = 0; i < typedArrayByteLength; i++) {
                words[i >>> 2] |= typedArray[i] << (24 - (i % 4) * 8);
            }

            // Initialize this word array
            superInit.call(this, words, typedArrayByteLength);
        } else {
            // Else call normal init
            superInit.apply(this, arguments);
        }
    };

    subInit.prototype = WordArray;

    var toArrayBuffer = WordArray.toArrayBuffer = function () {
        var view = new Int8Array(this.sigBytes);

        // Bonary moves to conver 32-bit words to bytes
        for (var n_word = 0; n_word < this.words.length; n_word++){
            word = this.words[n_word]

            var byte_3 = (word >>> 24);
            var byte_2 = (word >>> 16) - (byte_3 << 8);
            var byte_1 = (word >>> 8) - (byte_3 << 16) - (byte_2 << 8);
            var byte_0 = (word) - (byte_3 << 24) - (byte_2 << 16) - (byte_1 << 8);

            // Add them to the ArrayBuffer
            view[n_word*4] = byte_3;
            view[n_word*4+1] = byte_2;
            view[n_word*4+2] = byte_1;
            view[n_word*4+3] = byte_0;

        }

        // Return to the caller :)
        return view.buffer;
    };

    toArrayBuffer.prototype = WordArray;
}());
