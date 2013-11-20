import string
import hashlib
import random

import re
from unidecode import unidecode

bool_strings = ['true', '1', 't', 'y', 'on']

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


_punct_re = re.compile(r'[\t !"#$%&\'()*\-/<=>?@\[\\\]^_`{|},.]+')

def slugify(text, delim=u'-'):
    """Generates an ASCII-only slug."""
    result = []
    for word in _punct_re.split(text.lower()):
        result.extend(unidecode(word).split())

    return unicode(delim.join(result))