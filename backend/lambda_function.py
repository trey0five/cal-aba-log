import json
import os
import hashlib
import hmac
import secrets
import time
import boto3
from datetime import datetime, timezone

# Config
S3_BUCKET = os.environ.get('S3_BUCKET', 'villagefinders-provider-docs')
S3_PREFIX = os.environ.get('S3_PREFIX', 'cal-aba-therapy')
JWT_SECRET = os.environ.get('JWT_SECRET', 'change-me-in-production')
TOKEN_EXPIRY = 86400  # 24 hours

s3 = boto3.client('s3')

# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def cors_response(status, body):
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        },
        'body': json.dumps(body),
    }


def s3_key(filename):
    return f"{S3_PREFIX}/{filename}"


def read_json(filename, default=None):
    try:
        obj = s3.get_object(Bucket=S3_BUCKET, Key=s3_key(filename))
        return json.loads(obj['Body'].read().decode('utf-8'))
    except s3.exceptions.NoSuchKey:
        return default if default is not None else []
    except Exception:
        return default if default is not None else []


def write_json(filename, data):
    s3.put_object(
        Bucket=S3_BUCKET,
        Key=s3_key(filename),
        Body=json.dumps(data, indent=2),
        ContentType='application/json',
        ServerSideEncryption='AES256',
    )


def hash_pin(pin, salt=None):
    if salt is None:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac('sha256', pin.encode(), salt.encode(), 100000)
    return salt, hashed.hex()


def verify_pin(pin, salt, stored_hash):
    _, computed = hash_pin(pin, salt)
    return hmac.compare_digest(computed, stored_hash)


# Simple JWT (no external deps)
import base64

def _b64url(data):
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def _b64url_decode(s):
    s += '=' * (4 - len(s) % 4)
    return base64.urlsafe_b64decode(s)

def create_token(payload):
    payload['exp'] = int(time.time()) + TOKEN_EXPIRY
    header = _b64url(json.dumps({'alg': 'HS256', 'typ': 'JWT'}).encode())
    body = _b64url(json.dumps(payload).encode())
    sig_input = f"{header}.{body}".encode()
    sig = hmac.new(JWT_SECRET.encode(), sig_input, hashlib.sha256).digest()
    return f"{header}.{_b64url(sig)}.{body}"


def verify_token(token):
    try:
        parts = token.replace('Bearer ', '').split('.')
        if len(parts) != 3:
            return None
        header, sig, body = parts
        sig_input = f"{header}.{body}".encode()
        expected = hmac.new(JWT_SECRET.encode(), sig_input, hashlib.sha256).digest()
        if not hmac.compare_digest(_b64url_decode(sig), expected):
            return None
        payload = json.loads(_b64url_decode(body))
        if payload.get('exp', 0) < time.time():
            return None
        return payload
    except Exception:
        return None


def get_staff_from_token(event):
    auth = event.get('headers', {}).get('authorization', '') or \
           event.get('headers', {}).get('Authorization', '')
    if not auth:
        return None
    return verify_token(auth)


def generate_id():
    return secrets.token_hex(8)


# ──────────────────────────────────────────────
# Route handlers
# ──────────────────────────────────────────────

def handle_login(body):
    staff_list = read_json('staff.json', [])
    name = body.get('name', '').strip()
    pin = body.get('pin', '')

    for staff in staff_list:
        if staff['name'].lower() == name.lower():
            if verify_pin(pin, staff['salt'], staff['pin_hash']):
                token = create_token({'id': staff['id'], 'name': staff['name'], 'role': staff.get('role', 'staff')})
                return cors_response(200, {'token': token, 'staff': {'id': staff['id'], 'name': staff['name'], 'role': staff.get('role', 'staff')}})
            else:
                return cors_response(401, {'error': 'Invalid PIN'})

    return cors_response(401, {'error': 'Staff member not found'})


def handle_setup(body):
    """First-time setup: create admin staff if no staff exist."""
    staff_list = read_json('staff.json', [])
    if len(staff_list) > 0:
        return cors_response(400, {'error': 'Setup already completed'})

    name = body.get('name', '').strip()
    pin = body.get('pin', '')
    if not name or not pin or len(pin) < 4:
        return cors_response(400, {'error': 'Name and PIN (min 4 digits) required'})

    salt, pin_hash = hash_pin(pin)
    admin = {'id': generate_id(), 'name': name, 'pin_hash': pin_hash, 'salt': salt, 'role': 'admin'}
    write_json('staff.json', [admin])

    token = create_token({'id': admin['id'], 'name': admin['name'], 'role': 'admin'})
    return cors_response(200, {'token': token, 'staff': {'id': admin['id'], 'name': admin['name'], 'role': 'admin'}})


def handle_get_staff(event):
    user = get_staff_from_token(event)
    if not user:
        return cors_response(401, {'error': 'Unauthorized'})
    staff_list = read_json('staff.json', [])
    safe = [{'id': s['id'], 'name': s['name'], 'role': s.get('role', 'staff')} for s in staff_list]
    return cors_response(200, safe)


