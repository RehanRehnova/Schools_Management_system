import os
import sys
import sqlite3

def get_db_path():
	if getattr(sys, 'frozen', False):
		return os.path.join(os.path.dirname(sys.executable), "school.db")
	else:
		return os.path.join(os.path.dirname(os.path.abspath(__file__)), "school.db")



DB_PATH = get_db_path()


def get_connection():
    conn=sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn
