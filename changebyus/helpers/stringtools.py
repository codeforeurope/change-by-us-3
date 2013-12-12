# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

import string
import hashlib
import random

import re
from unidecode import unidecode

"""
.. module:: stringtools

    :synopsis: Set of string tools

"""

bool_strings = ['true', '1', 't', 'y', 'on']

def string_generator(size=6, chars=string.ascii_uppercase + string.digits):
    """Routine that generates a random string of a certain size
    
        Args:
            size: the size of the string to generate
            chars: set of base characters to work from
    
        Returns:
            random string
    """
    return ''.join(random.choice(chars) for x in range(size))


def hash_string(s):
    """Needs documentation
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