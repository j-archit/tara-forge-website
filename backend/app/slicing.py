import json
import re
import subprocess
from dataclasses import dataclass
from pathlib import Path
from tempfile import NamedTemporaryFile


PRINT_TIME_PATTERN = re.compile(r"Print time:\s*(\d+)", re.IGNORECASE)
FILAMENT_PATTERN = re.compile(r"Filament used:\s*([\d.]+)", re.IGNORECASE)


class SlicingError(RuntimeError):
    pass


@dataclass(frozen=True)
class SliceEstimate:
    print_time_seconds: int
    filament_grams: float
    output_summary: str


def parse_cura_output(output: str) -> SliceEstimate:
    time_match = PRINT_TIME_PATTERN.search(output)
    filament_match = FILAMENT_PATTERN.search(output)
    if not time_match and not filament_match:
        raise SlicingError("CuraEngine output did not contain an estimate")
    print_time = int(time_match.group(1)) if time_match else 0
    filament_meters = float(filament_match.group(1)) if filament_match else 0.0
    return SliceEstimate(
        print_time_seconds=print_time,
        filament_grams=round(filament_meters * 3.0, 2),
        output_summary=output[-8000:],
    )


class CuraSlicer:
    def __init__(self, binary: str, printer_definition: Path, timeout_seconds: int = 300):
        self.binary = binary
        self.printer_definition = printer_definition
        self.timeout_seconds = timeout_seconds

    def estimate(self, model_path: Path, profile: dict) -> SliceEstimate:
        if not model_path.is_file():
            raise SlicingError(f"Model file does not exist: {model_path.name}")
        if not self.printer_definition.is_file():
            raise SlicingError("Printer definition is unavailable")

        profile_file: Path | None = None
        try:
            with NamedTemporaryFile("w", suffix=".json", encoding="utf-8", delete=False) as handle:
                json.dump(profile, handle)
                profile_file = Path(handle.name)
            command = [
                self.binary,
                "slice",
                "-j",
                str(self.printer_definition),
                "-j",
                str(profile_file),
                "-l",
                str(model_path),
                "-o",
                str(model_path.with_suffix(".gcode.tmp")),
            ]
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=self.timeout_seconds,
                check=False,
                shell=False,
            )
            output = f"{result.stdout}\n{result.stderr}".strip()
            if result.returncode != 0:
                raise SlicingError(f"CuraEngine failed: {output[-2000:]}")
            return parse_cura_output(output)
        except FileNotFoundError as exc:
            raise SlicingError("CuraEngine binary was not found") from exc
        except subprocess.TimeoutExpired as exc:
            raise SlicingError("CuraEngine exceeded its execution limit") from exc
        finally:
            if profile_file:
                profile_file.unlink(missing_ok=True)
            model_path.with_suffix(".gcode.tmp").unlink(missing_ok=True)
