"""Update only Classroom B2's reproducible asset registry; never touch other apps."""
from pathlib import Path
import hashlib,json,re

root=Path(__file__).resolve().parents[2]
repo=root/"adaptive-pizarras"
path=repo/"build-assets.js"
data=json.loads(path.read_text(encoding="utf-8").split("=",1)[1].rstrip(";\r\n "))
assets=data["assets"]
assets["/adrian-core/components/adrian-learning-json.js"]=""
for url in list(assets):
    fp=root/url.lstrip("/")
    if not fp.is_file():
        raise FileNotFoundError(str(fp))
    content=fp.read_bytes()
    if fp.suffix.lower() in {".js",".cjs",".html",".css",".json",".webmanifest",".svg",".py",".md",".txt"}:
        content=content.replace(b"\r\n",b"\n")
    assets[url]=hashlib.sha256(content).hexdigest()
data["build"]=hashlib.sha256(json.dumps(assets,sort_keys=True,separators=(",",":")).encode()).hexdigest()[:16]
path.write_text("self.AdrianRelease="+json.dumps(data,sort_keys=True,separators=(",",":"))+";\n",encoding="utf-8",newline="\n")
print("Classroom asset build:",data["build"],"assets:",len(assets))
