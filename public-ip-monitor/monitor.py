import requests
import google_sheets_setup
import json
from datetime import datetime
import time

SPREADSHEET_ID_JSON = "client_spreadsheet.json"
ADDRESS_FORMAT = "%s:%s"
MINECRAFT_PORT = "25565"
TIME_FORMAT = "%A, %B %d, %Y %I:%M%p"
POLL_TIME = 60*5

class SheetsService:

    def __init__(self):
        self.service = google_sheets_setup.get_sheets_service()
        self.spreadsheet_id = self.__read_spreadsheet_id(SPREADSHEET_ID_JSON)

    @staticmethod
    def __read_spreadsheet_id(spreadsheet_json):
        with open(spreadsheet_json, 'r') as f:
            spreadsheet_dict = json.loads(f.read())

        return spreadsheet_dict["spreadsheet_id"]

    def write_to_spreadsheet(self, public_ip):
        range_name = 'Minecraft IP Address!B2:C'
        address = ADDRESS_FORMAT % (public_ip, MINECRAFT_PORT)
        update_time = datetime.now().strftime(TIME_FORMAT)

        values = [[address, update_time]]
        

        body = {'values': values}
    
        self.service.spreadsheets().values().update(spreadsheetId = self.spreadsheet_id, 
            range = range_name, valueInputOption = "RAW", body = body).execute()

SHEET_SERVICE = SheetsService()

def ping_for_ip(sheet_service = SHEET_SERVICE):
    public_ip = requests.get("https://api.ipify.org?format=json").json()['ip']
    sheet_service.write_to_spreadsheet(public_ip)


"""Doesn't poll exactly on POLL_TIME, but that's okay."""
def poll(fn, interval = POLL_TIME):
    while True:
        fn()
        time.sleep(POLL_TIME)

if __name__ == "__main__":
    poll(ping_for_ip)

