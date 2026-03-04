from database import get_connection

def test():
    conn=get_connection()
    cursor=conn.cursor()
    cursor.execute("SELECT 1 FROM students WHERE class_name = ? AND roll_number = ? ", (13, 123))

    row= cursor.fetchone() is not None
    conn.close()
    return row
print(test())