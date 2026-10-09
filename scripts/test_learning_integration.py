"""Browser smoke for shared JSON navigation and Classroom's dedicated entrypoint."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
nav=(ROOT/"components"/"hub-nav.js").read_text(encoding="utf-8")
bridge=(ROOT/"components"/"adrian-learning-json.js").read_text(encoding="utf-8")
classroom=(ROOT.parent/"adaptive-pizarras"/"index.html").read_text(encoding="utf-8")
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=r"C:\Program Files\Google\Chrome\Application\chrome.exe")
    for width in (390,1280):
        ctx=browser.new_context(viewport={"width":width,"height":844})
        def route(r):
            url=r.request.url
            if "adrian-learning-json.js" in url:
                r.fulfill(status=200,content_type="application/javascript",body=bridge)
            elif "/adaptive-pizarras/" in url and (url.endswith("/") or url.endswith("/index.html")):
                r.fulfill(status=200,content_type="text/html",body=classroom)
            elif url.endswith(".js") or ".js?" in url:
                r.fulfill(status=200,content_type="application/javascript",body="")
            elif url.endswith(".css"):
                r.fulfill(status=200,content_type="text/css",body="")
            else:
                r.fulfill(status=200,content_type="text/html",body="<html><head></head><body><main></main></body></html>")
        ctx.route("**/*",route)
        page=ctx.new_page()
        page.goto("https://adrianxds-ads.github.io/adaptive-english/")
        page.evaluate("""()=>localStorage.setItem('adaptive_english_campaign1_v1',JSON.stringify({
          history:[{qid:'T01',correct:false,ms:4300,ts:1791552000000}]}))""")
        page.add_script_tag(content=nav)
        page.locator(".adrian-tech-button").click()
        page.get_by_role("dialog").wait_for()
        page.locator("[data-kind=last_error]").click()
        page.get_by_role("status").wait_for()
        assert "JSON" in page.get_by_role("status").inner_text()
        page.get_by_role("button",name="Cerrar").click()
        assert page.locator("#xds-json-overlay").count()==0
        page.close()
        classroom_page=ctx.new_page()
        classroom_page.goto("https://adrianxds-ads.github.io/adaptive-pizarras/")
        assert classroom_page.locator("#learningJsonBtn").count()==1
        assert classroom_page.evaluate("()=>typeof window.AdrianLearningJSON.openPanel")=="function"
        classroom_page.locator("#learningJsonBtn").evaluate("(b)=>b.click()")
        classroom_page.get_by_role("dialog").wait_for()
        assert classroom_page.get_by_role("button",name="Progreso").is_visible()
        assert classroom_page.evaluate("()=>document.querySelector('.xds-json-panel').getBoundingClientRect().right<=innerWidth+1")
        classroom_page.close()
        ctx.close()
    browser.close()
print("PASS: shared JSON navigation + dedicated Classroom integration at 390 and 1280 px")
