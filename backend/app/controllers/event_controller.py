from bson import ObjectId
from app.database.mongodb import get_db
from app.models.event import Event
from app.models.registration import Registration
from app.schemas.event_schema import EventCreate
from app.schemas.registration_schema import RegistrationCreate

async def create_event(event_data: EventCreate, current_user):
    db = get_db()
    event = Event(
        title=event_data.title,
        description=event_data.description,
        date=event_data.date,
        location=event_data.location,
        tasks=event_data.tasks,
        benefits=event_data.benefits,
        created_by=str(current_user.get("id") or current_user.get("_id")),
        criteria=event_data.criteria,
        capacity=event_data.capacity
    )
    result = await db.events.insert_one(event.to_dict())
    new_event = await db.events.find_one({"_id": result.inserted_id})
    new_event["id"] = str(new_event["_id"])
    return new_event

async def get_events():
    db = get_db()
    events_cursor = db.events.find()
    events = []
    async for event in events_cursor:
        event["id"] = str(event["_id"])
        # Ensure missing fields are provided with default values
        event.setdefault("criteria", "")
        event.setdefault("capacity", 0)
        event.setdefault("volunteer_count", 0)
        event.setdefault("registration_open", True)
        events.append(event)
    print("Total events fetched:", len(events))
    return events

async def register_for_event(registration_data: RegistrationCreate, current_user):
    db = get_db()
    user_id = str(current_user.get("id") or current_user.get("_id"))
    existing = await db.registrations.find_one({
        "user_id": user_id,
        "event_id": registration_data.event_id
    })
    if existing:
        return None
    # Check if event is open
    event = await db.events.find_one({"_id": ObjectId(registration_data.event_id)})
    if not event:
        return None
    if not event.get("registration_open", True):
        approval_status = "reserve"
    else:
        approval_status = "pending"
    registration = Registration(
        user_id=user_id,
        event_id=registration_data.event_id,
        status="pending",
        approval_status=approval_status
    )
    result = await db.registrations.insert_one(registration.to_dict())
    new_registration = await db.registrations.find_one({"_id": result.inserted_id})
    new_registration["id"] = str(new_registration["_id"])
    return new_registration

async def get_registrations_for_user(current_user):
    db = get_db()
    user_id = str(current_user.get("id") or current_user.get("_id"))
    cursor = db.registrations.find({"user_id": user_id})
    registrations = []
    async for reg in cursor:
        reg["id"] = str(reg["_id"])
        try:
            print("Looking up event for registration with event_id:", reg["event_id"])
            event = await db.events.find_one({"_id": ObjectId(reg["event_id"])})
            if event:
                print("Found event:", event)
                reg["event_title"] = event.get("title", "No Title")
                reg["event_date"] = str(event.get("date"))
            else:
                reg["event_title"] = "Event not found"
        except Exception as e:
            print("Error fetching event for registration:", e)
            reg["event_title"] = "Unknown Event"
        registrations.append(reg)
    return registrations


# --- Admin Functions ---
async def get_events_by_admin(current_user):
    db = get_db()
    admin_id = str(current_user.get("id") or current_user.get("_id"))
    events_cursor = db.events.find({"created_by": admin_id})
    events = []
    async for event in events_cursor:
        event["id"] = str(event["_id"])
        # Ensure these fields are present
        event.setdefault("criteria", "")
        event.setdefault("capacity", 0)
        event.setdefault("volunteer_count", 0)
        event.setdefault("registration_open", True)
        events.append(event)
    return events

async def patch_event(event_id: str, update_data: dict, current_user):
    db = get_db()
    admin_id = str(current_user.get("id") or current_user.get("_id"))
    result = await db.events.update_one(
        {"_id": ObjectId(event_id), "created_by": admin_id},
        {"$set": update_data}
    )
    if result.modified_count:
        updated_event = await db.events.find_one({"_id": ObjectId(event_id)})
        updated_event["id"] = str(updated_event["_id"])
        return updated_event
    return None

async def delete_event(event_id: str, current_user):
    db = get_db()
    admin_id = str(current_user.get("id") or current_user.get("_id"))
    result = await db.events.delete_one({"_id": ObjectId(event_id), "created_by": admin_id})
    return result.deleted_count == 1

async def get_event_registrations(event_id: str, current_user):
    db = get_db()
    admin_id = str(current_user.get("id") or current_user.get("_id"))
    event = await db.events.find_one({"_id": ObjectId(event_id), "created_by": admin_id})
    if not event:
        return []
    cursor = db.registrations.find({"event_id": event_id})
    regs = []
    async for reg in cursor:
        reg["id"] = str(reg["_id"])
        # Attach the event title
        reg["event_title"] = event.get("title", "No Title")
        try:
            user_doc = await db.users.find_one({"_id": ObjectId(reg["user_id"])})
            if user_doc:
            # Attach user details that the admin needs to see
                reg["user_full_name"] = user_doc.get("full_name", "Unknown")
                reg["user_age"] = user_doc.get("age", 0)
                reg["user_languages"] = user_doc.get("languages", [])
                reg["user_experience"] = user_doc.get("experience", "")
            else:
                reg["user_full_name"] = "User not found"
                reg["user_age"] = 0
                reg["user_languages"] = []
                reg["user_experience"] = ""
        except Exception as e:
            print("Error fetching user for registration:", e)
            reg["user_full_name"] = "Error"
            reg["user_age"] = "Error"
            reg["user_languages"] = []
            reg["user_experience"] = "Error"
        regs.append(reg)
    return regs

async def approve_registration(registration_id: str, current_user):
    db = get_db()
    admin_id = str(current_user.get("id") or current_user.get("_id"))
    reg = await db.registrations.find_one({"_id": ObjectId(registration_id)})
    if not reg:
        return None
    event = await db.events.find_one({"_id": ObjectId(reg["event_id"]), "created_by": admin_id})
    if not event:
        return None
    result = await db.registrations.update_one(
        {"_id": ObjectId(registration_id)},
        {"$set": {"approval_status": "approved"}}
    )
    if result.modified_count:
        new_count = event.get("volunteer_count", 0) + 1
        update_fields = {"volunteer_count": new_count}
        if new_count >= event.get("capacity", 0):
            update_fields["registration_open"] = False
        await db.events.update_one({"_id": event["_id"]}, {"$set": update_fields})
        return True
    return None

async def reject_registration(registration_id: str, current_user):
    db = get_db()
    admin_id = str(current_user.get("id") or current_user.get("_id"))
    reg = await db.registrations.find_one({"_id": ObjectId(registration_id)})
    if not reg:
        return None
    event = await db.events.find_one({"_id": ObjectId(reg["event_id"]), "created_by": admin_id})
    if not event:
        return None
    result = await db.registrations.update_one(
        {"_id": ObjectId(registration_id)},
        {"$set": {"approval_status": "rejected"}}
    )
    if result.modified_count:
        return True
    return None

async def set_registration_status(registration_id: str, current_user, new_status: str):
    db = get_db()
    admin_id = str(current_user.get("id") or current_user.get("_id"))
    reg = await db.registrations.find_one({"_id": ObjectId(registration_id)})
    if not reg:
        return None
    # Check if the event belongs to this admin
    event = await db.events.find_one({"_id": ObjectId(reg["event_id"]), "created_by": admin_id})
    if not event:
        return None
    # Update the registration
    result = await db.registrations.update_one(
        {"_id": reg["_id"]},
        {"$set": {"approval_status": new_status}}
    )
    return result.modified_count == 1