def handle_add_staff(event, body):
    user = get_staff_from_token(event)
    if not user or user.get('role') != 'admin':
        return cors_response(403, {'error': 'Admin only'})

    name = body.get('name', '').strip()
    pin = body.get('pin', '')
    if not name or not pin or len(pin) < 4:
        return cors_response(400, {'error': 'Name and PIN (min 4 digits) required'})

    staff_list = read_json('staff.json', [])
    if any(s['name'].lower() == name.lower() for s in staff_list):
        return cors_response(400, {'error': 'Staff member already exists'})

    salt, pin_hash = hash_pin(pin)
    new_staff = {'id': generate_id(), 'name': name, 'pin_hash': pin_hash, 'salt': salt, 'role': body.get('role', 'staff')}
    staff_list.append(new_staff)
    write_json('staff.json', staff_list)
    return cors_response(200, {'id': new_staff['id'], 'name': name, 'role': new_staff['role']})


def handle_delete_staff(event, staff_id):
    user = get_staff_from_token(event)
    if not user or user.get('role') != 'admin':
        return cors_response(403, {'error': 'Admin only'})

    staff_list = read_json('staff.json', [])
    staff_list = [s for s in staff_list if s['id'] != staff_id]
    write_json('staff.json', staff_list)
    return cors_response(200, {'message': 'Deleted'})


def handle_get_children(event):
    user = get_staff_from_token(event)
    if not user:
        return cors_response(401, {'error': 'Unauthorized'})
    children = read_json('children.json', [])
    return cors_response(200, children)


def handle_add_child(event, body):
    user = get_staff_from_token(event)
    if not user:
        return cors_response(401, {'error': 'Unauthorized'})

    name = body.get('name', '').strip()
    if not name:
        return cors_response(400, {'error': 'Name required'})

    children = read_json('children.json', [])
    child = {
        'id': generate_id(),
        'name': name,
        'guardian': body.get('guardian', ''),
        'notes': body.get('notes', ''),
        'created_at': datetime.now(timezone.utc).isoformat(),
    }
    children.append(child)
    write_json('children.json', children)
    return cors_response(200, child)


def handle_delete_child(event, child_id):
    user = get_staff_from_token(event)
    if not user:
        return cors_response(401, {'error': 'Unauthorized'})

    children = read_json('children.json', [])
    children = [c for c in children if c['id'] != child_id]
    write_json('children.json', children)
    return cors_response(200, {'message': 'Deleted'})


def handle_checkin(event, body):
    user = get_staff_from_token(event)
    if not user:
        return cors_response(401, {'error': 'Unauthorized'})

    child_id = body.get('child_id', '')
    action = body.get('action', '')  # 'in' or 'out'

    if not child_id or action not in ('in', 'out'):
        return cors_response(400, {'error': 'child_id and action (in/out) required'})

    # Verify child exists
    children = read_json('children.json', [])
    child = next((c for c in children if c['id'] == child_id), None)
    if not child:
        return cors_response(404, {'error': 'Child not found'})

    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    log_file = f"logs/{today}.json"
    logs = read_json(log_file, [])

    entry = {
        'id': generate_id(),
        'child_id': child_id,
        'child_name': child['name'],
        'action': action,
        'staff_id': user['id'],
        'staff_name': user['name'],
        'timestamp': datetime.now(timezone.utc).isoformat(),
    }
    logs.append(entry)
    write_json(log_file, logs)
    return cors_response(200, entry)


def handle_get_logs(event):
    user = get_staff_from_token(event)
    if not user:
        return cors_response(401, {'error': 'Unauthorized'})

    params = event.get('queryStringParameters') or {}
    date = params.get('date', datetime.now(timezone.utc).strftime('%Y-%m-%d'))
    log_file = f"logs/{date}.json"
    logs = read_json(log_file, [])
    return cors_response(200, logs)


def handle_check_setup():
    """Check if initial setup has been done."""
    staff_list = read_json('staff.json', [])
    return cors_response(200, {'setup_complete': len(staff_list) > 0})


# ──────────────────────────────────────────────
# Lambda handler
# ──────────────────────────────────────────────

def lambda_handler(event, context):
    method = event.get('httpMethod', 'GET')
    path = event.get('path', '')

    # Handle CORS preflight
    if method == 'OPTIONS':
        return cors_response(200, {})

    # Parse body
    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            body = {}

    # Route
    if path == '/api/setup' and method == 'GET':
        return handle_check_setup()
    elif path == '/api/setup' and method == 'POST':
        return handle_setup(body)
    elif path == '/api/login' and method == 'POST':
        return handle_login(body)
    elif path == '/api/staff' and method == 'GET':
        return handle_get_staff(event)
    elif path == '/api/staff' and method == 'POST':
        return handle_add_staff(event, body)
    elif path.startswith('/api/staff/') and method == 'DELETE':
        staff_id = path.split('/')[-1]
        return handle_delete_staff(event, staff_id)
    elif path == '/api/children' and method == 'GET':
        return handle_get_children(event)
    elif path == '/api/children' and method == 'POST':
        return handle_add_child(event, body)
    elif path.startswith('/api/children/') and method == 'DELETE':
        child_id = path.split('/')[-1]
        return handle_delete_child(event, child_id)
    elif path == '/api/checkin' and method == 'POST':
        return handle_checkin(event, body)
    elif path == '/api/logs' and method == 'GET':
        return handle_get_logs(event)
    else:
        return cors_response(404, {'error': 'Not found'})
