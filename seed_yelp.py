"""Utility file to seed business database from Yelp API, see seed.py for SF open data"""

from sqlalchemy import func

from model import Business, Review
from model import connect_to_db, db

from server import app

from datetime import datetime

# import ast #turn string into dictionary
# import json

from seed import search_terms #import seach terms dictionary from seed.py / SF open data to search for in Yelp API

import requests 
import secret

##########################################################################
# Create sample data for yelp data matching

def create_review_dictionary(search_terms, search_keys):
    """Search for dba_name in the Yelp API and add the result to the dictionary"""

    print("creating dictionary")

    #for every key
    for ttxid in search_keys[0:4900]:
        dba_name = search_terms[ttxid]['dba_name']
        full_business_address = search_terms[ttxid]['full_business_address']
        search_result = search_yelp_api(dba_name, full_business_address)

        # print(search_result)
        #if there's no result, value is None for yelp_id and result key
        if search_result.get('businesses', []) == []:
            search_terms[ttxid]['yelp_id'] = None
            search_terms[ttxid]['result'] = None
        #if there is a result, yelp_id is the first result key of the first business in the list and result is the full result dictionary
        else:
            search_terms[ttxid]['yelp_id'] = search_result['businesses'][0]['id'] # use the first business id to search result, temporary solution
            search_terms[ttxid]['result'] = search_result
            print(ttxid, "found result")

    print("done creating dictionary")
    #returns dictionary to be used to added to Reviews table
    return search_terms

def search_yelp_api(term, location): #term = business name
    """search yelp api for result by location = San Francisco, and dba_name from searcH_terms"""
    secret.yelp_params['term'] = term
    # secret.yelp_params['location'] = location #use if the name search does not work well w/ only SF location and not full adddress

    response = requests.get('https://api.yelp.com/v3/businesses/search', headers=secret.yelp_headers, params=secret.yelp_params)
    data = response.json()
    return data

# search_yelp_api('Naked Chicken', '601 Mission Bay Blvd') # test


def load_matching_businesses(search_terms_result):
    """Load Yelp business data to Review table"""

    # print("delete last review table")
    Review.query.delete()

    print("loading businesses")
    for ttxid in search_terms_result:
        print(ttxid, "started loading")
        #if 'result' is None or does not exist and business is an empty list [] or does not exist
        if search_terms_result[ttxid].get('result', None) != None:
            if search_terms_result[ttxid].get('result', {}).get('businesses', []) != []: 
                #if the yelp address1 is not None
                if search_terms_result[ttxid]['result']['businesses'][0].get('location', {}).get('address1', None) != None:
                #if the db address matches the yelp result address 
                    if search_terms_result[ttxid].get('full_business_address', 'oiokkokhh').lower() == search_terms_result[ttxid]['result']['businesses'][0].get('location', {}).get('address1', 'asdfasdfadfaerwerda').lower():

                        review = Review(yelp_id=search_terms_result[ttxid]['result']['businesses'][0].get('id', None),
                                        ttxid=ttxid,
                                        alias=search_terms_result[ttxid]['result']['businesses'][0].get('alias', None),
                                        name=search_terms_result[ttxid]['result']['businesses'][0].get('name', None),
                                        image_url=search_terms_result[ttxid]['result']['businesses'][0].get('image_url', None),
                                        url=search_terms_result[ttxid]['result']['businesses'][0].get('url', None),
                                        review_count=search_terms_result[ttxid]['result']['businesses'][0].get('review_count', None),
                                        categories=str(search_terms_result[ttxid]['result']['businesses'][0].get('categories', None)),
                                        rating=search_terms_result[ttxid]['result']['businesses'][0].get('rating', None),
                                        coordinates=str(search_terms_result[ttxid]['result']['businesses'][0].get('coordinates', None)),
                                        longitude=search_terms_result[ttxid]['result']['businesses'][0].get('coordinates', None).get('longitude', None),
                                        latitude=search_terms_result[ttxid]['result']['businesses'][0].get('coordinates', None).get('latitude', None),
                                        transactions=str(search_terms_result[ttxid]['result']['businesses'][0].get('transactions', None)),
                                        price=search_terms_result[ttxid]['result']['businesses'][0].get('price', None),
                                        location=str(search_terms_result[ttxid]['result']['businesses'][0].get('location', None)),
                                        address=str(search_terms_result[ttxid]['result']['businesses'][0].get('location', {}).get('address1', None)),
                                        phone=search_terms_result[ttxid]['result']['businesses'][0].get('phone', None)
                                        # search_result=xx
                                        )
                        #dict_keys(['id', 'alias', 'name', 'image_url', 'is_closed', 'url', 'review_count', 'categories', 'rating', 'coordinates', 'transactions', 'price', 'location', 'phone', 'display_phone', 'distance'])

                        print(ttxid, "loaded")
                        
                        # We need to add to the session or it won't ever be stored
                        db.session.add(review)
                        print(ttxid, "added to db")

    # Once we're done, we should commit our work
    db.session.commit()
    print("done loading businesses")



#simplified 
search_keys = list(search_terms.keys())
search_term_results =create_review_dictionary(search_terms, search_keys)

##########################################################################
if __name__ == "__main__":
    connect_to_db(app)

    # In case tables haven't been created, create them
    db.create_all()

    # Import different types of data
    load_matching_businesses(create_review_dictionary(search_terms, list(search_terms.keys())))
