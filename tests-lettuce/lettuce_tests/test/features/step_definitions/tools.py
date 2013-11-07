import random
import datetime
import time
import string

def string_generator(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for x in range(size))

def email_generator():
    email = string_generator(2) + '@' + timestamp_generator() + '.com'
    return email

def password_generator(size=5):
    return string_generator(size)

def timestamp_generator():
    tm = time.gmtime()
    return str(tm.tm_mon) + '.' + str(tm.tm_mday) + '.' + str(tm.tm_min) + '.' + str(tm.tm_sec)

def name_generator():
    return string_generator(2) + '-' + timestamp_generator()

def text_generator(size):

    base = 'Aenean a lorem ante. Praesent blandit ullamcorper odio, sit amet blandit tellus feugiat id. In vehicula lorem at augue lacinia ultricies. Quisque sed ante diam, eget eleifend nulla. Maecenas dolor felis, feugiat eleifend placerat non, sodales vitae velit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nullam ac augue sem. Cras in massa sem. Aenean commodo metus quis nunc vehicula tristique. Nulla non tellus metus, a sagittis lacus. Maecenas justo turpis, cursus eget imperdiet eu, semper non quam. Duis tristique eros a turpis pulvinar id viverra nulla scelerisque. '

    result = ''
    while len(result) < size-2:
        adding = min( len(base), size - len(result) )
        result += base [0:adding]

    result += 'd.'

    return result

def unicode_generator():
    return unichr(random.choice((0x300, 0x2000)) + random.randint(0, 0xff)) + unichr(random.choice((0x300, 0x2000)) + random.randint(0, 0xff)) + unichr(random.choice((0x300, 0x2000)) + random.randint(0, 0xff)) + unichr(random.choice((0x300, 0x2000)) + random.randint(0, 0xff)) + unichr(random.choice((0x300, 0x2000)) + random.randint(0, 0xff)) + unichr(random.choice((0x300, 0x2000)) + random.randint(0, 0xff)) + unichr(random.choice((0x300, 0x2000)) + random.randint(0, 0xff)) + unichr(random.choice((0x300, 0x2000)) + random.randint(0, 0xff)) + unichr(random.choice((0x300, 0x2000)) + random.randint(0, 0xff)) + unichr(random.choice((0x300, 0x2000)) + random.randint(0, 0xff))

def unicode_email_generator():
    email = unicode_generator() + '@' + unicode_generator() + '.com'
    return email