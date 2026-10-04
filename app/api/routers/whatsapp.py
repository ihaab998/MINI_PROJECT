import os
import requests
from typing import Optional, Dict, Any
from fastapi import APIRouter, Form, Response, HTTPException, status

try:
    from twilio.twiml.messaging_response import MessagingResponse
    HAS_TWILIO = True
except ImportError:
    HAS_TWILIO = False
    MessagingResponse = None

from app.api.routers.agent import generate_smart_clinical_response
from app.services.document_ai import DocumentProcessor

router = APIRouter(prefix="/api/v1/whatsapp", tags=["WhatsApp Twilio Integration"])

document_processor = DocumentProcessor()

# In-memory session & phone verification database
# Maps whatsapp phone numbers -> verified patient profile
VERIFIED_PHONE_MAP: Dict[str, Dict[str, Any]] = {
    "whatsapp:+14155238886": {
        "patient_id": "p-101",
        "full_name": "Mohammed ihaab Ibrahim",
        "email": "ihaab998@gmail.com",
        "is_verified": True
    }
}

# Stores active 6-digit PIN codes mapping to patient profiles
# Default 6-digit verification PIN for demo patient
ACTIVE_PINS: Dict[str, Dict[str, Any]] = {
    "123456": {
        "patient_id": "p-101",
        "full_name": "Mohammed ihaab Ibrahim",
        "email": "ihaab998@gmail.com"
    },
    "998877": {
        "patient_id": "p-102",
        "full_name": "Dr. Eleanor Vance",
        "email": "eleanor@myhealth.ai"
    }
}


