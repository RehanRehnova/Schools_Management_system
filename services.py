from database import get_connection
import traceback



def roll_exists(class_name, roll_number):
    conn=get_connection()
    cursor=conn.cursor()
    cursor.execute("SELECT * FROM enrollments WHERE class_name = ? AND roll_number = ? AND status = ?", (class_name, roll_number, "active"))

    row= cursor.fetchone()
    conn.close()
    return row is not None

def get_enroll_id(class_name, roll_number):
    conn=get_connection()
    cursor=conn.cursor()
    id=cursor.execute("SELECT id FROM enrollments WHERE class_name = ? AND roll_number = ? ", (class_name, roll_number)).fetchone()
    conn.close

    enrollment_id=id[0]
    return enrollment_id


def get_student_id(class_name, roll_number):
    conn=get_connection()
    cursor=conn.cursor()
    id=cursor.execute("SELECT student_id FROM enrollments WHERE class_name = ? AND roll_number = ? ", (class_name, roll_number)).fetchone()
    conn.close
    if id==None:
        return False
    else:
        student_id=id[0]
        return student_id

def month(data, enroll_id):
    conn=get_connection()
    cursor=conn.cursor()
    enroll_id_value=f"{enroll_id}"
    last_data=cursor.execute("SELECT month, dues FROM fee_records WHERE enrollment_id =? ORDER BY id DESC LIMIT 1", (enroll_id_value)).fetchone()
    if last_data==None:
        return "New entry"
    return dict(last_data)
    


