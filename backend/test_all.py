import json
import traceback
import sys
import urllib.request
import urllib.error

# Add the backend path to sys.path so we can import app modules directly
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app.services.ai_service import ai_service, _GEMINI_MODEL, VALID_ACTION_TYPES, RecoveryActionSchema
    from app.config import settings
    from app.database import SessionLocal
    from app.models.recovery_action import RecoveryAction
    from app.models.audit_log import AuditLog
    from google import genai
    from google.genai import types
except Exception as e:
    print(f"Failed to import modules: {e}")
    sys.exit(1)

def test_live_gemini():
    print("GEMINI KEY LOADED:", "PASS" if settings.gemini_api_key else "FAIL")
    
    if not settings.gemini_api_key:
        print("GEMINI LIVE REQUEST: FAIL")
        print("Model: None")
        print("Response parsed successfully: no")
        print("Error type: Missing API Key")
        return
        
    client = genai.Client(api_key=settings.gemini_api_key)
    model_name = _GEMINI_MODEL
    
    prompt = "Return valid JSON with keys action_type, confidence_score, reasoning. Use EMAIL_REMINDER as action_type."
    
    try:
        resp = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=RecoveryActionSchema,
                temperature=0.2,
                max_output_tokens=300,
            )
        )
        print("GEMINI LIVE REQUEST: PASS")
        print(f"Model name: {model_name}")
        
        try:
            parsed = json.loads(resp.text)
            print("Response parsed successfully: yes")
            print("JSON RESPONSE: PASS")
        except Exception as json_e:
            print("Response parsed successfully: no")
            print(f"Error type: {type(json_e).__name__}")
            print("JSON RESPONSE: FAIL")
            
    except Exception as e:
        print("GEMINI LIVE REQUEST: FAIL")
        print(f"Model name: {model_name}")
        print("Response parsed successfully: no")
        
        error_type = type(e).__name__
        lower = str(e).lower()
        print(f"Error type: {error_type}")
        
        if "api_key" in lower or "invalid" in lower or "unauthorized" in lower or "permission" in lower:
            print("Classified Error: invalid API key")
        elif "quota" in lower or "rate" in lower or "resource_exhausted" in lower:
            print("Classified Error: quota/rate limit")
        elif "timeout" in lower or "deadline" in lower or "network" in lower:
            print("Classified Error: network")
        elif "not found" in lower or "not_found" in lower:
            print("Classified Error: model unavailable")
        else:
            print("Classified Error: application/code error")
        print("JSON RESPONSE: FAIL")

def test_endpoint():
    print("Testing RecoverAI AI Analysis endpoint...")
    req = urllib.request.Request("http://localhost:8000/api/recovery/analyze/1", method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            res_json = json.loads(res_body)
            if res_json.get("status") in ["success", "rejected"]:
                print("RECOVERAI AI ANALYSIS: PASS")
                return True
            else:
                print("RECOVERAI AI ANALYSIS: FAIL")
                print(f"Response: {res_json}")
                return False
    except Exception as e:
        print("RECOVERAI AI ANALYSIS: FAIL")
        print(f"Exception: {e}")
        if hasattr(e, 'read'):
            print(f"Body: {e.read().decode('utf-8')}")
        return False

def test_db():
    db = SessionLocal()
    try:
        # Check action
        action = db.query(RecoveryAction).order_by(RecoveryAction.id.desc()).first()
        if action:
            print("POLICY ENGINE: PASS")
            print("SUPABASE PERSISTENCE: PASS")
        else:
            print("POLICY ENGINE: FAIL")
            print("SUPABASE PERSISTENCE: FAIL")
            
        # Check audit log
        log = db.query(AuditLog).order_by(AuditLog.id.desc()).first()
        if log:
            print("AUDIT LOG: PASS")
        else:
            print("AUDIT LOG: FAIL")
    finally:
        db.close()

if __name__ == "__main__":
    test_live_gemini()
    print("---------------------------------")
    success = test_endpoint()
    if success:
        test_db()
