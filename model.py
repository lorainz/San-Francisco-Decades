"""Models and database functions for Hackbright project."""

from flask_sqlalchemy import SQLAlchemy

# This is the connection to the PostgreSQL database; we're getting this through
# the Flask-SQLAlchemy helper library. On this, we can find the `session`
# object, where we do most of our interactions (like committing, etc.)
db = SQLAlchemy()

##############################################################################
# Model definitions

class Business(db.Model):
    """Businesses pulled from SF Open Data."""

    __tablename__ = "businesses"

    ttxid = db.Column(db.String(64), 
                        primary_key=True)
    certificate_number = db.Column(db.String(), 
                        nullable=True)
    ownership_name = db.Column(db.String(), 
                        nullable=True)
    dba_name = db.Column(db.String(), 
                        nullable=True)
    full_business_address = db.Column(db.String(), 
                        nullable=True)
    city = db.Column(db.String(), 
                        nullable=True)
    state = db.Column(db.String(), 
                        nullable=True)
    business_zip = db.Column(db.String(), 
                        nullable=True)
    dba_start_date = db.Column(db.DateTime(), 
                        nullable=True)
    location_start_date = db.Column(db.DateTime(), 
                        nullable=True)
    dba_end_date = db.Column(db.DateTime(), 
                        nullable=True)
    location_end_date = db.Column(db.DateTime(), 
                        nullable=True)
    naic_code = db.Column(db.String(), 
                        nullable=True)
    naic_code_description = db.Column(db.String(), 
                        nullable=True)
    lic = db.Column(db.String(), 
                        nullable=True)
    lic_code_description = db.Column(db.String(), 
                        nullable=True)
    location = db.Column(db.Text(), 
                        nullable=True)
    longitude = db.Column(db.Numeric(9,6), 
                        nullable=True)
    latitude = db.Column(db.Numeric(9,6), 
                        nullable=True)
    # human_address_address = db.Column(db.Text(), 
    #                     nullable=True)
    # human_address_city = db.Column(db.Text(), 
    #                     nullable=True)
    # human_address_zip = db.Column(db.Text(), 
    #                     nullable=True)
    neighborhoods_analysis_boundaries = db.Column(db.String(), 
                        nullable=True)
    business_corridor = db.Column(db.String(), 
                        nullable=True)
    computed_region_6qbp_sg9q = db.Column(db.String(), 
                        nullable=True)

    def __repr__(self):
        """Provide helpful representation when printed."""
        return f"Business: {self.dba_name}, Date: {self.dba_start_date}, Neighborhood: {self.neighborhoods_analysis_boundaries}, Description: {self.lic_code_description}"


##############################################################################

class Review(db.Model):
    """User of ratings website."""

    __tablename__ = "reviews"

    review_result_id = db.Column(db.Integer, autoincrement=True, 
                    primary_key=True)
    yelp_id = db.Column(db.String(64), 
                        nullable=False)
    ttxid = db.Column(db.String(64), 
                        db.ForeignKey('businesses.ttxid'), #foreign key
                        nullable=True)
    alias = db.Column(db.String(), 
                        nullable=True)
    name = db.Column(db.String(), 
                        nullable=True)
    image_url = db.Column(db.String(), 
                        nullable=True)
    url = db.Column(db.String(), 
                        nullable=True)
    review_count = db.Column(db.Integer(), 
                        nullable=True)
    categories = db.Column(db.Text(), 
                        nullable=True)
    rating = db.Column(db.Numeric(2,1), 
                        nullable=True)
    coordinates = db.Column(db.Text(), 
                        nullable=True)
    longitude = db.Column(db.Numeric(9,6), 
                        nullable=True)
    latitude = db.Column(db.Numeric(9,6), 
                        nullable=True)
    transactions = db.Column(db.Text(), 
                        nullable=True)
    price = db.Column(db.String(), 
                        nullable=True)
    location = db.Column(db.Text(), 
                        nullable=True)
    address = db.Column(db.Text(), 
                        nullable=True)
    phone = db.Column(db.String(),
                        nullable=True)
    search_result = db.Column(db.Text(),
                        nullable=True)

    #define relationship to business
    business = db.relationship("Business", 
                            backref=db.backref("reviews", 
                                        order_by=ttxid))

    def __repr__(self):
        """Provide helpful representation when printed."""
        return f"<business name={self.name} address={self.location}>"

##############################################################################

class User(db.Model):
    """User of website."""

    __tablename__ = "users"

    user_id = db.Column(db.Integer, 
                        autoincrement=True,
                        primary_key=True)
    email = db.Column(db.String(64), 
                        nullable=False)
    password = db.Column(db.String(64), 
                        nullable=False)
    # age = db.Column(db.Integer, 
    #                     nullable=True)
    # zipcode = db.Column(db.String(5), 
    #                     nullable=False)

    def __repr__(self):
        """Provide helpful representation when printed."""
        return f"<User user_id={self.user_id} email={self.email}>"

class Like(db.Model):
    """Like for business by users"""

    __tablename__ = "likes"

    like_id = db.Column(db.Integer, 
                            autoincrement=True, 
                            primary_key=True)
    user_id = db.Column(db.Integer, 
                            db.ForeignKey('users.user_id'), #foreign key
                            nullable=False)
    ttxid = db.Column(db.String(64), 
                            db.ForeignKey('businesses.ttxid'), #foreign key
                            nullable=False)

    #define relationship to likes
    business = db.relationship("Business", 
                            backref=db.backref("likes", 
                                        order_by=user_id))
    user = db.relationship("User", 
                            backref=db.backref("likes", 
                                        order_by=user_id))

    def __repr__(self):
        """Provide helpful representation when printed."""
        return f"<like_id={self.like_id} user_id={self.user_id} ttxid={self.ttxid}>"


##############################################################################
# Helper functions

def connect_to_db(app):
    """Connect the database to our Flask app."""

    # Configure to use our PstgreSQL database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///businesses'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.app = app
    db.init_app(app)


if __name__ == "__main__":
    # As a convenience, if we run this module interactively, it will leave
    # you in a state of being able to work with the database directly.

    from server import app
    connect_to_db(app)
    print("Connected to DB.")
