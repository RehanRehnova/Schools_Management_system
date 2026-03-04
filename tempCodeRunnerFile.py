from db_testing import get_connection

def get_enroll_id():
    conn=get_connection()
    cursor=conn.cursor()
    enrollment_id=cursor.execute("""SELECT 
    e.roll_number,
    e.class_name,
    sr.full_name AS student_name,
    COALESCE(SUM(f.amount), 0) AS total_paid,
    e.total_fee,
    COALESCE(MAX(f.dues), e.total_fee) AS current_dues,
    ? AS month
FROM enrollments e
JOIN students_record sr ON sr.id = e.student_id
LEFT JOIN fee_records f 
    ON f.enrollment_id = e.id AND f.month = 'january'
WHERE e.roll_number = '102'
GROUP BY e.id, sr.full_name """, ("102")).fetchone()
    conn.close
    
    print(enrollment_id)

get_enroll_id()