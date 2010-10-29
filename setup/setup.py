import sys
import pymongo
import json
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
    try:
        fn = sys.argv[1]
    except IndexError:
        print 'usage: setup.py [json file]'
        return

    conn = pymongo.Connection('localhost', port=27000)
    db = conn['harkhome']
    db.drop_collection('games')
    g = db['games']
    data = json.load(file(fn))
    for item in data['items']:
        insert(g, item)

main()