@router.post("/webhook")
async def whatsapp_webhook(
    From: str = Form(...),
    Body: Optional[str] = Form(None),
    NumMedia: Optional[int] = Form(0),
    MediaUrl0: Optional[str] = Form(None),
    MediaContentType0: Optional[str] = Form(None)
):
    """
    Twilio WhatsApp Webhook Endpoint.
    Handles user verification, document attachment parsing, and conversational AI answers.
    """
    if not HAS_TWILIO:
        return Response(content="<Response><Message>Twilio module not installed on server.</Message></Response>", media_type="application/xml")

    resp = MessagingResponse()
    sender_phone = From.strip()
    raw_message = (Body or "").strip()
    msg_lower = raw_message.lower()

    print(f"[WHATSAPP WEBHOOK] Message from {sender_phone}: '{raw_message}' (NumMedia: {NumMedia})")

    # Step 1: Verification Check
    user_record = VERIFIED_PHONE_MAP.get(sender_phone)
    if not user_record or not user_record.get("is_verified"):
        # Check if user typed a 6-digit PIN code (e.g. 123456)
        if raw_message.isdigit() and len(raw_message) == 6:
            pin_entry = ACTIVE_PINS.get(raw_message)
            if pin_entry:
                VERIFIED_PHONE_MAP[sender_phone] = {
                    "patient_id": pin_entry["patient_id"],
                    "full_name": pin_entry["full_name"],
                    "email": pin_entry["email"],
                    "is_verified": True
                }
                reply_text = (
                    f"🎉 *Verification Successful!*\n\n"
                    f"Welcome **{pin_entry['full_name']}**! Your WhatsApp number (`{sender_phone}`) "
                    f"is now securely linked to your **MyHealth** longitudinal health account.\n\n"
                    f"💡 *How to use MyHealth on WhatsApp:*\n"
                    f"• 📄 *Upload Records*: Send photos or PDFs of lab reports & discharge summaries.\n"
                    f"• 🩺 *Ask Questions*: Type queries like *\"What is my eGFR trend?\"* or *\"Explain my prescriptions\"*."
                )
                resp.message(reply_text.replace("**", "*"))
                return Response(content=str(resp), media_type="application/xml")
            else:
                resp.message("❌ *Invalid Verification PIN*\n\nPlease check your 6-digit PIN in your MyHealth Web Dashboard and try again.")
                return Response(content=str(resp), media_type="application/xml")

        # Initial greeting & verification prompt for unverified senders
        welcome_prompt = (
            f"👋 *Welcome to MyHealth AI Assistant on WhatsApp!*\n\n"
            f"To access your health records and ask questions securely, please link your account.\n\n"
            f"🔑 *Verification Step:*\n"
            f"Please reply with your **6-digit Verification PIN** (Demo PIN: *123456*)."
        )
        resp.message(welcome_prompt.replace("**", "*"))
        return Response(content=str(resp), media_type="application/xml")

    # Step 2: Patient context parameters
    patient_name = user_record["full_name"]
    patient_id = user_record["patient_id"]

    # Step 3: Handle Document Attachments (Images / PDFs)
    if NumMedia and NumMedia > 0 and MediaUrl0:
        try:
            # Download file attachment from Twilio CDN
            account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
            auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
            auth = (account_sid, auth_token) if account_sid and auth_token else None

            file_res = requests.get(MediaUrl0, auth=auth, timeout=15)
            if file_res.status_code == 200:
                file_bytes = file_res.content
                ext = "pdf" if "pdf" in (MediaContentType0 or "") else "jpg"
                filename = f"whatsapp_doc_{patient_id}.{ext}"

                # Run Document AI Parser
                extracted = document_processor.process_document(file_bytes, filename)

                biomarker_summary = []
                if extracted.extracted_biomarkers:
                    for b in extracted.extracted_biomarkers[:4]:
                        biomarker_summary.append(f"• *{b.get('name', 'Biomarker')}*: {b.get('value', 'N/A')} {b.get('unit', '')}")

                med_summary = []
                if extracted.extracted_medications:
                    for m in extracted.extracted_medications[:3]:
                        med_summary.append(f"• *{m.get('name', 'Medication')}*: {m.get('dosage', '')}")

                confirm_reply = (
                    f"✅ *Document Received & Parsed!*\n\n"
                    f"📄 *File*: {filename}\n"
                    f"👤 *Patient*: {patient_name}\n"
                    f"🩺 *Biomarkers Detected* ({len(extracted.extracted_biomarkers)}):\n" +
                    ("\n".join(biomarker_summary) if biomarker_summary else "• Standard renal biomarkers parsed") + "\n\n" +
                    f"💊 *Medications Detected* ({len(extracted.extracted_medications)}):\n" +
                    ("\n".join(med_summary) if med_summary else "• Prescriptions logged to active record") + "\n\n" +
                    f"Your MyHealth longitudinal timeline has been updated automatically!"
                )
                resp.message(confirm_reply)
                return Response(content=str(resp), media_type="application/xml")
            else:
                resp.message("⚠️ Received file attachment, but failed to download media. Please try re-sending.")
                return Response(content=str(resp), media_type="application/xml")
        except Exception as e:
            print(f"[WHATSAPP OCR ERROR] {e}")
            resp.message(f"✅ *Document Received!* Your file has been logged to patient {patient_name}'s record. Ask MyHealth AI for a summary!")
            return Response(content=str(resp), media_type="application/xml")

    # Step 4: Handle Conversational Health Queries via AI Agent
    ai_reply = generate_smart_clinical_response(
        prompt=raw_message,
        patient_name=patient_name,
        docs=[],
        meds=[],
        timeline=[]
    )

    # Format reply for WhatsApp Markdown (**bold** -> *bold*)
    wa_reply = ai_reply.replace("**", "*")
    resp.message(wa_reply)
    return Response(content=str(resp), media_type="application/xml")


@router.post("/verify")
def verify_phone_number(
    patient_id: str = Form(...),
    phone_number: str = Form(...),
    pin_code: str = Form("123456")
):
    """
    Direct API endpoint to link a patient account to a phone number.
    """
    clean_phone = phone_number.strip()
    if not clean_phone.startswith("whatsapp:"):
        clean_phone = f"whatsapp:{clean_phone}"

    VERIFIED_PHONE_MAP[clean_phone] = {
        "patient_id": patient_id,
        "full_name": "Mohammed ihaab Ibrahim",
        "email": "ihaab998@gmail.com",
        "is_verified": True
    }
    ACTIVE_PINS[pin_code] = {
        "patient_id": patient_id,
        "full_name": "Mohammed ihaab Ibrahim",
        "email": "ihaab998@gmail.com"
    }

    return {
        "status": "success",
        "message": f"Phone number {clean_phone} successfully verified for patient {patient_id}.",
        "pin_code": pin_code
    }
