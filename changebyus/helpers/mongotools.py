
def swap_null_id(d):
    """
    ABOUT
        For some reason mongodb objects have their object id set to the None key.
        This will switch it into the 'id' key
    INPUT
        Mongodb object
    OUTPUT
        Mongodb object with it's id set to the 'id' key and the None key removed
    """
    if None in d and 'id' not in d:
        d['id'] = d[None]
        del d[None]


def db_list_to_dict_list(l):
    """
    ABOUT
        Convert a list of database objects into their .as_dict objects
    INPUT
        List of mongodb database objects
    OUTPUT 
        List of python dictionary objects
    """

    dict_list = []
    for db_item in db_list:
        dict_list.append( db_item.as_dict())

    return dict_list