def add_enrollments(data, id):

    conn=get_connection()
    cursor=conn.cursor()

    cursor.execute("""
        INSERT INTO enrollments (student_id, class_name, section, roll_number, total_fee, status, session_year)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
        id,
        data.get("class_name"),
        data.get("section"),
        data.get("roll_number"),
        data.get("total_fee"),
        "active",
        data.get("session")
        ))

    conn.commit()
    conn.close()

    return True

    




def add_student(data):


    if roll_exists(data.get("class_name"), data.get("roll_number")):
        return {"success": False, "message": "Roll already exists"}, 400
    else:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
        INSERT INTO students_record (full_name, father_name, dob, gender, b_form,  photo, contact, address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
        data["name"],
        data.get("father"),
        data["dob"],
        data.get("gender"),
        data.get("bform"),
        data.get("profile_image"),
        data.get("phone"),
        data.get("address")
        ))
       

        conn.commit()
        conn.close()

        id=cursor.lastrowid

        enrollments_details_add= add_enrollments(data, id)

        return {"success": True, "message": "Student added successfully"}, 200
  


def get_students(class_name):


    conn = get_connection()
    cursor = conn.cursor()
    students_data= cursor.execute("""
    SELECT
    sr.full_name,
    sr.father_name,
    sr.dob,
    sr.b_form,
    sr.gender,
    sr.photo,
    sr.contact,
    sr.address,
    e.section,
    e.roll_number,
    e.class_name
    FROM enrollments e
    INNER JOIN students_record sr
    ON e.student_id = sr.id
    WHERE e.class_name = ?""", (class_name,)).fetchall()
    conn.close()
    return [dict(row) for row in students_data]

def get_student(class_name, roll_number):
    conn = get_connection()
    cursor = conn.cursor()
    students_data= cursor.execute("""
    SELECT
    sr.full_name,
    sr.father_name,
    sr.dob,
    sr.gender,
    e.section,
    e.roll_number,
    e.class_name
    FROM enrollments e
    INNER JOIN students_record sr
    ON e.student_id = sr.id
    WHERE e.class_name = ? AND roll_number=?""", (class_name, roll_number)).fetchall()
    conn.close()

    return [dict(row) for row in students_data]


def delete_student(class_name, roll_number):

    id = get_student_id(class_name, roll_number)
    
    if not id:
        return False
    
    
    id_value=str(id)
    conn=get_connection()
    try:
        cursor=conn.cursor()
        cursor.execute("DELETE FROM enrollments WHERE student_id=?", (id_value))
        cursor.execute("DELETE FROM students_record WHERE id=?", (id_value))
        conn.commit()
    except Exception as e:
        conn.rollback()
        return "ERROR", e
    finally:
        affected_rows=cursor.rowcount

        conn.close()
    return affected_rows > 0



def update_student(class_name, roll_number, data):


    conn = get_connection()
    cursor = conn.cursor()

    # existence check
    student_check= roll_exists(class_name, roll_number)
    if student_check ==None:
        return "student not found", 404

    student_id=get_student_id(class_name, roll_number)
   
    cursor.execute(" BEGIN TRANSACTION;")
                   
    cursor.execute("""UPDATE students_record
                   SET full_name=?, father_name=?, dob=?, gender=?, photo=? WHERE id=?""", (data.get('name'), data.get('father'), data.get('dob'), data.get('gender'), data.get('profile_image'), student_id))

    cursor.execute("""UPDATE enrollments
                   SET section=?  WHERE student_id=?""", (data.get('section'), student_id))
    
    
    conn.commit()
        
    conn.close()

    return {"success": "Student updated"}

# fee management functions 


# =============================================================
# -------------------Advanced Fee System---------------------
# =============================================================

# def get_due(data, id):

#     class_name= data.get("class_name")
#     roll_number = data.get("roll_number")
#     month =data.get("month")
#     conn=get_connection()
#     cursor=conn.cursor()
    
#     total_fee=cursor.execute("SELECT total_fee FROM enrollments WHERE class_name = ? AND roll_number= ?", (class_name, roll_number)).fetchone()
#     enrollment_id=cursor.execute("SELECT id FROM enrollments WHERE class_name = ? AND roll_number= ?", (class_name, roll_number)).fetchone()
#     enrollment_id_value=enrollment_id[0]
#     paid_fee = cursor.execute("SELECT SUM(amount) FROM fee_records WHERE enrollment_id= ? AND month =?", (enrollment_id_value, month,)).fetchone()
    
#     if paid_fee[0]==None:
#         paid_fee=0
#         dues=total_fee[0]-paid_fee
      
#         cursor.execute("""
#             UPDATE fee_records SET dues = ? WHERE id = ?
#             """, (dues,id))
#         conn.commit()
#         conn.close()
#         return dues
#     else:
#         dues=total_fee[0]-paid_fee[0]
        
#         cursor.execute("""
#             UPDATE fee_records SET dues = ? WHERE id = ?
#                        """, (dues,id))
#         conn.commit()
#         conn.close()
#         return dues




# def add_fee(data):

#     exist = roll_exists(data.get("class_name"), data.get("roll_number"))
#     if exist == False:
#         return False
#     else:
#         conn = get_connection()
#         cursor = conn.cursor()
#         enroll_id= get_enroll_id(data.get("class_name"), data.get("roll_number"))
        
#         month_check= cursor.execute("""SELECT SUM(amount) FROM fee_records WHERE enrollment_id = ? AND month =?""", (enroll_id, data.get("month"))).fetchone()
#         if month_check[0] is None:
#             total_fee=cursor.execute("SELECT total_fee FROM enrollments WHERE class_name = ? AND roll_number= ?", (data.get("class_name"), data.get("roll_number"))).fetchone()
#             last_due= month(data, enroll_id)
#             if last_due=="New entry":
#                 current_due=int(total_fee[0])
#             else:
#                 current_due=int(last_due["dues"])+int(total_fee[0])
                
            
#             dues_with_payment=current_due- int(data.get("amount"))
#             method="cash"
#             cursor.execute("""
#                 INSERT INTO fee_records (enrollment_id,  amount, month, paid_on, method, dues)
#                 VALUES (?, ?, ?, ?, ?, ?)
#             """, (
#             enroll_id,
#             data.get("amount"),
#             data["month"],
#             data.get("paid_on"),
#             method,
#             dues_with_payment
#             ))
#             conn.commit()
#             conn.close()
#         else:
        
#             method="cash"
#             cursor.execute("""
#                 INSERT INTO fee_records (enrollment_id,  amount, month, paid_on, method)
#                 VALUES (?, ?, ?, ?, ?)
#             """, (
#             enroll_id,
#             data.get("amount"),
#             data["month"],
#             data.get("paid_on"),
#             method
#             ))
        
#             id=cursor.lastrowid
        
#             conn.commit()
#             conn.close()
#             get_due(data, id)
        
        
#         return "okay", 200

# =============================================================
# -------------------End of Advance fee system----------------
# =============================================================



# =============================================================
# -------------------Basic  fee system----------------
# =============================================================

def add_fee_basic(data):
     
    roll_check = roll_exists(data.get("class_name"), data.get("roll_number"))
    if roll_check == False:
        return False
    else:
        conn = get_connection()
        cursor = conn.cursor()
        enroll_id= get_enroll_id(data.get("class_name"), data.get("roll_number"))

        query="""
                 INSERT INTO fee_records (enrollment_id,  amount, month, paid_on, method, dues)
                 VALUES (?, ?, ?, ?, ?, ?)
             """
        cursor.execute(query, (
            enroll_id,
            data.get("amount"),
            data["month"],
            data.get("paid_on"),
            data.get("method"),
            data["dues"]
            ))
        
        conn.commit()
        conn.close()
        
        
        return "okay", 200

# =============================================================
# ----------------End of Basic  fee system----------------
# =============================================================




    # ---------------------------------

    # fee details fetch

def fee_details(data):

    conn=get_connection()
    cursor=conn.cursor()
    rollnumber=data.get('roll_number')
    class_=data.get('class_name')
    month=data.get('month')
    enroll_id=get_enroll_id(class_, rollnumber)
    student_id= get_student_id(class_, rollnumber)

    student_fee_data=cursor.execute("""
            SELECT 
                s.full_name, 
                e.class_name,
                e.roll_number, 
                f.month,
                f.paid_on,
                f.amount, 
                f.dues, 
                f.method 
                FROM fee_records f JOIN enrollments e ON e.id=f.enrollment_id JOIN students_record s ON s.id = e.student_id WHERE  f.enrollment_id=? AND f.month=?
            """, (enroll_id, month)).fetchall()
     
    conn.commit()
    conn.close
    if data==None:
        return "Not found", False

    return [dict(row) for row in student_fee_data]


def fee_report(data):

    conn=get_connection()
    cursor=conn.cursor()

    class_name = data.get("class_name")
    roll_number = data.get("roll_number")
    month = data.get("month")


    has_class=bool(class_name)
    has_roll=bool(roll_number)
    has_month=bool(month)

   

   

    if has_class and not has_month and not has_roll:
        query = """
        SELECT 
            sr.full_name AS full_name,
            e.roll_number,
            f.month,
            SUM(f.amount) AS amount,
            e.total_fee,
            (SELECT f2.dues
            FROM fee_records f2
            WHERE f2.enrollment_id=f.enrollment_id
            AND f2.month=f.month
            ORDER BY f2.id DESC
            LIMIT 1) AS dues
        FROM fee_records f
        JOIN enrollments e 
            ON e.id = f.enrollment_id
        JOIN students_record sr
            ON sr.id = e.student_id
        WHERE e.class_name=?
        GROUP BY e.roll_number, f.month
        ORDER BY e.roll_number, f.month
    """
        cursor.execute(query, (class_name,))
         

    if has_roll and has_class and not has_month:
        query = """
        SELECT 
    sr.full_name,
    e.roll_number,
    e.class_name,
    f.month,
    SUM(f.amount) AS total_paid,
    e.total_fee,
    last_dues.dues
FROM fee_records f

JOIN enrollments e 
    ON e.id = f.enrollment_id

JOIN students_record sr
    ON sr.id = e.student_id

JOIN (
    SELECT 
        enrollment_id,
        month,
        dues
    FROM fee_records fr1
    WHERE fr1.id = (
        SELECT MAX(fr2.id)
        FROM fee_records fr2
        WHERE fr2.enrollment_id = fr1.enrollment_id
        AND fr2.month = fr1.month
    )
) AS last_dues
ON last_dues.enrollment_id = f.enrollment_id
AND last_dues.month = f.month

WHERE e.class_name = ?
AND e.roll_number = ?

GROUP BY 
    sr.full_name,
    e.roll_number,
    f.month,
    e.total_fee,
    last_dues.dues

ORDER BY f.month;
    """
        cursor.execute(query, (class_name, roll_number))
         
    if has_month and has_class and not has_roll:
        query = """
        
SELECT
    sr.full_name AS name,
    e.roll_number AS roll,
    e.total_fee AS fee,
    COALESCE(SUM(f.amount), 0) AS amount,
    (e.total_fee - COALESCE(SUM(f.amount), 0)) AS dues,
    'general_mode' AS mode

FROM enrollments e
JOIN students_record sr ON sr.id = e.student_id
LEFT JOIN fee_records f 
    ON f.enrollment_id = e.id
    AND f.month = ?

WHERE e.class_name = ?
GROUP BY e.id
    """ 
        cursor.execute(query, (month,  class_name))


    if has_month and has_class and has_roll:
        query = """
       SELECT 
    sr.full_name AS name,
    sr.photo AS picture,
    e.roll_number AS roll_no,
    e.class_name AS class,
    f.month,
    COALESCE(f.amount, 0) AS amount,
    f.paid_on AS date,
    e.total_fee AS fee,

    COALESCE(
        (
            SELECT f2.dues
            FROM fee_records f2
            WHERE f2.enrollment_id = e.id
              AND f2.month = ?
            ORDER BY f2.id DESC
            LIMIT 1
        ),
        e.total_fee
    ) AS dues,

    'student_view' AS mode

FROM enrollments e
JOIN students_record sr 
    ON sr.id = e.student_id

LEFT JOIN fee_records f
    ON f.enrollment_id = e.id
    AND f.month = ?

WHERE e.class_name = ?
  AND e.roll_number = ?
    """ 
        cursor.execute(query, ( month, month, class_name, roll_number))
    

  

    results = cursor.fetchall()

    return [dict(row) for row in results]


# ======================== 

def run_query():
    conn=get_connection()
    cursor=conn.cursor()
    query = """
  CREATE TABLE enrollments(
                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                   student_id INTEGER NOT NULL,
                   class_name TEXT NOT NULL,
                   roll_number INTEGER NOT NULL,
                   section TEXT,
                   session_year TEXT NOT NULL,
                   status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'left')),
                   created_at DATE DEFAULT (DATE('now')), total_fee INTEGER NOT NULL DEFAULT 0,
                   FOREIGN KEY (student_id)
                   REFERENCES students_record(id)
                   );
CREATE UNIQUE INDEX uq_class_roll_session
                   ON enrollments (class_name, roll_number, session_year)
;
CREATE UNIQUE INDEX uq_active_class_roll
                   ON enrollments (class_name, roll_number)
                   WHERE status='active'
    """
    cursor.execute(query)
    conn.commit()
    conn.close()    

    
if __name__=="__main__":
    result = fee_report({"class_name": "9", "roll_number": "124"})
    print(result)



