import os
import sys
import sqlite3


def resource_path(relative_path):
    
    if hasattr(sys, '_MEIPASS'):
        base = sys._MEIPASS
        
    else:
        base = os.path.dirname(os.path.abspath(__file__))
    
    return os.path.join(base, relative_path)

def get_db_path():
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(os.path.dirname(sys.executable),"school.db")
    else:
        return os.path.join(os.path.dirname(os.path.abspath(__file__)), "school.db")

DB_PATH = get_db_path()


def get_connection():
    conn=sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn
