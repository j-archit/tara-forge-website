from app.google_integration import GoogleIntegration


class Request:
    def __init__(self, result):
        self.result = result

    def execute(self):
        return self.result


class DriveFiles:
    def __init__(self, existing=None):
        self.existing = existing or []
        self.created = []

    def list(self, **kwargs):
        self.list_kwargs = kwargs
        return Request({"files": self.existing})

    def create(self, **kwargs):
        self.created.append(kwargs)
        return Request({"id": "drive-new"})


class Drive:
    def __init__(self, files):
        self.resource = files

    def files(self):
        return self.resource


class Values:
    def __init__(self, identifiers):
        self.identifiers = identifiers
        self.updated = []
        self.appended = []

    def get(self, **kwargs):
        return Request({"values": self.identifiers})

    def update(self, **kwargs):
        self.updated.append(kwargs)
        return Request({})

    def append(self, **kwargs):
        self.appended.append(kwargs)
        return Request({})


class Spreadsheets:
    def __init__(self, values):
        self.resource = values

    def values(self):
        return self.resource


class Sheets:
    def __init__(self, values):
        self.resource = Spreadsheets(values)

    def spreadsheets(self):
        return self.resource


def test_drive_upload_is_idempotent(tmp_path, monkeypatch):
    model = tmp_path / "part.stl"
    model.write_bytes(b"solid")
    existing_files = DriveFiles(existing=[{"id": "drive-existing"}])
    integration = GoogleIntegration(Drive(existing_files), Sheets(Values([])), "folder", "sheet")
    assert integration.upload_once(model, "part.stl", "model/stl", "submission-1") == "drive-existing"
    assert not existing_files.created

    new_files = DriveFiles()
    monkeypatch.setattr("app.google_integration.MediaFileUpload", lambda *args, **kwargs: "media")
    integration = GoogleIntegration(Drive(new_files), Sheets(Values([])), "folder", "sheet")
    assert integration.upload_once(model, "part.stl", "model/stl", "submission-2") == "drive-new"
    assert new_files.created[0]["body"]["appProperties"]["taraforge_submission_id"] == "submission-2"


def test_sheet_row_is_updated_or_appended():
    existing_values = Values([["other"], ["submission-1"]])
    integration = GoogleIntegration(Drive(DriveFiles()), Sheets(existing_values), "folder", "sheet")
    integration.upsert_sheet_row(["value"], "submission-1")
    assert existing_values.updated[0]["range"] == "Sheet1!A2:K2"
    assert not existing_values.appended

    empty_values = Values([])
    integration = GoogleIntegration(Drive(DriveFiles()), Sheets(empty_values), "folder", "sheet")
    integration.upsert_sheet_row(["value"], "submission-2")
    assert empty_values.appended[0]["range"] == "Sheet1!A:K"
