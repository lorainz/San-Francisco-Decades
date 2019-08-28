"""Old Business Ratings."""

from jinja2 import StrictUndefined

from flask import (Flask, render_template, redirect, request, flash, session, jsonify)
from flask_debugtoolbar import DebugToolbarExtension

from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.orm.exc import MultipleResultsFound
from sqlalchemy import func #user func.lower for queries

from model import Business, Review, User, Like, connect_to_db, db
from secret import app_key

import json
import re
from random import randrange


app = Flask(__name__)

# Required to use Flask sessions and the debug toolbar
app.secret_key = app_key
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False
# Normally, if you use an undefined variable in Jinja2, it fails silently. This is horrible. Fix this so that, instead, it raises an error.
app.jinja_env.undefined = StrictUndefined


@app.route('/', methods=['GET', 'POST'])
def index():
    """Homepage."""
    return render_template("homepage-react.html")

@app.route('/inputs') 
def inputs(): 
    """Generates results for restaurants by decade. Results rendered in Decade Selector."""
    
    #Decade
    decade = request.args.get('decade') 
    start = None
    end = None
    if decade != None:
        start = decade + '-01-01'
        end = str(int(decade) + 10) + '-01-01'

    #Category
    category = request.args.get('category')

    #Search Term
    search_term = request.args.get('searchterm')
    if search_term != None:
        search_term = search_term.strip().lower()
    # print(end)

    #Decade without categories
    if search_term != None:
        print(search_term)
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
            func.lower(Review.name).like(f'%{search_term}%'))
            .order_by(Business.dba_start_date)
            .all()
            ) 
        print("search")
    elif category != None:
        # print(category)
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
            Business.dba_start_date < end,
            Review.categories.like(f'%{category}%'))
            .order_by(Business.dba_start_date)
            .all()
        ) 
        print("category")
    elif decade != None:
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
        print("decade")
    else:
        print("none")
        return None
    #Decade with categories
    
    
    print(result)
    print(category, decade, search_term)


    businesses = convert_list_to_dict(result)

    # return str(businesses)
    return jsonify(businesses)

@app.route('/random') 
def random(): 
    """Generates a random result by:
    Query database for list of all ttxids/restaurants. 
    Select a random integer from range 0 to total number of ttxids/restaurants.
    Find ttxid at index of random integer and query the database for restaurant details. 
    Results rendered in Random Generator."""

    #list of all ttxid
    all_ids = (db.session.query(Review.ttxid).all())
    # print(len(all_ids), all_ids[len(all_ids)-1][0])

    #select a random restaurant using randrange for 0 to total # of ttxid queried above
    random_idx = randrange(len(all_ids))
    random_ttxid = all_ids[random_idx][0]

    #query for select restaurant details
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
        Review.ttxid==random_ttxid)
        .order_by(Business.dba_start_date)
        .all()
    )

    #convert to format for front-end use
    businesses = convert_one_to_dict(result)

    # return str(businesses)
    return jsonify(businesses)

@app.route('/categories') 
def categories(): 
    """Generates a random result by:
    Query database for list of all ttxids/restaurants. 
    Select a random integer from range 0 to total number of ttxids/restaurants.
    Find ttxid at index of random integer and query the database for restaurant details. 
    Results rendered in Random Generator."""
    search = request.args.get('decade') 
    # search = '2010'
    start = search + '-01-01'
    end = str(int(search) + 10) + '-01-01'
    
    result = (db.session.query(Review.categories).join(Business)
        .filter(
        Business.dba_start_date > start, 
        Business.dba_start_date < end).all())


    #     result = (db.session
    #     .query(
    #     Business.ttxid, 
    #     Business.dba_name, 
    #     Business.dba_start_date, 
    #     Business.location_start_date, 
    #     Business.neighborhoods_analysis_boundaries, 
    #     Review.name, 
    #     Review.image_url, 
    #     Review.url, Review.
    #     review_count, 
    #     Review.categories, 
    #     Review.rating, 
    #     Review.price,
    #     Business.longitude,
    #     Business.latitude,
    #     Review.longitude,
    #     Review.latitude
    #     )
        
    #     .order_by(Business.dba_start_date)
    #     .all()
    # )

    categories = []
    for r in result:
        for i in r:
            sub_categories = i.split(",")
            for sub_category in sub_categories:
                if sub_category.strip() not in categories and sub_category.strip() != "":
                    categories.append(sub_category.strip())

    return jsonify(sorted(categories))

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

        if result[i][6] == "" or result[i][6] == None:
            img_url = './static/img/imagenotfound.png'
        else:
            img_url = result[i][6]

        new_dict[i] = {
            'ttxid': result[i][0],
            'dba_name': result[i][1],
            'dba_start_date': result[i][2].year,
            'location_start_date': result[i][3].year,
            'neighborhoods_analysis_boundaries': result[i][4],
            'name': result[i][5],
            'image_url': img_url,
            'url': result[i][7],
            'review_count': result[i][8],
            'categories': result[i][9],
            'rating': float(rating_score),
            'price': result[i][11],
            'coordinates': coordinates 
        }

    return new_dict;

