# -*- coding: utf-8 -*-
"""
=================
Encryption Module
=================
A module supporting basic 2-way encryption functionality using the AES algorithm.  
----------------------------------------------------------------------------------

It is assumed that keys are assembled via bitwise XOR from a local and remote key, 
though this is not strictly necessary.  Also, it is assumed that any string that is 
saved (key or encrypted text) is base-64 encoded.
"""

from base64 import b64encode, b64decode
from Crypto.Cipher import AES
from urllib2 import urlopen

# default values
BLOCKSIZE = 32
PAD = u'\u0000'

def pad_string(s, blocksize = BLOCKSIZE, pad = PAD):
    """
    ABOUT
        Right-pad string out to appropriate size.
    """
    return s + (blocksize - len(s) % blocksize) * pad

def aes_encrypt(s, key, iv, mode = AES.MODE_CBC):
    """
    ABOUT
        Returns base-64-encoded, AES encrypted string.
    """

    if s is None: 
        return None
    cipher = AES.new(key, mode, iv)
    
    return b64encode(cipher.encrypt(pad_string(s)))
    
def aes_decrypt(s, key, iv, mode = AES.MODE_CBC, pad = PAD):
    """
    ABOUT
        Accepts base-64-encoded, AES encrypted string and returns 
        decoded, decrypted string.
    """

    if s is None:
        return None
    cipher = AES.new(key, mode, iv)
    
    return cipher.decrypt(b64decode(s)).rstrip(pad)
    
def string_xor(s1, s2):
    """
    ABOUT
        Perform bitwise XOR on 2 strings.
    """
    o1 = [ord(c) for c in s1]
    o2 = [ord(c) for c in s2]
    
    s = ("").join(chr(x ^ y) for (x,y) in zip(o1, o2))
    
    return s
    
def assemble_key(local_key, remote_key_url):
    """
    ABOUT
        Takes a base64-encoded key and an url to a file containing another 
        base64-encoded key and performs a bitwise xor operation on them to 
        create the final key.
    """
    k1 = b64decode(local_key)
    k2 = b64decode(urlopen(remote_key_url).read().strip())
    
    k = string_xor(k1, k2)
    
    return k
