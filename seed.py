"""Utility file to seed business database from SF open data. See seed_yelp.py file for Yelp pull"""

##########################################################################
from sqlalchemy import func

from model import Business
from model import connect_to_db, db

from server import app

from datetime import datetime

# import pandas as pd #manipulate data for API
from sodapy import Socrata #pull data from API
import secret #access API key and params

# import ast #turn string into dictionary
# import json #turn string into dictionary

##########################################################################
# GET DATA FROM API - SF Open Data for businesses

#!/usr/bin/env python

# make sure to install these packages before running:
# pip install pandas
# pip install sodapy

# Unauthenticated client only works with public data sets. Note 'None'
# in place of application token, and no username or password:
# client = Socrata("data.sfgov.org", None)

# Example authenticated client (needed for non-public datasets):
client = Socrata("data.sfgov.org",
                 secret.param_sfdata['MyAppToken'],
                 username=secret.param_sfdata['username'],
                 password=secret.param_sfdata['password'])


# First 2000 results, returned as JSON from API / converted to Python list of
# dictionaries by sodapy.
# results = client.get("g8m3-pdis", limit = 250000)
#filter for food services 
results = client.get("g8m3-pdis", naic_code_description='Food Services', limit = 250000)


# # Convert to pandas DataFrame
# results_df = pd.DataFrame.from_records(results) 
# print(results)


##########################################################################
#FUNCTIONS TO HELP DETERMINE CONTENTS OF DATABASE

# get variables for columns in SQL table 
def get_column_names(results):
    variables = []

    for result in results:
        for x in result:
            if x not in variables:
                variables.append(x)
    return variables

# variables result
# variables = ['ttxid', 'certificate_number', 'ownership_name', 'dba_name', 'full_business_address', 'city', 'state', 'business_zip', 'dba_start_date', 'location_start_date', 'mailing_address_1', 'mail_city', 'mail_zipcode', 'mail_state', 'naic_code', 'naic_code_description', 'parking_tax', 'transient_occupancy_tax', 'location', ':@computed_region_bh8s_q3mv', 'supervisor_district', 'neighborhoods_analysis_boundaries', ':@computed_region_6qbp_sg9q', ':@computed_region_qgnn_b9vv', ':@computed_region_26cr_cadq', ':@computed_region_ajp5_b2md', ':@computed_region_yftq_j783', ':@computed_region_rxqg_mtj9', ':@computed_region_jx4q_fizf', ':@computed_region_fyvs_ahh9', ':@computed_region_p5aj_wyqh', 'location_end_date', 'dba_end_date', 'lic', 'lic_code_description', 'business_corridor']

def get_naic_code_descriptions(results):
    descriptions = []

    for result in results:
        if result.get('naic_code_description', None) not in descriptions:
            descriptions.append(result.get('naic_code_description', None))
    return descriptions

#['Manufacturing', 'Real Estate and Rental and Leasing Services', None, 'Construction', 'Retail Trade', 'Wholesale Trade', 'Administrative and Support Services', 'Private Education and Health Services', 'Professional, Scientific, and Technical Services', 'Food Services', 'Insurance', 'Certain Services', 'Arts, Entertainment, and Recreation', 'Financial Services', 'Information', 'Multiple', 'Transportation and Warehousing', 'Accommodations', 'Utilities']

def get_lic_code_descriptions(results):
    descriptions = []

    for result in results:
        if result.get('lic_code_description', None) not in descriptions:
            descriptions.append(result.get('lic_code_description', None))
    return descriptions


def get_business_by_letter(results, letter):
    businesses = []

    for result in results:
        if str(result.get('dba_name', None))[0].lower() == letter:
            businesses.append(result.get('dba_name', None))
    return businesses

def create_business_dictionary_by_category(results):
    businesses = {}

    #add keys, add values
    for result in results:
        businesses[result.get('naic_code_description', 'blank')] = businesses.get(result.get('naic_code_description', 'blank'), []) + [(result['dba_name'], result['dba_start_date'])]

    return businesses

#get search terms to use to pull data from Yelp API, get address for matching
def get_search_terms(results):
    businesses = {}

    #add keys, add values
    for result in results:
        if result.get('naic_code_description', None) == 'Food Services' and result.get('dba_end_date', None) == None and result.get('location_end_date', None) == None: 
            
            businesses[result.get('ttxid', None)] = {
                'full_business_address' : result.get('full_business_address', None),
                'dba_name' : result.get('dba_name', None),
                'dba_start_date' : result.get('dba_start_date', None)
            }

    return businesses

search_terms = get_search_terms(results) #send search terms to seed_yelp.py to pull results from API

