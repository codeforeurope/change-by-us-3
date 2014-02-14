# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

from changebyus.extensions import db
from flask import current_app as app
from flask_mongoutils import object_to_dict
from itertools import groupby
from mongoengine import Document, EmbeddedDocument
from mongoengine.queryset import QuerySet
from mongoengine.queryset.manager import queryset_manager
from types import ModuleType
import bson
from numbers import Number
import datetime



"""
.. module:: mixin

    :synopsis: Common Model Objects

    Timestamps and other auto-content to be mixed in with a MongoDB object, 
    and the pre_save routine that will populate them
"""

class EntityMixin(object):
    created_at = db.DateTimeField()
    updated_at = db.DateTimeField()
    
    def is_new(self):
        return True if self.id is None else False
    
    @classmethod    
    def pre_save(cls, sender, document, **kwargs):
        if not document.created_at:
            document.created_at = datetime.datetime.utcnow()
        document.updated_at = datetime.datetime.utcnow() 
        
    def as_dict(self, exclude_nulls=True, recursive=False, depth=1, **kwargs ):
        resp = object_to_dict(self, app=app,
                              exclude_nulls=exclude_nulls, 
                              recursive=recursive, 
                              depth=depth, 
                              **kwargs)
        return resp


class HasActiveEntityMixin(object):
    active = db.BooleanField(default=True)
    
    def is_active(self):
        return self.active


class FlaggableEntityMixin(object):
    flags = db.IntField(default=0)

    def is_flagged(self):
        return self.flags > 0
        
class LocationEnabledEntityMixin(object):
    location = db.StringField()

    # Geo JSON Field
    geo_location = db.PointField()    


def encode_model(obj=None, exclude_nulls=True, recursive=False, depth=1, **kwargs):
    """Take a Mongo (or other) object and return a JSON
     
        Args:
            obj: object to encode
            exclude_nulls: if a value is None, don't include it in the return set
            recursive: Descend into the referenced documents and return those objects.
                Keep in mind that recursive can be problematic since there's no depth!
            depth: recursion-depth. If 0, this is unlimited!
    
        KWargs:
            current_depth: for internal recursion
            use_derefs: whether to use deref_only and deref_exclude properties to filter dereferenced values
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
    elif isinstance(obj, Number):
        out = obj
    elif isinstance(obj, bson.DBRef):
        if recursive:
            # We have to do a bit of lazy-loading here because the 
            # Mixin needs to know about the model class to load
            # which we could not have told it about before, due to circular
            # references
            # We can do this every time because:
            #   "When Python imports a module, it first checks the module 
            #    registry (sys.modules) to see if the module is already imported"
            model = lazy_load_model_classes(obj.collection)
            Context = globals().get(model)
            
            if not Context:
                app.logger.error("Programming error! "
                                 "Missing Context (or import) for %s" % obj.collection)
                out = str(obj)
            else:
                try:
                    # Only apply the deref_* filters if requested
                    if kwargs.get('use_derefs'):
                        if hasattr(Context, 'deref_only'):
                            doc = Context.objects(id=obj.id).only(*Context.deref_only_fields).first()
                        elif hasattr(Context, 'deref_exclude'):
                            doc = Context.objects(id=obj.id).exclude(*Context.deref_exclude_fields).first()
                        else:
                            doc = Context.objects(id=obj.id).first()
                    else:
                        doc = Context.objects(id=obj.id).first()
                        
                    if not doc:
                        app.logger.error("Orphaned document: %s.id=%s" % (obj.collection, obj.id))
                        
                    if kwargs.get('current_depth') == depth:
                        if doc: doc = doc._data
                    
                    out = encode_model(obj=doc, recursive=recursive, depth=depth, **kwargs)
                except Exception as exc:
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

def lazy_load_model_classes(collection):
    """Lazily load modules as necessary"""
    # Ref: http://stackoverflow.com/questions/3372361/dynamic-loading-of-modules-then-using-from-x-import-on-loaded-module
    classname = ''.join([ x.capitalize() for x in collection.split('_') ])
    
    # No need to load if it's already present
    if classname in globals().keys():
        return classname
    
    MODEL_MAPPING = {'ProjectPost': 'post'}
    model_path = u"changebyus.%s.models" % (collection)
    # import all release models into (global) namespace
    try:
        exec("from %s import %s" % (model_path, classname)) in globals()
    except ImportError as exc:
        # Look to see if there's a model mapping somewhere?
        if MODEL_MAPPING.get(classname):
            exec("from %s import %s" % ('changebyus.%s.models' % MODEL_MAPPING.get(classname),
                                        classname)) in globals()
    except Exception as exc:
        app.logger.error("Exception lazy loading %s" % collection, exc_info=True)

    if classname not in globals().keys():
        app.logger.error("Programming error! "
                         "Missing Context (or import) for %s => %s."
                         "%s vs %s" % (collection, classname, globals().keys(), classname),
                         exc_info=True)

    return classname


