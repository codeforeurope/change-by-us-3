"""
TODOS
* make text search optional
* create some wrappers
"""
from math import radians, cos, sin, asin, sqrt

EARTH_RADIUS_MI = 3961
EARTH_RADIUS_KM = 6363


def search(db,
           collection,
           text,
           geo_field = None,
           geo_center = None,
           geo_dist = None,
           addl_filters = None,
           fields = None,
           units = 'km'):
    is_geo = False

    if (geo_field and geo_center and geo_dist):
        geo_center = map(float, geo_center)
        geo_dist = float(geo_dist)
        is_geo = True

    project = _build_projection(fields)
    filters = _build_filters(geo_field, geo_center, geo_dist,
                             addl_filters, units)

    search_data = db.command("text",
                             collection,
                             search = text,
                             project = project,
                             filter = filters)
    data = {}

    for x in search_data['results']:
        id = str(x['obj']['_id'])
        data[id] = {k: str(v) for k, v in x['obj'].iteritems()}
        data[id]['score'] = x['score']

        if (is_geo):
            data[id]['dist'] = haversine(geo_center[0], geo_center[1],
                                         x['obj']['geo_location']['coordinates'][0],
                                         x['obj']['geo_location']['coordinates'][1],
                                         units)

    return data


def _build_filters(geo_field = None,
                   geo_center = None,
                   geo_dist = None,
                   addl_filters = None,
                   units = 'km'):
    filters = {}

    if (geo_field and geo_center and geo_dist):
        radius = EARTH_RADIUS_KM if (units == 'km') else EARTH_RADIUS_MI
        filters[geo_field + '.coordinates'] = {
                                              "$geoWithin":
                                                    {
                                                    "$centerSphere":
                                                        [geo_center, geo_dist/radius]
                                                    }
                                               }

    if (addl_filters):
        filters.update(addl_filters)

    return filters


def _build_projection(fields):
    """
    Takes field list and builds projection dictionary
    """
    return {f: 1 for f in fields} if fields else None


def haversine(lon1, lat1, lon2, lat2, units = 'km'):
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees) and return
    value in km or mi.
    """
    # convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    # haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))

    if (units == 'mi'):
        return EARTH_RADIUS_MI * c
    else:
        return EARTH_RADIUS_KM * c