#MVP 
#['Food Services']

#Other 
#['Retail Trade', 'Private Education and Health Services', 'Certain Services', 'Arts, Entertainment, and Recreation', 'Information']
#Retail Trade includes SB, honda, Toyota, etc
#arts - this is a low funded category
#certain services - salons, cleaning, cleaning
#'Private Education and Health Services' - therapy, dog training, therapists
#'Information' - businesses liek salesforce, pocketgems, zillow

##########################################################################
# LOAD SF OPEN DATA BUSINESS DATA INTO DATABASE 
def load_businesses():
    """Load SF business data to Business table"""
    print("Businesses")

    # Delete all rows in table, so if we need to run this a second time,
    # we won't be trying to add duplicate users
    Business.query.delete()

    # Insert API data
    for i, result in enumerate(results):
        #if description is 'Food Services' and there is no end date for business permit or location 
        if result.get('naic_code_description', None) == 'Food Services' and result.get('dba_end_date', None) == None and result.get('location_end_date', None) == None: 
            # print(result.get('naic_code_description', None)) #check that you're pulling food services as naic_code_description

            # asdfadf = result.get('location',{}).get('human_address', {})
            # print(asdfadf)

            business = Business(ttxid=result['ttxid'],
                                certificate_number=result.get('certificate_number', None),
                                ownership_name=result.get('ownership_name', None),
                                dba_name=shorten_dba_name(result.get('dba_name', None)),
                                full_business_address =result.get('full_business_address', None),
                                city=fix_city(result.get('city', None)),
                                state=result.get('state', None),
                                business_zip=result.get('business_zip', None),
                                dba_start_date=convert_date(result.get('dba_start_date', None)),
                                location_start_date=convert_date(result.get('location_start_date', None)),
                                dba_end_date=convert_date(result.get('dba_end_date', None)),
                                location_end_date=convert_date(result.get('location_end_date', None)),
                                naic_code=result.get('naic_code', None),
                                naic_code_description=result.get('naic_code_description', None),
                                lic=result.get('lic', None),
                                lic_code_description=result.get('lic_code_description', None),
                                location=str(result.get('location', None)),
                                longitude=result.get('location', {}).get('longitude', None),
                                latitude=result.get('location', {}).get('latitude', None),
                                # human_address_address=str(json.loads(result.get('location',{}).get('human_address', {})).get('address', None)),
                                # human_address_city=str(json.loads(result.get('location',{}).get('human_address', {})).get('address', None)), 
                                # human_address_zip=str(json.loads(result.get('location',{}).get('human_address', {})).get('address', None)), 
                                neighborhoods_analysis_boundaries=result.get('neighborhoods_analysis_boundaries', None),
                                business_corridor=result.get('business_corridor', None),
                                computed_region_6qbp_sg9q=result.get('computed_region_6qbp_sg9q', None))
            # We need to add to the session or it won't ever be stored
            db.session.add(business)
            print(i)

    # Once we're done, we should commit our work
    db.session.commit()


#manipulate data before putting into DB
def shorten_dba_name(name): 
    """Remove inc from names"""
    return name.replace("Inc", "").strip()

def fix_city(city): 
    """Remove + from city names"""
    return city.replace("+", " ").strip()

def convert_date(date):
    """Convert string date to date format"""
    if date != None:
        return datetime.strptime(date, '%Y-%m-%dT%H:%M:%S.%f')
    return None

#filter out non-SF zip codes 


#change string to dictionary
# def change_str_to_dict():
#     return ast.literal_eval(result.get('location',{}).get('human_address', {})).get('city')
#    json.loads(results[0].get('location',{}).get('human_address', {})).get('address', None)

##########################################################################

#NOTE THAT THESE VALUES WERE DELETED MANUALLY FROM THE TABLE
#SELECT dba_name, lic_code_description FROM businesses b WHERE lic_code_description = 'Fast Food Extablishment' OR lic_code_description = 'Employee Cafeterias W/o Food Prep' OR lic_code_description = 'Employee Cafeterias W/food Prep' OR lic_code_description = 'Stadium Concession' OR dba_name LIKE 'Peet%' OR dba_name LIKE '9%' OR dba_name LIKE '%Bldg' ORDER BY dba_start_date

#Remove lic_code_description LIKE 'School Cafeterias%'
#Remove lic_code_description LIKE 'Vending Machines'
#REMOVE dba_name = 'Aramark Rfs At Salesforce'

##########################################################################
if __name__ == "__main__":
    connect_to_db(app)

    # In case tables haven't been created, create them
    db.create_all()

    # Import different types of data
    load_businesses()
