

def db_list_to_dict_list(l, **kwargs):
    """
    ABOUT
        Convert a list of database objects into their .as_dict objects
    INPUT
        List of mongodb database objects
    OUTPUT 
        List of python dictionary objects
    """

    dict_list = []
    for db_item in l:
        try:
            dict_list.append( db_item.as_dict(**kwargs) )
        except AttributeError:
            print "Oops!  not valid"

    return dict_list