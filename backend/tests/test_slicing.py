from pathlib import Path
from subprocess import CompletedProcess

import pytest

from app.slicing import CuraSlicer, SlicingError, parse_cura_output


def test_parse_cura_output():
    estimate = parse_cura_output("Print time: 7200\nFilament used: 4.25")
    assert estimate.print_time_seconds == 7200
    assert estimate.filament_grams == 12.75


def test_parse_cura_output_requires_estimate():
    with pytest.raises(SlicingError, match="did not contain"):
        parse_cura_output("Cura started, but returned no figures")


def test_cura_slicer_uses_argument_list_and_cleans_output(tmp_path, monkeypatch):
    model = tmp_path / "safe model.stl"
    definition = tmp_path / "printer.json"
    model.write_bytes(b"solid model")
    definition.write_text("{}", encoding="utf-8")
    observed = {}

    def fake_run(command, **kwargs):
        observed["command"] = command
        observed["kwargs"] = kwargs
        Path(command[-1]).write_text("temporary", encoding="utf-8")
        return CompletedProcess(command, 0, "Print time: 60\nFilament used: 1.5", "")

    monkeypatch.setattr("app.slicing.subprocess.run", fake_run)
    estimate = CuraSlicer("CuraEngine", definition).estimate(model, {"settings": {}})

    assert estimate.print_time_seconds == 60
    assert observed["command"][0:2] == ["CuraEngine", "slice"]
    assert observed["kwargs"]["shell"] is False
    assert not model.with_suffix(".gcode.tmp").exists()


def test_cura_slicer_reports_missing_model(tmp_path):
    with pytest.raises(SlicingError, match="does not exist"):
        CuraSlicer("CuraEngine", tmp_path / "printer.json").estimate(
            tmp_path / "missing.stl", {}
        )
