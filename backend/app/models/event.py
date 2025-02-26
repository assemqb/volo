from datetime import datetime

class Event:
    def __init__(self, title: str, description: str, date: datetime, location: str, tasks: list, benefits: list, created_by: str, criteria: str = "", capacity: int = 0):
        self.title = title
        self.description = description
        self.date = date
        self.location = location
        self.tasks = tasks
        self.benefits = benefits
        self.created_by = created_by
        self.criteria = criteria
        self.capacity = capacity
        self.volunteer_count = 0
        self.registration_open = True

    def to_dict(self):
        return {
            "title": self.title,
            "description": self.description,
            "date": self.date,
            "location": self.location,
            "tasks": self.tasks,
            "benefits": self.benefits,
            "created_by": self.created_by,
            "criteria": self.criteria,
            "capacity": self.capacity,
            "volunteer_count": self.volunteer_count,
            "registration_open": self.registration_open,
        }
