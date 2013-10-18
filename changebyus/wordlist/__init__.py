# define keys
BLACKLIST = "blacklist"
GRAYLIST = "graylist"

# TODO this goes in the model
wordlists = {BLACKLIST: ['shit', 'fuck', 'twat', 'cunt', 'blowjob', 'buttplug', 
                         'dildo', 'felching', 'fudgepacker', 'jizz', 'smegma', 
                         'clitoris', 'asshole', 'bullshit', 'bullshitter', 
                         'bullshitters', 'bullshitting', 'chickenshit', 
                         'chickenshits', 'clit', 'cockhead', 'cocksuck', 
                         'cocksucker', 'cocksucking', 'cum', 'cumming', 'cums', 
                         'cunt', 'cuntree', 'cuntry', 'cunts', 'dipshit', 
                         'dipshits', 'dumbfuck', 'dumbfucks', 'dumbshit', 
                         'dumbshits', 'fuck', 'fucka', 'fucke', 'fucked', 
                         'fucken', 'fucker', 'fuckers', 'fuckface', 'fuckhead', 
                         'fuckheads', 'fuckhed', 'fuckin', 'fucking', 'fucks', 
                         'fuckup', 'fuckups', 'kunt', 'kuntree', 'kuntry', 'kunts', 
                         'motherfuck', 'motherfucken', 'motherfucker', 'motherfuckers', 
                         'motherfuckin', 'motherfucking', 'shit', 'shitface', 
                         'shitfaced', 'shithead', 'shitheads', 'shithed', 'shits', 
                         'shitting', 'shitty'],
             GRAYLIST: ['ass', 'jerk']}

def get_word_conditions(s, full_words_only=True, strip_punctuation=True):
    """
    Handles multiple lists of words and returns a list of which lists are 
    matched in the string argument.
    """
    conditions = []

    if (strip_punctuation):
        from string import punctuation
        s = s.translate(None, punctuation)
        
    if (full_words_only):
        s = s.split()
    
    print(s)
    
    for k,v in wordlists.iteritems():
        if any(word in s for word in v):
            conditions.append(k)
            
    return conditions


## TODO this needs to go into mongo helpers or mixins or something.
def filter_model(model, fields):
    """
    Merges all fields being checked in the model into one string
    and performs wordlist check.
    """
    s = ""
    
    for f in fields:
        s += " " + getattr(model, f)
        
    conditions = get_word_conditions(s)
    
    if (BLACKLIST in conditions):
        model.active = False
        model.flags += 1
        
    if (GRAYLIST in conditions):
        model.flags += 1
