# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

"""
.. module:: mongotools

    :synopsis: A toolset for interfacing with mongoengine

"""

def db_list_to_dict_list(l, **kwargs):
    """Convert a list of database objects into their .as_dict objects
    
        Args:
            l: List of mongodb database objects
    
        Returns:
            List of python dictionary objects
    """

    dict_list = []
    for db_item in l:
        try:
            dict_list.append( db_item.as_dict(**kwargs) )
        except AttributeError:
            print "Oops!  not valid"

    return dict_list