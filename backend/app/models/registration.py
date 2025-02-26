class Registration:
    def __init__(self, user_id: str, event_id: str, status: str = "pending", approval_status: str = "pending"):
        self.user_id = user_id
        self.event_id = event_id
        self.status = status  # overall status (if needed)
        self.approval_status = approval_status  # "pending", "approved", "rejected", or "reserve"

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "event_id": self.event_id,
            "status": self.status,
            "approval_status": self.approval_status,
        }
