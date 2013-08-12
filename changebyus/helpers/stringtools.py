import string
import hashlib


bool_strings = ['true', '1', 't', 'y']

def string_generator(size=6, chars=string.ascii_uppercase + string.digits):
    """
    ABOUT
        Routine that generates a random string of a certain size
    INPUT
        size, base characters
    OUTPUT
        random string
    """
    return ''.join(random.choice(chars) for x in range(size))


def hash_string(s):
    """
    ABOUT
        Needs to be documented.
        I believe this is not used and can be removed.
    """
    sha1 = hashlib.sha1()
    sha1.update(s)
    return sha1.hexdigest()