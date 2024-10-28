# Information Security II Project 
# TEAM - Richard Olu-Jordan, Arian Goudar, Rumaysa Jafer, Ian Kelly
# Python 3.14
# Started Oct 6, 2024


'''
Quarter_Round 
Input - an array (list?) of 4 32 bit words
Output - an array of 4 32 bit words
Purpose - QR is supposed to scramble a given row or column of the salsa20 
        state array of 16 words
'''
def Quarter_round(A,B,C,D):
    
    # takes 4 32 bit words and returns 4 32 bit words

    '''
    b ^= (a + d) <<<  7;
    c ^= (b + a) <<<  9;
    d ^= (c + b) <<< 13;
    a ^= (d + c) <<< 18;

    or 

    y1 = x1 XOR ((x0 + x3) <<< 7)
    y2 = x2 XOR ((y1 + x0) <<< 9)
    y3 = x3 XOR ((y2 + y1) <<< 13)
    y0 = x0 XOR ((y3 + y2) <<< 18)
    '''
    #a + b is defined as a + b mod 2^32


'''
Round 
Input - Salsa 20 state array, round number(int)
Output - Salsa 20 state array
Purpose - Round is supposed to call all the needed quarter rounds for each round of scrambling 
        it needs the round number to decide if it will scramble rows or columns
'''
def round(array, roundNum):
    #define initial state (plaintext block)
    #iterate through message and encode each 64 bit block
    #there are 20 rounds,
    # for even numbered rounds, call quarter round on rows and on 
    # odd number rounds, call it on columns


    #State array is organized like this:
    # [ 1] [ 2] [ 3] [ 4]
    # [ 5] [ 6] [ 7] [ 8]
    # [ 9] [10] [11] [12]
    # [13] [14] [15] [16]

    '''
    // Odd round
    QR( 0,  4,  8, 12) // column 1
    QR( 5,  9, 13,  1) // column 2
    QR(10, 14,  2,  6) // column 3
    QR(15,  3,  7, 11) // column 4
    // Even round
    QR( 0,  1,  2,  3) // row 1
    QR( 5,  6,  7,  4) // row 2
    QR(10, 11,  8,  9) // row 3
    QR(15, 12, 13, 14) // row 4
    '''

'''
Salsa_enc
Input - plaintext string 
Output - cipher text string
Purpose - salsa_enc is the manager for the encryption. it will handle breaking 
            the plaintext into blocks, initiating each round of scrambling and collecting the 
            output of the XORs between scrambled and plaintext blocks
'''
def Salsa_enc():
    # for each 64 bit block in the plaintext
        # call round for each round() to scramble the block in a certian way 
            # after 20 rounds, we XOR the scrambled block with the PT block and get the Ciphertext block
        #X OR the scrambled block with the input plaintext block 
        # append the ciphertext to the output array
    #create an output string from the output array 
    #return output
    '''
    something something code magic
    '''  

'''
Salsa_dec
Input   - cipher text string
Output  - plain text string
Purpose - salsa_dec is the manager for the decryption. it will handle breaking
        the ciphertext into blocks, initiating each round of scrambling and collecting the
        output of the XORs between scrambled and ciphertext blocks
'''
def Salsa_dec():
    #not sure how this works yet
    '''
    gotta put someting here so the code doesnt get mad 
    '''


### MAIN ###
#plaintext = input("Enter your plaintext: ")

# call salsa on the plaintext - 
# ciphertext = salsa (plaintext, key)

# print(ciphertext)