def convert_one_to_dict(result):
    new_dict = {}

    coordinates = coalesce(result[0][12], 
                            result[0][13],
                            result[0][14],
                            result[0][15])

    if result[0][10] == None:
        rating_score = 0
    else:
        rating_score = result[0][10]

    new_dict["0"] = {
        'ttxid': result[0][0],
        'dba_name': result[0][1],
        'dba_start_date': result[0][2].year,
        'location_start_date': result[0][3].year,
        'neighborhoods_analysis_boundaries': result[0][4],
        'name': result[0][5],
        'image_url': result[0][6],
        'url': result[0][7],
        'review_count': result[0][8],
        'categories': result[0][9],
        'rating': float(rating_score),
        'price': result[0][11],
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

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Log in user"""
    if request.method == "POST":
            # print('GET EMAIL AND PASSWORD')
            # print(request.data); # returns byte string literal
            response = request.json
            print(response); # json
            email = request.json['email']
            password = request.json['password']
            print(email, password)

    registered_user = User.query.filter(User.email == email).first()
    print(registered_user.email, registered_user.user_id, email)

    if session.get('user_id', None) != None:
        # flash('You\'re already logged in')
        return jsonify({
            'user_id': session['user_id'], 
            'logged_in': True,
            'message': 'You\'re already logged in',
            'email': registered_user.email
        })
    else:
        if registered_user == None: 
            flash('User not found. Please register.')
        else: 
            if registered_user.email == email and registered_user.password == password:

                session['user_id'] = registered_user.user_id
                print("Logged in " + str(session['user_id']))
                # return jsonify(
                #     [session['user_id'], 
                #     True]
                # )
                return jsonify({
                    'user_id': session['user_id'], 
                    'logged_in': True,
                    'message': 'Successful login!',
                    'email': registered_user.email
                })

    return jsonify([None, False])

@app.route('/logout')
def logout():
    """Log out user"""

    session.clear()
    print(session)
    return jsonify({
        'user_id': session.get('user_id', None), 
        'logged_in': False,
        'email': None
    })


    return jsonify([None, False])

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Register user"""
    # if request.method == "GET":
    #     email = request.form.get('email')
    #     password = request.form.get('password')

    if request.method == "POST":
        # print('GET EMAIL AND PASSWORD')
        # print(request.data); # returns byte string literal
        response = request.json
        print(response); # json
        email = request.json['email']
        password = request.json['password']
        print(email, password)

    registered_user = User.query.filter(User.email == email).first()
    print(registered_user, email)

    if registered_user == None:
        register_user(email, password)
        return jsonify([True, "Registration success. Please proceed to login page.", email, password])
    elif email == registered_user.email and  password == registered_user.password:
        # flash("Email already in use. Please log in.")
        return jsonify([True, "Email already in use. Please log in.", email, password])
        
    # return jsonify(response)


def register_user(email, password):
    new_user = User(email=email, password=password)
    db.session.add(new_user)
    # flash("Registration success. Please log in.")
    db.session.commit()
    print(email + "SUCCESS")

@app.route('/addUserLike', methods=['GET', 'POST'])
def addUserLike():
    """Add user like"""
    # if request.method == "GET":
    #     email = request.form.get('email')
    #     password = request.form.get('password')

    if request.method == "POST":
        # print('GET USERID AND TTXID')
        # print(request.data); # returns byte string literal
        response = request.json
        user_id = request.json['userid']
        ttxid = request.json['ttxid']

        print("response: ", response); # json
        print("inputs: ", user_id, ttxid)

    user_like = Like.query.filter(Like.user_id == user_id, Like.ttxid == ttxid).first()
    print("verify not in database: ", user_like)

    if user_like == None:
        add_user_like(user_id, ttxid)
        return jsonify({
            'liked': True
        })
    else:
        # flash("Email already in use. Please log in.")
        return jsonify({
            'liked': False
        })
        
    # return jsonify(response)


def add_user_like(user_id, ttxid):
    new_user_like = Like(user_id=user_id, ttxid=ttxid)
    db.session.add(new_user_like)
    # flash("Registration success. Please log in.")
    db.session.commit()
    print(str(user_id) + " " + ttxid + "SUCCESS")

@app.route('/getUserLikes') 
def getUserLikes(): 
    """Get user like."""
    #Decade
    user_id = request.args.get('userid') 

    # user_likes = Like.query.filter(Like.user_id == user_id).all()
    likes = (db.session
            .query(Like.ttxid)
            .filter(Like.user_id == user_id)
            .all()
            ) 

    list_ttxid = get_list_like_restaurants(likes)
    # print(user_id)
    # print(likes)
    # print("New_dict", list_ttxid)

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
        Business.ttxid.in_(list_ttxid))
        .order_by(Business.dba_start_date)
        .all()
    )

    businesses = convert_list_to_dict(result)
    # print(businesses)
    
    return jsonify(businesses)

def get_list_like_restaurants(likes):
    new_list = []
    for ttxid in likes:
        new_list.append(ttxid[0])

    return new_list;


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
