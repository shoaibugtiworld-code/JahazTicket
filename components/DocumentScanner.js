import { useRef, useState } from "react";

// Parses an ICAO 9303 machine-readable passport zone (two 44-char lines) if present.
// Line 2 layout: passportNumber(9) check(1) nationality(3) birthDate(6) check(1) sex(1) expiryDate(6) check(1) ...
function parseMRZ(text) {
  const lines = text
    .split("\n")
    .map((l) => l.replace(/\s+/g, "").toUpperCase())
    .filter((l) => l.length >= 40 && /^[A-Z0-9<]+$/.test(l));

  const line2 = lines.find((l) => l.length >= 40 && !l.startsWith("P<"));
  if (!line2) return null;

  const passportNumber = line2.slice(0, 9).replace(/</g, "");
  const nationality = line2.slice(10, 13).replace(/</g, "");
  const expiryRaw = line2.slice(21, 27); // YYMMDD

  if (!/^\d{6}$/.test(expiryRaw) || !passportNumber) return null;

  const yy = parseInt(expiryRaw.slice(0, 2), 10);
  const mm = expiryRaw.slice(2, 4);
  const dd = expiryRaw.slice(4, 6);
  const yyyy = yy < 50 ? 2000 + yy : 1900 + yy; // passports rarely expire >50y out
  const passportExpiry = `${yyyy}-${mm}-${dd}`;

  return { passportNumber, nationality, passportExpiry };
}

function findCNIC(text) {
  const match = text.match(/\d{5}-?\d{7}-?\d{1}/);
  if (!match) return null;
  const digits = match[0].replace(/-/g, "");
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
}

function findLoosePassportNumber(text) {
  const match = text.match(/\b[A-Z]{1,2}\d{6,8}\b/);
  return match ? match[0] : null;
}

export default function DocumentScanner({ mode, onResult }) {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | scanning | done | error
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setStatus("scanning");

    try {
      const Tesseract = (await import("tesseract.js")).default;
      const { data } = await Tesseract.recognize(file, "eng");
      const text = data.text || "";

      if (mode === "cnic") {
        const cnic = findCNIC(text);
        if (cnic) {
          onResult({ cnic });
          setStatus("done");
        } else {
          setStatus("error");
        }
        return;
      }

      // mode === "passport"
      const mrz = parseMRZ(text);
      if (mrz) {
        onResult(mrz);
        setStatus("done");
        return;
      }
      const loose = findLoosePassportNumber(text);
      if (loose) {
        onResult({ passportNumber: loose });
        setStatus("done");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="mt-1">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 text-brand text-xs font-semibold"
      >
        📷 {status === "scanning" ? "Scanning..." : "Scan with camera"}
      </button>

      {previewUrl && status !== "idle" && (
        <div className="flex items-center gap-2 mt-2 bg-card border border-cardline rounded-lg px-3 py-2">
          <img src={previewUrl} alt="Scanned document" className="w-10 h-10 object-cover rounded" />
          <p className="text-xs flex-1">
            {status === "scanning" && <span className="text-muted">Reading document...</span>}
            {status === "done" && <span className="text-brand">Number filled in automatically — please double-check it.</span>}
            {status === "error" && (
              <span className="text-red-400">Couldn't read it clearly — please type the number manually.</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
