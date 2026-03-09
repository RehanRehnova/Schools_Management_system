import sys
import os

def resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)

import requests
import subprocess
import threading
import webbrowser
from threading import Timer

import cloudinary
import cloudinary.uploader
from flask import Flask, request, jsonify, render_template, Response, url_for
from flask_cors import CORS
import json
import traceback
from services import add_student, get_students, get_student, update_student, delete_student,  fee_details,  fee_report, add_fee_basic

#For auto update

CURRENT_VERSION = "1.0.0"
GITHUB_USER = "RehanRehnova"
GITHUB_REPO = "Schools_Management_system"
VERSION_URL = f"https://raw.githubusercontent.com/{GITHUB_USER}/{GITHUB_REPO}/main/version.txt"
DOWNLOAD_URL = f"https://github.com/{GITHUB_USER}/{GITHUB_REPO}/releases/latest/download/app.exe"

def check_for_updates():
    try:
        # Check latest version from GitHub
        response = requests.get(VERSION_URL, timeout=5)
        latest_version = response.text.strip()

        if latest_version != CURRENT_VERSION:
            print(f"New version {latest_version} found! Updating...")
            download_and_update(latest_version)
        else:
            print("App is up to date!")
    except:
        # No internet? Just run normally
        print("Offline mode - skipping update check")

def download_and_update(new_version):
    try:
        exe_path = sys.executable
        new_exe_path = exe_path + ".new"
        backup_path = exe_path + ".backup"

        # Download new version
        print("Downloading update...")
        response = requests.get(DOWNLOAD_URL, stream=True, timeout=30)
        
        with open(new_exe_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        # Backup old version
        if os.path.exists(backup_path):
            os.remove(backup_path)
        os.rename(exe_path, backup_path)

        # Replace with new version
        os.rename(new_exe_path, exe_path)

        print(f"Updated to {new_version}! Restarting...")
        
        # Restart app
        subprocess.Popen([exe_path])
        sys.exit()

    except Exception as e:
        print(f"Update failed: {e}")
        # Restore backup if update failed
        if os.path.exists(backup_path):
            os.rename(backup_path, exe_path)


#for static files path

app = Flask(__name__, template_folder=resource_path('templates'),
            static_folder=resource_path('static'))

CORS(app)





# cloudinary configuration 
cloudinary.config(
    cloud_name="dhcayqpqr",
    api_key="112842994958122",
    api_secret="qGiPvNxI2gddK2QfGbMhEUyTpbM"
)

# add student func
@app.route('/students', methods=['POST'])
def create_student():

    data = request.form.to_dict()

    image_file = request.files.get("image")

    image_url = None

    if image_file:
        try:
            upload_result = cloudinary.uploader.upload(image_file)
            image_url = upload_result["secure_url"]

        except Exception as e:
            return jsonify({"error": "Image upload failed", "details": str(e)}), 500

    data["profile_image"] = image_url

    response, status_code = add_student(data)

    return jsonify(response), status_code



# get student func 
@app.route('/students/<class_name>', methods=['GET'])
def read_students(class_name):
    students_details = get_students(class_name)
    return jsonify(students_details), 200

@app.route('/student/<class_name>/<roll_number>', methods=['GET'])
def read_student(class_name, roll_number):
    students = get_student(class_name, roll_number)
    return jsonify(students), 200




# update student func 

@app.route('/students/<class_name>/<roll_number>', methods=['PUT'])
def modify_student(class_name, roll_number):
    
    data = request.get_json()


    image_file = data.get("photo")

    image_url = None

    if image_file:
        try:
            upload_result = cloudinary.uploader.upload(image_file)
            image_url = upload_result["secure_url"]

        except Exception as e:
            return jsonify({"error": "Image upload failed", "details": str(e)}), 500

    data["profile_image"] = image_url

    result = update_student(class_name, roll_number, data)

    if "error" in result:
        if result["error"] == "Student not found":
            return jsonify(result), 404
        else:
            return jsonify(result), 400

    return jsonify({"success": "Student updated"}), 200

   



# delete student func 
@app.route('/students/<class_name>/<roll_number>', methods=['DELETE'])
def remove_student(class_name, roll_number):
    success = delete_student(class_name, roll_number)

    if not success:
        return jsonify({"error": "Student not found"}), 404
    return jsonify({"status": "success"}), 200


# ------------------------------
# fee management

@app.route('/add-fee-payment', methods=['POST'])
def showdata():
    data=request.get_json()
    response= add_fee_basic(data)
    
    if not response  :
        return jsonify({"error": "Student not found"}), 404
    else:
        return jsonify({"status": "success"}), 200  
    
# render fee details function

@app.route('/feedetails', methods=['POST'])
def fetch_fee_details():
    data=request.json
    response=fee_details(data)
    traceback.print_exc()
    if not response:
        return jsonify({"error": "Student not found"}), 404
    else:
        return jsonify(response), 200




@app.route('/allfeedetails', methods=['POST'])
def student_total_fee_details():
    data=request.json
    result=fee_report(data)
    if result==[]:
        return []
    elif result==None:
        return jsonify({"error": "error"}), 404

    else:
        return Response(response=json.dumps(result, sort_keys=False), status=200) 



@app.route('/')
def render_page():
    return render_template("index.html")

@app.context_processor
def inject_user():
    return dict(ASSETS=url_for('static', filename='assets/')) 

if __name__=="__main__":
	
	update_thread = threading.Thread(target=check_for_updates)
    update_thread.daemon = True
    update_thread.start()
    
    Timer(1.5, lambda: webbrowser.open('http://127.0.0.1:5000')).start()
    app.run(host="0.0.0.0", port=5000, debug=True)


