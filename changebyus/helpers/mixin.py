# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from datetime import datetime

from ..extensions import db
from .encryption import *
from flask import current_app


"""
====================
Common Model Objects
====================

Timestamps to be mixed in with a MongoDB object, and the pre_save
routine that will populate them

"""

class EntityMixin(object):
    created_at = db.DateTimeField()
    updated_at = db.DateTimeField()
    
    def is_new(self):
        return True if self.id is None else False
    
    @classmethod    
    def pre_save(cls, sender, document, **kwargs):
        if not document.created_at:
            document.created_at = datetime.utcnow()
        document.updated_at = datetime.utcnow() 
        
    def as_dict(self, exclude_nulls=True, recursive=False, depth=1, **kwargs ):
        resp = encode_model(self, exclude_nulls=True, recursive=False, depth=1, **kwargs)
        return resp
    

def encode_model(obj=None, exclude_nulls=True, recursive=False, depth=1, **kwargs):
    """Take a Mongo (or other) object and return a JSON
     
    :param obj: object to encode
    :param exclude_nulls: if a value is None, don't include it in the return set
    :param recursive: Descend into the referenced documents and return those objects.
        Keep in mind that recursive can be problematic since there's no depth!
    :param depth: recursion-depth. If 0, this is unlimited!
    
    kwargs:
        current_depth: for internal recursion
    """
    if (  kwargs.get('current_depth') is not None and
          kwargs.get('current_depth') > 0 and
          kwargs.get('current_depth') >= depth and 
          recursive is True ):
        recursive = False
    else:
        if kwargs.get('current_depth') is None: 
            kwargs['current_depth'] = 0
        kwargs['current_depth'] = kwargs.get('current_depth') + 1

    # Dynamic keys to pass up the recursion stack
    if kwargs.get('delete_keys') is None: 
        kwargs['delete_keys'] = []

    # insert the objects private fields into delete keys
    if hasattr(a, 'PRIVATE_FIELDS'):
        kwargs['delete_keys'] += obj.PRIVATE_FIELDS
      
    if obj is None:
        return obj
    
    if isinstance(obj, (Document, EmbeddedDocument)):
        out = dict(obj._data)
        for k,v in out.items():
            if isinstance(v, bson.ObjectId):
                if k is None:
                    out['id'] = str(v)
                    kwargs['delete_keys'].append(k)
                else:
                    # Unlikely since ObjectId's key is always None
                    out[k] = str(v)
            else:
                # No further processing necessary for some values
                if exclude_nulls and v is None:
                    kwargs['delete_keys'].append(k)
                else:
                    if isinstance(v, (str, unicode, float, int)):
                        out[k] = v
                    else:
                        out[k] = encode_model(v, recursive=recursive, 
                                              depth=depth, **kwargs)
                    
        # To avoid breaking loop flow, do at the end of looping
        for delkey in kwargs.get('delete_keys'):
            # double check that we're not deleting a non-empty key
            if ( delkey in out.keys() and 
                 ((out.get(delkey) is None) or (delkey is None)) ):
                del(out[delkey])
        # Remove our tracker for the next loop
        if kwargs.get('delete_keys'): kwargs['delete_keys'] = []
                    
    elif isinstance(obj, QuerySet):
        # out = encode_model(list(obj), recursive=recursive, **kwargs)
        # if recursive:
        #    obj = DeReference()(obj)
            
        out = [encode_model(item, recursive=recursive, depth=depth, **kwargs) 
               for item in obj]
    elif isinstance(obj, ModuleType):
        out = None
    elif isinstance(obj, groupby):
        out = [ (g,list(l)) for g,l in obj ]
    elif isinstance(obj, (list)):
        # GeoPointField is also a list!
        out = [encode_model(item, recursive=recursive, depth=depth, **kwargs) 
               for item in obj]
    elif isinstance(obj, (dict)):
        out = dict([(k,encode_model(v, recursive=recursive, depth=depth, **kwargs)) 
                    for (k,v) in obj.items()])
    elif isinstance(obj, bson.ObjectId):
        # out = {'ObjectId':str(obj)}
        out = str(obj)
    elif isinstance(obj, (str, unicode)):
        out = obj
    elif isinstance(obj, (datetime.datetime)):
        out = str(obj)
    elif isinstance(obj, (bool, int, float, long)):
        out = obj
    elif isinstance(obj, bson.DBRef):
        if recursive:
            # If we recurse deep enough, we don't have access to the model object
            # so we need to look it up in the globals.
            #
            # WARN: This means we assume that all models have been imported 
            Context = globals().get(''.join([x.capitalize() 
                                             for x in obj.collection.split('_')]))
            try:
                if kwargs.get('current_depth') == depth:
                    doc = Context.objects(id=obj.id).first()
                    if doc: doc = doc._data
                else:    
                    doc = Context.objects(id=obj.id).first()
                out = encode_model(obj=doc, recursive=False, depth=depth, **kwargs)
            except Exception:
                app.logger.error('Vars: context=%s, id=%s, depth=%s' % 
                                 (str(obj.collection), str(obj.id), depth),
                                 exc_info=True)
                out = str(obj)
        else:
            out = {'collection': obj.collection, 'id': str(obj.id)}

    else:
        app.logger.debug("Could not JSON-encode type '%s': %s" % 
                         (type(obj), str(obj)))
        out = str(obj)
        
    return out


def handle_initial_encryption(document, encrypted_fields):

    if current_app.config['ENCRYPTION']['ENABLED']:

        for key in encrypted_fields:
            if hasattr(document, key):
                field = getattr(document, key)
                field = aes_encrypt(field, 
                                    current_app.config['ENCRYPTION']['KEY'], 
                                    current_app.config['ENCRYPTION']['IV'])
                setattr(document, key, field)

def handle_update_encryption(document, encrypted_fields):
    if current_app.config['ENCRYPTION']['ENABLED']:

        for key in encrypted_fields:
            if hasattr(document, key):
                if key in document.__dict__['_changed_fields']:
                    field = getattr(document, key)
                    field = aes_encrypt(field, 
                                        current_app.config['ENCRYPTION']['KEY'], 
                                        current_app.config['ENCRYPTION']['IV'])
                    setattr(document, key, field)                        

def handle_decryption(document, encrypted_fields):
    if current_app.config['ENCRYPTION']['ENABLED']:

        # only decrypted saved docs
        if document.id is not None:

            for key in encrypted_fields:
                if hasattr(document, key):
                    field = getattr(document, key)
                    field = aes_decrypt(field, 
                                        current_app.config['ENCRYPTION']['KEY'], 
                                        current_app.config['ENCRYPTION']['IV'])
                    setattr(document, key, field)
