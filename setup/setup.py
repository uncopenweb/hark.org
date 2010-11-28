import sys
import pymongo
import json
import optparse
try:
    import pymongo.objectid
except ImportError:
    pass

def newId():
    return str(pymongo.objectid.ObjectId())

def insert(collection, item):
    if '_id' not in item:
        item['_id'] = newId()
    collection.insert(item, safe=True)

def main():
    parser = optparse.OptionParser(usage='usage: %prog [options] mongohost mongoport jsonfile')
    parser.add_option("-r", "--reset", dest="reset", action='store_true', default=False,
        help="reset Admin collections (irreversible!)")
    (options, args) = parser.parse_args()
    if len(args) != 3:
        parser.error('you must provide 3 arguments')
        
    fn = args[2]

    conn = pymongo.Connection(args[0], port=int(args[1]))
    db = conn['harkhome']
    collections = db.collection_names()
    if options.reset or 'games' not in collections:
        db.drop_collection('games')
        g = db['games']
        data = json.load(file(fn))
        for item in data['items']:
            insert(g, item)
    else:
        print 'not overwriting games'

main()