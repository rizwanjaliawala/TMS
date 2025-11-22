from pydantic import BaseModel, Field
from typing import Optional, List, Union
from datetime import datetime
from enum import Enum

class AssignmentType(str, Enum):
    DRAYAGE = "Drayage"
    AMAZON_DELIVERY = "Amazon Delivery"
    AMAZON_RELAY = "Amazon Relay"
    YARD_MOVE = "Yard Move"
    DAY_OFF = "Day Off"

class ContainerStatus(str, Enum):
    PLANNED = "Planned"
    PICKED = "Picked"
    DELIVERED = "Delivered"
    EMPTY = "Empty"
    RETURNED = "Returned"

class ApptStatus(str, Enum):
    SUCCESSFUL = "Successful"
    REJECTED = "Rejected"
    NCNS = "NCNS"

class Driver(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    cdl_number: str
    cdl_expire_date: datetime
    driver_picture: Optional[str] = None
    cdl_picture: Optional[str] = None
    dob: datetime
    assigned_truck_id: Optional[str] = None

class Incident(BaseModel):
    date: datetime = Field(default_factory=datetime.now)
    details: str
    location: str
    media_urls: List[str] = [] # Pictures/Videos

class Repair(BaseModel):
    date: datetime = Field(default_factory=datetime.now)
    reason: str
    invoice_url: Optional[str] = None
    amount: float
    mechanic_name: str
    mechanic_contact: str
    location: str

class Truck(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    vin: str
    make: str
    color: str
    picture: Optional[str] = None
    year: int
    type: str # Sleeper/Day Cab
    license_plate: str
    insurance_card_picture: Optional[str] = None
    mileage: float = 0.0
    incidents: List[Incident] = []
    repairs: List[Repair] = []

class DrayageDetails(BaseModel):
    container_number: str
    empty_return_number: Optional[str] = None
    bare_chassis: Optional[str] = None
    terminal: str
    container_category: str # FBU or Floor loaded

class AmazonDeliveryDetails(BaseModel):
    isa_id: str
    container_number: str
    appt_date_time: datetime
    appt_status: Optional[ApptStatus] = None
    rejection_reason: Optional[str] = None # If Rejected or NCNS

class AmazonRelayDetails(BaseModel):
    load_ids: List[str]
    origin: str
    destination: str
    expected_payout: float

class DayOffDetails(BaseModel):
    is_paid: bool
    reason: str

class Assignment(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    driver_id: str
    date: datetime
    type: AssignmentType
    details: Union[DrayageDetails, AmazonDeliveryDetails, AmazonRelayDetails, DayOffDetails, dict] = {} # Dict for Yard Move or generic

class Container(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    container_number: str
    mbl: Optional[str] = None
    terminal: str
    category: str # FBU or Floor loaded
    etas: Optional[str] = None
    ssl: Optional[str] = None
    status: ContainerStatus = ContainerStatus.PLANNED
