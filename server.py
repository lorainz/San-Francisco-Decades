"""Old Business Ratings."""

from jinja2 import StrictUndefined

from flask import (Flask, render_template, redirect, request, flash, session, jsonify)
from flask_debugtoolbar import DebugToolbarExtension

from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.orm.exc import MultipleResultsFound

from model import Business, Review, User, Like, connect_to_db, db
from secret import app_key

import json
import re
from random import randrange


app = Flask(__name__)
# Required to use Flask sessions and the debug toolbar
app.secret_key = app_key
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False
# Normally, if you use an undefined variable in Jinja2, it fails
# silently. This is horrible. Fix this so that, instead, it raises an
# error.
app.jinja_env.undefined = StrictUndefined


@app.route('/', methods=['GET', 'POST'])
def index():
    """Homepage."""

    return render_template("homepage-react.html")

@app.route('/inputs') 
def inputs(): 
    search = request.args.get('decade')
    start = search + '-01-01'
    end = str(int(search) + 10) + '-01-01'
    print(end)

    result = (db.session
        .query(
        Business.ttxid, 
        Business.dba_name, 
        Business.dba_start_date, 
        Business.location_start_date, 
        Business.neighborhoods_analysis_boundaries, 
        Review.name, 
        Review.image_url, 
        Review.url, Review.
        review_count, 
        Review.categories, 
        Review.rating, 
        Review.price,
        Business.longitude,
        Business.latitude,
        Review.longitude,
        Review.latitude
        )
        .join(Review)
        .filter(
        Business.dba_start_date > start, 
        Business.dba_start_date < end)
        .order_by(Business.dba_start_date)
        .all()
    )

    businesses = convert_list_to_dict(result)

    # return str(businesses)
    return jsonify(businesses)

@app.route('/random') 
def random(): 

    all_ids = (db.session.query(Review.ttxid).all())
    # print(len(all_ids), all_ids[len(all_ids)-1][0])

    random_idx = randrange(len(all_ids))
    random_ttxid = all_ids[random_idx][0]

    result = (db.session
        .query(
        Business.ttxid, 
        Business.dba_name, 
        Business.dba_start_date, 
        Business.location_start_date, 
        Business.neighborhoods_analysis_boundaries, 
        Review.name, 
        Review.image_url, 
        Review.url, Review.
        review_count, 
        Review.categories, 
        Review.rating, 
        Review.price,
        Business.longitude,
        Business.latitude,
        Review.longitude,
        Review.latitude
        )
        .join(Review)
        .filter(
        Business.ttxid == random_ttxid, 
        )
        .order_by(Business.dba_start_date)
        .all()
    )

    businesses = convert_list_to_dict(result)

    # return str(businesses)
    return jsonify(businesses)

# @app.route('/categories') 
# def categories(): 
#     result = (db.session.query(Review.categories).all())

#     categories = []
#     for r in result:
#         for i in r:
#             sub_categories = i.split(",")
#             for sub_category in sub_categories:
#                 if sub_category.strip() not in categories and sub_category.strip() != "":
#                     categories.append(sub_category.strip())

#     return jsonify(sorted(categories))

#convert query result list into a dictionary
def convert_list_to_dict(result):
    new_dict = {}

    for i, item in enumerate(result):

        coordinates = coalesce(result[i][12], 
                                result[i][13],
                                result[i][14],
                                result[i][15])

        if result[i][10] == None:
            rating_score = 0
        else:
            rating_score = result[i][10]

        new_dict[i] = {
            'ttxid': result[i][0],
            'dba_name': result[i][1],
            'dba_start_date': result[i][2].year,
            'location_start_date': result[i][3].year,
            'neighborhoods_analysis_boundaries': result[i][4],
            'name': result[i][5],
            'image_url': result[i][6],
            'url': result[i][7],
            'review_count': result[i][8],
            'categories': result[i][9],
            'rating': float(rating_score),
            'price': result[i][11],
            'coordinates': coordinates 
        }


        # if new_dict['image_url'] == None:
        #     new_dict['url'] = '/static/img/imagenotfound.png'
    
    return new_dict;

# coalesce for longitude results 
def coalesce(longitude1, latitude1, longitude2, latitude2):
    if longitude1:
        return [float(longitude1), float(latitude1)]
    elif longitude2:
        return [float(longitude2), float(latitude2)]
    else:
        return [None, None]

# @app.route('/login', methods=['GET', 'POST'])
# def login():
#     """Log in user"""
#     email = request.form.get('email')
#     password = request.form.get('password')

#     registered_user = User.query.filter(User.email == email).first()
#     # print(registered_user.email, registered_user.password, registered_user.user_id)

#     if session['user_id'] != None:
#         flash('You\'re already logged in')
#     else:
#         if registered_user != None: 
#             if registered_user.email == email and registered_user.password == password:
#                 session['user_id'] = registered_user.user_id
#                 print(session['user_id'])
#                 flash('You\'re logged in')
#         else:
#             flash('Log in information did not match')

#     return redirect('/')

# @app.route('/register', methods=['GET', 'POST'])
# def register():
#     """Register user"""

#     email = request.form.get('email')
#     password = request.form.get('password')
#     zipcode = request.form.get('zipcode')
#     print("email", email)

#     registered_user = User.query.filter(User.email == email).first()
#     print(registered_user, email)

#     if email == None:
#         return render_template('registration.html')
#     elif not validate_inputs(email, password, zipcode):
#         if not validate_email(email):
#             flash("Please enter valid email address.")
#         if not validate_password(password):
#             flash("Please enter valid password.")
#         if not validate_zipcode(zipcode):
#             flash("Please enter valid zip code.")
#         return render_template('registration.html')
#     elif registered_user != None:
#         flash("You've already registered. Please log in")
#         return redirect('/')
#     else:
#         register_user(email, password, zipcode)
#         return redirect('/')

#     return render_template('registration.html')


# def validate_inputs(email, password, zipcode):
#     return validate_email(email) and validate_password(password) and validate_zipcode(zipcode)

# def validate_email(email):
#     return "@" in email and email[-4:] == ".com" and not email.isspace()

# def validate_password(password):
#     return not password.isspace()

# def validate_zipcode(zipcode):
#     return len(zipcode) == 5 and zipcode.isdigit()

# def register_user(email, password, zipcode):
#     new_user = User(email=email, password=password, zipcode=zipcode)
#     db.session.add(new_user)
#     flash("Registration success")
#     db.session.commit()


if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the
    # point that we invoke the DebugToolbarExtension
    app.debug = True
    # make sure templates, etc. are not cached in debug mode
    app.jinja_env.auto_reload = app.debug

    connect_to_db(app)

    # Use the DebugToolbar
    DebugToolbarExtension(app)

    app.run(port=5000, host='0.0.0.0')
