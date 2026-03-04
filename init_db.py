from database import get_connection
from flask import jsonify

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    print()
if __name__ == "__main__":
        init_db()
